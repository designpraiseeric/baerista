/* DockDocs — multi-format document viewer panel for After Effects
 * Runs inside the CEP/CEF panel. Node integration is enabled in the
 * manifest (--enable-nodejs --mixed-context) so `require` is available
 * right here alongside normal DOM APIs.
 *
 * Text selection is native browser Range/Selection throughout (PDF text
 * layer included) -- deliberately NOT a custom hand-built selection
 * engine. An earlier version of this panel replaced native selection
 * with a bespoke geometric drag-rectangle system to work around a
 * gap-fallback quirk in native selection over PDF.js's absolutely
 * positioned spans. That system grew increasingly elaborate chasing
 * edge cases (rectangular vs. stream selection, add/subtract regions,
 * table-cell detection, cross-page support...) and still didn't behave
 * the way people actually expect a document viewer to behave. Native
 * selection *is* what "expected" behavior looks like -- character-level
 * precision, double-click-for-word, drag-to-extend, working across
 * page/element boundaries -- because it's the same selection model
 * every word processor and browser is already built on. So: back to
 * native selection, and the custom engine is gone.
 *
 * The DOCX/PDF *editing* feature (contentEditable DOCX editor, PDF
 * annotation/table overlay, Save/Save As) has also been removed. This
 * panel is a viewer.
 */
(function () {
  "use strict";

  var fs = require("fs");
  var path = require("path");

  var csInterface = new CSInterface();

  // Without this, Cmd/Ctrl+C during a text selection gets intercepted by
  // After Effects' own Edit > Copy before it ever reaches this panel --
  // CEP forwards most shortcuts to the host app unless the focused
  // element is a text <input>/<select>, and our text layer/document
  // views are plain <span>/<div>s, not <input> elements. This tells CEP
  // to route Cmd+C (mac) / Ctrl+C (win) to the panel instead.
  //
  // IMPORTANT: registerKeyEventsInterest's `keyCode` is the *native OS*
  // virtual key code, NOT the JS/DOM keyCode. On Windows, VK_C (0x43=67)
  // happens to match the DOM keyCode, which is why the Windows entry
  // below works. On macOS, the virtual keycode for the C key is 8
  // (Apple's kVK_ANSI_C) -- a completely different numbering scheme --
  // so an entry using 67 on Mac silently matches nothing and Cmd+C keeps
  // going to AE.
  try {
    csInterface.registerKeyEventsInterest(JSON.stringify([
      { keyCode: 8, metaKey: true },    // Cmd+C (mac virtual keycode for 'C')
      { keyCode: 67, ctrlKey: true }    // Ctrl+C (win VK_C)
    ]));
  } catch (e) {
    /* older CEP hosts (< 6.1.0) may not support this; copy will fall back
       to whatever the host normally allows */
  }

  // Fallback/insurance: explicitly perform the copy from the current DOM
  // selection on keydown, in case the browser's native copy handling for
  // the now-unblocked shortcut doesn't fire on its own in this CEF build.
  document.addEventListener("keydown", function (e) {
    var isCopyChord = (e.metaKey || e.ctrlKey) && (e.key === "c" || e.key === "C" || e.keyCode === 67);
    if (!isCopyChord) return;
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString()) return; // let normal handling (e.g. in a real <input>) proceed
    try {
      document.execCommand("copy");
    } catch (err) {
      /* ignore -- native handling may still succeed */
    }
  });

  // Writes plain text to the clipboard, preferring the modern async
  // Clipboard API and falling back to a hidden-textarea + execCommand
  // dance for older CEP/Chromium builds that lack navigator.clipboard or
  // reject it for permission reasons. Not currently called on the main
  // copy path (the native "copy" event handler below covers that) but
  // kept available for anything that needs to push text to the clipboard
  // outside of a real selection-driven copy.
  function copyPlainText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {
        legacyCopyFallback(text);
      });
    } else {
      legacyCopyFallback(text);
    }
  }
  function legacyCopyFallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-1000px;left:-1000px;opacity:0;";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      /* nothing more we can do */
    }
    document.body.removeChild(ta);
  }

  // AE's Source Text / text-layer paste was silently failing even though
  // the OS clipboard clearly had text on it (visible in a clipboard
  // viewer). Root cause: Chromium's default copy of a DOM selection
  // writes *multiple* clipboard formats at once -- text/plain AND
  // text/html -- and the text/html one is a literal serialization of our
  // absolutely positioned PDF text-layer spans (position:absolute;
  // left:...px; top:...px per word). AE's paste path evidently prefers a
  // rich/HTML format when one is present, tries to interpret that layout
  // soup as rich text, and fails silently instead of falling back to the
  // plain-text entry. This intercepts copy (whichever way it was
  // triggered -- Cmd+C or right-click Copy both dispatch the same native
  // "copy" event) and replaces the clipboard contents with plain text
  // only, so AE has nothing but a clean string to paste.
  document.addEventListener("copy", function (e) {
    var sel = window.getSelection();
    if (!sel || sel.isCollapsed) return; // no DOM selection -- let a real <input>'s own copy proceed untouched
    var text = sel.toString();
    if (!text) return;
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", text);
      e.preventDefault(); // stop Chromium's own default (multi-format) copy from also running
    }
  });

  // Convert a file:// URL (percent-encoded) into a plain filesystem path.
  // Shared by the pdf.js worker path fix below and by openFile()'s path
  // normalization further down.
  function urlToPath(fileUrl) {
    var p;
    try {
      p = decodeURIComponent(new URL(fileUrl).pathname);
    } catch (e) {
      p = decodeURIComponent(String(fileUrl).replace(/^file:\/\//i, ""));
    }
    // Windows: file:///C:/Users/... -> pathname "/C:/Users/..." — strip
    // the leading slash before the drive letter.
    if (/^\/[a-zA-Z]:\//.test(p)) p = p.slice(1);
    return p;
  }

  // This panel's own folder on disk, e.g. ".../CEP/extensions/DockDocs".
  // Needed below because relative require() paths (and pdf.js's internal
  // worker path) don't reliably resolve to "next to index.html" in CEP's
  // mixed Node/Chromium context — they need to be made absolute against
  // this instead. See the pdf.worker.min.js comment further down for the
  // full explanation.
  var panelDir = path.dirname(urlToPath(window.location.href));
  function localModule(name) {
    return path.join(panelDir, "js", name);
  }

  // Surface any otherwise-silent crash directly in the panel, since
  // there's no visible console in the CEP host by default.
  window.addEventListener("error", function (e) {
    showFatalError(e.error || e.message);
  });
  window.addEventListener("unhandledrejection", function (e) {
    showFatalError(e.reason);
  });
  function showFatalError(err) {
    var banner = document.getElementById("ddFatalError");
    if (!banner) {
      banner = document.createElement("div");
      banner.id = "ddFatalError";
      banner.style.cssText =
        "position:fixed;left:0;right:0;bottom:0;z-index:999;background:#5a1f1f;color:#fff;" +
        "font-size:11px;padding:8px 10px;max-height:35%;overflow:auto;white-space:pre-wrap;";
      document.body.appendChild(banner);
    }
    var line = document.createElement("div");
    line.textContent = "DockDocs error: " + (err && err.stack ? err.stack : err);
    banner.appendChild(line);
  }

  // ---- pdf.js worker (bundled locally, no CDN dependency) ----
  // With Node integration on, pdf.js detects `require` in scope and
  // assumes it's running under Node/Electron, so instead of spinning up
  // a real Worker it falls back to require(workerSrc) directly. A bare
  // relative path like "js/pdf.worker.min.js" then gets resolved as a
  // node_modules lookup (not relative to index.html), which is why it
  // fails with "Cannot find module". Fix: hand it an absolute filesystem
  // path instead, resolved from this panel's own location on disk.
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = localModule("pdf.worker.min.js");
  }

  // pdf.js's DefaultCanvasFactory picks NodeCanvasFactory whenever
  // `typeof process === "object"` is true, which it is here because this
  // panel runs with Node integration on (--enable-nodejs --mixed-context) —
  // even though this is a real Chromium/DOM context, not headless Node.
  // NodeCanvasFactory then requires the native `canvas` npm package, which
  // isn't bundled (it's a compiled native addon, different per OS/arch),
  // so PDF rendering throws "Cannot find module 'canvas'". Passing an
  // explicit canvasFactory to getDocument() skips that auto-detection
  // entirely (see DefaultCanvasFactory construction in pdf.js core).
  function DomCanvasFactory() {}
  DomCanvasFactory.prototype = {
    create: function (width, height) {
      var canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return { canvas: canvas, context: canvas.getContext("2d") };
    },
    reset: function (canvasAndContext, width, height) {
      canvasAndContext.canvas.width = width;
      canvasAndContext.canvas.height = height;
    },
    destroy: function (canvasAndContext) {
      canvasAndContext.canvas.width = 0;
      canvasAndContext.canvas.height = 0;
      canvasAndContext.canvas = null;
      canvasAndContext.context = null;
    }
  };
  var domCanvasFactory = new DomCanvasFactory();

  var SUPPORTED_EXT = {
    ".pdf": "pdf",
    ".txt": "text",
    ".log": "text",
    ".json": "text",
    ".csv": "text",
    ".jsx": "text",
    ".js": "text",
    ".md": "markdown",
    ".markdown": "markdown",
    ".rtf": "rtf",
    ".docx": "docx",
    ".png": "image",
    ".jpg": "image",
    ".jpeg": "image",
    ".gif": "image",
    ".svg": "image",
    ".webp": "image",
  };

  var tabs = []; // { id, filePath, title, kind, zoom }
  var activeTabId = null;
  var tabSeq = 0;
  var STORAGE_KEY = "dockdocs.session.v1";

  var el = {
    tabstrip: document.getElementById("tabstrip"),
    content: document.getElementById("content"),
    emptyState: document.getElementById("emptyState"),
    dropOverlay: document.getElementById("dropOverlay"),
    zoomLabel: document.getElementById("zoomLabel"),
    searchBox: document.getElementById("searchBox"),
    btnOpen: document.getElementById("btnOpen"),
    btnZoomIn: document.getElementById("btnZoomIn"),
    btnZoomOut: document.getElementById("btnZoomOut"),
    btnReload: document.getElementById("btnReload"),
  };

  function activeTab() {
    return tabs.filter(function (t) {
      return t.id === activeTabId;
    })[0];
  }

  // ---------------------------------------------------------------
  // Theme sync — pull AE's live panel colors so DockDocs blends in
  // instead of looking like a foreign web page bolted onto the UI.
  // ---------------------------------------------------------------
  function toCss(c) {
    if (!c) return null;
    return (
      "rgb(" +
      Math.round(c.red) +
      "," +
      Math.round(c.green) +
      "," +
      Math.round(c.blue) +
      ")"
    );
  }

  function applyHostTheme() {
    try {
      var env = csInterface.getHostEnvironment();
      var skin = env && env.appSkinInfo;
      if (!skin) return;
      var bg = toCss(skin.panelBackgroundColor.color);
      if (bg) document.documentElement.style.setProperty("--panel-bg", bg);
      if (skin.panelBackgroundColor.color) {
        var c = skin.panelBackgroundColor.color;
        var alt =
          "rgb(" +
          Math.min(255, Math.round(c.red) + 8) +
          "," +
          Math.min(255, Math.round(c.green) + 8) +
          "," +
          Math.min(255, Math.round(c.blue) + 8) +
          ")";
        document.documentElement.style.setProperty("--panel-bg-alt", alt);
      }
    } catch (e) {
      console.warn("DockDocs: could not read host theme", e);
    }
  }

  applyHostTheme();
  csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, applyHostTheme);

  // ---------------------------------------------------------------
  // Session persistence — reopen whatever was docked last time
  // ---------------------------------------------------------------
  function saveSession() {
    try {
      var data = {
        files: tabs.map(function (t) {
          return t.filePath;
        }),
        active: activeTabId,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function restoreSession() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      (data.files || []).forEach(function (p) {
        var np = normalizeFilePath(p);
        if (fs.existsSync(np)) openFile(np, false);
      });
      if (data.active) setActiveTab(data.active);
    } catch (e) {}
  }

  // ---------------------------------------------------------------
  // Opening files
  // ---------------------------------------------------------------
  function pickFile() {
    // cep.fs is the native dialog provided by the CEP host — no
    // browser <input type=file> quirks, works consistently in AE.
    if (window.cep && cep.fs && cep.fs.showOpenDialog) {
      var res = cep.fs.showOpenDialog(
        false,
        false,
        "Open document",
        "",
        ["pdf", "txt", "md", "markdown", "rtf", "docx", "json", "csv", "log", "png", "jpg", "jpeg", "gif", "svg", "webp"]
      );
      if (res && res.err === 0 && res.data && res.data.length) {
        openFile(res.data[0], true);
        return;
      }
    }
    // Fallback for environments without cep.fs (e.g. testing in a
    // plain browser tab) — regular file input, path may be blocked
    // by browser sandboxing outside CEP.
    var input = document.createElement("input");
    input.type = "file";
    input.onchange = function () {
      if (input.files && input.files[0] && input.files[0].path) {
        openFile(input.files[0].path, true);
      }
    };
    input.click();
  }

  function extOf(filePath) {
    return path.extname(filePath).toLowerCase();
  }

  // CEP's native file dialog (and OS drag-drop) sometimes hands back a
  // file:// URI instead of a plain filesystem path — this happens
  // reliably on macOS. Node's fs module doesn't understand URIs, so
  // fs.readFileSync("file:///Users/.../foo.pdf") fails with ENOENT even
  // though the real file exists. Normalize once, at the single entry
  // point every path flows through, so pickFile(), drag-drop, and
  // restored sessions are all covered.
  function normalizeFilePath(filePath) {
    if (typeof filePath !== "string" || !/^file:\/\//i.test(filePath)) {
      return filePath;
    }
    return urlToPath(filePath);
  }

  function openFile(filePath, focus) {
    filePath = normalizeFilePath(filePath);
    var ext = extOf(filePath);
    var kind = SUPPORTED_EXT[ext] || "unsupported";

    // If already open, just switch to it.
    var existing = tabs.filter(function (t) {
      return t.filePath === filePath;
    })[0];
    if (existing) {
      if (focus) setActiveTab(existing.id);
      return;
    }

    var tab = {
      id: "t" + ++tabSeq,
      filePath: filePath,
      title: path.basename(filePath),
      kind: kind,
      zoom: 1.0,
    };
    tabs.push(tab);
    renderTabStrip();
    buildContentPane(tab);
    if (focus) setActiveTab(tab.id);
    saveSession();
  }

  // ---------------------------------------------------------------
  // Tab strip
  // ---------------------------------------------------------------
  function kindIcon(kind) {
    return (
      {
        pdf: "▤",
        text: "≡",
        markdown: "≡",
        rtf: "≡",
        docx: "▤",
        image: "▦",
        unsupported: "?",
      }[kind] || "▤"
    );
  }

  function renderTabStrip() {
    el.tabstrip.innerHTML = "";
    tabs.forEach(function (t) {
      var d = document.createElement("div");
      d.className = "tab" + (t.id === activeTabId ? " active" : "");
      d.title = t.filePath;

      var icon = document.createElement("span");
      icon.className = "tab-icon";
      icon.textContent = kindIcon(t.kind);

      var title = document.createElement("span");
      title.className = "tab-title";
      title.textContent = t.title;

      var close = document.createElement("span");
      close.className = "tab-close";
      close.textContent = "✕";
      close.onclick = function (ev) {
        ev.stopPropagation();
        closeTab(t.id);
      };

      d.appendChild(icon);
      d.appendChild(title);
      d.appendChild(close);
      d.onclick = function () {
        setActiveTab(t.id);
      };
      el.tabstrip.appendChild(d);
    });
  }

  function closeTab(id) {
    var idx = tabs.findIndex(function (t) {
      return t.id === id;
    });
    if (idx === -1) return;
    var pane = document.getElementById("pane-" + id);
    if (pane) pane.remove();
    tabs.splice(idx, 1);
    if (activeTabId === id) {
      var next = tabs[idx] || tabs[idx - 1];
      activeTabId = next ? next.id : null;
    }
    renderTabStrip();
    updateActivePane();
    saveSession();
  }

  function setActiveTab(id) {
    activeTabId = id;
    // A selection made in the previously-active tab's pane is still a
    // live DOM Selection even after that pane is hidden (it's just
    // display:none, not removed) — clear it on switch so Cmd+C in the
    // newly active tab can't accidentally copy leftover text from a tab
    // you're no longer looking at.
    var sel = window.getSelection();
    if (sel) sel.removeAllRanges();
    renderTabStrip();
    updateActivePane();
    saveSession();
  }

  function updateActivePane() {
    var panes = el.content.querySelectorAll(".doc-view");
    panes.forEach(function (p) {
      p.classList.toggle("active", p.id === "pane-" + activeTabId);
    });
    el.emptyState.style.display = tabs.length ? "none" : "flex";
    var tab = activeTab();
    el.zoomLabel.textContent = tab ? Math.round((tab.zoom || 1) * 100) + "%" : "100%";
  }

  // ---------------------------------------------------------------
  // Content pane per tab
  // ---------------------------------------------------------------
  function buildContentPane(tab) {
    var pane = document.createElement("div");
    pane.className = "doc-view";
    pane.id = "pane-" + tab.id;
    el.content.appendChild(pane);

    var loading = document.createElement("div");
    loading.className = "unsupported-view";
    loading.textContent = "Loading " + tab.title + " …";
    pane.appendChild(loading);

    try {
      switch (tab.kind) {
        case "pdf":
          renderPDF(tab, pane);
          break;
        case "text":
          renderText(tab, pane);
          break;
        case "markdown":
          renderMarkdown(tab, pane);
          break;
        case "rtf":
          renderRTF(tab, pane);
          break;
        case "docx":
          renderDocx(tab, pane);
          break;
        case "image":
          renderImage(tab, pane);
          break;
        default:
          renderUnsupported(tab, pane);
      }
    } catch (e) {
      console.error(e);
      pane.innerHTML =
        '<div class="unsupported-view">Could not open this file.<br>' + escapeHtml(String(e.message || e)) + "</div>";
    }
  }

  function rebuildPane(tab) {
    var old = document.getElementById("pane-" + tab.id);
    if (old) old.remove();
    buildContentPane(tab);
    updateActivePane();
  }

  function clearPane(pane) {
    pane.innerHTML = "";
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  // ---- Plain text ----
  function renderText(tab, pane) {
    var raw = fs.readFileSync(tab.filePath, "utf8");
    clearPane(pane);
    var div = document.createElement("div");
    div.className = "text-view";
    div.textContent = raw;
    pane.appendChild(div);
    tab._searchTarget = div;
    tab._raw = raw;
  }

  // ---- Markdown ----
  function renderMarkdown(tab, pane) {
    var raw = fs.readFileSync(tab.filePath, "utf8");
    clearPane(pane);
    var div = document.createElement("div");
    div.className = "md-view";
    var html = window.marked ? marked.parse(raw) : "<pre>" + escapeHtml(raw) + "</pre>";
    div.innerHTML = html;
    pane.appendChild(div);
    tab._searchTarget = div;
    tab._raw = raw;
  }

  // ---- RTF (lightweight strip-down, not a full renderer) ----
  function rtfToText(rtf) {
    var text = rtf;
    text = text.replace(/\\par[d]?/g, "\n");
    text = text.replace(/\\tab/g, "\t");
    text = text.replace(/\\'[0-9a-fA-F]{2}/g, "");
    text = text.replace(/\{\\\*?\\[^{}]+\}/g, "");
    text = text.replace(/\\[a-zA-Z]+-?\d* ?/g, "");
    text = text.replace(/[{}]/g, "");
    return text.replace(/\n{3,}/g, "\n\n").trim();
  }

  function renderRTF(tab, pane) {
    var raw = fs.readFileSync(tab.filePath, "utf8");
    clearPane(pane);
    var div = document.createElement("div");
    div.className = "text-view";
    div.textContent = rtfToText(raw);
    pane.appendChild(div);
    var note = document.createElement("div");
    note.style.cssText = "padding:8px 18px;color:#777;font-size:10px;border-top:1px solid #333;";
    note.textContent = "Plain-text extraction of RTF — formatting is not preserved.";
    pane.appendChild(note);
    tab._searchTarget = div;
  }

  // ---- DOCX (read-only, via mammoth) ----
  function renderDocx(tab, pane) {
    var buf = fs.readFileSync(tab.filePath);
    var arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    if (!window.mammoth) {
      clearPane(pane);
      pane.innerHTML = '<div class="unsupported-view">DOCX support library did not load.</div>';
      return;
    }
    mammoth
      .convertToHtml({ arrayBuffer: arrayBuffer })
      .then(function (result) {
        clearPane(pane);
        var div = document.createElement("div");
        div.className = "md-view";
        div.innerHTML = result.value;
        pane.appendChild(div);
        tab._searchTarget = div;
      })
      .catch(function (err) {
        clearPane(pane);
        pane.innerHTML =
          '<div class="unsupported-view">Could not render this .docx file.<br>' +
          escapeHtml(String(err)) +
          "</div>";
      });
  }

  // ---- Images ----
  function renderImage(tab, pane) {
    clearPane(pane);
    var wrap = document.createElement("div");
    wrap.className = "img-view";
    var img = document.createElement("img");
    img.src = "file:///" + tab.filePath.replace(/\\/g, "/");
    wrap.appendChild(img);
    pane.appendChild(wrap);
  }

  // ---- Unsupported ----
  function renderUnsupported(tab, pane) {
    clearPane(pane);
    var div = document.createElement("div");
    div.className = "unsupported-view";
    div.innerHTML =
      "Can't preview this file type yet (" +
      escapeHtml(extOf(tab.filePath) || "no extension") +
      ").<br>Supported: PDF, DOCX, TXT, MD, RTF, JSON/CSV/LOG, and common images.";
    pane.appendChild(div);
  }

  // ---- PDF via pdf.js, with a real, natively-selectable text layer ----
  function renderPDF(tab, pane) {
    var data = new Uint8Array(fs.readFileSync(tab.filePath));
    clearPane(pane);
    var loadingTask = pdfjsLib.getDocument({
      data: data,
      canvasFactory: domCanvasFactory
    });
    loadingTask.promise
      .then(function (pdfDoc) {
        tab._pdfDoc = pdfDoc;
        renderAllPdfPages(tab, pane);
      })
      .catch(function (err) {
        pane.innerHTML =
          '<div class="unsupported-view">Could not open this PDF.<br>' + escapeHtml(String(err)) + "</div>";
      });
  }

  function renderAllPdfPages(tab, pane) {
    clearPane(pane);
    var pdfDoc = tab._pdfDoc;
    var zoom = tab.zoom || 1.0;
    var numPages = pdfDoc.numPages;
    var chain = Promise.resolve();

    for (var i = 1; i <= numPages; i++) {
      (function (pageNum) {
        chain = chain.then(function () {
          return pdfDoc.getPage(pageNum).then(function (page) {
            var renderScale = zoom * 1.3;
            var viewport = page.getViewport({ scale: renderScale });
            var wrap = document.createElement("div");
            wrap.className = "pdf-page-wrap";
            var inner = document.createElement("div");
            inner.className = "pdf-page-inner";
            inner.style.width = viewport.width + "px";
            inner.style.height = viewport.height + "px";

            var canvas = document.createElement("canvas");
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            var ctx = canvas.getContext("2d");
            inner.appendChild(canvas);

            var textLayerDiv = document.createElement("div");
            textLayerDiv.className = "pdf-textLayer";
            textLayerDiv.style.width = viewport.width + "px";
            textLayerDiv.style.height = viewport.height + "px";
            textLayerDiv.style.setProperty("--scale-factor", renderScale);
            inner.appendChild(textLayerDiv);

            wrap.appendChild(inner);
            pane.appendChild(wrap);

            var renderTask = page.render({ canvasContext: ctx, viewport: viewport });
            return renderTask.promise.then(function () {
              return page.getTextContent().then(function (textContent) {
                try {
                  if (pdfjsLib.renderTextLayer) {
                    return pdfjsLib.renderTextLayer({
                      textContentSource: textContent,
                      container: textLayerDiv,
                      viewport: viewport,
                    }).promise;
                  }
                } catch (e) {
                  /* text layer is a nice-to-have; canvas already rendered */
                }
              });
            });
          });
        });
      })(i);
    }

    chain.then(function () {
      tab._searchTarget = pane;
    });
  }

  function rerenderActivePdfIfAny() {
    var tab = activeTab();
    if (tab && tab.kind === "pdf" && tab._pdfDoc) {
      var pane = document.getElementById("pane-" + tab.id);
      renderAllPdfPages(tab, pane);
    }
    el.zoomLabel.textContent = tab ? Math.round((tab.zoom || 1) * 100) + "%" : "100%";
  }

  // ---------------------------------------------------------------
  // Zoom
  // ---------------------------------------------------------------
  function adjustZoom(delta) {
    var tab = activeTab();
    if (!tab) return;
    tab.zoom = Math.max(0.25, Math.min(4, (tab.zoom || 1) + delta));
    if (tab.kind === "pdf") {
      rerenderActivePdfIfAny();
    } else {
      var pane = document.getElementById("pane-" + tab.id);
      var target = pane && pane.querySelector(".text-view, .md-view");
      if (target) target.style.fontSize = 11.5 * tab.zoom + "px";
      el.zoomLabel.textContent = Math.round(tab.zoom * 100) + "%";
    }
  }

  // ---------------------------------------------------------------
  // Search (text / markdown / docx / pdf text layer)
  // ---------------------------------------------------------------
  function clearHighlights(root) {
    root.querySelectorAll("mark.dd-hit").forEach(function (m) {
      var parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
  }

  function runSearch(term) {
    var tab = activeTab();
    if (!tab || !tab._searchTarget) return;
    var root = tab._searchTarget;
    clearHighlights(root);
    if (!term) return;

    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    var lower = term.toLowerCase();
    var firstHit = null;

    nodes.forEach(function (node) {
      var text = node.nodeValue;
      var idx = text.toLowerCase().indexOf(lower);
      if (idx === -1) return;
      var frag = document.createDocumentFragment();
      var cursor = 0;
      var t = text;
      var lt = t.toLowerCase();
      var i;
      while ((i = lt.indexOf(lower, cursor)) !== -1) {
        frag.appendChild(document.createTextNode(t.slice(cursor, i)));
        var mark = document.createElement("mark");
        mark.className = "dd-hit";
        mark.textContent = t.slice(i, i + term.length);
        frag.appendChild(mark);
        if (!firstHit) firstHit = mark;
        cursor = i + term.length;
      }
      frag.appendChild(document.createTextNode(t.slice(cursor)));
      node.parentNode.replaceChild(frag, node);
    });

    if (firstHit) firstHit.scrollIntoView({ block: "center" });
  }

  // ---------------------------------------------------------------
  // Wire up UI
  // ---------------------------------------------------------------
  el.btnOpen.addEventListener("click", pickFile);
  el.btnZoomIn.addEventListener("click", function () {
    adjustZoom(0.1);
  });
  el.btnZoomOut.addEventListener("click", function () {
    adjustZoom(-0.1);
  });
  el.btnReload.addEventListener("click", function () {
    var tab = activeTab();
    if (!tab) return;
    rebuildPane(tab);
  });

  var searchDebounce;
  el.searchBox.addEventListener("input", function () {
    clearTimeout(searchDebounce);
    var val = el.searchBox.value;
    searchDebounce = setTimeout(function () {
      runSearch(val);
    }, 150);
  });

  // Drag & drop
  ["dragenter", "dragover"].forEach(function (evt) {
    el.content.addEventListener(evt, function (e) {
      e.preventDefault();
      el.dropOverlay.classList.add("active");
    });
  });
  ["dragleave", "drop"].forEach(function (evt) {
    el.content.addEventListener(evt, function (e) {
      e.preventDefault();
      el.dropOverlay.classList.remove("active");
    });
  });
  el.content.addEventListener("drop", function (e) {
    e.preventDefault();
    var files = e.dataTransfer && e.dataTransfer.files;
    if (!files || !files.length) return;
    for (var i = 0; i < files.length; i++) {
      if (files[i].path) openFile(files[i].path, i === 0);
    }
  });

  // Restore previous session on panel load
  restoreSession();
  updateActivePane();
})();
