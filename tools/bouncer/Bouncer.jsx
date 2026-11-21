/*
 * Bouncer.jsx — v1.0.0
 * Overshoot and bounce for any keyframed property. Replaces "bouncer_2"
 * (expression) and "my_Bouncer" (baked keyframes).
 *
 *  Live  — adds an inertial bounce expression plus slider controls in Effect
 *          Controls. Keep animating; the bounce follows your keyframes.
 *  Bake  — replaces the motion between selected keyframes with a damped-spring
 *          curve made of real keyframes (for hand-off, render farms, or editing).
 *
 * Author: DesignPraise (@designpraiseeric) · MIT License
 */

(function (thisObj) {
    var TOOL = "Bouncer";
    var VERSION = "1.0.0";
    var SETTINGS = "DesignPraise_Bouncer";
    var TAG = "// Baerista · Bouncer";

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


    function getSetting(k, d) { try { return app.settings.haveSetting(SETTINGS, k) ? app.settings.getSetting(SETTINGS, k) : d; } catch (e) { return d; } }
    function setSetting(k, v) { try { app.settings.saveSetting(SETTINGS, k, String(v)); } catch (e) {} }

    var NUMERIC = {};
    NUMERIC[PropertyValueType.OneD] = 1;
    NUMERIC[PropertyValueType.TwoD] = 2; NUMERIC[PropertyValueType.TwoD_SPATIAL] = 2;
    NUMERIC[PropertyValueType.ThreeD] = 3; NUMERIC[PropertyValueType.ThreeD_SPATIAL] = 3;
    NUMERIC[PropertyValueType.COLOR] = 4;

    function selectedNumericProps() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) return { err: "Open a composition first." };
        var out = [], sel = comp.selectedProperties;
        for (var i = 0; i < sel.length; i++) {
            var p = sel[i];
            if (p.propertyType === PropertyType.PROPERTY && NUMERIC[p.propertyValueType] && p.canVaryOverTime) out.push(p);
        }
        if (!out.length) return { err: "Select one or more keyframed properties (Position, Scale, Rotation…)." };
        return { comp: comp, props: out };
    }

    function layerOf(p) { return p.propertyGroup(p.propertyDepth); }

    // ════════════════════════════════════════════════════════════════
    //  LIVE — expression + sliders
    // ════════════════════════════════════════════════════════════════
    function controlPrefix(p) { return "Bounce · " + p.name; }

    function getOrMakeControl(layer, name, matchName, value) {
        var fx = layer.property("ADBE Effect Parade");
        var e = fx.property(name);
        if (!e) { e = fx.addProperty(matchName); e.name = name; }
        e.property(1).setValue(value);
        return e;
    }

    function bounceExpression(pfx, dims) {
        var q = function (s) { return 'effect("' + pfx + " " + s + '")(1)'; };
        var e = TAG + "\n" +
            "var amp = " + q("Amplitude") + " / 100, freq = " + q("Frequency") + ", decay = " + q("Decay") + ";\n" +
            "var bounce = " + q("Bounce, not elastic") + " == 1;\n" +
            "var n = 0;\n" +
            "if (numKeys > 0) { n = nearestKey(time).index; if (key(n).time > time) n--; }\n" +
            "if (n == 0) { value; } else {\n" +
            "  var t = time - key(n).time;\n" +
            "  var v = velocityAtTime(key(n).time - thisComp.frameDuration / 10);\n" +
            "  var w = freq * Math.PI * 2;\n" +
            "  var s = bounce ? -Math.abs(Math.sin(t * w)) : Math.sin(t * w);\n" +
            "  var k = amp * s / Math.exp(decay * t);\n";
        if (dims > 1 && dims < 4) {
            e += "  var on = [" + q("X") + ", " + q("Y") + (dims === 3 ? ", " + q("Z") : "") + "];\n" +
                 "  var out = value.slice(0);\n" +
                 "  for (var i = 0; i < on.length; i++) if (on[i] == 1) out[i] += v[i] * k;\n" +
                 "  out;\n";
        } else {
            e += "  add(value, mul(v, k));\n";
        }
        return e + "}";
    }

    function applyLive() {
        var pick = selectedNumericProps();
        if (pick.err) { setStatus(pick.err, false); return; }
        var amp = num(ampT, 5), freq = num(freqT, 4), decay = num(decayT, 8);
        var done = 0, noKeys = 0;
        app.beginUndoGroup(TOOL + " · Live");
        try {
            for (var i = 0; i < pick.props.length; i++) {
                var p = pick.props[i];
                if (p.numKeys < 1) { noKeys++; continue; }
                var L = layerOf(p), pfx = controlPrefix(p), dims = NUMERIC[p.propertyValueType];
                getOrMakeControl(L, pfx + " Amplitude", "ADBE Slider Control", amp);
                getOrMakeControl(L, pfx + " Frequency", "ADBE Slider Control", freq);
                getOrMakeControl(L, pfx + " Decay", "ADBE Slider Control", decay);
                getOrMakeControl(L, pfx + " Bounce, not elastic", "ADBE Checkbox Control", bounceCb.value ? 1 : 0);
                if (dims > 1 && dims < 4) {
                    getOrMakeControl(L, pfx + " X", "ADBE Checkbox Control", axisX.value ? 1 : 0);
                    getOrMakeControl(L, pfx + " Y", "ADBE Checkbox Control", axisY.value ? 1 : 0);
                    if (dims === 3) getOrMakeControl(L, pfx + " Z", "ADBE Checkbox Control", axisZ.value ? 1 : 0);
                }
                p.expression = bounceExpression(pfx, dims);
                done++;
            }
        } catch (e) {
            setStatus("Error: " + e.toString(), false);
            app.endUndoGroup();
            return;
        }
        app.endUndoGroup();
        setStatus("Live bounce on " + done + " propert" + (done === 1 ? "y" : "ies") + "." +
            (noKeys ? " Skipped " + noKeys + " without keyframes." : "") + " Tweak it in Effect Controls.", true);
    }

    function removeLive() {
        var pick = selectedNumericProps();
        if (pick.err) { setStatus(pick.err, false); return; }
        var n = 0;
        app.beginUndoGroup(TOOL + " · Remove");
        try {
            for (var i = 0; i < pick.props.length; i++) {
                var p = pick.props[i];
                if (p.expression.indexOf(TAG) === 0) { p.expression = ""; n++; }
                var fx = layerOf(p).property("ADBE Effect Parade"), pfx = controlPrefix(p) + " ";
                for (var j = fx.numProperties; j >= 1; j--) if (fx.property(j).name.indexOf(pfx) === 0) fx.property(j).remove();
            }
        } finally { app.endUndoGroup(); }
        setStatus("Removed the bounce from " + n + " propert" + (n === 1 ? "y" : "ies") + ".", true);
    }

    // ════════════════════════════════════════════════════════════════
    //  BAKE — damped spring between selected keyframes
    // ════════════════════════════════════════════════════════════════
    // Under-damped step response, with Amount scaling only the overshoot,
    // so every segment still lands exactly on its end keyframe.
    function springFactor(t, dur, zeta, wn, amount, phase) {
        if (t <= 0) return 0;
        if (t >= dur) return 1;
        var z = Math.min(zeta, 0.99);
        var wd = wn * Math.sqrt(1 - z * z);
        var env = Math.exp(-z * wn * t);
        var r = 1 - env * (Math.cos(wd * t + phase) + (z * wn / wd) * Math.sin(wd * t + phase));
        // Ease the last 15 % into the exact end value so there's no jump.
        var tail = Math.max(0, (t / dur - 0.85) / 0.15);
        r = r + (1 - r) * tail * tail;
        return 1 + (r - 1) * amount;
    }

    function bake() {
        var pick = selectedNumericProps();
        if (pick.err) { setStatus(pick.err, false); return; }
        var zeta = num(dampT, 0.28), wn = num(wnT, 12.5), amount = num(amountT, 1);
        var axis = axisDD.selection.index;    // 0 all, 1 X, 2 Y, 3 Z, 4 offset phase per axis
        var rateIdx = rateDD.selection.index;
        var fps = rateIdx === 0 ? pick.comp.frameRate : [0, 30, 15, 10][rateIdx];
        var step = 1 / fps;
        var done = 0, skipped = 0;

        app.beginUndoGroup(TOOL + " · Bake");
        try {
            for (var pi = 0; pi < pick.props.length; pi++) {
                var prop = pick.props[pi];
                var sel = prop.selectedKeys;
                if (!sel || sel.length < 2) { skipped++; continue; }
                var keys = [];
                for (var i = 0; i < sel.length; i++) {
                    var v = prop.keyValue(sel[i]);
                    keys.push({ t: prop.keyTime(sel[i]), v: (v instanceof Array) ? v.slice(0) : [v] });
                }
                keys.sort(function (a, b) { return a.t - b.t; });
                var scalar = !(prop.keyValue(sel[0]) instanceof Array);

                for (var s = 0; s < keys.length - 1; s++) {
                    var t0 = keys[s].t, t1 = keys[s + 1].t, v0 = keys[s].v, v1 = keys[s + 1].v;
                    var dur = t1 - t0;
                    if (dur < step * 2) continue;
                    for (var k = prop.numKeys; k >= 1; k--) {
                        var kt = prop.keyTime(k);
                        if (kt > t0 + 1e-6 && kt < t1 - 1e-6) prop.removeKey(k);
                    }
                    var steps = Math.floor(dur / step);
                    for (var n = 1; n < steps; n++) {
                        var t = n * step, val = [];
                        for (var d = 0; d < v0.length; d++) {
                            var f;
                            if (axis >= 1 && axis <= 3 && d !== axis - 1) f = t / dur;     // other axes move linearly
                            else f = springFactor(t, dur, zeta, wn, amount, axis === 4 ? d * 0.9 : 0);
                            val.push(v0[d] + (v1[d] - v0[d]) * f);
                        }
                        prop.setValueAtTime(t0 + t, scalar ? val[0] : val);
                    }
                    var a = prop.nearestKeyIndex(t0), b = prop.nearestKeyIndex(t1);
                    for (var li = a; li <= b; li++) {
                        try { prop.setInterpolationTypeAtKey(li, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR); } catch (e2) {}
                    }
                }
                done++;
            }
        } catch (e) {
            setStatus("Error: " + e.toString(), false);
            app.endUndoGroup();
            return;
        }
        app.endUndoGroup();
        setStatus("Baked " + done + " propert" + (done === 1 ? "y" : "ies") + "." +
            (skipped ? " Skipped " + skipped + " (select at least 2 keyframes on each)." : ""), true);
    }

    // ════════════════════════════════════════════════════════════════
    //  UI
    // ════════════════════════════════════════════════════════════════
    var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", TOOL, undefined, { resizeable: true });
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 8;
    win.margins = 10;

    var modeRow = win.add("group");
    var liveRb = modeRow.add("radiobutton", undefined, "Live (expression)");
    var bakeRb = modeRow.add("radiobutton", undefined, "Bake (keyframes)");

    var stack = win.add("group");
    stack.orientation = "stack";
    stack.alignChildren = ["fill", "top"];

    function sliderRow(parent, label, min, max, def, key, decimals) {
        var g = parent.add("group");
        g.alignChildren = ["left", "center"];
        var l = g.add("statictext", undefined, label); l.preferredSize.width = 84;
        var start = parseFloat(getSetting(key, def));
        var sl = g.add("slider", undefined, start, min, max); sl.preferredSize.width = 130;
        var t = g.add("edittext", undefined, start.toFixed(decimals)); t.characters = 5;
        sl.onChanging = function () { t.text = sl.value.toFixed(decimals); };
        sl.onChange = function () { setSetting(key, sl.value); };
        t.onChange = function () { var v = parseFloat(t.text); if (!isNaN(v)) { sl.value = Math.max(min, Math.min(max, v)); setSetting(key, v); } };
        return t;
    }
    function num(t, d) { var v = parseFloat(t.text); return isNaN(v) ? d : v; }

    // Live panel
    var pLive = stack.add("panel", undefined, "Live bounce");
    pLive.orientation = "column"; pLive.alignChildren = ["fill", "top"]; pLive.margins = [10, 14, 10, 10]; pLive.spacing = 4;
    var ampT = sliderRow(pLive, "Amplitude %", 0, 30, "5", "amp", 1);
    var freqT = sliderRow(pLive, "Frequency", 0.5, 10, "4", "freq", 1);
    var decayT = sliderRow(pLive, "Decay", 1, 20, "8", "decay", 1);
    var bounceCb = pLive.add("checkbox", undefined, "Bounce off the end value (instead of elastic)");
    bounceCb.value = getSetting("bounce", "false") === "true";
    var axisRow = pLive.add("group");
    axisRow.add("statictext", undefined, "Axes:");
    var axisX = axisRow.add("checkbox", undefined, "X"); axisX.value = true;
    var axisY = axisRow.add("checkbox", undefined, "Y"); axisY.value = true;
    var axisZ = axisRow.add("checkbox", undefined, "Z"); axisZ.value = true;
    var liveBtns = pLive.add("group");
    var liveBtn = liveBtns.add("button", undefined, "Apply to selected");
    var removeBtn = liveBtns.add("button", undefined, "Remove");

    // Bake panel
    var pBake = stack.add("panel", undefined, "Bake bounce");
    pBake.orientation = "column"; pBake.alignChildren = ["fill", "top"]; pBake.margins = [10, 14, 10, 10]; pBake.spacing = 4;
    var dampT = sliderRow(pBake, "Damping ζ", 0.05, 1.2, "0.28", "damp", 2);
    var wnT = sliderRow(pBake, "Frequency ωn", 4, 28, "12.5", "wn", 1);
    var amountT = sliderRow(pBake, "Overshoot", 0, 2, "1", "amount", 2);
    var axRow = pBake.add("group");
    axRow.add("statictext", undefined, "Axis:");
    var axisDD = axRow.add("dropdownlist", undefined, ["All together", "X only", "Y only", "Z only", "Offset per axis"]);
    axisDD.selection = 0;
    var rRow = pBake.add("group");
    rRow.add("statictext", undefined, "Keys per second:");
    var rateDD = rRow.add("dropdownlist", undefined, ["Comp frame rate", "30", "15", "10"]);
    rateDD.selection = 0;
    var bakeBtn = pBake.add("button", undefined, "Bake between selected keyframes");

    var statusTxt = win.add("statictext", undefined, "Select keyframed properties in the timeline.", { multiline: true });
    statusTxt.preferredSize.height = 30;

    DP.footer(win, { id: "bouncer", name: TOOL, version: VERSION });

    function setStatus(msg, ok) {
        statusTxt.text = msg;
        try { statusTxt.graphics.foregroundColor = statusTxt.graphics.newPen(statusTxt.graphics.PenType.SOLID_COLOR, ok ? [0.6, 0.85, 0.65] : [0.95, 0.45, 0.4], 1); } catch (e) {}
    }

    function showMode() {
        pLive.visible = liveRb.value;
        pBake.visible = bakeRb.value;
        setSetting("mode", liveRb.value ? "live" : "bake");
    }
    liveRb.value = getSetting("mode", "live") === "live";
    bakeRb.value = !liveRb.value;
    liveRb.onClick = bakeRb.onClick = showMode;
    bounceCb.onClick = function () { setSetting("bounce", bounceCb.value); };
    liveBtn.onClick = applyLive;
    removeBtn.onClick = removeLive;
    bakeBtn.onClick = bake;

    showMode();
    win.onResizing = win.onResize = function () { this.layout.resize(); };
    if (win instanceof Window) { win.center(); win.show(); }
    else { win.layout.layout(true); win.layout.resize(); }
})(this);
