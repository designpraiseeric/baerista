(function () {
  "use strict";

  var STORAGE_KEY = "dockview.tabs.v1";
  var csInterface = (typeof CSInterface !== "undefined") ? new CSInterface() : null;

  var tabs = [];              // { id, url, title, iframe, blockedEl, pane }
  var activeA = null;         // tab id currently shown in pane A
  var activeB = null;         // tab id currently shown in pane B
  var splitMode = false;
  var focusedPane = "a";      // which pane the address bar / back / fwd act on

  var el = {
    address: document.getElementById("address"),
    btnGo: document.getElementById("btn-go"),
    btnNew: document.getElementById("btn-new"),
    btnSplit: document.getElementById("btn-split"),
    btnBack: document.getElementById("btn-back"),
    btnFwd: document.getElementById("btn-fwd"),
    btnReload: document.getElementById("btn-reload"),
    btnSignin: document.getElementById("btn-signin"),
    btnSaved: document.getElementById("btn-saved"),
    btnStar: document.getElementById("btn-star"),
    btnFit: document.getElementById("btn-fit"),
    btnExternal: document.getElementById("btn-external"),
    btnAddLink: document.getElementById("btn-add-link"),
    saved: document.getElementById("saved"),
    savedList: document.getElementById("saved-list"),
    tabbar: document.getElementById("tabbar"),
    content: document.getElementById("content"),
    paneA: document.getElementById("pane-a"),
    paneB: document.getElementById("pane-b"),
    dropzone: document.getElementById("dropzone"),
    emptyState: document.getElementById("empty-state"),
  };

  // ---------- URL helpers ----------

  function looksLikeUrl(str) {
    if (!str) return false;
    str = str.trim();
    if (/^https?:\/\/\S+$/i.test(str)) return true;
    // bare domain, e.g. "frame.io/review/abc123" or "app.frame.io"
    if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(str) && !/\s/.test(str)) return true;
    return false;
  }

  function normalizeUrl(raw) {
    var s = raw.trim();
    if (!/^https?:\/\//i.test(s)) {
      s = "https://" + s;
    }
    return s;
  }

  function extractUrlFromText(text) {
    if (!text) return null;
    var match = text.match(/https?:\/\/[^\s"'<>]+/i);
    if (match) return match[0];
    var firstLine = text.split(/\r?\n/)[0].trim();
    if (looksLikeUrl(firstLine)) return normalizeUrl(firstLine);
    return null;
  }

  function extractUrlFromDrop(dt) {
    if (!dt) return null;

    // Standard browser drag source for links
    var uriList = dt.getData("text/uri-list");
    if (uriList) {
      var firstUri = uriList.split(/\r?\n/).filter(function (l) {
        return l && l.indexOf("#") !== 0;
      })[0];
      if (firstUri) return firstUri.trim();
    }

    // Firefox-style "URL\nTitle"
    var mozUrl = dt.getData("text/x-moz-url");
    if (mozUrl) {
      var fromMoz = extractUrlFromText(mozUrl);
      if (fromMoz) return fromMoz;
    }

    // Dragged .webloc / .url files (macOS Safari links, Finder aliases)
    if (dt.files && dt.files.length) {
      // We can't read file contents synchronously here without FileReader,
      // so fall through to plain text below; most browsers also populate
      // text/uri-list or text/plain alongside file drags.
    }

    var plain = dt.getData("text/plain");
    if (plain) {
      var fromPlain = extractUrlFromText(plain);
      if (fromPlain) return fromPlain;
    }

    var html = dt.getData("text/html");
    if (html) {
      var hrefMatch = html.match(/href=["']([^"']+)["']/i);
      if (hrefMatch) return hrefMatch[1];
    }

    return null;
  }

  // ---------- Tab management ----------

  function uid() {
    return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function faviconFor(url) {
    try {
      var u = new URL(url);
      return u.hostname.replace(/^www\./, "");
    } catch (e) {
      return url;
    }
  }

  function createTab(rawUrl, opts) {
    opts = opts || {};
    var pane = opts.pane || "a";
    var url = normalizeUrl(rawUrl);

    var iframe = document.createElement("iframe");
    iframe.allow = "camera; microphone; clipboard-read; clipboard-write; autoplay; fullscreen; encrypted-media";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.src = url;

    var tab = {
      id: uid(),
      url: url,
      title: faviconFor(url),
      iframe: iframe,
      pane: pane,
    };

    iframe.addEventListener("load", function () {
      try {
        var loadedTitle = iframe.contentDocument && iframe.contentDocument.title;
        if (loadedTitle) tab.title = loadedTitle;
      } catch (e) {
        // cross-origin: expected, we just keep the hostname as the title
      }
      renderTabs();
      persist();
    });

    tab.fit = opts.fit !== false;
    tabs.push(tab);
    (pane === "b" ? el.paneB : el.paneA).appendChild(iframe);
    applyFit(tab);

    setActive(tab.id, pane);
    persist();
    return tab;
  }

  function findTab(id) {
    for (var i = 0; i < tabs.length; i++) if (tabs[i].id === id) return tabs[i];
    return null;
  }

  function setActive(tabId, pane) {
    var tab = findTab(tabId);
    if (!tab) return;

    tab.pane = pane;
    focusedPane = pane;

    if (pane === "b") {
      activeB = tabId;
    } else {
      activeA = tabId;
    }

    tabs.forEach(function (t) {
      var isCurrentA = t.id === activeA;
      var isCurrentB = splitMode && t.id === activeB;
      t.iframe.classList.toggle("current", isCurrentA || isCurrentB);
      // A tab can only render once at a time; if it's active in B, make sure
      // it's actually parented under pane B's DOM node.
      var wantParent = isCurrentB && !isCurrentA ? el.paneB : el.paneA;
      if (t.iframe.parentElement !== wantParent && (isCurrentA || isCurrentB)) {
        wantParent.appendChild(t.iframe);
      }
    });

    el.paneA.classList.add("active");
    el.paneB.classList.toggle("split-visible", splitMode);

    tabs.forEach(applyFit);
    updateAddressBar();
    renderTabs();
    updateEmptyState();
  }

  function closeTab(tabId) {
    var idx = tabs.findIndex(function (t) { return t.id === tabId; });
    if (idx === -1) return;
    var tab = tabs[idx];
    tab.iframe.remove();
    tabs.splice(idx, 1);

    if (activeA === tabId) activeA = null;
    if (activeB === tabId) activeB = null;

    if (!activeA && tabs.length) setActive(tabs[tabs.length - 1].id, "a");
    else if (!tabs.length) updateAddressBar();

    renderTabs();
    updateEmptyState();
    persist();
  }

  function renderTabs() {
    el.tabbar.innerHTML = "";
    tabs.forEach(function (t) {
      var isA = t.id === activeA;
      var isB = splitMode && t.id === activeB;

      var d = document.createElement("div");
      d.className = "tab" + (isA || isB ? " active" : "") + (isB && !isA ? " pane-b-marker" : "");
      d.title = t.url + (isB ? "  (split: right pane)" : "");

      var titleSpan = document.createElement("span");
      titleSpan.className = "tab-title";
      titleSpan.textContent = t.title || t.url;
      d.appendChild(titleSpan);

      var closeBtn = document.createElement("span");
      closeBtn.className = "tab-close";
      closeBtn.textContent = "\u00D7";
      closeBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        closeTab(t.id);
      });
      d.appendChild(closeBtn);

      d.addEventListener("click", function (e) {
        setActive(t.id, e.shiftKey && splitMode ? "b" : "a");
      });

      // Dropping a new link directly onto an existing tab navigates it
      // instead of opening a duplicate tab.
      d.addEventListener("dragover", function (e) { e.preventDefault(); });
      d.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        hideDropzone();
        var url = extractUrlFromDrop(e.dataTransfer);
        if (url) navigate(t.id, url);
      });

      el.tabbar.appendChild(d);
    });
  }

  function navigate(tabId, rawUrl) {
    var tab = findTab(tabId);
    if (!tab) return;
    var url = normalizeUrl(rawUrl);
    tab.url = url;
    tab.title = faviconFor(url);
    tab.iframe.src = url;
    updateAddressBar();
    renderTabs();
    persist();
  }

  function currentTabForFocusedPane() {
    var id = focusedPane === "b" ? activeB : activeA;
    return findTab(id);
  }

  function updateAddressBar() {
    var tab = currentTabForFocusedPane();
    el.address.value = tab ? tab.url : "";
    el.btnBack.disabled = !tab;
    el.btnFwd.disabled = !tab;
    el.btnReload.disabled = !tab;
    el.btnStar.disabled = !tab;
    el.btnExternal.disabled = !tab;
    el.btnFit.classList.toggle("active", !!(tab && tab.fit));
    el.btnStar.innerHTML = tab && isSaved(tab.url) ? "&#9733;" : "&#9734;";
  }

  function updateEmptyState() {
    el.emptyState.classList.toggle("hidden", tabs.length > 0);
  }

  // ---------- Persistence ----------

  function persist() {
    try {
      var data = tabs.map(function (t) {
        return { url: t.url, title: t.title, pane: t.pane, fit: t.fit };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tabs: data,
        activeIndexA: tabs.findIndex(function (t) { return t.id === activeA; }),
        activeIndexB: tabs.findIndex(function (t) { return t.id === activeB; }),
        splitMode: splitMode,
      }));
    } catch (e) { /* storage unavailable, ignore */ }
  }

  function restore() {
    var raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { raw = null; }
    if (!raw) { updateEmptyState(); return; }
    try {
      var data = JSON.parse(raw);
      if (!data.tabs || !data.tabs.length) { updateEmptyState(); return; }
      data.tabs.forEach(function (t, i) {
        var pane = t.pane === "b" ? "b" : "a";
        createTab(t.url, { pane: pane, fit: t.fit });
      });
      if (data.splitMode) toggleSplit(true);
      if (tabs.length) setActive(tabs[0].id, "a");
    } catch (e) { updateEmptyState(); }
  }

  // ---------- Split view ----------

  function toggleSplit(force) {
    splitMode = typeof force === "boolean" ? force : !splitMode;
    el.content.classList.toggle("split", splitMode);
    el.btnSplit.classList.toggle("active", splitMode);
    if (splitMode && !activeB && tabs.length > 1) {
      var other = tabs.filter(function (t) { return t.id !== activeA; })[0];
      if (other) setActive(other.id, "b");
    }
    el.paneB.classList.toggle("split-visible", splitMode);
    renderTabs();
  }

  // ---------- Drop zone UI ----------

  var dragCounter = 0;
  function showDropzone() { el.dropzone.classList.add("show"); }
  function hideDropzone() { dragCounter = 0; el.dropzone.classList.remove("show"); }

  document.addEventListener("dragenter", function (e) {
    e.preventDefault();
    dragCounter++;
    showDropzone();
  });
  document.addEventListener("dragover", function (e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  });
  document.addEventListener("dragleave", function (e) {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) hideDropzone();
  });
  document.addEventListener("drop", function (e) {
    e.preventDefault();
    hideDropzone();
    var url = extractUrlFromDrop(e.dataTransfer);
    if (!url) return;

    // Dropping onto pane B while split view is active loads it there;
    // otherwise it opens as a new tab in the focused pane.
    var targetPane = "a";
    if (splitMode && el.paneB.contains(e.target)) targetPane = "b";
    else if (splitMode && el.paneA.contains(e.target)) targetPane = "a";

    createTab(url, { pane: targetPane });
  });

  // ---------- Sign-in via a separate ModelessDialog window ----------
  //
  // Three things ruled out already, by testing rather than guesswork:
  //   1. Google refuses to run sign-in inside any iframe.
  //   2. window.open() produces no usable window in this CEP host.
  //   3. Navigating the MAIN panel's own top-level page to the sign-in URL
  //      crashed AE outright.
  //
  // This uses CEP's actual documented mechanism for a second window:
  // requestOpenExtension() launches a separate registered extension (see
  // client/signin.html), passing the target URL as a query param. That
  // dialog window has its own document/origin — the main DockView panel
  // never navigates away from its own page, which is the piece that
  // crashed AE last time. If Google's page itself is what's incompatible
  // with this CEP host's Chromium build (rather than the panel-navigation
  // specifically), this could still crash — so it's worth testing in a
  // throwaway AE project before trusting it with real work.

  var SIGNIN_EXTENSION_ID = "com.designpraise.dockview.signin";

  function startSignin(url) {
    console.log("DockView: startSignin called with", url, "csInterface:", !!csInterface);
    if (csInterface && typeof csInterface.requestOpenExtension === "function") {
      try {
        console.log("DockView: calling requestOpenExtension for", SIGNIN_EXTENSION_ID);
        csInterface.requestOpenExtension(SIGNIN_EXTENSION_ID, "url=" + encodeURIComponent(url));
        console.log("DockView: requestOpenExtension call returned (this doesn't guarantee a window opened).");
        return;
      } catch (e) {
        console.warn("DockView: requestOpenExtension failed, falling back to system browser.", e);
      }
    } else {
      console.warn("DockView: csInterface or requestOpenExtension unavailable, falling back to system browser.");
    }
    // Fallback: hand off to the real system browser (no session sharing,
    // but guaranteed not to touch AE's renderer at all).
    if (csInterface && typeof csInterface.openURLInDefaultBrowser === "function") {
      csInterface.openURLInDefaultBrowser(url);
    } else {
      var a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  el.btnSignin.addEventListener("click", function () {
    var tab = currentTabForFocusedPane();
    var url = tab ? tab.url : el.address.value.trim();
    if (!url) return;
    startSignin(url);
  });

  // ---------- Fit to width (from LinkDock) ----------
  // Pages lay out at a desktop width and are scaled down to the pane, so
  // sites don't collapse into their phone layout in a narrow dock.
  var VIRTUAL_WIDTH = 1280;
  function applyFit(tab) {
    if (!tab || !tab.iframe) return;
    var host = tab.iframe.parentElement;
    var w = host ? host.clientWidth : 0;
    if (!tab.fit || !w) { tab.iframe.style.zoom = 1; tab.iframe.style.width = "100%"; tab.iframe.style.height = "100%"; return; }
    var scale = Math.min(1, w / VIRTUAL_WIDTH);
    tab.iframe.style.zoom = scale;
    tab.iframe.style.width = (100 / scale) + "%";
    tab.iframe.style.height = (100 / scale) + "%";
  }
  window.addEventListener("resize", function () { tabs.forEach(applyFit); });
  el.btnFit.addEventListener("click", function () {
    var tab = currentTabForFocusedPane();
    if (!tab) return;
    tab.fit = !tab.fit;
    applyFit(tab); updateAddressBar(); persist();
  });

  // ---------- Saved links (from LinkDock) ----------
  var SAVED_KEY = "dockview.saved.v1";
  function loadSaved() { try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; } catch (e) { return []; } }
  function storeSaved(list) { try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch (e) {} }
  function isSaved(url) { return loadSaved().some(function (s) { return s.url === url; }); }

  function renderSaved() {
    var list = loadSaved();
    el.savedList.innerHTML = "";
    if (!list.length) {
      el.savedList.innerHTML = '<div class="none">Nothing saved yet. Open a page and click &#9734;.</div>';
      return;
    }
    list.forEach(function (s, i) {
      var row = document.createElement("div");
      row.className = "saved-item";
      row.title = s.url + (s.external ? "  (opens in your browser)" : "");
      var name = document.createElement("span"); name.className = "name"; name.textContent = s.name;
      row.appendChild(name);
      if (s.external) { var ext = document.createElement("span"); ext.className = "ext"; ext.textContent = "\u2197"; row.appendChild(ext); }
      var del = document.createElement("span"); del.className = "del"; del.textContent = "\u00D7"; del.title = "Remove";
      del.addEventListener("click", function (e) {
        e.stopPropagation();
        var l = loadSaved(); l.splice(i, 1); storeSaved(l); renderSaved(); updateAddressBar();
      });
      row.appendChild(del);
      row.addEventListener("click", function () {
        if (s.external) { openExternal(s.url); return; }
        var tab = currentTabForFocusedPane();
        if (tab) navigate(tab.id, s.url); else createTab(s.url, { pane: focusedPane });
        el.saved.classList.remove("open"); el.btnSaved.classList.remove("active");
      });
      el.savedList.appendChild(row);
    });
  }

  function saveLink(url, defaultName) {
    var name = window.prompt ? prompt("Name this link:", defaultName) : defaultName;
    if (name === null) return;
    var external = confirm("Does this site refuse to load inside the panel (blank page)?\n\nOK = always open it in your browser\nCancel = open it here");
    var list = loadSaved();
    list.push({ url: url, name: (name || defaultName).trim() || defaultName, external: external });
    storeSaved(list);
    renderSaved(); updateAddressBar();
  }

  el.btnSaved.addEventListener("click", function () {
    var open = !el.saved.classList.contains("open");
    el.saved.classList.toggle("open", open);
    el.btnSaved.classList.toggle("active", open);
    if (open) renderSaved();
  });
  el.btnStar.addEventListener("click", function () {
    var tab = currentTabForFocusedPane();
    if (!tab) return;
    if (isSaved(tab.url)) {
      storeSaved(loadSaved().filter(function (s) { return s.url !== tab.url; }));
      renderSaved(); updateAddressBar();
    } else saveLink(tab.url, tab.title || faviconFor(tab.url));
  });
  el.btnAddLink.addEventListener("click", function () {
    var raw = prompt("Link to save:", "");
    if (!raw || !looksLikeUrl(raw)) return;
    saveLink(normalizeUrl(raw), faviconFor(normalizeUrl(raw)));
  });

  function openExternal(url) {
    if (csInterface && typeof csInterface.openURLInDefaultBrowser === "function") csInterface.openURLInDefaultBrowser(url);
    else window.open(url, "_blank");
  }
  el.btnExternal.addEventListener("click", function () {
    var tab = currentTabForFocusedPane();
    if (tab) openExternal(tab.url);
  });

  // ---------- Toolbar wiring ----------

  el.btnNew.addEventListener("click", function () {
    var url = el.address.value.trim();
    if (url && looksLikeUrl(url)) {
      createTab(url, { pane: focusedPane });
      el.address.value = "";
    } else {
      createTab("https://www.google.com", { pane: focusedPane });
    }
  });

  function submitAddress() {
    var raw = el.address.value.trim();
    if (!raw) return;
    var tab = currentTabForFocusedPane();
    if (tab) navigate(tab.id, raw);
    else createTab(raw, { pane: focusedPane });
  }

  el.btnGo.addEventListener("click", submitAddress);
  el.address.addEventListener("keydown", function (e) {
    if (e.key === "Enter") submitAddress();
  });

  el.btnSplit.addEventListener("click", function () { toggleSplit(); });

  el.btnBack.addEventListener("click", function () {
    var tab = currentTabForFocusedPane();
    if (tab) { try { tab.iframe.contentWindow.history.back(); } catch (e) {} }
  });
  el.btnFwd.addEventListener("click", function () {
    var tab = currentTabForFocusedPane();
    if (tab) { try { tab.iframe.contentWindow.history.forward(); } catch (e) {} }
  });
  el.btnReload.addEventListener("click", function () {
    var tab = currentTabForFocusedPane();
    if (tab) { try { tab.iframe.contentWindow.location.reload(); } catch (e) { tab.iframe.src = tab.iframe.src; } }
  });

  // Clicking directly in an empty pane focuses it, so back/forward/reload
  // and the address bar know which side of a split view you mean.
  el.paneA.addEventListener("mousedown", function () { focusedPane = "a"; updateAddressBar(); });
  el.paneB.addEventListener("mousedown", function () { focusedPane = "b"; updateAddressBar(); });

  // ---------- Init ----------
  updateEmptyState();
  restore();
  updateAddressBar();
})();
