/*
 * Slicer.jsx — v2.0.0
 * Finds where an animated path crosses itself and splits it into segments,
 * one layer per segment, each with Trim Paths keyed to the crossings over time.
 * Put a Drop Shadow or Bevel on each segment layer to get per-segment shadows
 * that over- and under-lap correctly.
 *
 * Works with shape layer paths and mask paths (mask segments become new
 * shape layers that follow the mask exactly).
 *
 * Author: DesignPraise (@designpraiseeric) · MIT License
 */

(function (thisObj) {
    var TOOL = "Slicer";
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


    function hyp(x, y) { return Math.sqrt(x * x + y * y); }

    // ── Find paths on a layer ─────────────────────────────────────────
    function findPaths(layer) {
        var out = [];
        function walk(group, label) {
            for (var i = 1; i <= group.numProperties; i++) {
                var p = group.property(i);
                if (!p) continue;
                if (p.matchName === "ADBE Vector Shape") out.push({ name: label + (p.parentProperty.name), prop: p, type: "shape" });
                else if (p.numProperties && p.propertyType !== PropertyType.PROPERTY) walk(p, p.matchName === "ADBE Vector Group" ? label + p.name + " › " : label);
            }
        }
        var root = layer.property("ADBE Root Vectors Group");
        if (root) walk(root, "");
        var masks = layer.property("ADBE Mask Parade");
        if (masks) for (var m = 1; m <= masks.numProperties; m++) {
            out.push({ name: masks.property(m).name + " (mask)", prop: masks.property(m).property("ADBE Mask Shape"), type: "mask" });
        }
        return out;
    }

    // Index chain from the layer down to a property, e.g. [2, 1, 2, 1, 2].
    function indexChain(prop) {
        var chain = [], p = prop;
        while (p && p.propertyDepth > 0) { chain.unshift(p.propertyIndex); p = p.parentProperty; }
        return chain;
    }
    function follow(layer, chain) {
        var p = layer;
        for (var i = 0; i < chain.length; i++) p = p.property(chain[i]);
        return p;
    }
    function exprRef(layer, chain) {
        var s = 'thisComp.layer("' + layer.name.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '")';
        for (var i = 0; i < chain.length; i++) s += "(" + chain[i] + ")";
        return s;
    }

    // ------------------------------------------------------------
    // Geometry: Bezier evaluation, length, subdivision and intersection
    // ------------------------------------------------------------
    function Point(x, y) { this.x = x; this.y = y; }
    function Bezier(p0, p1, p2, p3) {
        this.p0 = p0; this.p1 = p1; this.p2 = p2; this.p3 = p3;
    }
    Bezier.prototype.evaluate = function(t) {
        var mt = 1 - t;
        var x = mt*mt*mt * this.p0.x + 3*mt*mt*t * this.p1.x + 3*mt*t*t * this.p2.x + t*t*t * this.p3.x;
        var y = mt*mt*mt * this.p0.y + 3*mt*mt*t * this.p1.y + 3*mt*t*t * this.p2.y + t*t*t * this.p3.y;
        return new Point(x, y);
    };
    Bezier.prototype.derivative = function(t) {
        var mt = 1 - t;
        var dx = 3*mt*mt*(this.p1.x-this.p0.x) + 6*mt*t*(this.p2.x-this.p1.x) + 3*t*t*(this.p3.x-this.p2.x);
        var dy = 3*mt*mt*(this.p1.y-this.p0.y) + 6*mt*t*(this.p2.y-this.p1.y) + 3*t*t*(this.p3.y-this.p2.y);
        return new Point(dx, dy);
    };
    Bezier.prototype.getBounds = function() {
        var minX = Math.min(this.p0.x, this.p3.x);
        var maxX = Math.max(this.p0.x, this.p3.x);
        var minY = Math.min(this.p0.y, this.p3.y);
        var maxY = Math.max(this.p0.y, this.p3.y);
        var pts = [this.p1, this.p2];
        for (var i=0; i<pts.length; i++) {
            if (pts[i].x < minX) minX = pts[i].x;
            if (pts[i].x > maxX) maxX = pts[i].x;
            if (pts[i].y < minY) minY = pts[i].y;
            if (pts[i].y > maxY) maxY = pts[i].y;
        }
        return {minX:minX, minY:minY, maxX:maxX, maxY:maxY};
    };
    function lengthOfBezier(b, eps) {
        eps = eps || 0.5;
        function f(t) { var d = b.derivative(t); return hyp(d.x, d.y); }
        function simp(a,bp) { var m=(a+bp)/2; return (bp-a)*(f(a)+4*f(m)+f(bp))/6; }
        function adapt(a,bp,eps,depth) {
            depth = depth || 10;
            var whole = simp(a,bp), m=(a+bp)/2;
            var left=simp(a,m), right=simp(m,bp);
            if (Math.abs(left+right-whole) < 15*eps || depth<=0) return left+right;
            return adapt(a,m,eps/2,depth-1) + adapt(m,bp,eps/2,depth-1);
        }
        return adapt(0,1,eps);
    }
    function lerpPoint(p1,p2,t) { return new Point(p1.x+(p2.x-p1.x)*t, p1.y+(p2.y-p1.y)*t); }
    function deCasteljau(b,t) {
        var p01=lerpPoint(b.p0,b.p1,t), p12=lerpPoint(b.p1,b.p2,t), p23=lerpPoint(b.p2,b.p3,t);
        var p012=lerpPoint(p01,p12,t), p123=lerpPoint(p12,p23,t), p0123=lerpPoint(p012,p123,t);
        return {left:new Bezier(b.p0,p01,p012,p0123), right:new Bezier(p0123,p123,p23,b.p3)};
    }
    function lineIntersection(p1,p2,q1,q2) {
        var d = (p2.x-p1.x)*(q2.y-q1.y) - (p2.y-p1.y)*(q2.x-q1.x);
        if (Math.abs(d)<1e-10) return null;
        var t1 = ((q1.x-p1.x)*(q2.y-q1.y) - (q1.y-p1.y)*(q2.x-q1.x))/d;
        var t2 = ((q1.x-p1.x)*(p2.y-p1.y) - (q1.y-p1.y)*(p2.x-p1.x))/d;
        if (t1>=0 && t1<=1 && t2>=0 && t2<=1) {
            return {point: new Point(p1.x+t1*(p2.x-p1.x), p1.y+t1*(p2.y-p1.y)), t1:t1, t2:t2};
        }
        return null;
    }
    function bezierIntersections(b1,b2,flatness,eps) {
        eps=eps||0.5; var results=[];
        function isFlat(b) { var bb=b.getBounds(); return (bb.maxX-bb.minX)<=flatness && (bb.maxY-bb.minY)<=flatness; }
        function bboxOverlap(b1,b2) { var a=b1.getBounds(), b=b2.getBounds(); return !(a.maxX<b.minX || a.minX>b.maxX || a.maxY<b.minY || a.minY>b.maxY); }
        function intersectRec(b1,b2,tr1,tr2) {
            if(!bboxOverlap(b1,b2)) return;
            if(isFlat(b1) && isFlat(b2)) {
                var p1=b1.evaluate(0), p2=b1.evaluate(1), q1=b2.evaluate(0), q2=b2.evaluate(1);
                var inter = lineIntersection(p1,p2,q1,q2);
                if(inter) {
                    var t1 = tr1[0]+(tr1[1]-tr1[0])*inter.t1;
                    var t2 = tr2[0]+(tr2[1]-tr2[0])*inter.t2;
                    results.push({t1:t1, t2:t2, point:inter.point});
                } return;
            }
            var m1=0.5,m2=0.5;
            var l1=deCasteljau(b1,m1).left, r1=deCasteljau(b1,m1).right;
            var l2=deCasteljau(b2,m2).left, r2=deCasteljau(b2,m2).right;
            var tmid1=tr1[0]+(tr1[1]-tr1[0])*m1, tmid2=tr2[0]+(tr2[1]-tr2[0])*m2;
            intersectRec(l1,l2,[tr1[0],tmid1],[tr2[0],tmid2]);
            intersectRec(l1,r2,[tr1[0],tmid1],[tmid2,tr2[1]]);
            intersectRec(r1,l2,[tmid1,tr1[1]],[tr2[0],tmid2]);
            intersectRec(r1,r2,[tmid1,tr1[1]],[tmid2,tr2[1]]);
        }
        intersectRec(b1,b2,[0,1],[0,1]);
        var uniq=[];
        for(var i=0;i<results.length;i++) {
            var dup=false;
            for(var j=0;j<uniq.length;j++) if(hyp(results[i].point.x-uniq[j].point.x, results[i].point.y-uniq[j].point.y)<eps) {dup=true; break;}
            if(!dup) uniq.push(results[i]);
        }
        return uniq;
    }
    function getBezierSegmentsFromPathProperty(pathProp, time) {
        // Works for both shape path and mask path (they have same value structure)
        var pv = pathProp.valueAtTime(time, false);
        if (!pv || !pv.vertices) return [];
        var verts = pv.vertices;
        var inTang = pv.inTangents;
        var outTang = pv.outTangents;
        var closed = pv.closed;
        var segs=[], n=verts.length;
        if(n<2) return segs;
        for(var i=0;i<n-1;i++) {
            segs.push(new Bezier(
                new Point(verts[i][0],verts[i][1]),
                new Point(verts[i][0]+outTang[i][0], verts[i][1]+outTang[i][1]),
                new Point(verts[i+1][0]+inTang[i+1][0], verts[i+1][1]+inTang[i+1][1]),
                new Point(verts[i+1][0],verts[i+1][1])
            ));
        }
        if(closed) {
            var lst=n-1;
            segs.push(new Bezier(
                new Point(verts[lst][0],verts[lst][1]),
                new Point(verts[lst][0]+outTang[lst][0], verts[lst][1]+outTang[lst][1]),
                new Point(verts[0][0]+inTang[0][0], verts[0][1]+inTang[0][1]),
                new Point(verts[0][0],verts[0][1])
            ));
        }
        return segs;
    }
    function totalLength(segs, flat) { var len=0; for(var i=0;i<segs.length;i++) len+=lengthOfBezier(segs[i],flat); return len; }
    function findSelfIntersections(segs, flat, totalLen) {
        var inters=[];
        for(var i=0;i<segs.length;i++) {
            for(var j=i+1;j<segs.length;j++) {
                var its = bezierIntersections(segs[i], segs[j], flat, 0.5);
                for(var k=0;k<its.length;k++) {
                    var t1=its[k].t1;
                    if((Math.abs(t1)<1e-6 && (j==i+1 || (i==0 && j==segs.length-1))) ||
                       (Math.abs(t1-1)<1e-6 && (i+1==j || (i==segs.length-1 && j==0)))) continue;
                    var lenBefore=0;
                    for(var s=0;s<i;s++) lenBefore+=lengthOfBezier(segs[s]);
                    var leftPart = deCasteljau(segs[i], t1).left;
                    lenBefore += lengthOfBezier(leftPart);
                    inters.push({percent: lenBefore/totalLen});
                }
            }
        }
        inters.sort(function(a,b){return a.percent-b.percent;});
        var uniq=[];
        for(var i=0;i<inters.length;i++) if(uniq.length===0 || Math.abs(inters[i].percent-uniq[uniq.length-1].percent)>0.001) uniq.push(inters[i]);
        return uniq;
    }


    function getSegments(pathProp, time) {
        var pv = pathProp.valueAtTime(time, false);
        if (!pv || !pv.vertices) return [];
        var v = pv.vertices, inT = pv.inTangents, outT = pv.outTangents, n = v.length, segs = [];
        if (n < 2) return segs;
        for (var i = 0; i < n - 1; i++) segs.push(new Bezier(
            new Point(v[i][0], v[i][1]), new Point(v[i][0] + outT[i][0], v[i][1] + outT[i][1]),
            new Point(v[i + 1][0] + inT[i + 1][0], v[i + 1][1] + inT[i + 1][1]), new Point(v[i + 1][0], v[i + 1][1])));
        if (pv.closed) segs.push(new Bezier(
            new Point(v[n - 1][0], v[n - 1][1]), new Point(v[n - 1][0] + outT[n - 1][0], v[n - 1][1] + outT[n - 1][1]),
            new Point(v[0][0] + inT[0][0], v[0][1] + inT[0][1]), new Point(v[0][0], v[0][1])));
        return segs;
    }

    function slice() {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) { setStatus("Open a composition.", false); return; }
        if (!cache || !cache.paths.length) { setStatus("Click Refresh, then pick a layer and path.", false); return; }
        var layer = cache.layers[layerDD.selection.index];
        var info = cache.paths[pathDD.selection.index];
        var step = Math.max(1, parseInt(sampleT.text, 10) || 2);
        var flat = Math.max(0.05, parseFloat(flatT.text) || 0.5);

        // 1. Sample crossings over the layer's life.
        var fd = comp.frameDuration, times = [];
        for (var t = layer.inPoint; t <= layer.outPoint + 1e-4; t += step * fd) times.push(t);
        if (times[times.length - 1] < layer.outPoint - 1e-4) times.push(layer.outPoint);
        var all = [], most = 0;
        for (var ti = 0; ti < times.length; ti++) {
            var segs = getSegments(info.prop, times[ti]);
            var pc = [];
            if (segs.length >= 2) {
                var total = totalLength(segs, flat);
                if (total > 1e-6) {
                    var hits = findSelfIntersections(segs, flat, total);
                    for (var h = 0; h < hits.length; h++) pc.push(hits[h].percent);
                }
            }
            pc.sort(function (a, b) { return a - b; });
            all.push(pc);
            most = Math.max(most, pc.length);
            if (ti % 10 === 0) { setStatus("Scanning… " + Math.round(100 * ti / times.length) + "%", true); try { win.update && win.update(); } catch (e) {} }
        }
        if (most === 0) { setStatus("The path never crosses itself here. Try a lower flatness.", false); return; }
        var segCount = most + 1;

        app.beginUndoGroup(TOOL + " · Slice");
        try {
            var chain = indexChain(info.prop);
            var made = [];
            for (var s = 0; s < segCount; s++) {
                var seg, trimParent, pathProp;
                if (info.type === "shape") {
                    seg = layer.duplicate();
                    pathProp = follow(seg, chain);
                    trimParent = pathProp.parentProperty.parentProperty;          // the group's Contents
                } else {
                    seg = comp.layers.addShape();
                    seg.moveBefore(layer);
                    seg.parent = layer;                                            // share the mask's coordinate space
                    seg.transform.anchorPoint.setValue([0, 0]);
                    seg.transform.position.setValue([0, 0]);
                    var grp = seg.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
                    trimParent = grp.property("ADBE Vectors Group");
                    pathProp = trimParent.addProperty("ADBE Vector Shape - Group").property("ADBE Vector Shape");
                    var stroke = trimParent.addProperty("ADBE Vector Graphic - Stroke");
                    stroke.property("ADBE Vector Stroke Width").setValue(6);
                    try { stroke.property("ADBE Vector Stroke Line Cap").setValue(2); } catch (eC) {}
                }
                seg.name = layer.name + " · segment " + (s + 1);
                pathProp.expression = exprRef(layer, chain);                       // stays in sync with the original
                var trim = trimParent.addProperty("ADBE Vector Filter - Trim");
                made.push({ layer: seg, start: trim.property("ADBE Vector Trim Start"), end: trim.property("ADBE Vector Trim End") });
            }

            // 2. Key each segment's trim to the crossings.
            for (var m = 0; m < made.length; m++) {
                for (var k = 0; k < times.length; k++) {
                    var pcs = all[k], a = 0, b = 0;
                    if (!pcs.length) { if (m === 0) b = 100; }
                    else if (m === 0) b = pcs[0] * 100;
                    else if (m < pcs.length) { a = pcs[m - 1] * 100; b = pcs[m] * 100; }
                    else if (m === pcs.length) { a = pcs[pcs.length - 1] * 100; b = 100; }
                    made[m].start.setValueAtTime(times[k], Math.max(0, Math.min(100, a)));
                    made[m].end.setValueAtTime(times[k], Math.max(0, Math.min(100, b)));
                }
                for (var q = 1; q <= made[m].start.numKeys; q++) {
                    made[m].start.setInterpolationTypeAtKey(q, KeyframeInterpolationType.HOLD);
                    made[m].end.setInterpolationTypeAtKey(q, KeyframeInterpolationType.HOLD);
                }
            }
            if (hideCb.value) layer.enabled = false;
            setStatus("Made " + segCount + " segment layers. Add a Drop Shadow to each.", true);
        } catch (e) {
            setStatus("Error: " + e.toString(), false);
        } finally {
            app.endUndoGroup();
        }
    }

    // ── UI ────────────────────────────────────────────────────────────
    var cache = null;
    var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", TOOL, undefined, { resizeable: true });
    win.orientation = "column"; win.alignChildren = ["fill", "top"]; win.spacing = 8; win.margins = 10;

    var r1 = win.add("group");
    r1.add("statictext", undefined, "Layer:").preferredSize.width = 44;
    var layerDD = r1.add("dropdownlist", undefined, []); layerDD.alignment = ["fill", "center"]; layerDD.preferredSize.width = 180;
    var refreshBtn = r1.add("button", undefined, "Refresh");
    var r2 = win.add("group");
    r2.add("statictext", undefined, "Path:").preferredSize.width = 44;
    var pathDD = r2.add("dropdownlist", undefined, []); pathDD.alignment = ["fill", "center"]; pathDD.preferredSize.width = 180;

    var opt = win.add("panel", undefined, "Options");
    opt.orientation = "column"; opt.alignChildren = ["left", "top"]; opt.margins = [10, 14, 10, 10];
    var o1 = opt.add("group"); o1.add("statictext", undefined, "Check every");
    var sampleT = o1.add("edittext", undefined, "2"); sampleT.characters = 3; o1.add("statictext", undefined, "frames");
    var o2 = opt.add("group"); o2.add("statictext", undefined, "Flatness");
    var flatT = o2.add("edittext", undefined, "0.5"); flatT.characters = 4; o2.add("statictext", undefined, "px (lower = more precise)");
    var hideCb = opt.add("checkbox", undefined, "Turn off the original layer"); hideCb.value = true;

    var goBtn = win.add("button", undefined, "Slice at crossings");
    var statusTxt = win.add("statictext", undefined, "Click Refresh to list layers with paths.", { multiline: true });
    statusTxt.preferredSize.height = 30;

    DP.footer(win, { id: "slicer", name: TOOL, version: VERSION });

    function setStatus(msg, ok) {
        statusTxt.text = msg;
        try { statusTxt.graphics.foregroundColor = statusTxt.graphics.newPen(statusTxt.graphics.PenType.SOLID_COLOR, ok ? [0.6, 0.85, 0.65] : [0.95, 0.45, 0.4], 1); } catch (e) {}
    }

    function refresh() {
        layerDD.removeAll(); pathDD.removeAll(); cache = { layers: [], paths: [] };
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) { setStatus("Open a composition.", false); return; }
        for (var i = 1; i <= comp.numLayers; i++) {
            var L = comp.layer(i);
            if (findPaths(L).length) { cache.layers.push(L); layerDD.add("item", i + ". " + L.name); }
        }
        if (!cache.layers.length) { setStatus("No shape paths or masks in this comp.", false); return; }
        var sel = comp.selectedLayers.length ? comp.selectedLayers[0] : null, pick = 0;
        for (var j = 0; j < cache.layers.length; j++) if (cache.layers[j] === sel) pick = j;
        layerDD.selection = pick;
        setStatus(cache.layers.length + " layer(s) with paths.", true);
    }
    layerDD.onChange = function () {
        pathDD.removeAll();
        if (!layerDD.selection || !cache) return;
        cache.paths = findPaths(cache.layers[layerDD.selection.index]);
        for (var i = 0; i < cache.paths.length; i++) pathDD.add("item", cache.paths[i].name);
        if (cache.paths.length) pathDD.selection = 0;
    };
    refreshBtn.onClick = refresh;
    goBtn.onClick = slice;

    win.onResizing = win.onResize = function () { this.layout.resize(); };
    refresh();
    if (win instanceof Window) { win.center(); win.show(); }
    else { win.layout.layout(true); win.layout.resize(); }
})(this);
