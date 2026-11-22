/*
 * PrecompKit.jsx — v1.0.0
 * Three source-management jobs in one panel (replaces "dupe_src_with_prc_layer"
 * v1 and v2, "Batch Sync All Layer Names To Sources" and
 * "Delete selected layers and their unused sources").
 *
 *  Deep Duplicate — duplicate precomp layers AND their comps (nested precomps
 *                   too), so editing the copy never touches the original.
 *                   The new layer is a true duplicate: effects, masks, parenting,
 *                   blend modes, mattes and keyframes all come along.
 *  Sync Names     — copy layer names to their sources, or source names to layers.
 *  Delete & Clean — delete layers, then remove any of their sources that nothing
 *                   else in the project uses.
 *
 * Author: DesignPraise (@designpraiseeric) · MIT License
 */

(function (thisObj) {
    var TOOL = "Precomp Kit";
    var VERSION = "1.0.2";
    var SETTINGS = "DesignPraise_PrecompKit";

//@@DP_CORE@@

    function getSetting(k, d) { try { return app.settings.haveSetting(SETTINGS, k) ? app.settings.getSetting(SETTINGS, k) : d; } catch (e) { return d; } }
    function setSetting(k, v) { try { app.settings.saveSetting(SETTINGS, k, String(v)); } catch (e) {} }
    function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

    function activeCompWithSelection() {
        var c = app.project.activeItem;
        if (!(c instanceof CompItem)) { setStatus("Open a comp and select layers.", false); return null; }
        if (!c.selectedLayers.length) { setStatus("Select one or more layers.", false); return null; }
        return c;
    }

    // ── Deep Duplicate ───────────────────────────────────────────────
    function findOrMakeBin(name) {
        for (var i = 1; i <= app.project.rootFolder.numItems; i++) {
            var it = app.project.rootFolder.item(i);
            if (it instanceof FolderItem && it.name === name) return it;
        }
        return app.project.items.addFolder(name);
    }

    function nextName(original, style) {
        var base = original.replace(/_cp\d+$/, "").replace(/ copy( \d+)?$/, "");
        var re = style === 0 ? new RegExp("^" + escapeRe(base) + "_cp(\\d+)$")
                             : new RegExp("^" + escapeRe(base) + " copy(?: (\\d+))?$");
        var max = 0, found = false;
        for (var i = 1; i <= app.project.numItems; i++) {
            var m = re.exec(app.project.item(i).name);
            if (m) { found = true; max = Math.max(max, m[1] ? parseInt(m[1], 10) : 1); }
        }
        if (style === 0) return base + "_cp" + (max + 1);
        return found ? base + " copy " + (max + 1) : base + " copy";
    }

    function deepDuplicate() {
        var comp = activeCompWithSelection(); if (!comp) return;
        var layers = [];
        for (var i = 0; i < comp.selectedLayers.length; i++) {
            var L = comp.selectedLayers[i];
            if (L instanceof AVLayer && L.source instanceof CompItem) layers.push(L);
        }
        if (!layers.length) { setStatus("Select at least one precomp layer.", false); return; }

        var style = nameDD.selection.index;
        var bin = binCb.value ? findOrMakeBin("Duplicated Comps") : null;
        var copies = {};   // comp id -> duplicate, so shared nested comps are copied once

        function dupComp(c, depth) {
            if (copies[c.id]) return copies[c.id];
            var d = c.duplicate();
            d.name = nextName(c.name, style);
            if (bin) d.parentFolder = bin;
            copies[c.id] = d;
            if (nestedCb.value) {
                for (var j = 1; j <= d.numLayers; j++) {
                    var inner = d.layer(j);
                    if (inner instanceof AVLayer && inner.source instanceof CompItem) {
                        var wasLocked = inner.locked;
                        if (wasLocked) inner.locked = false;
                        inner.replaceSource(dupComp(inner.source, depth + 1), false);
                        if (wasLocked) inner.locked = true;
                    }
                }
            }
            return d;
        }

        app.beginUndoGroup(TOOL + " · Deep Duplicate");
        var made = 0;
        try {
            for (var k = 0; k < layers.length; k++) {
                var src = layers[k];
                var wasLocked = src.locked;
                if (wasLocked) src.locked = false;
                var newLayer = src.duplicate();           // keeps every layer property
                newLayer.replaceSource(dupComp(src.source, 0), false);
                if (src.name !== src.source.name) newLayer.name = src.name;   // keep a custom layer name
                if (wasLocked) { src.locked = true; }
                made++;
            }
            setStatus("Duplicated " + made + " precomp layer(s) and " + count(copies) + " comp(s).", true);
        } catch (e) {
            setStatus("Error: " + e.toString(), false);
        } finally {
            app.endUndoGroup();
        }
    }
    function count(o) { var n = 0; for (var k in o) if (o.hasOwnProperty(k)) n++; return n; }

    // ── Sync Names ───────────────────────────────────────────────────
    function syncNames(layerToSource) {
        var comp = activeCompWithSelection(); if (!comp) return;
        var n = 0, skipped = 0;
        app.beginUndoGroup(TOOL + " · Sync Names");
        try {
            for (var i = 0; i < comp.selectedLayers.length; i++) {
                var L = comp.selectedLayers[i];
                var src = (L instanceof AVLayer) ? L.source : null;
                if (!(src instanceof FootageItem || src instanceof CompItem)) { skipped++; continue; }
                try {
                    if (layerToSource) { if (src.name !== L.name) { src.name = L.name; n++; } }
                    else { if (L.name !== src.name) { L.name = src.name; n++; } }
                } catch (e) { skipped++; }
            }
        } finally {
            app.endUndoGroup();
        }
        setStatus("Renamed " + n + (layerToSource ? " source(s)." : " layer(s).") + (skipped ? " Skipped " + skipped + " (no source or locked)." : ""), true);
    }

    // ── Delete & Clean ───────────────────────────────────────────────
    function deleteAndClean() {
        var comp = activeCompWithSelection(); if (!comp) return;
        var sel = comp.selectedLayers.slice ? comp.selectedLayers.slice(0) : comp.selectedLayers;
        var sources = [], seen = {};
        for (var i = 0; i < sel.length; i++) {
            var src = (sel[i] instanceof AVLayer) ? sel[i].source : null;
            if (src && !seen[src.id]) { seen[src.id] = true; sources.push(src); }
        }
        if (!confirm("Delete " + sel.length + " layer(s), then remove any of their " + sources.length +
            " source(s) that nothing else uses?")) return;

        var removedLayers = 0, removedSources = 0, kept = 0;
        app.beginUndoGroup(TOOL + " · Delete & Clean");
        try {
            for (var j = sel.length - 1; j >= 0; j--) {
                try { if (sel[j].locked) sel[j].locked = false; sel[j].remove(); removedLayers++; } catch (e) {}
            }
            for (var s = 0; s < sources.length; s++) {
                var item = sources[s];
                // usedIn lists every comp that still holds a layer of this item.
                var inUse = false;
                try { inUse = item.usedIn.length > 0; } catch (e2) { inUse = true; }
                if (!inUse && item instanceof FootageItem && !(item.mainSource instanceof SolidSource)) {
                    // Footage may also serve as another item's proxy.
                    for (var p = 1; p <= app.project.numItems && !inUse; p++) {
                        var other = app.project.item(p);
                        try { if (other !== item && other.useProxy && other.proxySource && other.proxySource.file &&
                            item.file && other.proxySource.file.fsName === item.file.fsName) inUse = true; } catch (e3) {}
                    }
                }
                if (inUse) { kept++; continue; }
                try { item.remove(); removedSources++; } catch (e4) { kept++; }
            }
        } finally {
            app.endUndoGroup();
        }
        setStatus("Deleted " + removedLayers + " layer(s) and " + removedSources + " unused source(s)." +
            (kept ? " Kept " + kept + " still in use." : ""), true);
    }

    // ── UI ───────────────────────────────────────────────────────────
    var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", TOOL, undefined, { resizeable: true });
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 8;
    win.margins = 10;

    var pDup = win.add("panel", undefined, "Deep Duplicate");
    pDup.orientation = "column"; pDup.alignChildren = ["fill", "top"]; pDup.margins = [10, 14, 10, 10]; pDup.spacing = 5;
    var dupBtn = pDup.add("button", undefined, "Duplicate precomp layer(s) + comps");
    var nameRow = pDup.add("group");
    nameRow.add("statictext", undefined, "Name copies:");
    var nameDD = nameRow.add("dropdownlist", undefined, ["Name_cp1, _cp2…", "Name copy, copy 2…"]);
    nameDD.selection = parseInt(getSetting("names", "0"), 10) || 0;
    var nestedCb = pDup.add("checkbox", undefined, "Also duplicate nested precomps");
    nestedCb.value = getSetting("nested", "true") === "true";
    var binCb = pDup.add("checkbox", undefined, "Collect copies in a \"Duplicated Comps\" folder");
    binCb.value = getSetting("bin", "true") === "true";

    var pSync = win.add("panel", undefined, "Sync Names");
    pSync.orientation = "row"; pSync.alignChildren = ["fill", "center"]; pSync.margins = [10, 14, 10, 10];
    var l2sBtn = pSync.add("button", undefined, "Layer → Source");
    l2sBtn.helpTip = "Rename each selected layer's source to the layer's name";
    var s2lBtn = pSync.add("button", undefined, "Source → Layer");
    s2lBtn.helpTip = "Rename each selected layer to its source's name";

    var pDel = win.add("panel", undefined, "Delete & Clean");
    pDel.orientation = "column"; pDel.alignChildren = ["fill", "top"]; pDel.margins = [10, 14, 10, 10];
    var delBtn = pDel.add("button", undefined, "Delete layers + unused sources");

    var statusTxt = win.add("statictext", undefined, "Ready.", { multiline: true });
    statusTxt.preferredSize.height = 30;

    DP.footer(win, { id: "precompkit", name: TOOL, version: VERSION });

    function setStatus(msg, ok) {
        statusTxt.text = msg;
        try { statusTxt.graphics.foregroundColor = statusTxt.graphics.newPen(statusTxt.graphics.PenType.SOLID_COLOR, ok ? [0.6, 0.85, 0.65] : [0.95, 0.45, 0.4], 1); } catch (e) {}
    }

    dupBtn.onClick = deepDuplicate;
    l2sBtn.onClick = function () { syncNames(true); };
    s2lBtn.onClick = function () { syncNames(false); };
    delBtn.onClick = deleteAndClean;
    nameDD.onChange = function () { setSetting("names", nameDD.selection.index); };
    nestedCb.onClick = function () { setSetting("nested", nestedCb.value); };
    binCb.onClick = function () { setSetting("bin", binCb.value); };

    win.onResizing = win.onResize = function () { this.layout.resize(); };
    if (win instanceof Window) { win.center(); win.show(); }
    else { win.layout.layout(true); win.layout.resize(); }
})(this);
