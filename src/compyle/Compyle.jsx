(function(panel) {
    var TOOL = "Compyle", VERSION = "1.1.1";

//@@DP_CORE@@
    // ========== ES3 Polyfill for Array.indexOf ==========
    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(item) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === item) return i;
            }
            return -1;
        };
    }
    // ===================================================

    var win;
    if (panel instanceof Panel) {
        win = panel;
        win.orientation = "column";
        win.alignChildren = "fill";
        win.spacing = 6;
        win.margins = 10;
        win.text = "Compyle";  // set panel title
    } else {
        win = new Window("palette", "Compyle", undefined, { resizeable: true });
        win.orientation = "column";
        win.alignChildren = "fill";
        win.spacing = 6;
        win.margins = 10;
    }

    var allComps = [];
    var checkedMap = {};
    var bucketComps = [];

    function getAllComps() {
        var comps = [];
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem) comps.push(item);
        }
        return comps;
    }

    function refreshAll() {
        allComps = getAllComps();
        for (var key in checkedMap) {
            if (checkedMap.hasOwnProperty(key)) {
                var idx = parseInt(key, 10);
                if (idx >= allComps.length || !(allComps[idx] instanceof CompItem)) {
                    delete checkedMap[key];
                }
            }
        }
        var validBucket = [];
        for (var i = 0; i < bucketComps.length; i++) {
            if (bucketComps[i] && allComps.indexOf(bucketComps[i]) !== -1) {
                validBucket.push(bucketComps[i]);
            }
        }
        bucketComps = validBucket;
        rebuildLeftList();
        rebuildRightList();
        return allComps.length;
    }

    function rebuildLeftList() {
        var lcFilter = searchField.text.toLowerCase();
        leftListBox.removeAll();
        for (var i = 0; i < allComps.length; i++) {
            var name = allComps[i].name;
            if (lcFilter && name.toLowerCase().indexOf(lcFilter) === -1) continue;
            var prefix = checkedMap.hasOwnProperty(i) ? "☑ " : "☐ ";
            leftListBox.add("item", prefix + name);
        }
        leftListBox.selection = null;
        updateCheckedStatus();
    }

    function rebuildRightList() {
        rightListBox.removeAll();
        for (var i = 0; i < bucketComps.length; i++) {
            rightListBox.add("item", bucketComps[i].name);
        }
    }

    function updateCheckedStatus() {
        var count = 0;
        for (var key in checkedMap) {
            if (checkedMap.hasOwnProperty(key)) count++;
        }
        status.text = "Checked: " + count + " item(s).";
    }

    function toggleItemByVisibleIndex(visibleIndex) {
        var lcFilter = searchField.text.toLowerCase();
        var count = 0;
        for (var i = 0; i < allComps.length; i++) {
            var name = allComps[i].name;
            if (lcFilter && name.toLowerCase().indexOf(lcFilter) === -1) continue;
            if (count === visibleIndex) {
                if (checkedMap.hasOwnProperty(i)) {
                    delete checkedMap[i];
                } else {
                    checkedMap[i] = true;
                }
                rebuildLeftList();
                return;
            }
            count++;
        }
    }

    function addCheckedToBucket() {
        var count = 0;
        for (var key in checkedMap) {
            if (checkedMap.hasOwnProperty(key)) {
                var idx = parseInt(key, 10);
                if (idx >= 0 && idx < allComps.length) {
                    var comp = allComps[idx];
                    if (bucketComps.indexOf(comp) === -1) {
                        bucketComps.push(comp);
                        count++;
                    }
                }
            }
        }
        rebuildRightList();
        if (count === 0) {
            alert("No checked items to add. Click on composition names in the left list to check them first.");
        }
    }

    function addAllVisibleToBucket() {
        var lcFilter = searchField.text.toLowerCase();
        for (var i = 0; i < allComps.length; i++) {
            var name = allComps[i].name;
            if (lcFilter && name.toLowerCase().indexOf(lcFilter) === -1) continue;
            var comp = allComps[i];
            if (bucketComps.indexOf(comp) === -1) {
                bucketComps.push(comp);
            }
        }
        rebuildRightList();
    }

    function removeSelectedFromBucket() {
        var sel = rightListBox.selection;
        if (!sel || sel.length === 0) return;
        var idxs = [];
        for (var k = 0; k < sel.length; k++) idxs.push(sel[k].index);
        idxs.sort(function (a, b) { return a - b; });
        for (var j = idxs.length - 1; j >= 0; j--) {
            var idx = idxs[j];
            if (idx >= 0 && idx < bucketComps.length) {
                bucketComps.splice(idx, 1);
            }
        }
        rebuildRightList();
    }

    function removeAllFromBucket() {
        bucketComps = [];
        rebuildRightList();
    }

    function sanitizeFilename(name) {
        return name.replace(/[\\\/:*?"<>|]/g, '_');
    }

    function selectOnlyThese(comps) {
        for (var i = 1; i <= app.project.numItems; i++) {
            app.project.item(i).selected = false;
        }
        for (var j = 0; j < comps.length; j++) {
            if (comps[j] && comps[j].selected !== undefined) {
                comps[j].selected = true;
            }
        }
    }

    function findCompByName(name) {
        for (var i = 1; i <= app.project.numItems; i++) {
            var item = app.project.item(i);
            if (item instanceof CompItem && item.name === name) return item;
        }
        return null;
    }

    function reduceProject() {
        var reduceCmd = app.findMenuCommandId("Reduce Project");
        if (!reduceCmd) throw new Error("Couldn't find File > Dependencies > Reduce Project in this version of After Effects.");
        app.executeCommand(reduceCmd);
    }

    function saveBucket(saveMode) {
        if (bucketComps.length === 0) {
            alert("No compositions in the bucket. Please add at least one composition.");
            return;
        }

        var originalPath = app.project.file;
        if (!originalPath) {
            var ans = confirm("The current project has not been saved yet. To save compositions to a new project, the original project must be saved first. Do you want to save it now?");
            if (ans) {
                try {
                    var saveFile = File.saveDialog("Save Current Project As", "*.aep");
                    if (saveFile) {
                        app.project.save(saveFile);
                        originalPath = saveFile;
                    } else {
                        alert("Save cancelled. Aborting.");
                        return;
                    }
                } catch (e) {
                    alert("Failed to save the current project. Aborting.");
                    return;
                }
            } else {
                alert("Cannot proceed without saving the original project. Aborting.");
                return;
            }
        } else if (app.project.dirty) {
            var ans2 = confirm("The current project has unsaved changes. Do you want to save it before creating new projects?");
            if (ans2) {
                try { app.project.save(); } catch (e) {
                    alert("Failed to save the current project. Aborting.");
                    return;
                }
            }
        }
        originalPath = app.project.file;

        var compNames = [];
        for (var i = 0; i < bucketComps.length; i++) {
            compNames.push(bucketComps[i].name);
        }

        if (saveMode === 'one') {
            selectOnlyThese(bucketComps);
            reduceProject();
            var saveFile = File.saveDialog("Save New Project As", "*.aep");
            if (saveFile) {
                var path = saveFile.fsName;
                if (!path.match(/\.aep$/i)) path += ".aep";
                saveFile = new File(path);
                try {
                    app.project.save(saveFile);
                    alert("Project saved to:\n" + saveFile.fsName);
                } catch (e) {
                    alert("Save failed. You can save manually.");
                }
            } else {
                alert("Save cancelled. Reopening original project...");
            }
            try { app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES); } catch (e) {}
            try { app.open(originalPath); } catch (e) {
                alert("Failed to reopen original project. Please open it manually.");
            }
        } else if (saveMode === 'separate') {
            var destFolder = Folder.selectDialog("Select destination folder for individual projects");
            if (!destFolder) {
                alert("No folder selected. Aborting.");
                return;
            }
            win.statusText.text = "Saving to: " + destFolder.fsName;

            for (var idx = 0; idx < compNames.length; idx++) {
                var compName = compNames[idx];
                try {
                    app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
                } catch (e) {}
                try {
                    app.open(originalPath);
                    $.sleep(500);
                } catch (e) {
                    alert("Failed to reopen original project. Aborting.");
                    return;
                }
                var comp = findCompByName(compName);
                if (!comp) {
                    alert("Could not find composition '" + compName + "' in the original project. Skipping.");
                    continue;
                }
                selectOnlyThese([comp]);
                reduceProject();
                var safeName = sanitizeFilename(comp.name);
                var saveFile = new File(destFolder.fsName + "/" + safeName + ".aep");
                var counter = 1;
                while (saveFile.exists) {
                    saveFile = new File(destFolder.fsName + "/" + safeName + "_" + counter + ".aep");
                    counter++;
                }
                try {
                    app.project.save(saveFile);
                    win.statusText.text = "Saved: " + saveFile.name + " (" + (idx+1) + "/" + compNames.length + ")";
                } catch (e) {
                    alert("Failed to save project for '" + compName + "'. You can save it manually.");
                }
            }
            try { app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES); } catch (e) {}
            try {
                app.open(originalPath);
                $.sleep(500);
            } catch (e) {
                alert("Failed to reopen original project after saving. Please open it manually.");
            }
            win.statusText.text = "All compositions saved individually to: " + destFolder.fsName;
            alert("All " + compNames.length + " compositions saved as separate projects in:\n" + destFolder.fsName);
        }
    }

    // ---- UI ----
    var radioGroup = win.add("group");
    radioGroup.orientation = "row"; radioGroup.alignChildren = "left"; radioGroup.spacing = 10;
    var rbActive = radioGroup.add("radiobutton", undefined, "Active Comp");
    var rbList = radioGroup.add("radiobutton", undefined, "Choose from list");
    rbActive.value = true; rbList.value = false;
    win.rbActive = rbActive; win.rbList = rbList;

    var searchGroup = win.add("group");
    searchGroup.orientation = "row"; searchGroup.alignChildren = "left"; searchGroup.spacing = 5;
    searchGroup.add("statictext", undefined, "Search:");
    var searchField = searchGroup.add("edittext", undefined, "");
    searchField.characters = 20;
    searchField.enabled = false;

    var listsGroup = win.add("group");
    listsGroup.orientation = "row";
    listsGroup.alignChildren = "top";
    listsGroup.spacing = 6;
    listsGroup.margins = 0;

    var leftGroup = listsGroup.add("group");
    leftGroup.orientation = "column";
    leftGroup.alignChildren = "fill";
    leftGroup.spacing = 2;
    leftGroup.add("statictext", undefined, "Available Compositions (click to check/uncheck):");
    var leftListBox = leftGroup.add("listbox", undefined, [], { multiselect: false });
    leftListBox.preferredSize.width = 220;
    leftListBox.preferredSize.height = 180;
    leftListBox.enabled = false;

    var centerBtnGroup = listsGroup.add("group");
    centerBtnGroup.orientation = "column";
    centerBtnGroup.alignChildren = "center";
    centerBtnGroup.spacing = 4;
    centerBtnGroup.margins = 0;
    var addCheckedBtn = centerBtnGroup.add("button", undefined, "Add Checked →");
    var addAllBtn = centerBtnGroup.add("button", undefined, "Add All Visible →");
    var removeBtn = centerBtnGroup.add("button", undefined, "← Remove Selected");
    var removeAllBtn = centerBtnGroup.add("button", undefined, "← Remove All");
    addCheckedBtn.preferredSize.width = 120;
    addAllBtn.preferredSize.width = 120;
    removeBtn.preferredSize.width = 120;
    removeAllBtn.preferredSize.width = 120;

    var rightGroup = listsGroup.add("group");
    rightGroup.orientation = "column";
    rightGroup.alignChildren = "fill";
    rightGroup.spacing = 2;
    rightGroup.add("statictext", undefined, "Selected for Export:");
    var rightListBox = rightGroup.add("listbox", undefined, [], { multiselect: true });
    rightListBox.preferredSize.width = 220;
    rightListBox.preferredSize.height = 180;
    rightListBox.enabled = true;

    var modeGroup = win.add("group");
    modeGroup.orientation = "row"; modeGroup.alignChildren = "left"; modeGroup.spacing = 10;
    var rbOne = modeGroup.add("radiobutton", undefined, "Save all as one project");
    var rbSeparate = modeGroup.add("radiobutton", undefined, "Save each as separate project");
    rbOne.value = true; rbSeparate.value = false;

    var btnGroup = win.add("group");
    btnGroup.orientation = "row"; btnGroup.alignChildren = "center"; btnGroup.spacing = 8;
    var refreshBtn = btnGroup.add("button", undefined, "Refresh List");
    var saveBtn = btnGroup.add("button", undefined, "Save Bucket");

    var status = win.add("statictext", undefined, "Ready.");
    status.alignment = "left";
    win.statusText = status;

    DP.footer(win, { id: "compyle", name: TOOL, version: VERSION });

    function updateUIForMode() {
        var active = rbActive.value;
        leftListBox.enabled = !active;
        searchField.enabled = !active;
        addCheckedBtn.enabled = !active;
        addAllBtn.enabled = !active;
        removeBtn.enabled = !active;
        removeAllBtn.enabled = !active;
        rightListBox.enabled = !active;
        if (active) {
            checkedMap = {};
            bucketComps = [];
            rebuildLeftList();
            rebuildRightList();
            status.text = "Active comp selected (if any).";
        } else {
            checkedMap = {};
            rebuildLeftList();
            status.text = "Click items to check them (☑ appears).";
        }
    }

    rbActive.onClick = updateUIForMode;
    rbList.onClick = updateUIForMode;

    searchField.onChanging = function() {
        rebuildLeftList();
    };

    leftListBox.onChange = function() {
        if (!leftListBox.enabled) return;
        if (leftListBox.selection && leftListBox.selection.index !== undefined) {
            toggleItemByVisibleIndex(leftListBox.selection.index);
        }
    };

    leftListBox.onDoubleClick = function() {
        if (!leftListBox.enabled) return;
        if (leftListBox.selection && leftListBox.selection.index !== undefined) {
            toggleItemByVisibleIndex(leftListBox.selection.index);
        }
        addCheckedToBucket();
    };

    addCheckedBtn.onClick = function() {
        addCheckedToBucket();
    };

    addAllBtn.onClick = function() {
        addAllVisibleToBucket();
    };

    removeBtn.onClick = function() {
        removeSelectedFromBucket();
    };

    removeAllBtn.onClick = function() {
        removeAllFromBucket();
    };

    refreshBtn.onClick = function() {
        var count = refreshAll();
        status.text = "Refreshed. " + count + " comp(s) found.";
    };

    saveBtn.onClick = function() {
        var compsToSave;
        if (rbActive.value) {
            var active = app.project.activeItem;
            if (active && active instanceof CompItem) compsToSave = [active];
            else { alert("No active composition found."); return; }
        } else {
            if (bucketComps.length === 0) {
                alert("No compositions in the bucket. Please add at least one composition.");
                return;
            }
            compsToSave = bucketComps.slice();
        }
        var saveMode = rbOne.value ? 'one' : 'separate';
        var names = "";
        for (var i = 0; i < compsToSave.length; i++) names += compsToSave[i].name + "\n";
        if (!confirm("Save the following composition(s) " + (saveMode === 'one' ? "as a single project" : "as separate projects") + "?\n\n" + names)) return;
        bucketComps = compsToSave;
        saveBucket(saveMode);
    };

    if (app.project) {
        refreshAll();
        updateUIForMode();
    } else {
        alert("Please open a project first.");
        return;
    }

    win.layout.layout(true);
    if (!(panel instanceof Panel)) win.show();
})(this);