/*
 * Text Burst Physics Tool v3.0
 * ---------------------------------------------------------------------
 * Redesign of the v2 "collision physics" tool. v2 tethered every
 * element to its final position with a spring for the ENTIRE
 * simulation, and boxed each element into a narrow neighbor slot.
 * That meant elements never had room to actually collide — the
 * "collision" pass was mostly inert.
 *
 * v3 is two honest phases:
 *   PHASE 1 - BURST & COLLIDE: every element launches from a shared
 *   origin point with mass proportional to its own size (bigger
 *   letters push smaller ones harder), gravity pulls them down, and
 *   they bounce off each other and a soft arena wall using real
 *   mass-weighted impulse resolution. No homing force at all here -
 *   this is where the "solid object" feel actually lives.
 *
 *   PHASE 2 - PULL HOME: once an element's personal snap window
 *   opens, it stops colliding and eases smoothly to its final slot.
 *   Clean handoff, no spring oscillation.
 *
 * Parameter count is roughly halved vs v2 (dropped: spring strength,
 * separate H/V range, neighbor-encroachment clamp, spatial-grid /
 * "Random" mode toggles - all now handled automatically).
 * ---------------------------------------------------------------------
 */

(function (thisObj) {
var TOOL = "TextJam", VERSION = "3.1.2";

//@@DP_CORE@@

function indexIn(arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i; return -1; }

// ------------------------------------------------------------
// Resilient property lookup
// ------------------------------------------------------------
function getProp(parent, matchNames, fallbackName) {
    for (var i = 0; i < matchNames.length; i++) {
        try { var p = parent.property(matchNames[i]); if (p) return p; } catch (e) {}
    }
    if (fallbackName) {
        try { var p2 = parent[fallbackName]; if (p2) return p2; } catch (e) {}
    }
    return null;
}

// ------------------------------------------------------------
// Parameter definitions (trimmed to what actually changes the feel)
// ------------------------------------------------------------
var SIM_FPS = 30; // internal simulation resolution, not exposed - doesn't need to be

var PARAM_DEFS = [
    { key: "duration",     label: "Duration (s)",              def: 2.2,  min: 0.5,  max: 10.0, decimals: 1 },
    { key: "stagger",      label: "Burst Stagger (s)",          def: 0.02, min: 0.0,  max: 0.3,  decimals: 2 },
    { key: "burstForce",   label: "Burst Force (px/s)",         def: 550,  min: 0,    max: 2000, decimals: 0 },
    { key: "gravity",      label: "Gravity (px/s\u00B2)",       def: 350,  min: -1000, max: 2000, decimals: 0 },
    { key: "drag",         label: "Drag",                       def: 0.85, min: 0.0,  max: 1.0,  decimals: 2 },
    { key: "bounciness",   label: "Bounciness",                 def: 0.55, min: 0.0,  max: 1.0,  decimals: 2 },
    { key: "snapPct",      label: "Snap % (pull-home window)",  def: 35,   min: 5,    max: 90,   decimals: 0 },
    { key: "solidity",     label: "Solidity (collision size)",  def: 0.7,  min: 0.0,  max: 2.0,  decimals: 1 },
    { key: "randomSeed",   label: "Random Seed",                def: 0,    min: 0,    max: 1000, decimals: 0 }
];

var MODE_LIST = ["Letter", "Word", "Line"];

var EFFECT_PREFIX = "Physics: ";
var BOOL_PARAM_DEFS = [
    { key: "autoWorkArea", label: "Auto-set Work Area", def: true }
];

function getParamDef(key) {
    for (var i = 0; i < PARAM_DEFS.length; i++) {
        if (PARAM_DEFS[i].key === key) return PARAM_DEFS[i];
    }
    return null;
}

// ------------------------------------------------------------
// Effect-control helpers
// ------------------------------------------------------------
function getEffectsGroup(layer) {
    return getProp(layer, ["ADBE Effect Parade"], "Effects");
}

function findEffectByName(layer, effName) {
    var fx = getEffectsGroup(layer);
    if (!fx) return null;
    for (var i = 1; i <= fx.numProperties; i++) {
        if (fx.property(i).name === effName) return fx.property(i);
    }
    return null;
}

function readExistingEffectValue(layer, key) {
    var e = findEffectByName(layer, EFFECT_PREFIX + key);
    if (!e) return null;
    try { return e.property(1).value; } catch (e1) { return null; }
}

function writeEffectValue(layer, key, value, matchName) {
    var fx = getEffectsGroup(layer);
    if (!fx) throw new Error("Layer has no Effects group");
    var effName = EFFECT_PREFIX + key;
    var target = findEffectByName(layer, effName);
    if (!target) {
        target = fx.addProperty(matchName);
        target.name = effName;
    }
    target.property(1).setValue(value);
}

function getActiveCompAndTextLayer() {
    var comp = app.project.activeItem;
    if (!comp || !(comp instanceof CompItem)) {
        alert("Please select or open a composition.");
        return null;
    }
    if (comp.selectedLayers.length === 0) {
        alert("Please select a text layer.");
        return null;
    }
    var layer = comp.selectedLayers[0];
    if (!(layer instanceof TextLayer)) {
        alert("Please select a text layer.");
        return null;
    }
    return { comp: comp, layer: layer };
}

// ------------------------------------------------------------
// UI
// ------------------------------------------------------------
function buildUI() {
    var comp = app.project.activeItem;
    var seedLayer = null;
    if (comp instanceof CompItem && comp.selectedLayers.length > 0 && comp.selectedLayers[0] instanceof TextLayer) {
        seedLayer = comp.selectedLayers[0];
    }

    var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", "TextJam", undefined, { resizeable: true });
    win.orientation = "column";
    win.alignChildren = "left";

    // Panel: Split mode
    var p1 = win.add("panel", undefined, "Split Into");
    p1.orientation = "row";
    p1.alignChildren = "left";
    p1.add("statictext", undefined, "Mode:");
    var modeDD = p1.add("dropdownlist", undefined, MODE_LIST);
    modeDD.selection = 0;
    modeDD.helpTip = "What each physics object is: a letter, a word, or a line.";
    if (seedLayer) {
        var existingModeIdx = readExistingEffectValue(seedLayer, "mode");
        if (existingModeIdx !== null) {
            var idx = Math.round(existingModeIdx);
            if (idx >= 0 && idx < MODE_LIST.length) modeDD.selection = idx;
        }
    }

    // Panel: Burst & Collide
    var p2 = win.add("panel", undefined, "Burst & Collide");
    p2.orientation = "column";
    var sliders = {};
    var burstKeys = ["duration", "stagger", "burstForce", "gravity", "drag", "bounciness"];
    addSliderRow(p2, burstKeys, seedLayer, sliders);

    // Panel: Assembly
    var p3 = win.add("panel", undefined, "Assembly");
    p3.orientation = "column";
    var assemblyKeys = ["snapPct", "solidity", "randomSeed"];
    addSliderRow(p3, assemblyKeys, seedLayer, sliders);

    // Panel: Options
    var p4 = win.add("panel", undefined, "Options");
    p4.orientation = "column";
    var checkboxes = {};
    for (var b = 0; b < BOOL_PARAM_DEFS.length; b++) {
        var bdef = BOOL_PARAM_DEFS[b];
        var startBool = bdef.def;
        if (seedLayer) {
            var existingBool = readExistingEffectValue(seedLayer, bdef.key);
            if (existingBool !== null) startBool = !!existingBool;
        }
        var cb = p4.add("checkbox", undefined, bdef.label);
        cb.value = startBool;
        checkboxes[bdef.key] = cb;
    }

    if (seedLayer) {
        win.add("statictext", undefined, "\u2713 Loaded current Effect Controls values.");
    }

    var btnGroup = win.add("group");
    btnGroup.alignment = "center";
    var applyBtn = btnGroup.add("button", undefined, "Apply & Bake");
    var resetBtn = btnGroup.add("button", undefined, "Reset Layer");
    var loadBtn = btnGroup.add("button", undefined, "Read layer");
    loadBtn.helpTip = "Load the Physics sliders from the selected text layer";

    applyBtn.onClick = function() {
        var target = getActiveCompAndTextLayer();
        if (!target) return;

        var params = { mode: modeDD.selection.text };
        for (var k in sliders) {
            params[k] = parseFloat(sliders[k].value);
        }
        params.duration = Math.max(0.1, params.duration);
        params.stagger = Math.max(0, params.stagger);

        for (var bk in checkboxes) {
            params[bk] = checkboxes[bk].value;
        }
        main(params, target.comp, target.layer);
    };

    resetBtn.onClick = function() {
        var target = getActiveCompAndTextLayer();
        if (!target) return;
        if (confirm("Remove all physics effects and animators from the selected layer?")) {
            var layer = target.layer;
            app.beginUndoGroup("Reset Text Physics");
            try {
                var fx = getEffectsGroup(layer);
                if (fx) {
                    for (var i = fx.numProperties; i >= 1; i--) {
                        var ef = fx.property(i);
                        if (ef.name && ef.name.indexOf(EFFECT_PREFIX) === 0) ef.remove();
                    }
                }
                var txt = getProp(layer, ["ADBE Text Properties"], "text");
                if (txt) {
                    var anims = getProp(txt, ["ADBE Text Animators"], "animators");
                    if (anims) {
                        for (var a = anims.numProperties; a >= 1; a--) {
                            var anim = anims.property(a);
                            if (anim.name && (anim.name.indexOf("Physics_") === 0 || anim.name.indexOf("FadeIn_") === 0)) {
                                anim.remove();
                            }
                        }
                    }
                }
                alert("Layer reset.");
            } catch (e) { alert("Reset error: " + e); }
            app.endUndoGroup();
        }
    };

    loadBtn.onClick = function () {
        var c = app.project.activeItem;
        var L = (c instanceof CompItem && c.selectedLayers.length) ? c.selectedLayers[0] : null;
        if (!(L instanceof TextLayer)) { alert("Select a text layer first."); return; }
        var n = 0;
        for (var k in sliders) {
            var v = readExistingEffectValue(L, k);
            if (v !== null) { sliders[k].value = v; sliders[k]._lbl.text = v.toFixed(sliders[k]._dec); n++; }
        }
        var m = readExistingEffectValue(L, "mode");
        if (m !== null && m >= 0 && m < MODE_LIST.length) modeDD.selection = Math.round(m);
        for (var b in checkboxes) { var bv = readExistingEffectValue(L, b); if (bv !== null) checkboxes[b].value = !!bv; }
        alert(n ? "Loaded " + n + " values from " + L.name + "." : "No TextJam sliders on this layer yet.");
    };

    DP.footer(win, { id: "textjam", name: TOOL, version: VERSION });

    win.onResizing = win.onResize = function () { this.layout.resize(); };
    if (win instanceof Window) { win.center(); win.show(); }
    else { win.layout.layout(true); win.layout.resize(); }

    function addSliderRow(panel, keys, seedLayer, sliders) {
        for (var idx = 0; idx < keys.length; idx++) {
            var key = keys[idx];
            var def = getParamDef(key);
            var val = def.def;
            if (seedLayer) {
                var existing = readExistingEffectValue(seedLayer, key);
                if (existing !== null) val = existing;
            }
            (function(k, d, startVal) {
                var g = panel.add("group");
                g.orientation = "row";
                g.alignChildren = "left";
                g.add("statictext", undefined, d.label + ":");
                var sl = g.add("slider", undefined, startVal, d.min, d.max);
                var lbl = g.add("statictext", undefined, startVal.toFixed(d.decimals));
                lbl.characters = 8;
                sl.onChanging = function() { lbl.text = sl.value.toFixed(d.decimals); };
                sl._lbl = lbl; sl._dec = d.decimals;
                sliders[k] = sl;
            })(key, def, val);
        }
    }
}

// ------------------------------------------------------------
// MAIN
// ------------------------------------------------------------
function main(params, comp, textLayer) {
    app.beginUndoGroup("Text Burst Physics v3");
    try {
        for (var p = 0; p < PARAM_DEFS.length; p++) {
            var key = PARAM_DEFS[p].key;
            writeEffectValue(textLayer, key, params[key], "ADBE Slider Control");
        }
        var modeIdx = indexIn(MODE_LIST, params.mode);
        if (modeIdx < 0) modeIdx = 0;
        writeEffectValue(textLayer, "mode", modeIdx, "ADBE Slider Control");
        for (var b = 0; b < BOOL_PARAM_DEFS.length; b++) {
            var bkey = BOOL_PARAM_DEFS[b].key;
            writeEffectValue(textLayer, bkey, params[bkey] ? 1 : 0, "ADBE Checkbox Control");
        }

        var textPropGroup = getProp(textLayer, ["ADBE Text Properties"], "text");
        if (!textPropGroup) throw new Error("Layer has no 'ADBE Text Properties' group");
        var sourceTextDoc = getProp(textPropGroup, ["ADBE Text Document"], "sourceText");
        if (!sourceTextDoc) throw new Error("Layer has no 'ADBE Text Document' property");
        var rawString = sourceTextDoc.value.toString();
        if (rawString.length === 0) {
            alert("Text layer is empty.");
            return;
        }

        var elements = splitIntoElements(rawString, params.mode);
        if (elements.length === 0) {
            alert("No elements found.");
            return;
        }
        if (elements.length > 500) {
            if (!confirm("This will create " + elements.length + " animators, which may be slow. Continue?")) {
                return;
            }
        }

        var result = measurePositionsAndRadii(textLayer, elements);
        var finalPositions, radii;
        if (!result) {
            alert("Could not measure element positions. Using fallback.");
            var fallbackPos = [], fallbackRadii = [];
            var cx = 0, cy = 0;
            for (var i = 0; i < elements.length; i++) {
                fallbackPos.push({ x: cx, y: cy });
                fallbackRadii.push(12);
                cx += 20;
                if (cx > 500) { cx = 0; cy += 30; }
            }
            finalPositions = fallbackPos;
            radii = fallbackRadii;
        } else {
            finalPositions = result.positions;
            radii = result.radii;
        }

        for (var ri = 0; ri < radii.length; ri++) {
            radii[ri] *= params.solidity;
            if (radii[ri] < 1) radii[ri] = 1;
        }

        // Burst origin = centroid of the final text layout.
        var origin = { x: 0, y: 0 };
        for (var oi = 0; oi < finalPositions.length; oi++) {
            origin.x += finalPositions[oi].x;
            origin.y += finalPositions[oi].y;
        }
        origin.x /= finalPositions.length;
        origin.y /= finalPositions.length;

        var rng = makeSeededRandom(params.randomSeed);
        var launchTimes = getLaunchTimes(elements.length, params.stagger, rng);
        var simData = runPhysicsSimulation(elements, finalPositions, radii, origin, launchTimes, params, rng);

        removeOldAnimators(textLayer);
        applyPositionAnimators(textLayer, elements, finalPositions, simData, params, rawString.length);
        applyFadeInAnimators(textLayer, elements, launchTimes, rawString.length);

        if (params.autoWorkArea) {
            comp.workAreaStart = 0;
            comp.workAreaDuration = Math.min(params.duration, comp.duration);
        }

        alert("Baked " + elements.length + " elements.\nTweak the Physics sliders in Effect Controls, click Read layer, then Apply & Bake again.");
    } catch (e) {
        alert("Error: " + e.toString() + (e.line ? (" (line " + e.line + ")") : ""));
    } finally {
        app.endUndoGroup();
    }
}

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

function makeSeededRandom(seed) {
    var s = (Math.abs(Math.floor(seed)) % 233280) + 1;
    return function() {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

function splitIntoElements(text, mode) {
    var elements = [];
    var i;
    if (mode === "Letter") {
        for (i = 0; i < text.length; i++) {
            var ch = text.charAt(i);
            if (/\s/.test(ch)) continue;
            elements.push({ text: ch, startChar: i, endChar: i });
        }
    } else if (mode === "Word") {
        var wordRe = /\S+/g;
        var wm;
        while ((wm = wordRe.exec(text)) !== null) {
            elements.push({ text: wm[0], startChar: wm.index, endChar: wm.index + wm[0].length - 1 });
        }
    } else if (mode === "Line") {
        var lineRe = /[^\r\n]+/g;
        var lm;
        while ((lm = lineRe.exec(text)) !== null) {
            elements.push({ text: lm[0], startChar: lm.index, endChar: lm.index + lm[0].length - 1 });
        }
    }
    return elements;
}

// Where each element actually sits in the finished text.
// Measuring an element on its own puts every element at the same spot, so instead:
//   · each source line is measured with the layer's own justification (its left edge),
//   · every prefix of that line is measured left-justified (its running width),
//   · an element's centre is that line's left edge + the middle of its prefix span.
// Point text: exact to within kerning. Paragraph (box) text that wraps on its own
// is measured by its typed line breaks only.
function measurePositionsAndRadii(originalLayer, elements) {
    var dupLayer = originalLayer.duplicate();
    if (!dupLayer) throw new Error("duplicate() failed.");
    var textGroup = getProp(dupLayer, ["ADBE Text Properties"], "text");
    var st = getProp(textGroup, ["ADBE Text Document"], "sourceText");
    var anims = getProp(textGroup, ["ADBE Text Animators"], "animators");
    if (anims) for (var a = anims.numProperties; a >= 1; a--) anims.property(a).remove();
    if (st.numKeys) for (var k = st.numKeys; k >= 1; k--) st.removeKey(k);
    try { st.expression = ""; } catch (e0) {}

    var baseDoc = getProp(getProp(originalLayer, ["ADBE Text Properties"], "text"), ["ADBE Text Document"], "sourceText").value;
    var full = baseDoc.text;
    var justification = baseDoc.justification;
    var wasEnabled = originalLayer.enabled;
    originalLayer.enabled = false;

    function rectFor(str, just) {
        var d = baseDoc;
        d.text = str;
        if (just !== undefined) d.justification = just;
        st.setValue(d);
        return dupLayer.sourceRectAtTime(0, false);
    }

    var positions = [], radii = [];
    try {
        // Line breaks in AE text are \r; accept \n too.
        var lines = [], starts = [], cur = 0, re = /\r\n|\r|\n/g, m, last = 0;
        while ((m = re.exec(full)) !== null) { lines.push(full.substring(last, m.index)); starts.push(last); last = m.index + m[0].length; }
        lines.push(full.substring(last)); starts.push(last);

        var block = rectFor(full, justification);
        var lineH = block.height / lines.length;

        var lineInfo = [];
        for (var li = 0; li < lines.length; li++) {
            if (!lines[li].replace(/\s/g, "")) { lineInfo.push(null); continue; }
            var lr = rectFor(lines[li], justification);
            // Running width of every prefix, left-justified so it grows from one edge.
            var widths = [];
            for (var c = 1; c <= lines[li].length; c++) widths.push(rectFor(lines[li].substring(0, c), ParagraphJustification.LEFT_JUSTIFY).width);
            lineInfo.push({ left: lr.left, widths: widths, cy: block.top + lineH * (li + 0.5) });
        }

        for (var i = 0; i < elements.length; i++) {
            var e = elements[i];
            var L = 0;
            while (L + 1 < starts.length && starts[L + 1] <= e.startChar) L++;
            var info = lineInfo[L];
            if (!info) { positions.push({ x: block.left + block.width / 2, y: block.top + lineH * (L + 0.5) }); radii.push(lineH * 0.3); continue; }
            var s0 = e.startChar - starts[L], s1 = e.endChar - starts[L];
            var wStart = s0 > 0 ? info.widths[s0 - 1] : 0;
            var wEnd = info.widths[Math.min(s1, info.widths.length - 1)];
            var w = Math.max(1, wEnd - wStart);
            positions.push({ x: info.left + (wStart + wEnd) / 2, y: info.cy });
            radii.push(Math.max(w, lineH * 0.7) * 0.5);
        }
    } catch (e) {
        positions = null; radii = null;
    } finally {
        dupLayer.remove();
        originalLayer.enabled = wasEnabled;
    }
    return positions ? { positions: positions, radii: radii } : null;
}

// Launch order is always shuffled - a burst should feel organic
// regardless of split mode, so there's no separate "Random" mode
// to expose in the UI.
function getLaunchTimes(count, stagger, rng) {
    var order = [];
    for (var i = 0; i < count; i++) order.push(i);
    for (var j = count - 1; j > 0; j--) {
        var k = Math.floor(rng() * (j + 1));
        var tmp = order[j]; order[j] = order[k]; order[k] = tmp;
    }
    var times = new Array(count);
    for (var pIdx = 0; pIdx < count; pIdx++) {
        times[order[pIdx]] = pIdx * stagger;
    }
    return times;
}

function easeOutCubic(t) {
    var u = 1 - t;
    return 1 - u * u * u;
}

// Reflects a launched element off a soft circular arena wall centered
// on the burst origin, so the burst stays visually contained.
function reflectOffBoundary(i, pos, vel, origin, maxRange, restitution) {
    var dx = pos[i].x - origin.x;
    var dy = pos[i].y - origin.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > maxRange && dist > 0.0001) {
        var nx = dx / dist, ny = dy / dist;
        pos[i].x = origin.x + nx * maxRange;
        pos[i].y = origin.y + ny * maxRange;
        var vDotN = vel[i].x * nx + vel[i].y * ny;
        if (vDotN > 0) {
            vel[i].x -= (1 + restitution) * vDotN * nx;
            vel[i].y -= (1 + restitution) * vDotN * ny;
        }
    }
}

// PHASE 1 (burst/collide) + PHASE 2 (pull-home ease), per element.
function runPhysicsSimulation(elements, finalPositions, radii, origin, launchTimes, params, rng) {
    var n = elements.length;
    var totalSteps = Math.floor(params.duration * SIM_FPS);
    var dt = 1 / SIM_FPS;
    var gravity = params.gravity, drag = params.drag, bounciness = params.bounciness;
    var burstForce = params.burstForce;
    var snapFrac = Math.max(0.05, Math.min(0.9, params.snapPct / 100));

    // Mass proportional to on-screen area (radius^2) - bigger elements
    // push smaller ones harder and get pushed less. This is what makes
    // collisions feel like solid objects rather than equal-weight dots.
    var mass = [];
    for (var mi = 0; mi < n; mi++) mass.push(radii[mi] * radii[mi]);

    // Arena size scales with how far the final layout spreads from the
    // origin and with burst force, so faster bursts get more room.
    var spreadMax = 0;
    for (var si = 0; si < n; si++) {
        var ddx = finalPositions[si].x - origin.x;
        var ddy = finalPositions[si].y - origin.y;
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d > spreadMax) spreadMax = d;
    }
    var arenaRange = spreadMax + burstForce * 0.25 + 100;

    var pos = [], vel = [], launched = [], homing = [];
    var launchStep = [], homeStartStep = [], homeAnchor = [], homeAnchorStep = [];
    for (var i = 0; i < n; i++) {
        pos.push({ x: origin.x, y: origin.y });
        vel.push({ x: 0, y: 0 });
        launched.push(false);
        homing.push(false);
        launchStep.push(-1);
        homeStartStep.push(-1);
        homeAnchor.push({ x: origin.x, y: origin.y });
        homeAnchorStep.push(0);
    }

    var simData = [];
    for (i = 0; i < n; i++) simData.push([]);

    var cellSize = 0;
    if (n > 30) {
        var sumRadii = 0;
        for (var ri = 0; ri < radii.length; ri++) sumRadii += radii[ri];
        cellSize = (sumRadii / n) * 2.5;
    }

    for (var step = 0; step <= totalSteps; step++) {
        var currentTime = step * dt;

        // Launch pass
        for (i = 0; i < n; i++) {
            if (!launched[i] && currentTime >= launchTimes[i]) {
                launched[i] = true;
                launchStep[i] = step;

                var jitterAngle = rng() * 2 * Math.PI;
                var jitterMag = radii[i] * 0.15;
                pos[i].x = origin.x + Math.cos(jitterAngle) * jitterMag;
                pos[i].y = origin.y + Math.sin(jitterAngle) * jitterMag;

                var launchAngle = rng() * 2 * Math.PI;
                var launchSpeed = burstForce * (0.55 + 0.45 * rng());
                vel[i].x = Math.cos(launchAngle) * launchSpeed;
                vel[i].y = Math.sin(launchAngle) * launchSpeed;

                var windowLen = Math.max(0, totalSteps - step);
                homeStartStep[i] = step + Math.floor(windowLen * (1 - snapFrac));
                if (homeStartStep[i] > totalSteps) homeStartStep[i] = totalSteps;
            }
        }

        // Phase transition + integration
        for (i = 0; i < n; i++) {
            if (!launched[i]) continue;
            if (!homing[i] && step >= homeStartStep[i]) {
                homing[i] = true;
                homeAnchor[i] = { x: pos[i].x, y: pos[i].y };
                homeAnchorStep[i] = step;
            }
            if (!homing[i]) {
                vel[i].y += gravity * dt;
                vel[i].x *= (1 - drag * dt);
                vel[i].y *= (1 - drag * dt);
                pos[i].x += vel[i].x * dt;
                pos[i].y += vel[i].y * dt;
                reflectOffBoundary(i, pos, vel, origin, arenaRange, bounciness);
            } else {
                var denom = totalSteps - homeAnchorStep[i];
                var t = denom <= 0 ? 1 : (step - homeAnchorStep[i]) / denom;
                if (t > 1) t = 1;
                var e = easeOutCubic(t);
                pos[i].x = homeAnchor[i].x + (finalPositions[i].x - homeAnchor[i].x) * e;
                pos[i].y = homeAnchor[i].y + (finalPositions[i].y - homeAnchor[i].y) * e;
            }
        }

        // Collision resolution - only among elements still in the
        // free-collide phase. Once an element is homing, it neither
        // pushes nor gets pushed.
        var active = [];
        for (i = 0; i < n; i++) {
            if (launched[i] && !homing[i]) active.push(i);
        }

        if (active.length > 30 && cellSize > 0) {
            var grid = {};
            for (var ai = 0; ai < active.length; ai++) {
                var idx = active[ai];
                var cx = Math.floor(pos[idx].x / cellSize);
                var cy = Math.floor(pos[idx].y / cellSize);
                var key = cx + "," + cy;
                if (!grid[key]) grid[key] = [];
                grid[key].push(idx);
            }
            var checked = {};
            for (var key2 in grid) {
                var parts = key2.split(",");
                var cx0 = parseInt(parts[0], 10);
                var cy0 = parseInt(parts[1], 10);
                for (var dxOff = -1; dxOff <= 1; dxOff++) {
                    for (var dyOff = -1; dyOff <= 1; dyOff++) {
                        var nKey = (cx0 + dxOff) + "," + (cy0 + dyOff);
                        if (!grid[nKey]) continue;
                        var listA = grid[key2], listB = grid[nKey];
                        for (var ia = 0; ia < listA.length; ia++) {
                            for (var ib = 0; ib < listB.length; ib++) {
                                var iA = listA[ia], iB = listB[ib];
                                if (iA >= iB) continue;
                                var pairKey = iA + "," + iB;
                                if (checked[pairKey]) continue;
                                checked[pairKey] = true;
                                resolveCollision(iA, iB);
                            }
                        }
                    }
                }
            }
        } else {
            for (var ax = 0; ax < active.length - 1; ax++) {
                for (var ay = ax + 1; ay < active.length; ay++) {
                    resolveCollision(active[ax], active[ay]);
                }
            }
        }

        // Re-contain after collisions
        for (i = 0; i < n; i++) {
            if (launched[i] && !homing[i]) {
                reflectOffBoundary(i, pos, vel, origin, arenaRange, bounciness);
            }
        }

        for (i = 0; i < n; i++) {
            simData[i].push({ x: pos[i].x, y: pos[i].y });
        }
    }

    // Guarantee exact rest on the final couple of frames.
    for (i = 0; i < n; i++) {
        for (var s2 = Math.max(0, totalSteps - 2); s2 <= totalSteps; s2++) {
            simData[i][s2] = { x: finalPositions[i].x, y: finalPositions[i].y };
        }
    }

    return simData;

    // Mass-weighted impulse + positional correction - real rigid-body
    // collision response instead of the old equal-mass approximation.
    function resolveCollision(i, j) {
        var dx2 = pos[j].x - pos[i].x;
        var dy2 = pos[j].y - pos[i].y;
        var dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        var minDist = radii[i] + radii[j];
        if (dist2 >= minDist) return;

        var invMassI = 1 / mass[i];
        var invMassJ = 1 / mass[j];
        var totalInvMass = invMassI + invMassJ;

        if (dist2 <= 0.0001) {
            var jitterAngle = ((i * 12.9898 + j * 78.233) % (Math.PI * 2));
            var jx = Math.cos(jitterAngle), jy = Math.sin(jitterAngle);
            pos[i].x -= jx * 0.5 * (invMassI / totalInvMass) * 2;
            pos[i].y -= jy * 0.5 * (invMassI / totalInvMass) * 2;
            pos[j].x += jx * 0.5 * (invMassJ / totalInvMass) * 2;
            pos[j].y += jy * 0.5 * (invMassJ / totalInvMass) * 2;
            return;
        }

        var overlap = minDist - dist2;
        var nx = dx2 / dist2, ny = dy2 / dist2;
        var corrI = overlap * (invMassI / totalInvMass);
        var corrJ = overlap * (invMassJ / totalInvMass);
        pos[i].x -= nx * corrI; pos[i].y -= ny * corrI;
        pos[j].x += nx * corrJ; pos[j].y += ny * corrJ;

        var relVel = (vel[i].x - vel[j].x) * nx + (vel[i].y - vel[j].y) * ny;
        if (relVel < 0) {
            var impulse = -(1 + bounciness) * relVel / totalInvMass;
            vel[i].x += impulse * invMassI * nx; vel[i].y += impulse * invMassI * ny;
            vel[j].x -= impulse * invMassJ * nx; vel[j].y -= impulse * invMassJ * ny;
        }
    }
}

// ------------------------------------------------------------
// Animator helpers
// ------------------------------------------------------------
// Range by character index (Units: Index); falls back to percentages.
function setRange(sel, el, totalLen) {
    try {
        sel.property("ADBE Text Range Advanced").property("ADBE Text Range Units").setValue(2);
        sel.property("ADBE Text Index Start").setValue(el.startChar);
        sel.property("ADBE Text Index End").setValue(el.endChar + 1);
        return;
    } catch (e) {}
    getProp(sel, ["ADBE Text Percent Start"], "start").setValue((el.startChar / totalLen) * 100);
    getProp(sel, ["ADBE Text Percent End"], "end").setValue(((el.endChar + 1) / totalLen) * 100);
}

// ------------------------------------------------------------
// (helpers continue)
// ------------------------------------------------------------
function removeOldAnimators(textLayer) {
    var textGroup = getProp(textLayer, ["ADBE Text Properties"], "text");
    var anims = getProp(textGroup, ["ADBE Text Animators"], "animators");
    for (var i = anims.numProperties; i >= 1; i--) {
        var anim = anims.property(i);
        if (anim.name && (anim.name.indexOf("Physics_") === 0 || anim.name.indexOf("FadeIn_") === 0)) {
            anim.remove();
        }
    }
}

function applyPositionAnimators(textLayer, elements, finalPositions, simData, params, totalLen) {
    var totalSteps = simData[0].length;

    var textGroup = getProp(textLayer, ["ADBE Text Properties"], "text");
    var animsGroup = getProp(textGroup, ["ADBE Text Animators"], "animators");

    for (var i = 0; i < elements.length; i++) {
        var anim = animsGroup.addProperty("ADBE Text Animator");
        anim.name = "Physics_" + i;

        var selectorsGroup = getProp(anim, ["ADBE Text Selectors"], "selectors");
        var sel = selectorsGroup.addProperty("ADBE Text Selector");
        setRange(sel, elements[i], totalLen);

        var animPropsGroup = getProp(anim, ["ADBE Text Animator Properties"], "properties");
        var posProp = null;
        try { posProp = animPropsGroup.addProperty("ADBE Text Position 3D"); }
        catch (e1) { posProp = animPropsGroup.addProperty("ADBE Text Position"); }

        var posIs3D = posProp.value && posProp.value.length === 3;

        for (var step = 0; step < totalSteps; step++) {
            var time = step / SIM_FPS;
            var offsetX = simData[i][step].x - finalPositions[i].x;
            var offsetY = simData[i][step].y - finalPositions[i].y;
            posProp.setValueAtTime(time, posIs3D ? [offsetX, offsetY, 0] : [offsetX, offsetY]);
        }

        for (var k = 1; k <= posProp.numKeys; k++) {
            posProp.setInterpolationTypeAtKey(k, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        }
    }
}

function applyFadeInAnimators(textLayer, elements, launchTimes, totalLen) {
    var textGroup = getProp(textLayer, ["ADBE Text Properties"], "text");
    var animsGroup = getProp(textGroup, ["ADBE Text Animators"], "animators");

    for (var i = 0; i < elements.length; i++) {
        var anim = animsGroup.addProperty("ADBE Text Animator");
        anim.name = "FadeIn_" + i;

        var selectorsGroup = getProp(anim, ["ADBE Text Selectors"], "selectors");
        var sel = selectorsGroup.addProperty("ADBE Text Selector");
        setRange(sel, elements[i], totalLen);

        var animPropsGroup = getProp(anim, ["ADBE Text Animator Properties"], "properties");
        var opProp = animPropsGroup.addProperty("ADBE Text Opacity");
        var tStart = Math.max(0, launchTimes[i] - 0.05);
        var tEnd = launchTimes[i];
        opProp.setValueAtTime(tStart, 0);
        opProp.setValueAtTime(tEnd, 100);

        for (var k = 1; k <= opProp.numKeys; k++) {
            opProp.setInterpolationTypeAtKey(k, KeyframeInterpolationType.LINEAR, KeyframeInterpolationType.LINEAR);
        }
    }
}

// ------------------------------------------------------------
// LAUNCH
// ------------------------------------------------------------
buildUI();
})(this);
