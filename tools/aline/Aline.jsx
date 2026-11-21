// ============================================================
//  AlignPointsToLine_v20_PhysicsNulls.jsx   (Complete, Compact, Tighten)
// ============================================================

(function buildUI(thisObj) {

    // ── DesignPraise core (brand mark + update check) ── injected by build.py; edit lib/dp-core.jsxinc ──
    var DP = (function () {
        var REGISTRY = "https://raw.githubusercontent.com/designpraiseeric/baerista/main/registry.json";
        var RAW_BASE = "https://raw.githubusercontent.com/designpraiseeric/baerista/main/";
        var SITE = "https://designpraiseeric.pages.dev/soon";
        var SECTION = "DesignPraise_Updates";
        var CHECK_EVERY_HOURS = 12;
        var IS_WIN = $.os.indexOf("Windows") !== -1;
        var SELF = File($.fileName);
        var MARK_LILAC = "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A\x00\x00\x00\x0D\x49\x48\x44\x52\x00\x00\x00\x11\x00\x00\x00\x14\x08\x06\x00\x00\x00\x6B\xA0\xD6\x49\x00\x00\x00\x06\x62\x4B\x47\x44\x00\xFF\x00\xFF\x00\xFF\xA0\xBD\xA7\x93\x00\x00\x01\xB7\x49\x44\x41\x54\x38\x8D\xED\x92\xBD\x6B\x14\x61\x18\xC4\x7F\xCF\x7B\xBB\xC2\x19\x85\xC4\x10\x0B\x0B\xED\x63\x25\x56\x41\x3C\xB0\xB0\x11\xC4\x46\x83\x64\x4F\xA2\xCD\x06\xC4\xC2\x13\x34\x5E\xB6\x49\xC4\x05\x2B\x03\x89\x08\xA7\x95\x92\x0D\x72\x8A\x12\x10\x05\xC5\x22\xA5\x76\x56\x5A\xC4\x46\x10\xB1\x50\xFC\xCC\xC1\xED\xC7\xD8\x28\x84\xBB\xCB\xFD\x05\x99\x76\x86\x79\x86\x99\x07\xB6\xD0\x09\xEB\x47\x36\x67\xB5\x2B\x4D\x59\x02\xBE\x01\x2B\x41\x6C\x0F\x7B\xE9\x5C\x3F\x93\x76\x9B\x29\xC4\x83\x20\xB6\xAA\x8C\x1F\x49\xA4\x0B\x42\x5D\x87\x3D\x80\x66\x4D\xE5\xB4\xCC\x15\x8C\xE3\x40\x09\xE3\xBD\x3C\x2E\x5B\xCA\x41\x8C\x47\x00\xAE\x60\x50\x46\x90\x44\x9C\x5F\x46\x5F\x0A\x58\xA8\xC6\xF6\x04\xC0\x35\x42\xF9\xD9\x76\x9E\x61\xFC\xF1\xD7\x39\x1C\xC4\x76\x40\x39\xB7\xD4\x26\x07\x06\xFD\x9C\xEF\x49\xA4\x19\xE0\x54\x06\x27\xAB\xB1\x8D\x66\x19\x93\x4E\x9C\x5D\x8E\x74\x09\xC0\x92\x48\x21\xB0\x2F\x88\x2D\xEA\x8C\x99\x44\x7A\x65\xA2\x26\xE3\xEE\x1E\x9F\x43\x47\x66\x2D\xFB\xCF\x35\x42\xF9\x3B\x46\x78\xED\xFB\x1C\x73\x26\x8E\xAA\x20\xD9\xA4\x96\xA1\xDC\xA8\x20\x1E\x6F\x34\x00\x98\xBA\x63\x29\x62\x25\x6B\x53\xE9\x5B\x2C\x22\x73\xC6\x6E\x0C\xBF\x9F\xCC\xC9\x78\x69\x8E\xA0\x93\x58\xAA\x6B\x14\xC7\x3A\xF0\x19\xE3\x6B\x27\xDF\x08\xE5\x63\x9C\x00\x56\xAD\x11\xCA\xDF\x39\xC2\x8B\x42\x3C\xDD\xD6\xE2\xF6\xF8\xBC\xB5\x92\x48\x15\x60\xB1\x10\xE7\xCC\x31\x86\xC8\x5D\xC1\xDB\xD4\xF1\x71\x32\xB6\x4F\xF7\xA7\xB5\xD7\x2B\xB1\x88\xB1\x3A\x11\xDB\x4D\xEB\x9A\x58\x0C\x01\x6F\x4A\x8E\x6B\xA7\xAF\xDB\xBB\x24\xD2\x8C\xE0\x03\xE2\xA7\x19\x57\x81\x01\x83\x5F\x1B\x27\xF6\x00\xC6\xE7\xAD\x05\xCC\x01\x73\xF7\xEA\x1A\xF6\x1C\x17\x25\x7E\xFF\x4B\x3E\xA6\x9C\xE6\x99\x1B\xB6\x06\x3C\xEF\xD5\x49\xCF\xB7\x6F\xD6\x54\x4E\x07\xA8\x53\xB0\xDF\x8C\xB5\x89\xD8\xA6\xFB\x0E\xB0\x85\x2E\xFC\x05\x4D\xC0\xAC\x92\xFB\x83\x0E\x54\x00\x00\x00\x00\x49\x45\x4E\x44\xAE\x42\x60\x82";
        var MARK_WHITE = "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A\x00\x00\x00\x0D\x49\x48\x44\x52\x00\x00\x00\x11\x00\x00\x00\x14\x08\x06\x00\x00\x00\x6B\xA0\xD6\x49\x00\x00\x00\x06\x62\x4B\x47\x44\x00\xFF\x00\xFF\x00\xFF\xA0\xBD\xA7\x93\x00\x00\x01\x2B\x49\x44\x41\x54\x38\x8D\xED\x92\xAD\x4B\xC3\x51\x18\x85\x9F\xFB\xC3\x85\x35\x3F\x50\x14\x3F\x92\x45\x05\x8B\x49\x85\x35\x05\x93\x18\xC4\x20\x18\x4D\xA6\x29\xC8\x56\x0C\xE2\xDF\x61\x99\x2C\x28\xC2\x10\x2C\x2A\xB2\x24\x82\x68\xB2\x69\x16\x83\xD5\xE2\xE0\xB1\xDC\xC1\xCF\x7D\x89\xE6\x9D\x74\xEF\x7B\x0E\xE7\x7D\xEF\x79\x2F\x74\xF1\x27\xA8\xFD\xEA\xA5\x5A\x52\xD7\xFF\x6B\x52\x50\xB7\xE2\x79\x59\xDD\x51\x43\xA3\x2E\x89\x82\xAC\x7A\xA0\x3E\xA8\x4F\x6A\x59\x1D\x03\xE6\x80\xBB\xA8\xED\x05\x36\x81\x67\xF5\x56\x5D\x4B\x77\xCB\xC4\xE2\x9E\x9A\x8D\xB5\x45\x75\x44\xBD\x56\x07\xD5\xA2\x7A\xAA\x8E\x46\x7E\x42\xAD\xA8\xF9\xBA\xC9\xB6\x7A\xD4\xE6\x39\x37\xEA\xAC\x7A\xAF\xF6\x34\x70\x19\xF5\x51\x1D\x4E\x80\x25\xE0\xA4\x4D\x2C\x7D\x40\x0E\x38\x0F\x21\xD4\xD2\x44\x08\xE1\x0B\xA8\x00\xB9\xE4\x97\x6C\x6B\xC0\x10\x90\xE9\x24\x4A\x80\xAB\x18\x58\xE3\x53\xA6\x81\x4F\xE0\x0D\xF8\x68\xC1\x67\x80\x55\xA0\x9A\x00\xC7\xC0\x82\xBA\x9B\x0A\x36\x07\x94\x81\x7C\x6C\xA4\x3A\x9F\x0E\x16\x38\x03\x4A\x21\x84\xF7\xBA\x6B\x7A\xC5\xAF\x71\xC5\x53\x91\x2B\xAA\x1B\xEA\x8A\x5A\x8D\x9A\x9F\x2B\x6E\x31\xE6\x80\x7A\xA8\x8E\xC7\xFB\x85\x3A\xD9\x29\x93\xA6\xDF\x57\x9F\x0C\x28\x00\x33\xC0\x4B\x08\x61\xBF\x93\x49\x17\xCD\xF8\x06\xA5\x9D\xF5\xDC\x62\x8A\x2B\xB7\x00\x00\x00\x00\x49\x45\x4E\x44\xAE\x42\x60\x82";

        function sh(cmd) { try { return system.callSystem(cmd) || ""; } catch (e) { return ""; } }

        function netAllowed() {
            try { return app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY") === 1; }
            catch (e) { return false; }
        }

        function openURL(url) {
            if (!netAllowed()) {
                alert("To open links, turn on Preferences > Scripting & Expressions >\n\"Allow Scripts to Write Files and Access Network\".\n\n" + url);
                return;
            }
            if (IS_WIN) sh('cmd.exe /c start "" "' + url + '"');
            else sh('open "' + url + '"');
        }

        function fetchText(url) {
            return sh((IS_WIN ? "curl.exe" : "curl") + ' -fsSL -m 8 "' + url + '"');
        }

        function cmpVersion(a, b) {
            var x = String(a).split("."), y = String(b).split(".");
            for (var i = 0; i < Math.max(x.length, y.length); i++) {
                var p = parseInt(x[i] || "0", 10), q = parseInt(y[i] || "0", 10);
                if (p !== q) return p > q ? 1 : -1;
            }
            return 0;
        }

        // Reads one tool's entry from registry.json without eval.
        function findEntry(json, id) {
            var start = json.indexOf('"id": "' + id + '"');
            if (start < 0) start = json.indexOf('"id":"' + id + '"');
            if (start < 0) return null;
            var next = json.indexOf('"id":', start + 6);
            var block = json.substring(start, next < 0 ? json.length : next);
            function grab(key) {
                var m = new RegExp('"' + key + '"\\s*:\\s*"([^"]*)"').exec(block);
                return m ? m[1] : null;
            }
            return { version: grab("version"), path: grab("path"), sha256: grab("sha256"), changelog: grab("changelog") || "" };
        }

        function sha256Of(file) {
            var out;
            if (IS_WIN) {
                out = sh('certutil -hashfile "' + file.fsName + '" SHA256');
                var lines = out.split(/\r?\n/);
                return lines.length > 1 ? lines[1].replace(/\s/g, "").toLowerCase() : "";
            }
            out = sh('shasum -a 256 "' + file.fsName + '"');
            return out.split(" ")[0].toLowerCase();
        }

        function installUpdate(meta, entry) {
            var msg = meta.name + " " + entry.version + " is available (you have " + meta.version + ").";
            if (entry.changelog) msg += "\n\n" + entry.changelog;
            if (!confirm(msg + "\n\nUpdate now?")) return;

            var tmp = File(Folder.temp.fsName + "/dp_" + meta.id + "_" + entry.version + ".jsx");
            sh((IS_WIN ? "curl.exe" : "curl") + ' -fsSL -m 30 -o "' + tmp.fsName + '" "' + RAW_BASE + entry.path + '"');
            if (!tmp.exists) { alert("The download didn't complete. Check your connection and try again."); return; }
            if (entry.sha256 && sha256Of(tmp) !== entry.sha256.toLowerCase()) {
                tmp.remove();
                alert("The downloaded file didn't match its checksum, so nothing was changed.");
                return;
            }
            if (tmp.copy(SELF.fsName)) {
                tmp.remove();
                alert(meta.name + " is now " + entry.version + ".\nClose this panel and reopen it from the Window menu.");
            } else {
                alert("After Effects couldn't overwrite the script (the folder may need admin rights).\n" +
                      "The new version is saved here — copy it over the old one:\n\n" + tmp.fsName);
                if (!IS_WIN) sh('open -R "' + tmp.fsName + '"');
            }
        }

        function check(meta, badge, force) {
            if (!netAllowed()) return;
            var key = meta.id + "_last";
            var now = new Date().getTime();
            try {
                if (!force && app.settings.haveSetting(SECTION, key)) {
                    var last = parseFloat(app.settings.getSetting(SECTION, key));
                    if (now - last < CHECK_EVERY_HOURS * 3600000) {
                        // Still show a known pending update without hitting the network.
                        if (app.settings.haveSetting(SECTION, meta.id + "_pending")) {
                            var pv = app.settings.getSetting(SECTION, meta.id + "_pending");
                            if (cmpVersion(pv, meta.version) > 0) showBadge(badge, pv);
                        }
                        return;
                    }
                }
                app.settings.saveSetting(SECTION, key, String(now));
            } catch (e) {}

            var json = fetchText(REGISTRY);
            if (!json) return;
            var entry = findEntry(json, meta.id);
            if (!entry || !entry.version) return;
            try { app.settings.saveSetting(SECTION, meta.id + "_pending", entry.version); } catch (e2) {}
            badge._entry = entry;
            if (cmpVersion(entry.version, meta.version) > 0) showBadge(badge, entry.version);
        }

        function showBadge(badge, v) {
            badge.text = "Update to " + v;
            badge.visible = true;
            try { badge.parent.layout.layout(true); } catch (e) {}
        }

        /** Adds the footer (update button + dp mark) to a ScriptUI container. */
        function footer(parent, meta) {
            var row = parent.add("group");
            row.orientation = "row";
            row.alignment = ["fill", "bottom"];
            row.alignChildren = ["left", "center"];
            row.margins = [0, 2, 0, 0];

            var badge = row.add("button", undefined, "Update");
            badge.visible = false;
            badge.helpTip = "A newer version is available";
            badge.onClick = function () {
                if (!badge._entry) {
                    var json = fetchText(REGISTRY);
                    badge._entry = json ? findEntry(json, meta.id) : null;
                }
                if (badge._entry) installUpdate(meta, badge._entry);
            };

            var ver = row.add("statictext", undefined, meta.name + " " + meta.version);
            ver.graphics.font = ScriptUI.newFont("dialog", "REGULAR", 9);
            try { ver.graphics.foregroundColor = ver.graphics.newPen(ver.graphics.PenType.SOLID_COLOR, [0.55, 0.55, 0.6], 1); } catch (e) {}

            var spacer = row.add("group");
            spacer.alignment = ["fill", "center"];

            var mark = row.add("iconbutton", undefined, ScriptUI.newImage(MARK_LILAC, MARK_LILAC, MARK_WHITE, MARK_WHITE), { style: "toolbutton" });
            mark.alignment = ["right", "center"];
            mark.helpTip = "designpraise — click to visit the site";
            mark.onClick = function () { openURL(SITE); };

            // Test harness hook (only defined while Baerista's test script runs).
            if (typeof $.global.__dpTestHook === "function") { try { $.global.__dpTestHook(meta.id, parent); } catch (eH) {} }

            // Check after the panel has drawn, so opening it never waits on the network.
            var cbName = "__dpUpd_" + meta.id;
            $.global[cbName] = function () { check(meta, badge, false); };
            try { app.scheduleTask("try{$.global." + cbName + "();}catch(e){}", 1500, false); } catch (e3) {}
            return row;
        }

        return { footer: footer, openURL: openURL, site: SITE };
    })();
    // ── end DesignPraise core ──


    var state = {
        pathProp:    null,
        layer:       null,
        comp:        null,
        numPoints:   0,
        populating:  false
    };

    // ── Window / Panel ─────────────────────────────────────
    var win = (thisObj instanceof Panel)
        ? thisObj
        : new Window("palette", "Aline", undefined, { resizeable: true });

    win.orientation   = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing       = 0;
    win.margins       = 0;

    // ── Header ─────────────────────────────────────────────
    var hdr = win.add("group");
    hdr.orientation   = "column";
    hdr.alignChildren = ["center", "top"];
    hdr.spacing       = 1;
    hdr.margins       = [8, 8, 8, 4];

    var hdrTitle = hdr.add("statictext", undefined, "ALIGN POINTS TO LINE");
    hdrTitle.graphics.font = ScriptUI.newFont("dialog", "BOLD", 11);

    var hdrSub = hdr.add("statictext", undefined, "Tangent Tighten controls curve sharpness");
    hdrSub.graphics.font = ScriptUI.newFont("dialog", "REGULAR", 8);

    var sep0 = win.add("panel", undefined, "");
    sep0.maximumSize.height = 1;
    sep0.alignment = ["fill", "top"];

    // ── Main group ─────────────────────────────────────────
    var mainGroup = win.add("group");
    mainGroup.orientation   = "column";
    mainGroup.alignChildren = ["fill", "top"];
    mainGroup.spacing       = 4;
    mainGroup.margins       = 8;

    // ── Step 1 — Scan (compact) ────────────────────────────
    var step1 = mainGroup.add("panel", undefined, "Step 1 — Scan Path");
    step1.orientation   = "column";
    step1.alignChildren = ["fill", "top"];
    step1.spacing       = 2;
    step1.margins       = [6, 8, 6, 6];

    var radioSel  = step1.add("radiobutton", undefined, "Use selected Path property in timeline");
    var radioAuto = step1.add("radiobutton", undefined, "Auto-find first path on layer");
    radioSel.value = true;

    var scanBtn = step1.add("button", undefined, "↺  SCAN PATH");

    var scanStatus = step1.add("statictext", undefined, "No path scanned yet.", { multiline: true });
    scanStatus.graphics.font      = ScriptUI.newFont("dialog", "REGULAR", 8);
    scanStatus.maximumSize.height = 20;

    // ── Step 2 — Point List ────────────────────────────────
    var step2 = mainGroup.add("panel", undefined, "Step 2 — Select Points  (Shift / Ctrl+click)");
    step2.orientation   = "column";
    step2.alignChildren = ["fill", "top"];
    step2.spacing       = 2;
    step2.margins       = [6, 8, 6, 6];

    var listRow = step2.add("group");
    listRow.orientation   = "row";
    listRow.alignChildren = ["fill", "top"];
    listRow.spacing       = 2;

    var pointList = listRow.add("listbox", undefined, [], { multiselect: true });
    pointList.preferredSize = [130, 90];

    var btnCol = listRow.add("group");
    btnCol.orientation   = "column";
    btnCol.alignChildren = ["fill", "top"];
    btnCol.spacing       = 2;

    var allBtn         = btnCol.add("button", undefined, "ALL");
    var noneBtn        = btnCol.add("button", undefined, "NONE");
    var invertBtn      = btnCol.add("button", undefined, "INVERT");
    var createNullsBtn = btnCol.add("button", undefined, "CREATE NULLS");
    createNullsBtn.helpTip = "Creates tracking nulls with Elastic/Bounce physics for the selected points.";

    var countTxt = btnCol.add("statictext", undefined, "0 selected");
    countTxt.graphics.font = ScriptUI.newFont("dialog", "REGULAR", 8);

    // ── Step 3 — Animation Options (TABBED) ────────────────
    var step3 = mainGroup.add("panel", undefined, "Step 3 — Animation Options");
    step3.orientation   = "column";
    step3.alignChildren = ["fill", "top"];
    step3.spacing       = 2;
    step3.margins       = [6, 8, 6, 6];

    // Tab bar
    var tabBar = step3.add("group");
    tabBar.orientation = "row";
    tabBar.alignChildren = ["left", "center"];
    tabBar.spacing = 1;

    var tabTiming = tabBar.add("radiobutton", undefined, "Timing");
    var tabLine   = tabBar.add("radiobutton", undefined, "Line Setup");
    var tabPhys   = tabBar.add("radiobutton", undefined, "Physics");
    tabTiming.value = true;

    // Content group
    var tabContent = step3.add("group");
    tabContent.orientation   = "stack";
    tabContent.alignChildren = ["fill", "top"];
    tabContent.spacing       = 0;
    tabContent.margins       = 0;

    // ── Timing tab (compact) ───────────────────────────────
    var panelTiming = tabContent.add("panel", undefined, "");
    panelTiming.orientation   = "column";
    panelTiming.alignChildren = ["fill", "top"];
    panelTiming.spacing       = 2;
    panelTiming.margins       = [0, 2, 0, 0];

    var timingRow1 = panelTiming.add("group");
    timingRow1.orientation = "row";
    timingRow1.alignChildren = ["left", "center"];
    timingRow1.spacing = 4;
    timingRow1.add("statictext", undefined, "Stagger:"); var staggerInput = timingRow1.add("edittext", undefined, "3"); staggerInput.characters = 3;
    timingRow1.add("statictext", undefined, "Travel:"); var travelInput = timingRow1.add("edittext", undefined, "10"); travelInput.characters = 3;

    var timingRow2 = panelTiming.add("group");
    timingRow2.orientation = "row";
    timingRow2.alignChildren = ["left", "center"];
    timingRow2.spacing = 4;
    timingRow2.add("statictext", undefined, "Easing:"); var easeDD = timingRow2.add("dropdownlist", undefined, ["Linear", "Ease In", "Ease Out", "Ease In & Out"]); easeDD.selection = 3; easeDD.preferredSize = [100, 20];

    var timingRow3 = panelTiming.add("group");
    timingRow3.orientation = "row";
    timingRow3.alignChildren = ["left", "center"];
    timingRow3.spacing = 4;
    timingRow3.add("statictext", undefined, "Dir:"); var radioTimeFirst = timingRow3.add("radiobutton", undefined, "First→Last"); var radioTimeLast = timingRow3.add("radiobutton", undefined, "Last→First"); radioTimeFirst.value = true;

    // ── Line Setup tab (compact) ───────────────────────────
    var panelLine = tabContent.add("panel", undefined, "");
    panelLine.orientation   = "column";
    panelLine.alignChildren = ["fill", "top"];
    panelLine.spacing       = 2;
    panelLine.margins       = [0, 2, 0, 0];
    panelLine.visible = false;

    var lineRow1 = panelLine.add("group");
    lineRow1.orientation = "row"; lineRow1.alignChildren = ["left", "center"]; lineRow1.spacing = 4;
    lineRow1.add("statictext", undefined, "Angle:"); var angleInput = lineRow1.add("edittext", undefined, "0"); angleInput.characters = 3;
    lineRow1.add("statictext", undefined, "Ref:"); var radioRefVertex = lineRow1.add("radiobutton", undefined, "Vtx"); var radioRefCustom = lineRow1.add("radiobutton", undefined, "Cstm"); radioRefVertex.value = true;
    var refVertexInput = lineRow1.add("edittext", undefined, "0"); refVertexInput.characters = 3;
    var refCustomX = lineRow1.add("edittext", undefined, "0"); refCustomX.characters = 4; refCustomX.visible = false;
    var refCustomY = lineRow1.add("edittext", undefined, "0"); refCustomY.characters = 4; refCustomY.visible = false;
    function updateRefVisibility() {
        refVertexInput.visible = radioRefVertex.value;
        refCustomX.visible = radioRefCustom.value;
        refCustomY.visible = radioRefCustom.value;
        win.layout.layout(true);
    }
    radioRefVertex.onClick = updateRefVisibility;
    radioRefCustom.onClick = updateRefVisibility;

    var lineRow2 = panelLine.add("group");
    lineRow2.orientation = "row"; lineRow2.alignChildren = ["left", "center"]; lineRow2.spacing = 4;
    lineRow2.add("statictext", undefined, "Tensile:"); var fidelityInput = lineRow2.add("edittext", undefined, "100"); fidelityInput.characters = 3;
    lineRow2.add("statictext", undefined, "Tighten:"); var tangentTightenInput = lineRow2.add("edittext", undefined, "0"); tangentTightenInput.characters = 3; tangentTightenInput.helpTip = "Frames over which tangents shrink to zero. 0 = immediate snap.";

    var lineRow3 = panelLine.add("group");
    lineRow3.orientation = "row"; lineRow3.alignChildren = ["left", "center"]; lineRow3.spacing = 4;
    lineRow3.add("statictext", undefined, "Drift:"); var driftInput = lineRow3.add("edittext", undefined, "0"); driftInput.characters = 3;
    var chainDriftCb = lineRow3.add("checkbox", undefined, "Chain Drift"); chainDriftCb.value = false;

    var focalDriftGrp = panelLine.add("group");
    focalDriftGrp.orientation = "row"; focalDriftGrp.alignChildren = ["left", "center"]; focalDriftGrp.spacing = 4;
    focalDriftGrp.add("statictext", undefined, "Focal drift:"); var focalDriftInput = focalDriftGrp.add("edittext", undefined, "0"); focalDriftInput.characters = 3;
    var focalDirToggle = focalDriftGrp.add("checkbox", undefined, "+ dir"); focalDirToggle.value = true;
    var focalRampDD = focalDriftGrp.add("dropdownlist", undefined, [
        "None","Linear","Quad In","Quad Out","Quad InOut","Cubic In","Cubic Out","Cubic InOut","Sine In","Sine Out","Sine InOut",
        "Expo In","Expo Out","Expo InOut","Back In","Back Out","Back InOut","Bounce In","Bounce Out","Bounce InOut",
        "Elastic In","Elastic Out","Elastic InOut"
    ]); focalRampDD.selection = 0; focalRampDD.preferredSize = [100, 20];
    function updateFocalControls() {
        var en = chainDriftCb.value;
        focalDriftInput.enabled = en;
        focalDirToggle.enabled = en;
        focalRampDD.enabled = en;
        win.layout.layout(true);
    }
    chainDriftCb.onClick = function() { updateFocalControls(); };
    updateFocalControls();

    // ── Physics tab (compact) ──────────────────────────────
    var panelPhysics = tabContent.add("panel", undefined, "");
    panelPhysics.orientation   = "column";
    panelPhysics.alignChildren = ["fill", "top"];
    panelPhysics.spacing       = 2;
    panelPhysics.margins       = [0, 2, 0, 0];
    panelPhysics.visible = false;
    panelPhysics.add("statictext", undefined, "Master Physics null is created when you run the alignment with the nulls rig enabled.").graphics.font = ScriptUI.newFont("dialog", "REGULAR", 8);
    var useNullsCb = panelPhysics.add("checkbox", undefined, "Create Kinematic Nulls Rig"); useNullsCb.value = false;

    // ── Tab switching ──────────────────────────────────────
    function showTab(which) {
        panelTiming.visible = (which === "timing");
        panelLine.visible   = (which === "line");
        panelPhysics.visible = (which === "physics");
        step3.layout.layout(true);
        win.layout.layout(true);
    }
    tabTiming.onClick = function () { if (tabTiming.value) showTab("timing"); };
    tabLine.onClick   = function () { if (tabLine.value)   showTab("line"); };
    tabPhys.onClick   = function () { if (tabPhys.value)   showTab("physics"); };

    // ── Run button and result ──────────────────────────────
    var runBtn = mainGroup.add("button", undefined, "▶  ALIGN TO LINE");
    runBtn.alignment = ["fill", "center"];

    var resultTxt = mainGroup.add("statictext", undefined, "", { multiline: true });
    resultTxt.graphics.font      = ScriptUI.newFont("dialog", "REGULAR", 8);
    resultTxt.maximumSize.height = 30;

    if (!(win instanceof Panel)) {
        win.preferredSize = [340, 680];
        win.minimumSize   = [300, 580];
    }

    // ══════════════════════════════════════════════════════
    //  SCAN
    // ══════════════════════════════════════════════════════
    scanBtn.onClick = function () {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) { setStatus("✖  No active Composition.", false); return; }
        var layer = comp.selectedLayers[0];
        if (!layer) { setStatus("✖  No layer selected.", false); return; }

        var pp = null;
        if (radioSel.value) {
            var sp = layer.selectedProperties;
            for (var i = 0; i < sp.length; i++) {
                if (sp[i].matchName === "ADBE Vector Shape" || sp[i].matchName === "ADBE Mask Shape") { pp = sp[i]; break; }
            }
            if (!pp) { setStatus("✖  No Path property selected.\nClick the Path name in the timeline first.", false); return; }
        } else {
            if (layer.mask && layer.mask.numProperties > 0) pp = layer.mask(1).property("ADBE Mask Shape");
            if (!pp && layer.property("ADBE Root Vectors Group")) pp = findFirstShapePath(layer.property("ADBE Root Vectors Group"));
            if (!pp) { setStatus("✖  No path found on this layer.", false); return; }
        }

        var pv;
        try { pv = pp.valueAtTime(comp.time, false); }
        catch (e) { setStatus("✖  Could not read path:\n" + e, false); return; }

        state.pathProp = pp; state.layer = layer; state.comp = comp; state.numPoints = pv.vertices.length;
        if (state.numPoints === 0) { setStatus("✖  Path has 0 vertices.", false); return; }

        refVertexInput.text = String(state.numPoints - 1);

        state.populating = true;
        pointList.removeAll();
        for (var j = 0; j < state.numPoints; j++) {
            pointList.add("item", "Pt " + j + "  (" + Math.round(pv.vertices[j][0]) + ", " + Math.round(pv.vertices[j][1]) + ")");
        }
        state.populating = false;

        updateCount();
        var lastIdx = state.numPoints - 1;
        setStatus("✔  " + state.numPoints + " points. Ref vertex " + lastIdx +
            " (" + Math.round(pv.vertices[lastIdx][0]) + ", " +
            Math.round(pv.vertices[lastIdx][1]) + ")", true);
    };

    // ══════════════════════════════════════════════════════
    //  CREATE NULLS — PHYSICS RIG
    // ══════════════════════════════════════════════════════
    createNullsBtn.onClick = function () {
        if (!state.pathProp || !state.layer || !state.comp) { setResult("✖  No valid path or layer. Re-scan.", false); return; }

        var selected = [];
        for (var i = 0; i < pointList.items.length; i++) if (pointList.items[i].selected) selected.push(i);
        if (selected.length === 0) { setResult("✖  Select at least one point.", false); return; }

        app.beginUndoGroup("Create Elastic Tracking Nulls");
        var created = 0;
        try {
            var propPathStr = getExpressionPath(state.pathProp);

            // Clean up old Master Physics
            for (var idx = 1; idx <= state.comp.numLayers; idx++) {
                if (state.comp.layer(idx).name === "Master Physics") {
                    state.comp.layer(idx).remove();
                    break;
                }
            }

            // Create new Master Physics
            var masterNull = state.comp.layers.addNull();
            masterNull.name = "Master Physics";
            masterNull.property("Anchor Point").setValue([0, 0]);
            var masterFx = masterNull.property("Effects");
            var masterAmp = masterFx.addProperty("ADBE Slider Control");
            masterAmp.name = "Amplitude";
            masterAmp.property(1).setValue(100);
            var masterFreq = masterFx.addProperty("ADBE Slider Control");
            masterFreq.name = "Frequency";
            masterFreq.property(1).setValue(100);
            var masterDecay = masterFx.addProperty("ADBE Slider Control");
            masterDecay.name = "Decay";
            masterDecay.property(1).setValue(100);
            var masterBounce = masterFx.addProperty("ADBE Checkbox Control");
            masterBounce.name = "Use Bounce (Off = Elastic)";
            masterBounce.property(1).setValue(0);
            var masterBounceEaseIn = masterFx.addProperty("ADBE Slider Control");
            masterBounceEaseIn.name = "Bounce Ease‑In";
            masterBounceEaseIn.property(1).setValue(5);
            var masterBounceDuration = masterFx.addProperty("ADBE Slider Control");
            masterBounceDuration.name = "Bounce Duration";
            masterBounceDuration.property(1).setValue(0);

            for (var idx = 0; idx < selected.length; idx++) {
                var ptIdx     = selected[idx];
                var nullLayer = state.comp.layers.addNull();
                nullLayer.name = state.layer.name + " Point " + ptIdx;
                nullLayer.parent = state.layer;
                nullLayer.transform.anchorPoint.setValue([0, 0]);

                var fxGrp   = nullLayer.property("Effects");
                var cbBounce = fxGrp.addProperty("ADBE Checkbox Control");
                cbBounce.name = "Use Bounce (Off = Elastic)";
                cbBounce.property(1).setValue(0);

                var slAmp = fxGrp.addProperty("ADBE Slider Control");
                slAmp.name = "Amplitude";
                slAmp.property(1).setValue(15);

                var slFreq = fxGrp.addProperty("ADBE Slider Control");
                slFreq.name = "Frequency";
                slFreq.property(1).setValue(3);

                var slDecay = fxGrp.addProperty("ADBE Slider Control");
                slDecay.name = "Decay";
                slDecay.property(1).setValue(5);

                var slBounceEaseIn = fxGrp.addProperty("ADBE Slider Control");
                slBounceEaseIn.name = "Bounce Ease‑In";
                slBounceEaseIn.property(1).setValue(5);

                var slBounceDuration = fxGrp.addProperty("ADBE Slider Control");
                slBounceDuration.name = "Bounce Duration";
                slBounceDuration.property(1).setValue(0);

                // Link to Master Physics
                slAmp.property(1).expression =
                    "15 * thisComp.layer('Master Physics').effect('Amplitude')('Slider') / 100";
                slFreq.property(1).expression =
                    "3 * thisComp.layer('Master Physics').effect('Frequency')('Slider') / 100";
                slDecay.property(1).expression =
                    "5 * thisComp.layer('Master Physics').effect('Decay')('Slider') / 100";
                cbBounce.property(1).expression =
                    "thisComp.layer('Master Physics').effect('Use Bounce (Off = Elastic)')('Checkbox')";
                slBounceEaseIn.property(1).expression =
                    "thisComp.layer('Master Physics').effect('Bounce Ease‑In')('Slider')";
                slBounceDuration.property(1).expression =
                    "thisComp.layer('Master Physics').effect('Bounce Duration')('Slider')";

                // Position expression (with bounce duration/ease-in)
                var posExpr =
                    "try {\n" +
                    "  var myPath = thisLayer.parent" + propPathStr + ";\n" +
                    "  var ptIdx = " + ptIdx + ";\n" +
                    "  var val = myPath.points()[ptIdx];\n" +
                    "  var n = 0;\n" +
                    "  if (myPath.numKeys > 0) {\n" +
                    "    n = myPath.nearestKey(time).index;\n" +
                    "    if (myPath.key(n).time > time) n--;\n" +
                    "  }\n" +
                    "  if (n > 0) {\n" +
                    "    var tKey = myPath.key(n).time;\n" +
                    "    var dt = time - tKey;\n" +
                    "    if (dt > 0 && dt < 4) {\n" +
                    "      var t0 = tKey - 0.01;\n" +
                    "      var p0 = myPath.points(t0)[ptIdx];\n" +
                    "      var p1 = myPath.points(tKey)[ptIdx];\n" +
                    "      var v = [(p1[0]-p0[0])/0.01, (p1[1]-p0[1])/0.01];\n" +
                    "      var isBounce = effect('Use Bounce (Off = Elastic)')('Checkbox').value;\n" +
                    "      var amp   = effect('Amplitude')('Slider').value / 100;\n" +
                    "      var freq  = effect('Frequency')('Slider').value;\n" +
                    "      var decay = effect('Decay')('Slider').value;\n" +
                    "      var w = freq * Math.PI * 2;\n" +
                    "      var mult = isBounce == 1\n" +
                    "        ? amp * Math.abs(Math.sin(dt * w)) * Math.exp(-decay * dt)\n" +
                    "        : (amp / w) * Math.sin(dt * w) * Math.exp(-decay * dt);\n" +
                    "      var easeInFrames = effect('Bounce Ease‑In')('Slider').value;\n" +
                    "      if (easeInFrames > 0) {\n" +
                    "        var easeInSec = easeInFrames * thisComp.frameDuration;\n" +
                    "        var ramp = Math.min(dt / easeInSec, 1);\n" +
                    "        mult *= ramp;\n" +
                    "      }\n" +
                    "      var duration = effect('Bounce Duration')('Slider').value;\n" +
                    "      if (duration > 0 && dt > duration * thisComp.frameDuration) {\n" +
                    "        mult = 0;\n" +
                    "      }\n" +
                    "      val = [val[0] + v[0]*mult, val[1] + v[1]*mult];\n" +
                    "    }\n" +
                    "  }\n" +
                    "  val;\n" +
                    "} catch(e) { value; }";
                nullLayer.transform.position.expression = posExpr;

                var genericExpr =
                    "try {\n" +
                    "  var n = 0;\n" +
                    "  if (numKeys > 0) {\n" +
                    "    n = nearestKey(time).index;\n" +
                    "    if (key(n).time > time) n--;\n" +
                    "  }\n" +
                    "  if (n == 0) { value; } else {\n" +
                    "    var dt = time - key(n).time;\n" +
                    "    if (dt > 0 && dt < 4) {\n" +
                    "      var v = velocityAtTime(key(n).time - thisComp.frameDuration/10);\n" +
                    "      var isBounce = effect('Use Bounce (Off = Elastic)')('Checkbox').value;\n" +
                    "      var amp   = effect('Amplitude')('Slider').value / 100;\n" +
                    "      var freq  = effect('Frequency')('Slider').value;\n" +
                    "      var decay = effect('Decay')('Slider').value;\n" +
                    "      var w = freq * Math.PI * 2;\n" +
                    "      var osc = isBounce == 1\n" +
                    "        ? v * amp * Math.abs(Math.sin(dt*w)) * Math.exp(-decay*dt)\n" +
                    "        : (v * amp / w) * Math.sin(dt*w) * Math.exp(-decay*dt);\n" +
                    "      var easeInFrames = effect('Bounce Ease‑In')('Slider').value;\n" +
                    "      if (easeInFrames > 0) {\n" +
                    "        var easeInSec = easeInFrames * thisComp.frameDuration;\n" +
                    "        var ramp = Math.min(dt / easeInSec, 1);\n" +
                    "        osc = osc * ramp;\n" +
                    "      }\n" +
                    "      var duration = effect('Bounce Duration')('Slider').value;\n" +
                    "      if (duration > 0 && dt > duration * thisComp.frameDuration) {\n" +
                    "        osc = 0;\n" +
                    "      }\n" +
                    "      value + osc;\n" +
                    "    } else { value; }\n" +
                    "  }\n" +
                    "} catch(e) { value; }";
                nullLayer.transform.scale.expression    = genericExpr;
                nullLayer.transform.rotation.expression = genericExpr;

                created++;
            }
            setResult("✔  Created " + created + " physics null(s).", true);
        } catch (e) {
            setResult("✖  Error: " + e, false);
        } finally {
            app.endUndoGroup();
        }
    };

    // ══════════════════════════════════════════════════════
    //  BATCH BUTTONS
    // ══════════════════════════════════════════════════════
    allBtn.onClick    = function () { for (var i = 0; i < pointList.items.length; i++) pointList.items[i].selected = true;  updateCount(); };
    noneBtn.onClick   = function () { for (var i = 0; i < pointList.items.length; i++) pointList.items[i].selected = false; updateCount(); };
    invertBtn.onClick = function () { for (var i = 0; i < pointList.items.length; i++) pointList.items[i].selected = !pointList.items[i].selected; updateCount(); };
    pointList.onChange = function () { if (!state.populating) updateCount(); };

    function updateCount() {
        var c = 0;
        for (var i = 0; i < pointList.items.length; i++) if (pointList.items[i].selected) c++;
        countTxt.text = c + " of " + state.numPoints + " selected";
    }

    // ══════════════════════════════════════════════════════
    //  RAMP HELPERS
    // ══════════════════════════════════════════════════════
    function applyRamp(p, rampIndex) {
        switch (rampIndex) {
            case 0:  return 1;                      // None
            case 1:  return p;                      // Linear
            case 2:  return p * p;                  // Quad In
            case 3:  return 1 - (1-p)*(1-p);        // Quad Out
            case 4:  return p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2; // Quad InOut
            case 5:  return p * p * p;              // Cubic In
            case 6:  return 1 - Math.pow(1-p, 3);   // Cubic Out
            case 7:  return p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p+2, 3)/2; // Cubic InOut
            case 8:  return 1 - Math.cos((p * Math.PI) / 2);     // Sine In
            case 9:  return Math.sin((p * Math.PI) / 2);         // Sine Out
            case 10: return -(Math.cos(Math.PI * p) - 1) / 2;   // Sine InOut
            case 11: return p === 0 ? 0 : Math.pow(2, 10 * p - 10); // Expo In
            case 12: return p === 1 ? 1 : 1 - Math.pow(2, -10 * p); // Expo Out
            case 13: return p < 0.5 ? Math.pow(2, 20 * p - 10) / 2
                                    : (2 - Math.pow(2, -20 * p + 10)) / 2; // Expo InOut
            case 14: var c1 = 1.70158; var c3 = c1 + 1;
                      return c3 * p * p * p - c1 * p * p; // Back In
            case 15: var c1 = 1.70158; var c3 = c1 + 1;
                      return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); // Back Out
            case 16: var c1 = 1.70158; var c2 = c1 * 1.525;
                      return p < 0.5
                          ? (Math.pow(2*p, 2) * ((c2+1)*2*p - c2)) / 2
                          : (Math.pow(2*p-2, 2) * ((c2+1)*(2*p-2) + c2) + 2) / 2; // Back InOut
            case 17: return 1 - bounceOut(1 - p); // Bounce In
            case 18: return bounceOut(p);          // Bounce Out
            case 19: return p < 0.5
                          ? (1 - bounceOut(1 - 2*p)) / 2
                          : (1 + bounceOut(2*p - 1)) / 2; // Bounce InOut
            case 20: return elasticIn(p);          // Elastic In
            case 21: return elasticOut(p);         // Elastic Out
            case 22: return elasticInOut(p);       // Elastic InOut
            default: return p;
        }
    }

    function bounceOut(t) {
        var n1 = 7.5625;
        var d1 = 2.75;
        if (t < 1 / d1) {
            return n1 * t * t;
        } else if (t < 2 / d1) {
            t -= 1.5 / d1;
            return n1 * t * t + 0.75;
        } else if (t < 2.5 / d1) {
            t -= 2.25 / d1;
            return n1 * t * t + 0.9375;
        } else {
            t -= 2.625 / d1;
            return n1 * t * t + 0.984375;
        }
    }

    function elasticIn(t) {
        if (t === 0 || t === 1) return t;
        var c4 = (2 * Math.PI) / 3;
        return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
    }

    function elasticOut(t) {
        if (t === 0 || t === 1) return t;
        var c4 = (2 * Math.PI) / 3;
        return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    }

    function elasticInOut(t) {
        if (t === 0 || t === 1) return t;
        var c5 = (2 * Math.PI) / 4.5;
        if (t < 0.5) {
            return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
        } else {
            return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
        }
    }

    // ══════════════════════════════════════════════════════
    //  RUN  (updated with Tangent Tighten)
    // ══════════════════════════════════════════════════════
    runBtn.onClick = function () {
        try {
            var msg = doAlign(true, radioTimeFirst.value, useNullsCb.value);
            setResult(msg, msg.charAt(0) === "✔");
        } catch (e) {
            alert("Script Error:\n" + e.toString());
            setResult("✖  Script error: " + e.toString(), false);
        }
    };

    function doAlign(ascending, timeFirstToLast, useNulls) {
        if (!state.pathProp) return "✖  Scan a path first.";

        var chosen = [];
        for (var i = 0; i < pointList.items.length; i++) if (pointList.items[i].selected) chosen.push(i);
        if (chosen.length < 2) return "✖  Select at least 2 points.";

        var comp = state.comp || app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) return "✖  No active Composition.";
        var layer = state.layer || comp.selectedLayers[0];

        var fps           = comp.frameRate;
        var staggerFrames = parseFloat(staggerInput.text) || 0;
        var travelFrames  = parseFloat(travelInput.text)  || 1;
        var startTime     = comp.time;
        var fidelityPct   = parseFloat(fidelityInput.text) || 100;
        if (fidelityPct <= 0) fidelityPct = 1;
        var driftStrength = parseFloat(driftInput.text) || 0;
        var useChainDrift = chainDriftCb.value;
        var lineAngleDeg  = parseFloat(angleInput.text) || 0;
        var lineAngleRad  = lineAngleDeg * Math.PI / 180;
        var ux = Math.cos(lineAngleRad);
        var uy = Math.sin(lineAngleRad);
        var tightenFrames = parseFloat(tangentTightenInput.text) || 0;

        // Reference point
        var refX, refY;
        if (radioRefCustom.value) {
            refX = parseFloat(refCustomX.text);
            refY = parseFloat(refCustomY.text);
            if (isNaN(refX) || isNaN(refY)) return "✖  Invalid custom reference coordinates.";
        } else {
            var refIdx = parseInt(refVertexInput.text);
            if (isNaN(refIdx)) return "✖  Invalid reference vertex index.";
            var pvSnap;
            try { pvSnap = state.pathProp.valueAtTime(startTime, false); }
            catch (e) { return "✖  Could not read path."; }
            if (refIdx < 0 || refIdx >= pvSnap.vertices.length) return "✖  Ref index out of range.";
            refX = pvSnap.vertices[refIdx][0];
            refY = pvSnap.vertices[refIdx][1];
        }

        var pvSnap;
        try { pvSnap = state.pathProp.valueAtTime(startTime, false); }
        catch (e) { return "✖  Could not read path."; }

        var points = [];
        for (var ci = 0; ci < chosen.length; ci++) {
            var idx = chosen[ci];
            points.push({
                idx:     idx,
                origX:   pvSnap.vertices[idx][0],
                origY:   pvSnap.vertices[idx][1],
                origIn:  [pvSnap.inTangents[idx][0],  pvSnap.inTangents[idx][1]],
                origOut: [pvSnap.outTangents[idx][0], pvSnap.outTangents[idx][1]]
            });
        }

        // Sort by original vertex index ASCENDING
        points.sort(function(a, b) { return a.idx - b.idx; });
        for (var i = 0; i < points.length; i++) {
            points[i].timingRank = timeFirstToLast ? i : (points.length - 1 - i);
        }

        var focalPoint, focalIdxInSorted;
        if (timeFirstToLast) {
            focalPoint = points[0];
            focalIdxInSorted = 0;
        } else {
            focalPoint = points[points.length - 1];
            focalIdxInSorted = points.length - 1;
        }

        for (var b = 0; b < points.length; b++) {
            points[b].proj = (points[b].origX - refX) * ux + (points[b].origY - refY) * uy;
        }

        var chosenIdxArray = [];
        for (var ci = 0; ci < points.length; ci++) chosenIdxArray.push(points[ci].idx);
        var arcLen = approxArcLength(pvSnap, chosenIdxArray);
        if (arcLen < 1) arcLen = Math.abs(points[points.length-1].proj - points[0].proj) || (points.length-1)*10;
        var finalSpan = Math.max(1, arcLen * (fidelityPct / 100));
        var step = (points.length > 1) ? finalSpan / (points.length - 1) : 0;

        var focalDriftVal = parseFloat(focalDriftInput.text) || 0;
        var focalDriftSign = focalDirToggle.value ? 1 : -1;
        var rampIndex = focalRampDD.selection ? focalRampDD.selection.index : 0;

        var perpUx = -uy;
        var perpUy = ux;

        var focalPerpProj = (focalPoint.origX - refX) * ux + (focalPoint.origY - refY) * uy;
        var focalFinalT;
        if (useChainDrift) {
            focalFinalT = focalPerpProj + focalDriftVal * focalDriftSign;
        } else {
            focalFinalT = focalPerpProj;
        }

        var orderSign = -focalDriftSign;
        for (var i = 0; i < points.length; i++) {
            var dist = Math.abs(i - focalIdxInSorted);
            points[i].targetT = focalFinalT + orderSign * dist * step;
            points[i].targetX = refX + points[i].targetT * ux;
            points[i].targetY = refY + points[i].targetT * uy;
        }

        // ── Animation ──────────────────────────────────
        app.beginUndoGroup(useNulls ? "Align Points (Independent Nulls)" : "Align Points (Baked)");
        try {
            if (state.pathProp.numKeys === 0) state.pathProp.setValueAtTime(startTime, cloneShape(pvSnap));

            var easeType        = easeDD.selection ? easeDD.selection.index : 3;
            var totalFramesAnim = Math.ceil((points.length - 1) * staggerFrames + travelFrames);

            function getFocalDriftCurrent(rawP) {
                if (!useChainDrift) return 0;
                var ramp = applyRamp(rawP, rampIndex);
                return focalDriftVal * focalDriftSign * ramp;
            }

            // Tangent fade: linear from 1 to 0 over tightenFrames
            function getTangentFade(elapsedFrames) {
                if (tightenFrames <= 0) return 0;
                return 1 - Math.min(1, elapsedFrames / tightenFrames);
            }

            if (useNulls) {
                var physicsExpr;
                if (easeType === 0) {
                    physicsExpr = 
                        "try {\n" +
                        "  if (numKeys < 1) { value; }\n" +
                        "  else {\n" +
                        "    var destKey  = key(numKeys);\n" +
                        "    var dt = time - destKey.time;\n" +
                        "    if (dt <= 0) { value; }\n" +
                        "    else {\n" +
                        "      var isBounce = effect('Use Bounce (Off = Elastic)')('Checkbox').value;\n" +
                        "      var amp   = effect('Amplitude')('Slider').value / 100;\n" +
                        "      var freq  = effect('Frequency')('Slider').value;\n" +
                        "      var decay = effect('Decay')('Slider').value;\n" +
                        "      var v = velocityAtTime(destKey.time - thisComp.frameDuration/10);\n" +
                        "      var w = freq * Math.PI * 2;\n" +
                        "      var mult = isBounce == 1\n" +
                        "        ? amp * Math.abs(Math.sin(dt * w)) * Math.exp(-decay * dt)\n" +
                        "        : (amp / (w > 0 ? w : 0.001)) * Math.sin(dt * w) * Math.exp(-decay * dt);\n" +
                        "      var easeInFrames = effect('Bounce Ease‑In')('Slider').value;\n" +
                        "      if (easeInFrames > 0) {\n" +
                        "        var easeInSec = easeInFrames * thisComp.frameDuration;\n" +
                        "        var ramp = Math.min(dt / easeInSec, 1);\n" +
                        "        mult *= ramp;\n" +
                        "      }\n" +
                        "      var duration = effect('Bounce Duration')('Slider').value;\n" +
                        "      if (duration > 0 && dt > duration * thisComp.frameDuration) {\n" +
                        "        mult = 0;\n" +
                        "      }\n" +
                        "      value + [v[0] * mult, v[1] * mult];\n" +
                        "    }\n" +
                        "  }\n" +
                        "} catch(e) { value; }";
                } else {
                    physicsExpr = 
                        "try {\n" +
                        "  if (numKeys < 1) { value; }\n" +
                        "  else {\n" +
                        "    var destKey  = key(numKeys);\n" +
                        "    var dt = time - destKey.time;\n" +
                        "    if (dt <= 0) { value; }\n" +
                        "    else {\n" +
                        "      var isBounce = effect('Use Bounce (Off = Elastic)')('Checkbox').value;\n" +
                        "      var amp   = effect('Amplitude')('Slider').value / 100;\n" +
                        "      var freq  = effect('Frequency')('Slider').value;\n" +
                        "      var decay = effect('Decay')('Slider').value;\n" +
                        "      var STEPS = 40;\n" +
                        "      var tStart   = key(1).time;\n" +
                        "      var tEnd     = destKey.time;\n" +
                        "      var span     = tEnd - tStart;\n" +
                        "      var peakSpd2 = 0;\n" +
                        "      var peakVel  = [0, 0];\n" +
                        "      var peakTime = tStart;\n" +
                        "      if (span > 0) {\n" +
                        "        for (var s = 0; s <= STEPS; s++) {\n" +
                        "          var t  = tStart + (s / STEPS) * span;\n" +
                        "          var vt = velocityAtTime(t);\n" +
                        "          var spd2 = vt[0]*vt[0] + vt[1]*vt[1];\n" +
                        "          if (spd2 > peakSpd2) {\n" +
                        "            peakSpd2 = spd2;\n" +
                        "            peakVel  = vt;\n" +
                        "            peakTime = t;\n" +
                        "          }\n" +
                        "        }\n" +
                        "      }\n" +
                        "      var w = freq * Math.PI * 2;\n" +
                        "      var mult = isBounce == 1\n" +
                        "        ? amp * Math.abs(Math.sin(dt * w)) * Math.exp(-decay * dt)\n" +
                        "        : (amp / (w > 0 ? w : 0.001)) * Math.sin(dt * w) * Math.exp(-decay * dt);\n" +
                        "      var easeInFrames = effect('Bounce Ease‑In')('Slider').value;\n" +
                        "      if (easeInFrames > 0) {\n" +
                        "        var easeInSec = easeInFrames * thisComp.frameDuration;\n" +
                        "        var ramp = Math.min(dt / easeInSec, 1);\n" +
                        "        mult *= ramp;\n" +
                        "      }\n" +
                        "      var duration = effect('Bounce Duration')('Slider').value;\n" +
                        "      if (duration > 0 && dt > duration * thisComp.frameDuration) {\n" +
                        "        mult = 0;\n" +
                        "      }\n" +
                        "      value + [peakVel[0] * mult, peakVel[1] * mult];\n" +
                        "    }\n" +
                        "  }\n" +
                        "} catch(e) { value; }";
                }

                var nullsArray = points.slice().sort(function(a, b) { return a.timingRank - b.timingRank; });

                for (var i = 0; i < nullsArray.length; i++) {
                    var myNull = comp.layers.addNull();
                    myNull.name = layer.name + " Pt " + nullsArray[i].idx;
                    myNull.property("Anchor Point").setValue([0, 0]);
                    nullsArray[i].nullLayer = myNull;
                    myNull.parent = layer;

                    var fxGrp = myNull.property("Effects");
                    var cbBounce = fxGrp.addProperty("ADBE Checkbox Control");
                    cbBounce.name = "Use Bounce (Off = Elastic)";
                    cbBounce.property(1).setValue(0);
                    var slAmp = fxGrp.addProperty("ADBE Slider Control");
                    slAmp.name = "Amplitude";
                    slAmp.property(1).setValue(15);
                    var slFreq = fxGrp.addProperty("ADBE Slider Control");
                    slFreq.name = "Frequency";
                    slFreq.property(1).setValue(3);
                    var slDecay = fxGrp.addProperty("ADBE Slider Control");
                    slDecay.name = "Decay";
                    slDecay.property(1).setValue(5);
                    var slBounceEaseIn = fxGrp.addProperty("ADBE Slider Control");
                    slBounceEaseIn.name = "Bounce Ease‑In";
                    slBounceEaseIn.property(1).setValue(5);
                    var slBounceDuration = fxGrp.addProperty("ADBE Slider Control");
                    slBounceDuration.name = "Bounce Duration";
                    slBounceDuration.property(1).setValue(0);
                }

                // Master Physics Null
                for (var idx = 1; idx <= comp.numLayers; idx++) {
                    if (comp.layer(idx).name === "Master Physics") {
                        comp.layer(idx).remove();
                        break;
                    }
                }
                var masterNull = comp.layers.addNull();
                masterNull.name = "Master Physics";
                masterNull.property("Anchor Point").setValue([0,0]);
                var masterFx = masterNull.property("Effects");
                var masterAmp = masterFx.addProperty("ADBE Slider Control");
                masterAmp.name = "Amplitude";
                masterAmp.property(1).setValue(100);
                var masterFreq = masterFx.addProperty("ADBE Slider Control");
                masterFreq.name = "Frequency";
                masterFreq.property(1).setValue(100);
                var masterDecay = masterFx.addProperty("ADBE Slider Control");
                masterDecay.name = "Decay";
                masterDecay.property(1).setValue(100);
                var masterBounce = masterFx.addProperty("ADBE Checkbox Control");
                masterBounce.name = "Use Bounce (Off = Elastic)";
                masterBounce.property(1).setValue(0);
                var masterBounceEaseIn = masterFx.addProperty("ADBE Slider Control");
                masterBounceEaseIn.name = "Bounce Ease‑In";
                masterBounceEaseIn.property(1).setValue(5);
                var masterBounceDuration = masterFx.addProperty("ADBE Slider Control");
                masterBounceDuration.name = "Bounce Duration";
                masterBounceDuration.property(1).setValue(0);

                for (var i = 0; i < nullsArray.length; i++) {
                    var nullLayer = nullsArray[i].nullLayer;
                    var fx = nullLayer.property("Effects");
                    fx("Amplitude").property(1).expression =
                        "15 * thisComp.layer('Master Physics').effect('Amplitude')('Slider') / 100";
                    fx("Frequency").property(1).expression =
                        "3 * thisComp.layer('Master Physics').effect('Frequency')('Slider') / 100";
                    fx("Decay").property(1).expression =
                        "5 * thisComp.layer('Master Physics').effect('Decay')('Slider') / 100";
                    fx("Use Bounce (Off = Elastic)").property(1).expression =
                        "thisComp.layer('Master Physics').effect('Use Bounce (Off = Elastic)')('Checkbox')";
                    fx("Bounce Ease‑In").property(1).expression =
                        "thisComp.layer('Master Physics').effect('Bounce Ease‑In')('Slider')";
                    fx("Bounce Duration").property(1).expression =
                        "thisComp.layer('Master Physics').effect('Bounce Duration')('Slider')";
                }

                // Keyframing for nulls
                for (var c = 0; c < nullsArray.length; c++) {
                    var p        = nullsArray[c];
                    var startF   = p.timingRank * staggerFrames;
                    var endF     = startF + travelFrames;
                    var posProp  = p.nullLayer.property("Position");

                    if (startF > 0) {
                        posProp.setValueAtTime(
                            startTime + (startF - 1) / fps,
                            [p.origX, p.origY]
                        );
                    }

                    for (var f = startF; f <= endF; f++) {
                        var rawP   = (f >= endF) ? 1
                                   : (travelFrames > 0 ? (f - startF) / travelFrames : 1);
                        var easedP = getEase(rawP, easeType);

                        var targetX = p.targetX;
                        var targetY = p.targetY;

                        if (useChainDrift) {
                            var focalDriftCurrent = getFocalDriftCurrent(rawP);
                            var distFromFocal = Math.abs(p.idx - focalPoint.idx);
                            var baseT = focalPerpProj + orderSign * distFromFocal * step;
                            var inheritFactor = Math.pow(Math.min(Math.max(driftStrength,0),1), distFromFocal);
                            var dynamicT = baseT + (focalDriftCurrent - 0) * inheritFactor;
                            targetX = refX + dynamicT * ux;
                            targetY = refY + dynamicT * uy;
                        }

                        var driftX = 0, driftY = 0;
                        if (driftStrength > 0 && p !== focalPoint) {
                            var distFactor = Math.abs(p.idx - focalPoint.idx) / (points.length - 1);
                            var bell = 4 * rawP * (1 - rawP);
                            var swayMag = driftStrength * distFactor * bell;
                            driftX = perpUx * swayMag;
                            driftY = perpUy * swayMag;
                        }

                        posProp.setValueAtTime(
                            startTime + f / fps,
                            [
                                p.origX + (targetX - p.origX) * easedP + driftX,
                                p.origY + (targetY - p.origY) * easedP + driftY
                            ]
                        );
                    }

                    posProp.expression = physicsExpr;
                }

                // Path expression (with tangent tighten via elapsed frames)
                while (state.pathProp.numKeys > 0) state.pathProp.removeKey(1);
                state.pathProp.setValue(cloneShape(pvSnap));

                var expr = "var pts  = thisProperty.points();\n" +
                           "var inT  = thisProperty.inTangents();\n" +
                           "var outT = thisProperty.outTangents();\n" +
                           "try {\n";

                for (var c = 0; c < points.length; c++) {
                    var p = points[c];
                    expr += "  var nL"  + p.idx + " = thisComp.layer('" + p.nullLayer.name + "');\n";
                    expr += "  var nP"  + p.idx + " = fromComp(nL" + p.idx + ".toComp([0,0]));\n";
                    expr += "  pts["    + p.idx + "] = nP" + p.idx + ";\n";

                    expr += "  var stP" + p.idx + " = [" + p.origX   + ", " + p.origY   + "];\n";
                    expr += "  var enP" + p.idx + " = [" + p.targetX + ", " + p.targetY + "];\n";
                    expr += "  var d"   + p.idx + " = length(stP" + p.idx + ", enP" + p.idx + ");\n";
                    expr += "  var prg" + p.idx + " = d" + p.idx + " > 0.001 "
                                       + "? length(nP" + p.idx + ", stP" + p.idx + ") / d" + p.idx + " : 1;\n";
                    expr += "  prg"     + p.idx + " = Math.min(Math.max(prg" + p.idx + ", 0), 1);\n";
                    expr += "  var tStart = nL" + p.idx + ".transform.position.key(1).time;\n";
                    expr += "  var elapsed = (time - tStart) / thisComp.frameDuration;\n";
                    expr += "  var fade = " + tightenFrames + " > 0 ? (1 - Math.min(1, elapsed / " + tightenFrames + ")) : 0;\n";
                    expr += "  inT["    + p.idx + "] = [" + p.origIn[0]  + ", " + p.origIn[1]  + "] * fade;\n";
                    expr += "  outT["   + p.idx + "] = [" + p.origOut[0] + ", " + p.origOut[1] + "] * fade;\n\n";
                }

                expr += "  createPath(pts, inT, outT, thisProperty.isClosed());\n" +
                        "} catch(e) { value; }";
                state.pathProp.expression = expr;

            } else {
                // Baked keyframes
                for (var f = 0; f <= totalFramesAnim; f++) {
                    var curTime   = startTime + (f / fps);
                    var pvCurrent = cloneShape(pvSnap);
                    var vCur      = pvCurrent.vertices;
                    var inTCur    = pvCurrent.inTangents;
                    var outTCur   = pvCurrent.outTangents;

                    for (var c = 0; c < points.length; c++) {
                        var pInfo  = points[c];
                        var startF = pInfo.timingRank * staggerFrames;
                        var endF   = startF + travelFrames;
                        var rawP   = (f >= endF) ? 1 : ((f > startF) ? (f - startF) / travelFrames : 0);
                        var easedP = getEase(rawP, easeType);

                        var targetX = pInfo.targetX, targetY = pInfo.targetY;
                        if (useChainDrift) {
                            var focalDriftCurrent = getFocalDriftCurrent(rawP);
                            var distFromFocal = Math.abs(pInfo.idx - focalPoint.idx);
                            var baseT = focalPerpProj + orderSign * distFromFocal * step;
                            var inheritFactor = Math.pow(Math.min(Math.max(driftStrength,0),1), distFromFocal);
                            var dynamicT = baseT + (focalDriftCurrent - 0) * inheritFactor;
                            targetX = refX + dynamicT * ux;
                            targetY = refY + dynamicT * uy;
                        }

                        var driftX = 0, driftY = 0;
                        if (driftStrength > 0 && pInfo !== focalPoint) {
                            var distFactor = Math.abs(pInfo.idx - focalPoint.idx) / (points.length - 1);
                            var bell = 4 * rawP * (1 - rawP);
                            var swayMag = driftStrength * distFactor * bell;
                            driftX = perpUx * swayMag;
                            driftY = perpUy * swayMag;
                        }

                        var fade = (f >= startF) ? getTangentFade(f - startF) : 1;
                        vCur[pInfo.idx] = [
                            pInfo.origX + (targetX - pInfo.origX) * easedP + driftX,
                            pInfo.origY + (targetY - pInfo.origY) * easedP + driftY
                        ];
                        inTCur[pInfo.idx]  = [pInfo.origIn[0]  * fade, pInfo.origIn[1]  * fade];
                        outTCur[pInfo.idx] = [pInfo.origOut[0] * fade, pInfo.origOut[1] * fade];
                    }
                    pvCurrent.vertices    = vCur;
                    pvCurrent.inTangents  = inTCur;
                    pvCurrent.outTangents = outTCur;
                    state.pathProp.setValueAtTime(curTime, pvCurrent);
                }
            }

        } catch (e) {
            alert("Alignment error:\n" + e.toString());
            app.endUndoGroup();
            return "✖  Error:\n" + e.toString();
        }

        app.endUndoGroup();
        var totalF = (points.length - 1) * staggerFrames + travelFrames;
        if (totalF > 0) comp.time = startTime + totalF / fps;

        var keysPerNull = travelFrames + 2;
        var modeText = useChainDrift ? "Chain Drift" : "Standard";
        var refDesc = radioRefCustom.value ? "custom(" + Math.round(refX) + "," + Math.round(refY) + ")" : "vtx " + refIdx;
        return "✔  Done!  " + points.length + " pts over " + totalF + " frames.\n" +
               "Line: " + lineAngleDeg + "°, ref " + refDesc + ". " +
               modeText + (useChainDrift ? " Focal drift: " + (focalDriftVal * focalDriftSign) + "px" : "") +
               "  Arc ≈ " + Math.round(arcLen) + "px → span " +
               Math.round(finalSpan) + "px (" + fidelityPct + "%).  " +
               (useNulls
                   ? points.length + " independent nulls · ~" + keysPerNull + " keys each · physics rig + Master Controls."
                   : "Baked.");
    }

    // ══════════════════════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════════════════════
    function approxArcLength(pv, idxArray) {
        var totalLen = 0, samples = 20;
        for (var s = 0; s < idxArray.length - 1; s++) {
            var i0  = idxArray[s], i1 = idxArray[s + 1];
            var p0x = pv.vertices[i0][0], p0y = pv.vertices[i0][1];
            var c0x = p0x + pv.outTangents[i0][0], c0y = p0y + pv.outTangents[i0][1];
            var p3x = pv.vertices[i1][0], p3y = pv.vertices[i1][1];
            var c1x = p3x + pv.inTangents[i1][0],  c1y = p3y + pv.inTangents[i1][1];
            var px  = p0x, py = p0y;
            for (var k = 1; k <= samples; k++) {
                var tt = k / samples, mt = 1 - tt;
                var bx = mt*mt*mt*p0x + 3*mt*mt*tt*c0x + 3*mt*tt*tt*c1x + tt*tt*tt*p3x;
                var by = mt*mt*mt*p0y + 3*mt*mt*tt*c0y + 3*mt*tt*tt*c1y + tt*tt*tt*p3y;
                var dx = bx - px, dy = by - py;
                totalLen += Math.sqrt(dx*dx + dy*dy);
                px = bx; py = by;
            }
        }
        return totalLen;
    }

    function getEase(p, easeType) {
        if (p <= 0) return 0; if (p >= 1) return 1;
        switch (easeType) {
            case 0: return p;
            case 1: return p * p * p;
            case 2: return 1 - Math.pow(1 - p, 3);
            case 3: return p < 0.5 ? 4*p*p*p : 1 - Math.pow(-2*p + 2, 3) / 2;
            default: return p;
        }
    }

    function cloneShape(pv) {
        var s = new Shape(); s.closed = pv.closed;
        var v = [], inT = [], outT = [];
        for (var i = 0; i < pv.vertices.length; i++) {
            v.push([pv.vertices[i][0],    pv.vertices[i][1]]);
            inT.push([pv.inTangents[i][0],  pv.inTangents[i][1]]);
            outT.push([pv.outTangents[i][0], pv.outTangents[i][1]]);
        }
        s.vertices = v; s.inTangents = inT; s.outTangents = outT; return s;
    }

    function setStatus(msg, ok) {
        scanStatus.text = msg;
        scanStatus.graphics.foregroundColor = scanStatus.graphics.newPen(
            scanStatus.graphics.PenType.SOLID_COLOR, ok ? [0.25, 0.75, 0.35] : [0.80, 0.25, 0.25], 1);
        win.layout.layout(true);
    }

    function setResult(msg, ok) {
        resultTxt.text = msg;
        resultTxt.graphics.foregroundColor = resultTxt.graphics.newPen(
            resultTxt.graphics.PenType.SOLID_COLOR, ok ? [0.25, 0.75, 0.35] : [0.80, 0.25, 0.25], 1);
        win.layout.layout(true);
    }

    function findFirstShapePath(group) {
        for (var n = 1; n <= group.numProperties; n++) {
            var item = group(n);
            if (item.matchName === "ADBE Vector Shape") return item;
            if (item.numProperties) { var found = findFirstShapePath(item); if (found) return found; }
        } return null;
    }

    function getExpressionPath(prop) {
        var str = "", cur = prop;
        while (cur && cur.propertyDepth > 0) {
            str = "('" + cur.name.replace(/'/g, "\\'") + "')" + str;
            cur = cur.parentProperty;
        } return str;
    }

    DP.footer(win, { id: "aline", name: "Aline", version: "2.1.1" });

    if (win instanceof Window) { win.center(); win.show(); } else { win.layout.layout(true); }

}(this));