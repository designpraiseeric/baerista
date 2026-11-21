/* Baerista — the DesignPraise After Effects toolbar.
 * Reads registry.json from GitHub, installs/updates tools with checksum checks,
 * and launches them (docked if a ScriptUI Panels copy exists, floating otherwise). */
(function () {
  "use strict";

  var BAR_VERSION = "0.3.0";
  var REPO_RAW = "https://raw.githubusercontent.com/designpraiseeric/baerista/main/";
  var SITE = "https://designpraiseeric.pages.dev/soon";
  var PAID_API = "https://designpraiseeric.pages.dev/api/paid";

  var cs = new CSInterface();
  var nodeRequire = (window.cep_node && window.cep_node.require) || window.require;
  var fs = nodeRequire("fs"), path = nodeRequire("path"), os = nodeRequire("os"), crypto = nodeRequire("crypto");

  var HOME = process.platform === "win32"
    ? path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "DesignPraise", "Baerista")
    : path.join(os.homedir(), "Library", "Application Support", "DesignPraise", "Baerista");
  var TOOLS_DIR = path.join(HOME, "tools");
  var STATE_FILE = path.join(HOME, "installed.json");
  var CACHE_FILE = path.join(HOME, "registry-cache.json");
  // User-level CEP extensions folder (no admin rights needed).
  var CEP_EXT = process.platform === "win32"
    ? path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "Adobe", "CEP", "extensions")
    : path.join(os.homedir(), "Library", "Application Support", "Adobe", "CEP", "extensions");
  var SELF_DIR = cs.getSystemPath(SystemPath.EXTENSION);

  var $ = function (id) { return document.getElementById(id); };
  var state = readJSON(STATE_FILE, {});      // { id: { version, files: [localPath] } }
  var registry = null;
  var panelsFolder = "";

  // ── small helpers ───────────────────────────────────────────────
  function readJSON(file, fallback) {
    try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { return fallback; }
  }
  function writeJSON(file, obj) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(obj, null, 2));
  }
  function evalHost(fn, args) {
    var call = fn + "(" + (args || []).map(function (a) { return JSON.stringify(a); }).join(",") + ")";
    return new Promise(function (resolve) { cs.evalScript(call, resolve); });
  }
  function cmp(a, b) {
    var x = String(a).split("."), y = String(b).split(".");
    for (var i = 0; i < Math.max(x.length, y.length); i++) {
      var p = +(x[i] || 0), q = +(y[i] || 0);
      if (p !== q) return p > q ? 1 : -1;
    }
    return 0;
  }
  var toastTimer;
  function toast(msg, ms) {
    var t = $("toast");
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, ms || 3500);
  }
  function monogram(name) {
    var parts = name.replace(/[^A-Za-z ]/g, "").split(" ");
    return (parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2)).replace(/^(.)(.)/, function (m, a, b) { return a.toUpperCase() + b.toLowerCase(); });
  }
  function openURL(url) { cs.openURLInDefaultBrowser(url); }

  // ── theme: auto follows After Effects' panel colour ──────────────
  var THEMES = ["auto", "day", "night"];
  var themePref = localStorage.getItem("baerista.theme") || "auto";
  function hostIsDark() {
    try {
      var c = cs.getHostEnvironment().appSkinInfo.panelBackgroundColor.color;
      return (0.299 * c.red + 0.587 * c.green + 0.114 * c.blue) < 128;
    } catch (e) { return true; }
  }
  function applyTheme() {
    var t = themePref === "auto" ? (hostIsDark() ? "night" : "day") : themePref;
    document.documentElement.setAttribute("data-theme", t);
    $("theme").title = "Theme: " + themePref;
  }
  $("theme").addEventListener("click", function () {
    themePref = THEMES[(THEMES.indexOf(themePref) + 1) % THEMES.length];
    localStorage.setItem("baerista.theme", themePref);
    applyTheme();
    toast("Theme: " + themePref);
  });
  cs.addEventListener("com.adobe.csxs.events.ThemeColorChanged", applyTheme);

  // ── brand marks ──────────────────────────────────────────────────
  function inlineSVG(file, target) {
    try { $(target).innerHTML = fs.readFileSync(path.join(cs.getSystemPath(SystemPath.EXTENSION), "img", file), "utf8"); }
    catch (e) {}
  }
  $("wordmark").addEventListener("click", function (e) { e.preventDefault(); openURL(SITE); });

  // ── registry ─────────────────────────────────────────────────────
  function loadRegistry() {
    return fetch(REPO_RAW + "registry.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (json) { writeJSON(CACHE_FILE, json); return { json: json, offline: false }; })
      .catch(function () { return { json: readJSON(CACHE_FILE, null), offline: true }; });
  }

  var licences = readJSON(path.join(HOME, "licences.json"), {});   // { toolId: key } — stays on this computer
  function statusOf(tool) {
    var have = state[tool.id];
    if (tool.tier === "paid" && !have) return licences[tool.id] ? "available" : "locked";
    if (!have) return "available";
    return cmp(tool.version, have.version) > 0 ? "update" : "current";
  }

  // ── install / update ─────────────────────────────────────────────
  function sha256(buf) { return crypto.createHash("sha256").update(buf).digest("hex"); }

  function installTool(tool) {
    var written = [];
    var docked = false;
    return tool.files.reduce(function (p, f) {
      return p.then(function () {
        var req = f.path.indexOf("paid/") === 0
          ? fetch(PAID_API, { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ license: licences[tool.id] || "", product: tool.product || "", path: f.path }) })
          : fetch(REPO_RAW + f.path + "?t=" + Date.now(), { cache: "no-store" });
        return req
          .then(function (r) {
            if (r.ok) return r.arrayBuffer();
            return r.json().catch(function () { return {}; }).then(function (j) { throw new Error(j.error || ("Download failed (" + r.status + ")")); });
          })
          .then(function (ab) {
            var buf = Buffer.from(ab);
            if (f.sha256 && sha256(buf) !== f.sha256) throw new Error("Checksum mismatch — nothing was changed");
            var as = f.installAs || f.path;
            var name = path.basename(as);
            var local;
            if (as.indexOf("CEP/") === 0) local = path.join(CEP_EXT, as.slice(4));          // panel extension
            else if (as.indexOf("SELF/") === 0) local = path.join(SELF_DIR, as.slice(5));   // the bar itself
            else local = path.join(TOOLS_DIR, name);                                       // ScriptUI script
            fs.mkdirSync(path.dirname(local), { recursive: true });
            fs.writeFileSync(local, buf);
            written.push(local);
            // Dockable copy, if After Effects' panels folder is writable.
            if (panelsFolder && /ScriptUI Panels\//.test(f.installAs || "")) {
              try { fs.writeFileSync(path.join(panelsFolder, name), buf); docked = true; } catch (e) { /* needs admin rights */ }
            }
          });
      });
    }, Promise.resolve()).then(function () {
      if (!tool.id) return { docked: false, wasInstalled: true };      // the bar updating itself
      var wasInstalled = !!state[tool.id];
      state[tool.id] = { version: tool.version, files: written, docked: docked, at: new Date().toISOString() };
      writeJSON(STATE_FILE, state);
      return { docked: docked, wasInstalled: wasInstalled };
    });
  }

  function runInstall(tool, tile) {
    tile.classList.add("busy");
    return installTool(tool).then(function (res) {
      if (tool.kind === "cep") toast(tool.name + (res.wasInstalled ? " updated. Close and reopen its panel." : " installed. Restart After Effects once, then open it here or from Window › Extensions."), 6000);
      else if (res.wasInstalled) toast(tool.name + " updated to " + tool.version + ". Reopen its panel to load it.");
      else if (res.docked) toast(tool.name + " installed. Restart After Effects to dock it; until then it opens floating.", 5500);
      else toast(tool.name + " installed. It opens as a floating panel.", 4500);
    }).catch(function (e) {
      toast(tool.name + ": " + e.message, 5000);
    }).then(function () { render(); });
  }

  function launch(tool) {
    var have = state[tool.id];
    if (!have || !have.files.length) return;
    if (tool.kind === "cep") {
      try { cs.requestOpenExtension(tool.extensionId, ""); }
      catch (e) { toast("Open it from Window › Extensions › " + tool.name + "."); }
      return;
    }
    var file = have.files[0];
    evalHost("baerista_launch", [path.basename(file), file]).then(function (res) {
      if (res === "missing") { toast("The file is missing — reinstalling."); delete state[tool.id]; writeJSON(STATE_FILE, state); render(); }
      else if (res && res.indexOf("error:") === 0) toast(tool.name + " couldn't open: " + res.slice(6), 5000);
    });
  }

  // ── licences for paid tools ──────────────────────────────────────
  function askLicence(tool, tile) {
    $("licenceTitle").textContent = "Unlock " + tool.name;
    $("licenceKey").value = "";
    $("licence").hidden = false;
    $("licenceKey").focus();
    $("licenceBuy").onclick = function () { openURL(tool.gumroad || "https://designpraiseeric.gumroad.com"); };
    $("licenceCancel").onclick = function () { $("licence").hidden = true; };
    $("licenceForm").onsubmit = function (e) {
      e.preventDefault();
      var key = $("licenceKey").value.trim();
      if (!key) return;
      licences[tool.id] = key;
      $("licence").hidden = true;
      runInstall(tool, tile).then(function () {
        if (!state[tool.id]) { delete licences[tool.id]; }     // rejected: don't keep a bad key
        writeJSON(path.join(HOME, "licences.json"), licences);
        render();
      });
    };
  }

  // ── rendering ────────────────────────────────────────────────────
  function render() {
    var grid = $("grid");
    grid.innerHTML = "";
    if (!registry) { grid.innerHTML = '<p class="meta">Couldn\'t reach the tool list. Check your connection.</p>'; return; }

    var updates = [];
    registry.tools.forEach(function (tool, i) {
      var st = statusOf(tool);
      if (st === "update") updates.push(tool);
      var have = state[tool.id];

      var verb = { available: "Install", update: "Update", current: "Open", locked: "Unlock" }[st];
      var sub = {
        available: "v" + tool.version + " · free",
        update: (have && have.version) + " → " + tool.version,
        current: "v" + tool.version + (tool.kind === "cep" ? " · panel" : (have && have.docked ? " · docks" : " · floating")),
        locked: "Paid · enter your licence"
      }[st];
      var dot = { available: "none", update: "", current: "ok", locked: "none" }[st];

      var tile = document.createElement("div");
      tile.className = "tile" + (st === "locked" ? " locked" : "");
      tile.style.animationDelay = (i * 45) + "ms";
      tile.innerHTML =
        '<div class="cube">' +
          '<div class="face front">' +
            '<div class="row"><span class="mono"></span><span class="name"></span></div>' +
            '<div class="meta"><span class="dot ' + dot + '"></span><span class="ver"></span></div>' +
          '</div>' +
          '<div class="face action">' +
            '<span class="verb"></span><span class="sub"></span><button></button>' +
          '</div>' +
        '</div>';
      tile.querySelector(".mono").textContent = monogram(tool.name);
      tile.querySelector(".name").textContent = tool.name;
      tile.querySelector(".ver").textContent = have ? "v" + have.version + (st === "update" ? " · update" : "") : (st === "locked" ? "paid" : "not installed");
      tile.querySelector(".verb").textContent = verb;
      tile.querySelector(".sub").textContent = sub;
      var btn = tile.querySelector("button");
      btn.setAttribute("aria-label", verb + " " + tool.name);
      btn.title = tool.changelog || tool.name;
      btn.addEventListener("click", function () {
        if (st === "current") launch(tool);
        else if (st === "locked") askLicence(tool, tile);
        else runInstall(tool, tile);
      });
      grid.appendChild(tile);
    });

    var pill = $("status");
    pill.classList.toggle("has-updates", updates.length > 0);
    pill.textContent = updates.length ? updates.length + " update" + (updates.length > 1 ? "s" : "") : "Up to date";
    $("banner").hidden = updates.length < 2;
    $("bannerText").textContent = updates.length + " tools have updates";
    $("updateAll").onclick = function () {
      updates.reduce(function (p, t) { return p.then(function () { return installTool(t); }); }, Promise.resolve())
        .then(function () { toast("All tools updated. Reopen their panels to load the new versions."); })
        .catch(function (e) { toast(e.message, 5000); })
        .then(render);
    };

    var bv = $("barver");
    bv.textContent = "Baerista " + BAR_VERSION;
    if (registry.bar && cmp(registry.bar.version, BAR_VERSION) > 0) {
      bv.innerHTML = 'Baerista ' + BAR_VERSION + ' · <a href="#">update to ' + registry.bar.version + '</a>';
      bv.querySelector("a").onclick = function (e) {
        e.preventDefault();
        if (!registry.bar.files || !registry.bar.files.length) { openURL("https://github.com/designpraiseeric/baerista"); return; }
        toast("Updating Baerista…");
        installTool(registry.bar).then(function () { location.reload(); })
          .catch(function (err) { toast("Baerista update failed: " + err.message, 5000); });
      };
    }
  }

  // ── start ────────────────────────────────────────────────────────
  applyTheme();
  inlineSVG("mark.svg", "mark");
  inlineSVG("wordmark.svg", "wordmark");
  evalHost("baerista_panelsFolder").then(function (p) { panelsFolder = p || ""; });

  function refresh() {
    return loadRegistry().then(function (res) {
      registry = res.json;
      render();
      if (res.offline && registry) toast("Offline — showing the last tool list.");
    });
  }
  refresh();
  setInterval(refresh, 6 * 60 * 60 * 1000);   // re-check every 6 hours while AE is open
})();
