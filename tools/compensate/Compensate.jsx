/*
 * Compensate.jsx — v3.0.0
 * Extend or shorten pre-compositions by frames, either by typing a value
 * or by dragging the layer's out edge in the timeline (Drag mode).
 *
 * Install as a dockable panel:
 *   macOS  : /Applications/Adobe After Effects <ver>/Scripts/ScriptUI Panels/
 *   Windows: C:\Program Files\Adobe\Adobe After Effects <ver>\Support Files\Scripts\ScriptUI Panels\
 *   then Window > Compensate.jsx
 *
 * DRAG MODE — how it works
 *   After Effects gives scripts no timeline drag events, and a precomp layer
 *   cannot normally be dragged past its source's end. So when you Arm:
 *     1. the source comp of each selected precomp layer gets temporary headroom,
 *        so its out edge can be pulled further right;
 *     2. the panel watches the layer's out point while you drag;
 *     3. when you let go (or press Apply) the headroom is removed and the real
 *        compensation runs with the frame difference you dragged.
 *   Drag left to shorten, right to extend. Cancel restores everything.
 *
 * Author: DesignPraise (@designpraiseeric) · MIT License
 */

(function (thisObj) {
    var TOOL = "Compensate";
    var VERSION = "3.0.0";
    var SETTINGS_SECTION = "DesignPraise_Compensate";

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


    var TICK_MS = 150;          // how often Drag mode reads the timeline
    var SETTLE_TICKS = 5;       // ~0.75 s without change = "you let go"
    var MAX_COMP_DURATION = 10800;

    // One shared state object so the scheduled task (which runs in global
    // scope) can reach the panel, and so reopening the panel cleans up.
    var G = $.global.__dpCompensate;
    if (!G) { G = {}; $.global.__dpCompensate = G; }
    stopWatching();
    G.tracked = null;

    // ════════════════════════════════════════════════════════════════
    //  Settings
    // ════════════════════════════════════════════════════════════════
    function getSetting(key, def) {
        try {
            if (app.settings.haveSetting(SETTINGS_SECTION, key)) return app.settings.getSetting(SETTINGS_SECTION, key);
        } catch (e) {}
        return def;
    }
    function setSetting(key, val) {
        try { app.settings.saveSetting(SETTINGS_SECTION, key, String(val)); } catch (e) {}
    }

    // ════════════════════════════════════════════════════════════════
    //  Core engine
    // ════════════════════════════════════════════════════════════════
    function modifyLayer(layer, fn, handleLock) {
        var wasLocked = false;
        try {
            if (handleLock && layer.locked) { wasLocked = true; layer.locked = false; }
            fn();
        } catch (e) {
            // read-only or clamped property: skip this layer
        } finally {
            if (wasLocked) { try { layer.locked = true; } catch (e2) {} }
        }
    }

    // 0 = leave as is, 1 = off, 2 = frame mix, 3 = pixel motion
    // (AVLayer.frameBlending is read-only; frameBlendingType is the writable switch.)
    function setFrameBlending(layer, mode, handleLock) {
        if (mode === 0 || !(layer instanceof AVLayer)) return;
        modifyLayer(layer, function () {
            if (mode === 1) layer.frameBlendingType = FrameBlendingType.NO_FRAME_BLEND;
            else if (mode === 2) layer.frameBlendingType = FrameBlendingType.FRAME_MIX;
            else if (mode === 3) layer.frameBlendingType = FrameBlendingType.PIXEL_MOTION;
        }, handleLock);
    }

    function layerSource(layer) {
        try { return layer.source; } catch (e) { return null; }
    }

    /**
     * Change a comp's duration by deltaSec and carry its layers along.
     * opt: { depth, onlyAtEnd, timeStretch, handleLock, frameBlend }
     */
    function processComp(comp, deltaSec, opt, depth, visited) {
        if (visited[comp.id]) return;
        visited[comp.id] = true;

        var oldDur = comp.duration;
        var halfFrame = comp.frameDuration / 2;
        var newDur = Math.min(MAX_COMP_DURATION, Math.max(comp.frameDuration, oldDur + deltaSec));
        comp.duration = newDur;

        for (var i = 1; i <= comp.numLayers; i++) {
            var L = comp.layer(i);
            if (!L) continue;
            var reachedEnd = (L.outPoint >= oldDur - halfFrame);
            var src = layerSource(L);

            setFrameBlending(L, opt.frameBlend, opt.handleLock);

            // Nested precomps that run to the end grow with their parent.
            if (reachedEnd && depth > 0 && src instanceof CompItem && L.stretch !== 0) {
                processComp(src, deltaSec * 100 / Math.abs(L.stretch), opt, depth - 1, visited);
            }

            var shouldTouch = reachedEnd || !opt.onlyAtEnd || L.outPoint > newDur;
            if (!shouldTouch) continue;

            var isFootage = (src instanceof FootageItem);
            var targetOut = (reachedEnd || !opt.onlyAtEnd) ? newDur : Math.min(L.outPoint, newDur);

            if (opt.timeStretch && isFootage && reachedEnd) {
                // Scale the layer so its visible span fills the new length,
                // keeping its in point where it is.
                (function (layer, target) {
                    var span = layer.outPoint - layer.inPoint;
                    var newSpan = target - layer.inPoint;
                    if (span <= 0 || newSpan <= 0) return;
                    var ratio = newSpan / span;
                    modifyLayer(layer, function () {
                        var inP = layer.inPoint;
                        var st = layer.startTime;
                        layer.stretch = layer.stretch * ratio;
                        layer.startTime = inP - (inP - st) * ratio;
                        layer.inPoint = inP;
                        layer.outPoint = target;
                    }, opt.handleLock);
                })(L, targetOut);
            } else {
                (function (layer, target) {
                    modifyLayer(layer, function () { layer.outPoint = target; }, opt.handleLock);
                })(L, targetOut);
            }
        }
    }

    /** Compensate one selected precomp layer by deltaSec (parent-comp time). */
    function compensateLayer(layer, deltaSec, opt, visited) {
        var src = layer.source;
        var innerDelta = deltaSec * 100 / Math.abs(layer.stretch || 100);
        var startOut = layer.outPoint;
        processComp(src, innerDelta, opt, opt.depth, visited);
        modifyLayer(layer, function () { layer.outPoint = startOut + deltaSec; }, opt.handleLock);
        setFrameBlending(layer, opt.frameBlend, opt.handleLock);
    }

    function selectedPrecompLayers() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) return { err: "Open a composition and select a precomp layer." };
        var out = [];
        var sel = comp.selectedLayers;
        for (var i = 0; i < sel.length; i++) {
            if (sel[i] instanceof AVLayer && sel[i].source instanceof CompItem) out.push(sel[i]);
        }
        if (!out.length) return { err: "Select at least one precomp layer." };
        return { comp: comp, layers: out };
    }

    function readOptions() {
        var d = depthDD.selection ? depthDD.selection.index : 1;
        return {
            depth: (d === 4) ? 999 : d,
            onlyAtEnd: onlyEndCb.value,
            timeStretch: stretchCb.value,
            handleLock: lockCb.value,
            frameBlend: fbDD.selection ? fbDD.selection.index : 0
        };
    }

    function runNumeric(sign) {
        if (G.tracked) { setStatus("Finish or cancel the drag first.", false); return; }
        var n = parseInt(framesInput.text, 10);
        if (isNaN(n) || n <= 0) { setStatus("Enter a whole number of frames above 0.", false); return; }
        var pick = selectedPrecompLayers();
        if (pick.err) { setStatus(pick.err, false); return; }

        var opt = readOptions();
        var deltaSec = (sign * n) / pick.comp.frameRate;
        app.beginUndoGroup(TOOL + " " + (sign > 0 ? "+" : "−") + n + "f");
        try {
            var visited = {};
            for (var i = 0; i < pick.layers.length; i++) compensateLayer(pick.layers[i], deltaSec, opt, visited);
            setStatus((sign > 0 ? "Added " : "Removed ") + n + " frame" + (n === 1 ? "" : "s") + " on " +
                pick.layers.length + " layer" + (pick.layers.length === 1 ? "" : "s") + ".", true);
        } catch (e) {
            setStatus("Error: " + e.toString(), false);
        } finally {
            app.endUndoGroup();
        }
    }

    // ════════════════════════════════════════════════════════════════
    //  Drag mode
    // ════════════════════════════════════════════════════════════════
    function stopWatching() {
        if (G.taskId) { try { app.cancelTask(G.taskId); } catch (e) {} }
        G.taskId = null;
    }

    function arm(layersOverride) {
        var layers, comp;
        if (layersOverride) {
            layers = layersOverride;
        } else {
            var pick = selectedPrecompLayers();
            if (pick.err) { setStatus(pick.err, false); return false; }
            layers = pick.layers;
        }

        var recs = [];
        var srcSeen = {};
        app.beginUndoGroup(TOOL + " · arm drag");
        try {
            for (var i = 0; i < layers.length; i++) {
                var L = layers[i];
                var src = L.source;
                var rec = { layer: L, src: src, origOut: L.outPoint, owner: !srcSeen[src.id] };
                if (rec.owner) {
                    srcSeen[src.id] = rec;
                    rec.origDur = src.duration;
                    var headroom = Math.min(Math.max(60, src.duration), MAX_COMP_DURATION - src.duration);
                    src.duration = src.duration + headroom;
                } else {
                    rec.origDur = srcSeen[src.id].origDur;
                }
                recs.push(rec);
            }
        } catch (e) {
            app.endUndoGroup();
            setStatus("Could not arm: " + e.toString(), false);
            return false;
        }
        app.endUndoGroup();

        G.tracked = recs;
        G.lastSig = "";
        G.stable = 0;
        G.taskId = app.scheduleTask("try{$.global.__dpCompensate.tick();}catch(e){}", TICK_MS, true);
        updateDragUI(true);
        deltaTxt.text = "Δ 0f";
        setStatus("Drag the right edge of the selected layer" + (recs.length > 1 ? "s" : "") + ". Left shortens, right extends.", true);
        return true;
    }

    function currentDeltas() {
        var out = [];
        for (var i = 0; i < G.tracked.length; i++) {
            var r = G.tracked[i];
            var fps = r.layer.containingComp.frameRate;
            var frames = Math.round((r.layer.outPoint - r.origOut) * fps);
            out.push({ frames: frames, fps: fps });
        }
        return out;
    }

    G.tick = function () {
        if (!G.tracked) { stopWatching(); return; }
        var d;
        try { d = currentDeltas(); }
        catch (e) { cancelDrag("A tracked layer went away, so the drag was cancelled."); return; }

        var sig = "", label = "", mixed = false, anyMove = false;
        for (var i = 0; i < d.length; i++) {
            sig += d[i].frames + ",";
            if (d[i].frames !== 0) anyMove = true;
            if (i > 0 && d[i].frames !== d[0].frames) mixed = true;
        }
        var f = d[0].frames;
        label = mixed ? "Δ mixed" : ("Δ " + (f > 0 ? "+" : "") + f + "f");
        if (!mixed && f !== 0) label += "   (" + timeToCurrentFormat(Math.abs(f) / d[0].fps, d[0].fps) + ")";
        try { deltaTxt.text = label; } catch (e2) {}

        if (sig === G.lastSig) G.stable++;
        else { G.lastSig = sig; G.stable = 0; }

        if (autoCb.value && anyMove && G.stable >= SETTLE_TICKS) commitDrag(true);
    };

    function restoreTracked() {
        // Put the layers back where they were before removing headroom.
        for (var i = 0; i < G.tracked.length; i++) {
            var r = G.tracked[i];
            (function (rec) {
                modifyLayer(rec.layer, function () { rec.layer.outPoint = rec.origOut; }, true);
            })(r);
        }
        for (var j = 0; j < G.tracked.length; j++) {
            if (G.tracked[j].owner) { try { G.tracked[j].src.duration = G.tracked[j].origDur; } catch (e) {} }
        }
    }

    function commitDrag(rearm) {
        if (!G.tracked) return;
        stopWatching();
        var recs = G.tracked;
        var d;
        try { d = currentDeltas(); } catch (e) { cancelDrag("A tracked layer went away, so the drag was cancelled."); return; }

        var opt = readOptions();
        var layersForRearm = [];
        var total = 0;

        app.beginUndoGroup(TOOL + " · drag");
        try {
            restoreTracked();
            // One delta per source comp (from the first layer that uses it).
            var bySrc = {};
            var visited = {};
            for (var i = 0; i < recs.length; i++) {
                var r = recs[i];
                layersForRearm.push(r.layer);
                var deltaSec = d[i].frames / d[i].fps;
                if (r.owner) {
                    bySrc[r.src.id] = deltaSec;
                    if (d[i].frames !== 0) { compensateLayer(r.layer, deltaSec, opt, visited); total++; }
                } else {
                    var shared = bySrc[r.src.id] || 0;
                    (function (layer, ds) {
                        modifyLayer(layer, function () { layer.outPoint = layer.outPoint + ds; }, opt.handleLock);
                    })(r.layer, shared);
                }
            }
        } catch (e) {
            setStatus("Error: " + e.toString(), false);
        } finally {
            app.endUndoGroup();
        }

        G.tracked = null;
        updateDragUI(false);
        var f = d[0].frames;
        setStatus(total ? ("Applied " + (f > 0 ? "+" : "") + f + "f from drag.") : "No change.", true);

        if (rearm && stayArmedCb.value) arm(layersForRearm);
    }

    function cancelDrag(msg) {
        if (!G.tracked) return;
        stopWatching();
        app.beginUndoGroup(TOOL + " · cancel drag");
        try { restoreTracked(); } catch (e) {}
        app.endUndoGroup();
        G.tracked = null;
        updateDragUI(false);
        deltaTxt.text = "Δ —";
        setStatus(msg || "Drag cancelled. Nothing changed.", true);
    }

    // ════════════════════════════════════════════════════════════════
    //  UI
    // ════════════════════════════════════════════════════════════════
    var win = (thisObj instanceof Panel) ? thisObj
        : new Window("palette", TOOL, undefined, { resizeable: true });
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 8;
    win.margins = 10;

    var head = win.add("group");
    head.orientation = "row";
    head.alignChildren = ["left", "center"];
    var title = head.add("statictext", undefined, TOOL.toUpperCase());
    title.graphics.font = ScriptUI.newFont("dialog", "BOLD", 12);

    // — Type a value
    var pNum = win.add("panel", undefined, "Type frames");
    pNum.orientation = "row";
    pNum.alignChildren = ["left", "center"];
    pNum.margins = [10, 14, 10, 10];
    var minusBtn = pNum.add("button", undefined, "−");
    minusBtn.preferredSize = [32, 24];
    minusBtn.helpTip = "Remove frames from the end";
    var framesInput = pNum.add("edittext", undefined, getSetting("frames", "1"));
    framesInput.characters = 5;
    var plusBtn = pNum.add("button", undefined, "+");
    plusBtn.preferredSize = [32, 24];
    plusBtn.helpTip = "Add frames to the end";
    pNum.add("statictext", undefined, "frames");

    // — Drag
    var pDrag = win.add("panel", undefined, "Drag in timeline");
    pDrag.orientation = "column";
    pDrag.alignChildren = ["fill", "top"];
    pDrag.margins = [10, 14, 10, 10];
    pDrag.spacing = 6;
    var dragRow = pDrag.add("group");
    dragRow.orientation = "row";
    var armBtn = dragRow.add("button", undefined, "Arm drag");
    armBtn.helpTip = "Select precomp layer(s), arm, then drag their right edge in the timeline.";
    var applyBtn = dragRow.add("button", undefined, "Apply");
    var cancelBtn = dragRow.add("button", undefined, "Cancel");
    var deltaTxt = pDrag.add("statictext", undefined, "Δ —");
    deltaTxt.graphics.font = ScriptUI.newFont("dialog", "BOLD", 14);
    var autoCb = pDrag.add("checkbox", undefined, "Apply when I let go");
    autoCb.value = getSetting("auto", "true") === "true";
    var stayArmedCb = pDrag.add("checkbox", undefined, "Stay armed after applying");
    stayArmedCb.value = getSetting("stay", "true") === "true";

    // — Options
    var pOpt = win.add("panel", undefined, "Options");
    pOpt.orientation = "column";
    pOpt.alignChildren = ["fill", "top"];
    pOpt.margins = [10, 14, 10, 10];
    pOpt.spacing = 5;
    var depthRow = pOpt.add("group");
    depthRow.add("statictext", undefined, "Nested precomps:");
    var depthDD = depthRow.add("dropdownlist", undefined, ["Don't touch", "1 level", "2 levels", "3 levels", "All levels"]);
    depthDD.selection = parseInt(getSetting("depth", "1"), 10) || 0;
    var onlyEndCb = pOpt.add("checkbox", undefined, "Only extend layers that reach the comp's end");
    onlyEndCb.value = getSetting("onlyEnd", "true") === "true";
    onlyEndCb.helpTip = "Leaves layers that deliberately end early where they are.";
    var stretchCb = pOpt.add("checkbox", undefined, "Time-stretch footage to fill");
    stretchCb.value = getSetting("stretch", "false") === "true";
    var lockCb = pOpt.add("checkbox", undefined, "Include locked layers (unlock temporarily)");
    lockCb.value = getSetting("lock", "true") === "true";
    var fbRow = pOpt.add("group");
    fbRow.add("statictext", undefined, "Frame blending:");
    var fbDD = fbRow.add("dropdownlist", undefined, ["Leave as is", "Off", "Frame Mix", "Pixel Motion"]);
    fbDD.selection = parseInt(getSetting("fb", "0"), 10) || 0;

    var statusTxt = win.add("statictext", undefined, "Ready.", { multiline: true });
    statusTxt.preferredSize.height = 30;

    DP.footer(win, { id: "compensate", name: TOOL, version: VERSION });

    function setStatus(msg, ok) {
        try {
            statusTxt.text = msg;
            statusTxt.graphics.foregroundColor = statusTxt.graphics.newPen(
                statusTxt.graphics.PenType.SOLID_COLOR, ok ? [0.6, 0.85, 0.65] : [0.95, 0.45, 0.4], 1);
        } catch (e) {}
    }

    function updateDragUI(armed) {
        armBtn.enabled = !armed;
        applyBtn.enabled = armed;
        cancelBtn.enabled = armed;
        plusBtn.enabled = minusBtn.enabled = !armed;
    }

    // — Events
    plusBtn.onClick = function () { runNumeric(1); };
    minusBtn.onClick = function () { runNumeric(-1); };
    armBtn.onClick = function () { arm(null); };
    applyBtn.onClick = function () { commitDrag(false); };
    cancelBtn.onClick = function () { cancelDrag(); };

    framesInput.onChange = function () { setSetting("frames", framesInput.text); };
    autoCb.onClick = function () { setSetting("auto", autoCb.value); };
    stayArmedCb.onClick = function () { setSetting("stay", stayArmedCb.value); };
    onlyEndCb.onClick = function () { setSetting("onlyEnd", onlyEndCb.value); };
    stretchCb.onClick = function () { setSetting("stretch", stretchCb.value); };
    lockCb.onClick = function () { setSetting("lock", lockCb.value); };
    depthDD.onChange = function () { setSetting("depth", depthDD.selection.index); };
    fbDD.onChange = function () { setSetting("fb", fbDD.selection.index); };

    win.onClose = function () { if (G.tracked) cancelDrag(); stopWatching(); };

    updateDragUI(false);
    win.onResizing = win.onResize = function () { this.layout.resize(); };
    if (win instanceof Window) { win.center(); win.show(); }
    else { win.layout.layout(true); win.layout.resize(); }
})(this);
