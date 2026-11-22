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
    var VERSION = "1.0.3";
    var SETTINGS = "DesignPraise_Bouncer";
    var TAG = "// Baerista · Bouncer";

//@@DP_CORE@@

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
                 "  for (var i = 0; i < out.length && i < on.length; i++) if (on[i] == 1) out[i] += v[i] * k;\n" +
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
                // Spatial properties on a 2D layer report 3 values to scripts but only 2 to expressions.
                if (dims === 3 && p.propertyValueType === PropertyValueType.ThreeD_SPATIAL && !L.threeDLayer) dims = 2;
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
