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

//@@DP_CORE@@

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
