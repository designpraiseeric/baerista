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

//@@DP_CORE@@

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
