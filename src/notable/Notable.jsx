/*
 * Notable.jsx — v2.0.0
 * Notes and a sketch pad, docked inside After Effects.
 *
 *  · Several notes, saved automatically and kept between sessions
 *  · Copy puts the note on the system clipboard, so Cmd/Ctrl+V works in any
 *    After Effects text field
 *  · Post a note as a text layer, into the selected text layer, or as a
 *    comp or layer marker at the playhead
 *  · Each note has its own sketch; Sketch → Comp makes smooth, round-capped
 *    shape paths that keep the drawing's proportions
 *
 * Install: copy into the ScriptUI Panels folder, then Window > Notable.jsx
 * Author: DesignPraise (@designpraiseeric) · MIT License
 */

(function (thisObj) {
    var TOOL = "Notable";
    var VERSION = "2.0.2";

//@@DP_CORE@@

    var IS_WIN = $.os.indexOf("Windows") !== -1;
    var MIN_NOTE_H = 50, MIN_CANVAS_H = 120, HANDLE = 8;
    var BRUSHES = [1, 2, 3, 5, 8, 13];
    var PRESETS = [
        [0.647, 0.482, 1.000], // lilac
        [1.000, 1.000, 1.000], // white
        [1.000, 0.659, 0.000], // amber
        [0.012, 0.933, 0.847], // aqua
        [0.851, 0.012, 0.933], // magenta
        [0.933, 0.851, 0.012], // sun
        [0.012, 0.933, 0.388], // volt
        [0.55, 0.55, 0.55]     // grey
    ];

    // ════════════════════════════════════════════════════════════════
    //  Storage — one file in the user's data folder
    // ════════════════════════════════════════════════════════════════
    var dataFolder = Folder(Folder.userData.fsName + "/DesignPraise/Notable");
    var dataFile = File(dataFolder.fsName + "/notes.dat");
    var data = load();
    var dirty = false, lastSave = 0;

    function blankNote(name) { return { name: name, text: "", strokes: [] }; }

    function load() {
        var d = null;
        try {
            if (dataFile.exists) {
                dataFile.encoding = "UTF-8";
                dataFile.open("r");
                var src = dataFile.read();
                dataFile.close();
                d = eval(src);
            }
        } catch (e) { d = null; }
        if (!d || !d.notes || !d.notes.length) {
            d = { notes: [blankNote("Note 1")], current: 0, noteH: 110, pen: PRESETS[0], brush: 2 };
        }
        if (d.current >= d.notes.length) d.current = 0;
        return d;
    }

    function save() {
        try {
            if (!dataFolder.exists) dataFolder.create();
            dataFile.encoding = "UTF-8";
            dataFile.open("w");
            dataFile.write(data.toSource());
            dataFile.close();
            dirty = false;
            lastSave = new Date().getTime();
        } catch (e) {}
    }

    function markDirty() {
        dirty = true;
        if (new Date().getTime() - lastSave > 1500) save();
    }

    // Catches the last keystrokes if After Effects quits without the field losing focus.
    $.global.__dpNotableFlush = function () { if (dirty) save(); };
    try {
        if ($.global.__dpNotableTask) app.cancelTask($.global.__dpNotableTask);
        $.global.__dpNotableTask = app.scheduleTask("try{$.global.__dpNotableFlush();}catch(e){}", 3000, true);
    } catch (e) {}

    function note() { return data.notes[data.current]; }

    // ════════════════════════════════════════════════════════════════
    //  UI
    // ════════════════════════════════════════════════════════════════
    var win = (thisObj instanceof Panel) ? thisObj
        : new Window("palette", TOOL, undefined, { resizeable: true });
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 8;
    win.margins = 10;

    // — Note picker
    var pickRow = win.add("group");
    pickRow.orientation = "row";
    pickRow.alignChildren = ["left", "center"];
    pickRow.spacing = 4;
    var noteDD = pickRow.add("dropdownlist", undefined, []);
    noteDD.alignment = ["fill", "center"];
    noteDD.preferredSize.width = 140;
    var newBtn = pickRow.add("button", undefined, "+");
    newBtn.preferredSize = [26, 22]; newBtn.helpTip = "New note";
    var renBtn = pickRow.add("button", undefined, "Rename");
    var delBtn = pickRow.add("button", undefined, "Delete");

    // — Notes
    var textPanel = win.add("panel", undefined, "Note");
    textPanel.orientation = "column";
    textPanel.alignChildren = ["fill", "top"];
    textPanel.margins = [8, 12, 8, 8];
    textPanel.spacing = 0;

    var noteInput = textPanel.add("edittext", undefined, "", { multiline: true, wantReturn: true, scrollable: true });
    noteInput.alignment = ["fill", "top"];
    var hHandle = textPanel.add("panel");
    hHandle.alignment = ["fill", "top"];
    hHandle.helpTip = "Drag to resize";

    var postRow = textPanel.add("group");
    postRow.orientation = "row";
    postRow.alignChildren = ["left", "center"];
    postRow.margins = [0, 8, 0, 0];
    postRow.spacing = 4;
    var copyBtn = postRow.add("button", undefined, "Copy");
    copyBtn.helpTip = "Copy this note to the clipboard";
    var postDD = postRow.add("dropdownlist", undefined, ["Text layer", "Into selected text layer", "Comp marker", "Layer marker"]);
    postDD.selection = 0;
    var postBtn = postRow.add("button", undefined, "Post");
    var guideCb = textPanel.add("checkbox", undefined, "Text layers as guide layers (won't render)");
    guideCb.value = data.guide !== false;

    // — Sketch
    var sketchPanel = win.add("panel", undefined, "Sketch");
    sketchPanel.orientation = "column";
    sketchPanel.alignment = ["fill", "fill"];
    sketchPanel.alignChildren = ["fill", "top"];
    sketchPanel.margins = [8, 12, 8, 8];
    sketchPanel.spacing = 6;

    var canvas = sketchPanel.add("panel");
    canvas.alignment = ["fill", "fill"];
    canvas.minimumSize = [120, MIN_CANVAS_H];
    canvas.preferredSize = [300, 220];

    var swatchRow = sketchPanel.add("group");
    swatchRow.orientation = "row";
    swatchRow.alignChildren = ["left", "center"];
    swatchRow.spacing = 4;
    var swatches = [];
    for (var pi = 0; pi < PRESETS.length; pi++) swatches.push(makeSwatch(PRESETS[pi]));
    var hexField = swatchRow.add("edittext", undefined, rgbToHex(data.pen));
    hexField.characters = 7;
    hexField.helpTip = "Hex colour — press Enter";

    var toolRow = sketchPanel.add("group");
    toolRow.orientation = "row";
    toolRow.alignChildren = ["left", "center"];
    toolRow.spacing = 4;
    toolRow.add("statictext", undefined, "Brush");
    var brushDD = toolRow.add("dropdownlist", undefined, ["1 px", "2 px", "3 px", "5 px", "8 px", "13 px"]);
    brushDD.selection = indexOf(BRUSHES, data.brush) < 0 ? 1 : indexOf(BRUSHES, data.brush);
    var undoBtn = toolRow.add("button", undefined, "Undo");
    var clearBtn = toolRow.add("button", undefined, "Clear");
    var toCompBtn = toolRow.add("button", undefined, "Sketch → Comp");

    DP.footer(win, { id: "notable", name: TOOL, version: VERSION });

    // ════════════════════════════════════════════════════════════════
    //  Notes logic
    // ════════════════════════════════════════════════════════════════
    function refreshPicker() {
        noteDD.removeAll();
        for (var i = 0; i < data.notes.length; i++) noteDD.add("item", data.notes[i].name);
        noteDD._silent = true;
        noteDD.selection = data.current;
        noteDD._silent = false;
        delBtn.enabled = data.notes.length > 1;
    }

    function showNote() {
        noteInput.text = note().text;
        redraw();
    }

    noteDD.onChange = function () {
        if (noteDD._silent || !noteDD.selection) return;
        note().text = noteInput.text;
        data.current = noteDD.selection.index;
        markDirty();
        showNote();
    };

    newBtn.onClick = function () {
        note().text = noteInput.text;
        data.notes.push(blankNote("Note " + (data.notes.length + 1)));
        data.current = data.notes.length - 1;
        save(); refreshPicker(); showNote();
        noteInput.active = true;
    };

    renBtn.onClick = function () {
        var n = prompt("Name this note:", note().name, "Rename note");
        if (n === null) return;
        n = n.replace(/^\s+|\s+$/g, "");
        if (!n) return;
        note().name = n;
        save(); refreshPicker();
    };

    delBtn.onClick = function () {
        if (data.notes.length < 2) return;
        if (!confirm("Delete \"" + note().name + "\" and its sketch?")) return;
        data.notes.splice(data.current, 1);
        if (data.current >= data.notes.length) data.current = data.notes.length - 1;
        save(); refreshPicker(); showNote();
    };

    noteInput.onChanging = function () { note().text = noteInput.text; markDirty(); };
    noteInput.onChange = function () { note().text = noteInput.text; save(); };
    guideCb.onClick = function () { data.guide = guideCb.value; save(); };

    // Clipboard through the OS, because AE intercepts Cmd/Ctrl+C in panels.
    copyBtn.onClick = function () {
        var t = noteInput.text;
        if (!t) { alert("This note is empty."); return; }
        var ok = false;
        try {
            var f = File(Folder.temp.fsName + "/dp_notable_clip.txt");
            f.encoding = "UTF-8"; f.lineFeed = IS_WIN ? "Windows" : "Unix";
            f.open("w"); f.write(t); f.close();
            if (IS_WIN) {
                system.callSystem('powershell -NoProfile -Command "Get-Content -Raw -Encoding UTF8 \'' + f.fsName + '\' | Set-Clipboard"');
            } else {
                system.callSystem('/bin/sh -c \'LANG=en_US.UTF-8 pbcopy < "' + f.fsName + '"\'');
            }
            f.remove();
            ok = true;
        } catch (e) {}
        if (!ok) alert("Copy needs Preferences > Scripting & Expressions >\n\"Allow Scripts to Write Files and Access Network\" turned on.");
    };

    postBtn.onClick = function () {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) { alert("Open a composition first."); return; }
        var t = noteInput.text;
        if (!t || !t.replace(/\s+/g, "")) { alert("This note is empty."); return; }
        var mode = postDD.selection.index;
        var sel = comp.selectedLayers;

        app.beginUndoGroup("Notable · Post note");
        try {
            if (mode === 0) {
                var layer = comp.layers.addText(t);
                layer.name = "Note · " + t.split(/\r|\n/)[0].slice(0, 24);
                layer.guideLayer = guideCb.value;
            } else if (mode === 1) {
                if (!sel.length || !(sel[0] instanceof TextLayer)) { alert("Select a text layer first."); return; }
                var st = sel[0].property("ADBE Text Properties").property("ADBE Text Document");
                var doc = st.value;
                doc.text = t;
                if (st.numKeys > 0) st.setValueAtTime(comp.time, doc); else st.setValue(doc);
            } else {
                var mv = new MarkerValue(t);
                if (mode === 2) {
                    if (!comp.markerProperty) { alert("Comp markers need After Effects 2023 or newer. Use Layer marker instead."); return; }
                    comp.markerProperty.setValueAtTime(comp.time, mv);
                } else {
                    if (!sel.length) { alert("Select a layer first."); return; }
                    sel[0].property("ADBE Marker").setValueAtTime(comp.time, mv);
                }
            }
        } catch (e) {
            alert("Couldn't post the note: " + e.toString());
        } finally {
            app.endUndoGroup();
        }
    };

    // — Note height handle
    var drag = null;
    hHandle.onDraw = function () {
        var g = this.graphics, s = this.size;
        if (!s || s[0] <= 0) return;
        g.newPath(); g.rectPath(0, 0, s[0], s[1]);
        g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, [0.2, 0.2, 0.22, 1]));
        var dot = g.newBrush(g.BrushType.SOLID_COLOR, [0.6, 0.6, 0.62, 1]);
        for (var k = -1; k <= 1; k++) { g.newPath(); g.ellipsePath(s[0] / 2 + k * 6 - 1, s[1] / 2 - 1, 2, 2); g.fillPath(dot); }
    };
    hHandle.addEventListener("mousedown", function (ev) { drag = { sy: ev.screenY, h: data.noteH }; });
    win.addEventListener("mousemove", function (ev) {
        if (!drag) return;
        var spare = 100000;
        try { spare = canvas.size[1] - MIN_CANVAS_H; } catch (e) {}
        var h = Math.max(MIN_NOTE_H, Math.min(drag.h + (ev.screenY - drag.sy), data.noteH + Math.max(0, spare)));
        data.noteH = Math.round(h);
        applyNoteSize();
    });
    function stopDrag() { if (drag) { drag = null; save(); } }
    hHandle.addEventListener("mouseup", stopDrag);
    win.addEventListener("mouseup", stopDrag);

    function applyNoteSize() {
        noteInput.preferredSize.height = data.noteH;
        noteInput.minimumSize.height = data.noteH;
        noteInput.maximumSize.height = data.noteH;
        hHandle.preferredSize.height = hHandle.minimumSize.height = hHandle.maximumSize.height = HANDLE;
        try { win.layout.layout(true); win.layout.resize(); } catch (e) {}
    }

    // ════════════════════════════════════════════════════════════════
    //  Sketch logic — points are stored relative to canvas width,
    //  so drawings keep their shape when the panel resizes.
    // ════════════════════════════════════════════════════════════════
    var current = null;

    function redraw() { try { canvas.hide(); canvas.show(); } catch (e) {} }

    canvas.onDraw = function () {
        var s = canvas.size;
        if (!s || s[0] <= 0 || s[1] <= 0) return;
        var g = canvas.graphics, W = s[0];
        g.newPath(); g.rectPath(0, 0, s[0], s[1]);
        g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, [0.043, 0.020, 0.125, 1]));  // night
        function drawStroke(st) {
            if (!st || st.p.length < 4) return;
            var pen = g.newPen(g.PenType.SOLID_COLOR, [st.c[0], st.c[1], st.c[2], 1], st.w);
            g.newPath();
            g.moveTo(st.p[0] * W, st.p[1] * W);
            for (var j = 2; j < st.p.length; j += 2) g.lineTo(st.p[j] * W, st.p[j + 1] * W);
            g.strokePath(pen);
        }
        var list = note().strokes;
        for (var i = 0; i < list.length; i++) drawStroke(list[i]);
        if (current) drawStroke(current);
    };

    canvas.addEventListener("mousedown", function (ev) {
        var W = canvas.size[0];
        current = { c: data.pen.slice(0), w: BRUSHES[brushDD.selection.index], p: [ev.clientX / W, ev.clientY / W] };
    });
    canvas.addEventListener("mousemove", function (ev) {
        if (!current) return;
        var s = canvas.size;
        if (ev.clientX < 0 || ev.clientY < 0 || ev.clientX > s[0] || ev.clientY > s[1]) return;
        current.p.push(ev.clientX / s[0], ev.clientY / s[0]);
        redraw();
    });
    function endStroke() {
        if (!current) return;
        if (current.p.length >= 4) { note().strokes.push(current); save(); }
        current = null;
        redraw();
    }
    canvas.addEventListener("mouseup", endStroke);
    win.addEventListener("mouseup", endStroke);

    undoBtn.onClick = function () { if (note().strokes.length) { note().strokes.pop(); save(); redraw(); } };
    clearBtn.onClick = function () {
        if (!note().strokes.length) return;
        if (!confirm("Clear this note's sketch?")) return;
        note().strokes = []; save(); redraw();
    };
    brushDD.onChange = function () { data.brush = BRUSHES[brushDD.selection.index]; save(); };

    function makeSwatch(rgb) {
        var sw = swatchRow.add("panel");
        sw.preferredSize = sw.minimumSize = sw.maximumSize = [20, 20];
        sw.helpTip = rgbToHex(rgb);
        sw.onDraw = function () {
            var g = sw.graphics, s = sw.size;
            g.newPath(); g.rectPath(0, 0, s[0], s[1]);
            g.fillPath(g.newBrush(g.BrushType.SOLID_COLOR, [rgb[0], rgb[1], rgb[2], 1]));
            if (sameColor(rgb, data.pen)) {
                g.newPath(); g.rectPath(1, 1, s[0] - 2, s[1] - 2);
                g.strokePath(g.newPen(g.PenType.SOLID_COLOR, [1, 1, 1, 1], 2));
            }
        };
        sw.addEventListener("mousedown", function () { setPen(rgb); });
        return sw;
    }

    function setPen(rgb) {
        data.pen = rgb.slice(0);
        hexField.text = rgbToHex(rgb);
        for (var i = 0; i < swatches.length; i++) { swatches[i].hide(); swatches[i].show(); }
        save();
    }

    hexField.addEventListener("enterKey", function () {
        var rgb = hexToRgb(hexField.text);
        if (!rgb) { alert("Use a hex colour like #A57BFF."); return; }
        setPen(rgb);
    });

    // Smooth, proportional, round-capped shape layer from the sketch.
    toCompBtn.onClick = function () {
        var comp = app.project.activeItem;
        if (!(comp instanceof CompItem)) { alert("Open a composition first."); return; }
        var strokes = note().strokes;
        if (!strokes.length) { alert("Nothing to send — draw something first."); return; }

        var W = canvas.size[0], H = canvas.size[1];
        var k = Math.min(comp.width / W, comp.height / H);   // keep proportions
        app.beginUndoGroup("Notable · Sketch to comp");
        try {
            var shapeLayer = comp.layers.addShape();
            shapeLayer.name = "Sketch · " + note().name;
            var root = shapeLayer.property("ADBE Root Vectors Group");
            for (var i = 0; i < strokes.length; i++) {
                var pts = simplify(strokes[i].p, W, 2.5);
                if (pts.length < 2) continue;
                var verts = [], inT = [], outT = [];
                for (var j = 0; j < pts.length; j++) verts.push([(pts[j][0] - W / 2) * k, (pts[j][1] - H / 2) * k]);
                for (var m = 0; m < verts.length; m++) {
                    if (m === 0 || m === verts.length - 1) { inT.push([0, 0]); outT.push([0, 0]); continue; }
                    var tx = (verts[m + 1][0] - verts[m - 1][0]) / 6, ty = (verts[m + 1][1] - verts[m - 1][1]) / 6;
                    inT.push([-tx, -ty]); outT.push([tx, ty]);
                }
                var grp = root.addProperty("ADBE Vector Group");
                grp.name = "Stroke " + (i + 1);
                var contents = grp.property("ADBE Vectors Group");
                var shape = new Shape();
                shape.vertices = verts; shape.inTangents = inT; shape.outTangents = outT; shape.closed = false;
                contents.addProperty("ADBE Vector Shape - Group").property("ADBE Vector Shape").setValue(shape);
                var st = contents.addProperty("ADBE Vector Graphic - Stroke");
                st.property("ADBE Vector Stroke Color").setValue(strokes[i].c);
                st.property("ADBE Vector Stroke Width").setValue(Math.max(1, strokes[i].w * k));
                try { st.property("ADBE Vector Stroke Line Cap").setValue(2); st.property("ADBE Vector Stroke Line Join").setValue(2); } catch (e2) {}
            }
        } catch (e) {
            alert("Couldn't send the sketch: " + e.toString());
        } finally {
            app.endUndoGroup();
        }
    };

    // Canvas pixels, dropping points closer than minDist to the last kept one.
    function simplify(p, W, minDist) {
        var out = [[p[0] * W, p[1] * W]];
        for (var i = 2; i < p.length; i += 2) {
            var x = p[i] * W, y = p[i + 1] * W, last = out[out.length - 1];
            if (Math.sqrt((x - last[0]) * (x - last[0]) + (y - last[1]) * (y - last[1])) >= minDist) out.push([x, y]);
        }
        var endX = p[p.length - 2] * W, endY = p[p.length - 1] * W, l = out[out.length - 1];
        if (l[0] !== endX || l[1] !== endY) out.push([endX, endY]);
        return out;
    }

    // ════════════════════════════════════════════════════════════════
    //  Helpers
    // ════════════════════════════════════════════════════════════════
    function indexOf(arr, v) { for (var i = 0; i < arr.length; i++) if (arr[i] === v) return i; return -1; }
    function sameColor(a, b) { return Math.abs(a[0] - b[0]) < 0.01 && Math.abs(a[1] - b[1]) < 0.01 && Math.abs(a[2] - b[2]) < 0.01; }
    function rgbToHex(rgb) {
        function h(c) { var s = Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).toUpperCase(); return s.length === 1 ? "0" + s : s; }
        return "#" + h(rgb[0]) + h(rgb[1]) + h(rgb[2]);
    }
    function hexToRgb(hex) {
        var m = /^\s*#?([0-9a-fA-F]{6})\s*$/.exec(hex);
        if (!m) return null;
        var n = parseInt(m[1], 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
    }

    // ════════════════════════════════════════════════════════════════
    //  Start
    // ════════════════════════════════════════════════════════════════
    refreshPicker();
    noteInput.text = note().text;
    win.onResizing = win.onResize = function () {
        try {
            var deficit = MIN_CANVAS_H - canvas.size[1];
            if (deficit > 0) data.noteH = Math.max(MIN_NOTE_H, data.noteH - deficit);
        } catch (e) {}
        applyNoteSize();
    };
    win.onClose = function () { note().text = noteInput.text; save(); };

    applyNoteSize();
    if (win instanceof Window) { win.center(); win.show(); }
    else { win.layout.layout(true); win.layout.resize(); }
})(this);
