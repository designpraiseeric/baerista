// Let's-Be-Guided.jsx
// A custom After Effects ScriptUI Panel for project-relative guide management.
// Author: DesignPraise (@designpraiseeric) 🫶🏾
// Fixed version — see inline comments marked FIX for what was broken and why.
// Features: Export, Import (merge/overwrite), Rename, Clear Comp Guides, Clear Guide Files.

(function(thisObj) {
    var scriptName = "Let's Be Guided";
    var VERSION = "1.1.1";

//@@DP_CORE@@

    // Older ExtendScript builds have no JSON object; guide files are plain data.
    var J = (typeof JSON !== "undefined") ? JSON : {
        stringify: function (v) { return v.toSource(); },
        parse: function (s) { return eval("(" + s + ")"); }
    };

    // ─── AE GUIDE ORIENTATION CONSTANTS ───────────────────────────────────
    // FIX: There is no GuideOrientation enum in ExtendScript. Per Adobe's
    // Item.addGuide() docs, orientationType is a plain Integer:
    //   0 = horizontal, 1 = vertical (anything else defaults to horizontal).
    // Guide objects returned in comp.guides expose this as `orientationType`
    // (not `.orientation`, which is what the previous version read).
    var ORIENT_H = 0;
    var ORIENT_V = 1;

    // ─── UI SETUP ────────────────────────────────────────────────────────
    var win = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, {resizeable: true});
    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 8;
    win.margins = 16;

    // Tip Panel
    var tipGroup = win.add("panel", undefined, "💡 Workspace Tip");
    tipGroup.orientation = "column";
    tipGroup.alignChildren = ["fill", "top"];
    tipGroup.margins = 12;
    tipGroup.add("statictext", undefined, "Hit 'Clear Guide Files' before closing or revisiting a project — it deletes the .guides dumps next to your project so you never accidentally import stale guides later.", {multiline: true});

    var mainGrp = win.add("group");
    mainGrp.orientation = "column";
    mainGrp.alignChildren = ["fill", "top"];
    mainGrp.spacing = 10;

    // Dropdown & Refresh
    var dropGrp = mainGrp.add("group");
    dropGrp.orientation = "row";
    dropGrp.alignChildren = ["fill", "center"];
    var guideDropdown = dropGrp.add("dropdownlist", undefined, []);
    guideDropdown.preferredSize.width = 180;
    var btnRefresh = dropGrp.add("button", undefined, "↻");
    btnRefresh.preferredSize.width = 30;
    btnRefresh.helpTip = "Refresh guide list";

    // Actions Group 1 (Import / Export)
    var btnGrp1 = mainGrp.add("group");
    btnGrp1.orientation = "row";
    btnGrp1.alignChildren = ["fill", "top"];
    var btnImport = btnGrp1.add("button", undefined, "Import Selected");
    var btnExport = btnGrp1.add("button", undefined, "Export Guides");
    btnImport.preferredSize.width = btnExport.preferredSize.width = 105;

    // Actions Group 2 (Rename / Clear Files)
    var btnGrp2 = mainGrp.add("group");
    btnGrp2.orientation = "row";
    btnGrp2.alignChildren = ["fill", "top"];
    var btnRename = btnGrp2.add("button", undefined, "Rename Selected");
    var btnClearFiles = btnGrp2.add("button", undefined, "Clear Guide Files");
    btnRename.preferredSize.width = btnClearFiles.preferredSize.width = 105;

    // Group 3 – Clear Comp Guides
    var btnGrp3 = mainGrp.add("group");
    btnGrp3.orientation = "row";
    btnGrp3.alignChildren = ["fill", "top"];
    var btnClearCompGuides = btnGrp3.add("button", undefined, "Clear Comp Guides");
    btnClearCompGuides.preferredSize.width = 215;

    // Status bar
    var statusText = win.add("statictext", undefined, "Ready.");
    statusText.alignment = "left";
    function setStatus(msg) { statusText.text = msg; }

    // ─── CORE LOGIC ──────────────────────────────────────────────────────
    var currentFiles = [];

    function getProjFolder() {
        if (app.project && app.project.file) {
            return app.project.file.parent;
        }
        return null;
    }

    function refreshList() {
        guideDropdown.removeAll();
        currentFiles = [];
        var folder = getProjFolder();
        if (folder) {
            var files = folder.getFiles("*.guides");
            for (var i = 0; i < files.length; i++) {
                currentFiles.push(files[i]);
                guideDropdown.add("item", decodeURI(files[i].name).replace(".guides", ""));
            }
            if (guideDropdown.items.length > 0) {
                guideDropdown.selection = 0;
            }
        }
    }

    // FIX: comp.removeAllGuides() does not exist. Walk backwards.
    function removeAllGuidesFromComp(comp) {
        for (var i = comp.guides.length - 1; i >= 0; i--) {
            comp.removeGuide(i);
        }
    }

    // Import mode dialog
    function getImportMode() {
        var dialog = new Window("dialog", "Import Guides");
        dialog.orientation = "column";
        dialog.alignChildren = "center";
        dialog.add("statictext", undefined, "How would you like to import?");
        var btnGroup = dialog.add("group");
        btnGroup.orientation = "row";
        btnGroup.alignChildren = "center";
        var btnMerge = btnGroup.add("button", undefined, "Merge");
        var btnOverwrite = btnGroup.add("button", undefined, "Overwrite");
        var btnCancel = btnGroup.add("button", undefined, "Cancel");
        btnMerge.preferredSize.width = btnOverwrite.preferredSize.width = 80;
        var result = null;
        btnMerge.onClick = function() { result = "merge"; dialog.close(); };
        btnOverwrite.onClick = function() { result = "overwrite"; dialog.close(); };
        btnCancel.onClick = function() { result = null; dialog.close(); };
        dialog.show();
        return result;
    }

    // Initialize list on load
    refreshList();
    btnRefresh.onClick = function() { refreshList(); setStatus("List refreshed."); };

    // EXPORT
    btnExport.onClick = function() {
        try {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) {
                alert("Please select an active composition.");
                return;
            }
            var folder = getProjFolder();
            if (!folder) {
                alert("Please save your After Effects project first. The tool needs a saved project location to drop the guide files.");
                return;
            }

            var guidesData = [];
            for (var i = 0; i < comp.guides.length; i++) {
                var g = comp.guides[i];
                guidesData.push({
                    type: (g.orientationType === ORIENT_H) ? "h" : "v",
                    pos: g.position
                });
            }

            if (guidesData.length === 0) {
                alert("No guides found in the active composition to export.");
                return;
            }

            var baseName = "guide";
            var index = 1;
            var newFile = new File(folder.fsName + "/" + baseName + index + ".guides");
            while (newFile.exists) {
                index++;
                newFile = new File(folder.fsName + "/" + baseName + index + ".guides");
            }

            var opened = newFile.open("w");
            if (!opened) {
                alert("Could not open file for writing:\n" + newFile.fsName);
                return;
            }
            newFile.write(J.stringify({ w: comp.width, h: comp.height, guides: guidesData }));
            newFile.close();

            refreshList();

            for (var j = 0; j < currentFiles.length; j++) {
                if (currentFiles[j].name === newFile.name) {
                    guideDropdown.selection = j;
                    break;
                }
            }
            setStatus("Exported " + guidesData.length + " guide(s) to " + newFile.name);
        } catch (e) {
            alert("Export failed: " + e.toString() + (e.line ? (" (line " + e.line + ")") : ""));
        }
    };

    // IMPORT (with Merge/Overwrite)
    btnImport.onClick = function() {
        try {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) {
                alert("Please select an active composition to import guides into.");
                return;
            }
            if (!guideDropdown.selection || currentFiles.length === 0) {
                alert("No guide preset selected.");
                return;
            }

            var selFile = currentFiles[guideDropdown.selection.index];
            if (!selFile.exists) {
                refreshList();
                alert("That guide file no longer exists. List refreshed.");
                return;
            }

            var mode = getImportMode();
            if (mode === null) {
                setStatus("Import cancelled.");
                return;
            }

            selFile.open("r");
            var content = selFile.read();
            selFile.close();

            var guidesData;
            try {
                guidesData = J.parse(content);
            } catch (parseErr) {
                alert("Error: Corrupted or invalid guide file.");
                return;
            }

            // v1.0 files are a bare array; v1.1 files carry the source comp size.
            var srcW = comp.width, srcH = comp.height;
            if (guidesData && guidesData.guides) { srcW = guidesData.w || srcW; srcH = guidesData.h || srcH; guidesData = guidesData.guides; }
            var sx = 1, sy = 1;
            if ((srcW !== comp.width || srcH !== comp.height) &&
                confirm("These guides were made in a " + srcW + "x" + srcH + " comp. Scale them to " + comp.width + "x" + comp.height + "?")) {
                sx = comp.width / srcW; sy = comp.height / srcH;
            }

            app.beginUndoGroup("Import Guides");

            if (mode === "overwrite") {
                removeAllGuidesFromComp(comp);
            }

            var imported = 0;
            for (var i = 0; i < guidesData.length; i++) {
                var g = guidesData[i];
                var oriInt = (g.type === "h") ? ORIENT_H : ORIENT_V;
                comp.addGuide(oriInt, g.pos * (oriInt === ORIENT_H ? sy : sx));
                imported++;
            }
            app.endUndoGroup();
            setStatus("Imported " + imported + " guide(s) from " + selFile.name + " (" + mode + ").");
        } catch (e) {
            alert("Import failed: " + e.toString() + (e.line ? (" (line " + e.line + ")") : ""));
        }
    };

    // RENAME
    btnRename.onClick = function() {
        try {
            if (!guideDropdown.selection || currentFiles.length === 0) {
                alert("No guide preset selected.");
                return;
            }

            var selFile = currentFiles[guideDropdown.selection.index];
            if (!selFile.exists) {
                refreshList();
                return;
            }

            var oldName = decodeURI(selFile.name).replace(".guides", "");
            var newName = prompt("Rename your guide preset to:", oldName, "Rename Guides");

            if (newName && newName !== oldName) {
                newName = newName.replace(/[^a-zA-Z0-9_\- ]/g, "");
                if (newName === "") return;

                var folder = getProjFolder();
                var collision = folder ? new File(folder.fsName + "/" + newName + ".guides") : null;
                if (collision && collision.exists) {
                    alert("A guide file named \"" + newName + "\" already exists.");
                    return;
                }

                var renamed = selFile.rename(newName + ".guides");
                if (renamed) {
                    refreshList();
                    for (var j = 0; j < currentFiles.length; j++) {
                        if (decodeURI(currentFiles[j].name) === newName + ".guides") {
                            guideDropdown.selection = j;
                            break;
                        }
                    }
                    setStatus("Renamed to " + newName + ".guides");
                } else {
                    alert("Failed to rename. Ensure the file isn't open in another application.");
                }
            }
        } catch (e) {
            alert("Rename failed: " + e.toString() + (e.line ? (" (line " + e.line + ")") : ""));
        }
    };

    // CLEAR GUIDE FILES (disk cleanup)
    btnClearFiles.onClick = function() {
        try {
            var folder = getProjFolder();
            if (!folder) {
                alert("Please save your After Effects project first.");
                return;
            }
            var files = folder.getFiles("*.guides");
            if (!files.length) {
                setStatus("No guide files to clear.");
                return;
            }
            var proceed = confirm("Delete all " + files.length + " .guides file(s) next to this project? This can't be undone.");
            if (!proceed) return;

            var removed = 0;
            for (var i = 0; i < files.length; i++) {
                if (files[i].remove()) removed++;
            }
            refreshList();
            setStatus("Cleared " + removed + " guide file(s).");
        } catch (e) {
            alert("Clear failed: " + e.toString() + (e.line ? (" (line " + e.line + ")") : ""));
        }
    };

    // CLEAR COMP GUIDES (in viewer)
    btnClearCompGuides.onClick = function() {
        try {
            var comp = app.project.activeItem;
            if (!(comp instanceof CompItem)) {
                alert("Please select an active composition.");
                return;
            }
            if (comp.guides.length === 0) {
                setStatus("Composition has no guides to clear.");
                return;
            }
            app.beginUndoGroup("Clear Comp Guides");
            removeAllGuidesFromComp(comp);
            app.endUndoGroup();
            setStatus("Cleared all guides from composition.");
        } catch (e) {
            alert("Clear failed: " + e.toString() + (e.line ? (" (line " + e.line + ")") : ""));
        }
    };

    DP.footer(win, { id: "guided", name: scriptName, version: VERSION });

    // ─── LAUNCH ──────────────────────────────────────────────────────────
    win.onResizing = win.onResize = function() { win.layout.resize(); };
    if (win instanceof Window) {
        win.center();
        win.show();
    } else {
        win.layout.layout(true);
        win.layout.resize();
    }

})(this);