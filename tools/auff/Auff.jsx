/*
 * Auff.jsx — v2.0.0
 * Turn audio off across a project (or just some comps), keeping an exempt list.
 *
 *  · Scope: whole project, the active comp, or comps selected in the Project panel
 *  · Exempt layers by search (exact name, or start with * for "contains")
 *    or straight from the timeline selection
 *  · Turn audio off for everything except the exempt list, or turn it back on
 *  · One undo step; layers without audio are skipped instead of stopping the run
 *
 * Author: DesignPraise (@designpraiseeric) · MIT License
 */

(function (thisObj) {
    var TOOL = "Auff";
    var VERSION = "2.0.0";

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

            // Check after the panel has drawn, so opening it never waits on the network.
            var cbName = "__dpUpd_" + meta.id;
            $.global[cbName] = function () { check(meta, badge, false); };
            try { app.scheduleTask("try{$.global." + cbName + "();}catch(e){}", 1500, false); } catch (e3) {}
            return row;
        }

        return { footer: footer, openURL: openURL, site: SITE };
    })();
    // ── end DesignPraise core ──


    function trim(s) { return String(s).replace(/^\s+|\s+$/g, ""); }

    // ── Which comps are in play ──────────────────────────────────────
    function compsInScope() {
        var out = [], i;
        var mode = scopeDD.selection ? scopeDD.selection.index : 0;
        if (mode === 1) {
            var c = app.project.activeItem;
            if (c instanceof CompItem) out.push(c);
        } else if (mode === 2) {
            var sel = app.project.selection;
            for (i = 0; i < sel.length; i++) if (sel[i] instanceof CompItem) out.push(sel[i]);
        } else {
            for (i = 1; i <= app.project.numItems; i++) {
                var it = app.project.item(i);
                if (it instanceof CompItem) out.push(it);
            }
        }
        return out;
    }

    function audioLayers(comps) {
        var out = [];
        for (var c = 0; c < comps.length; c++) {
            for (var j = 1; j <= comps[c].numLayers; j++) {
                var L = comps[c].layer(j);
                if (L instanceof AVLayer && L.hasAudio) out.push({ comp: comps[c], layer: L });
            }
        }
        return out;
    }

    // ── State ─────────────────────────────────────────────────────────
    var results = [];
    var exempt = [];

    function label(e) { return e.comp.name + "  ›  " + e.layer.name; }
    function isExempt(e) {
        for (var i = 0; i < exempt.length; i++) if (exempt[i].layer === e.layer) return true;
        return false;
    }
    function addExempt(e) { if (!isExempt(e)) exempt.push(e); }
    function prune(list) {
        // Drop entries whose layer was deleted since they were added.
        var keep = [];
        for (var i = 0; i < list.length; i++) { try { if (list[i].layer.name !== undefined) keep.push(list[i]); } catch (e) {} }
        return keep;
    }

    // ── UI ────────────────────────────────────────────────────────────
    var win = (thisObj instanceof Panel) ? thisObj
        : new Window("palette", TOOL, undefined, { resizeable: true });
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 8;
    win.margins = 10;

    var scopeRow = win.add("group");
    scopeRow.add("statictext", undefined, "Comps:");
    var scopeDD = scopeRow.add("dropdownlist", undefined, ["Whole project", "Active comp", "Selected in Project panel"]);
    scopeDD.selection = 0;

    var pFind = win.add("panel", undefined, "Find layers to exempt");
    pFind.orientation = "column";
    pFind.alignChildren = ["fill", "top"];
    pFind.margins = [10, 14, 10, 10];
    pFind.spacing = 6;
    var searchRow = pFind.add("group");
    searchRow.alignChildren = ["fill", "center"];
    var searchField = searchRow.add("edittext", undefined, "");
    searchField.alignment = ["fill", "center"];
    searchField.helpTip = "Exact layer name, or start with * to match any name containing the text";
    var searchBtn = searchRow.add("button", undefined, "Search");
    var resultsList = pFind.add("listbox", undefined, [], { multiselect: true });
    resultsList.preferredSize = [300, 110];
    var findBtns = pFind.add("group");
    var selAllBtn = findBtns.add("button", undefined, "Select all");
    var addBtn = findBtns.add("button", undefined, "Exempt selected ↓");

    var pEx = win.add("panel", undefined, "Exempt (audio stays on)");
    pEx.orientation = "column";
    pEx.alignChildren = ["fill", "top"];
    pEx.margins = [10, 14, 10, 10];
    pEx.spacing = 6;
    var exemptList = pEx.add("listbox", undefined, [], { multiselect: true });
    exemptList.preferredSize = [300, 110];
    var exBtns = pEx.add("group");
    var fromTimelineBtn = exBtns.add("button", undefined, "+ Timeline selection");
    fromTimelineBtn.helpTip = "Exempt the layers selected in the active comp";
    var removeBtn = exBtns.add("button", undefined, "Remove");
    var clearBtn = exBtns.add("button", undefined, "Clear");

    var actRow = win.add("group");
    actRow.alignChildren = ["fill", "center"];
    var offBtn = actRow.add("button", undefined, "Audio off (except exempt)");
    offBtn.alignment = ["fill", "center"];
    var onBtn = actRow.add("button", undefined, "Audio on");
    onBtn.helpTip = "Turn audio back on for every layer with audio in scope";

    var statusTxt = win.add("statictext", undefined, "Ready.", { multiline: true });
    statusTxt.preferredSize.height = 28;

    DP.footer(win, { id: "auff", name: TOOL, version: VERSION });

    // ── Behaviour ─────────────────────────────────────────────────────
    function setStatus(t) { statusTxt.text = t; }

    function refreshLists() {
        results = prune(results); exempt = prune(exempt);
        resultsList.removeAll();
        for (var i = 0; i < results.length; i++) resultsList.add("item", label(results[i]));
        exemptList.removeAll();
        for (var j = 0; j < exempt.length; j++) exemptList.add("item", label(exempt[j]));
    }

    function search() {
        var q = trim(searchField.text);
        if (!q) { setStatus("Type a layer name to search."); return; }
        var contains = q.charAt(0) === "*";
        if (contains) q = trim(q.substring(1));
        if (!q) { setStatus("Type some text after the *."); return; }
        q = q.toLowerCase();
        var all = audioLayers(compsInScope());
        results = [];
        for (var i = 0; i < all.length; i++) {
            var n = all[i].layer.name.toLowerCase();
            if (contains ? n.indexOf(q) !== -1 : n === q) results.push(all[i]);
        }
        refreshLists();
        setStatus(results.length + " layer" + (results.length === 1 ? "" : "s") + " with audio found.");
    }
    searchBtn.onClick = search;
    searchField.addEventListener("enterKey", search);

    selAllBtn.onClick = function () {
        var idx = [];
        for (var i = 0; i < resultsList.items.length; i++) idx.push(i);
        resultsList.selection = idx;
    };

    addBtn.onClick = function () {
        var sel = resultsList.selection;
        if (!sel || !sel.length) { setStatus("Select results first."); return; }
        for (var i = 0; i < sel.length; i++) addExempt(results[sel[i].index]);
        refreshLists();
    };

    fromTimelineBtn.onClick = function () {
        var c = app.project.activeItem;
        if (!(c instanceof CompItem) || !c.selectedLayers.length) { setStatus("Select layers in the timeline first."); return; }
        var n = 0;
        for (var i = 0; i < c.selectedLayers.length; i++) {
            var L = c.selectedLayers[i];
            if (L instanceof AVLayer) { addExempt({ comp: c, layer: L }); n++; }
        }
        refreshLists();
        setStatus(n + " layer" + (n === 1 ? "" : "s") + " exempted.");
    };

    removeBtn.onClick = function () {
        var sel = exemptList.selection;
        if (!sel || !sel.length) return;
        var idx = [];
        for (var i = 0; i < sel.length; i++) idx.push(sel[i].index);
        idx.sort(function (a, b) { return b - a; });
        for (var k = 0; k < idx.length; k++) exempt.splice(idx[k], 1);
        refreshLists();
    };
    clearBtn.onClick = function () { exempt = []; refreshLists(); };

    function setAudio(on) {
        var comps = compsInScope();
        if (!comps.length) { setStatus("No comps in scope."); return; }
        var all = audioLayers(comps);
        if (!on && !confirm("Turn audio off for " + (all.length - countExempt(all)) + " layer(s) in " + comps.length + " comp(s)?")) return;
        var changed = 0, kept = 0, failed = 0;
        app.beginUndoGroup(TOOL + (on ? " · audio on" : " · audio off"));
        try {
            for (var i = 0; i < all.length; i++) {
                if (!on && isExempt(all[i])) { kept++; continue; }
                try {
                    if (all[i].layer.audioEnabled !== on) { all[i].layer.audioEnabled = on; changed++; }
                } catch (e) { failed++; }
            }
        } finally {
            app.endUndoGroup();
        }
        setStatus((on ? "Audio on for " : "Audio off for ") + changed + " layer(s)" +
            (on ? "" : ", " + kept + " exempt") + (failed ? ", " + failed + " locked or failed" : "") + ".");
    }
    function countExempt(all) { var n = 0; for (var i = 0; i < all.length; i++) if (isExempt(all[i])) n++; return n; }
    offBtn.onClick = function () { setAudio(false); };
    onBtn.onClick = function () { setAudio(true); };

    win.onResizing = win.onResize = function () { this.layout.resize(); };
    if (win instanceof Window) { win.center(); win.show(); }
    else { win.layout.layout(true); win.layout.resize(); }
})(this);
