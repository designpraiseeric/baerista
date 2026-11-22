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
    var VERSION = "2.0.2";

//@@DP_CORE@@

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
