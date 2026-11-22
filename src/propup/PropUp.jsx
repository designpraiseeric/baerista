/*
 * Shape Property Revealer – Dockable Panel (Zero Index Calls)
 * Lists leaf properties from selected shape groups.
 * Checkboxes toggle selection and reveal in Timeline.
 * Scrollable, dockable, and robust.
 */

(function(thisObj) {
    var TOOL = "Prop Up", VERSION = "1.1.1";
    var COLUMNS = 4;

//@@DP_CORE@@

    // Property groups report INDEXED_GROUP or NAMED_GROUP.
    function isGroupType(t) { return t === PropertyType.INDEXED_GROUP || t === PropertyType.NAMED_GROUP; }
    var DEFAULT_DEPTH = 2;

    // ---- Main window ----
    var win = (thisObj && thisObj.add) ? thisObj : new Window('palette', 'Shape Property Revealer', undefined, { resizeable: true });
    win.orientation = 'column';
    win.alignChildren = 'left';
    win.spacing = 5;
    win.margins = 10;
    win.preferredSize.width = 420;
    win.preferredSize.height = 500;

    // ---- Top controls ----
    var topGroup = win.add('group');
    topGroup.orientation = 'row';
    topGroup.alignChildren = 'center';
    topGroup.spacing = 5;
    topGroup.add('statictext', undefined, 'Depth:');
    var depthDD = topGroup.add('dropdownlist', undefined, ['1','2','3','4','5','All']);
    depthDD.selection = Math.min(DEFAULT_DEPTH, depthDD.items.length - 1);
    var refreshBtn = topGroup.add('button', undefined, '⟳ Refresh');

    // ---- Status label ----
    var statusText = win.add('statictext', undefined, 'Status: Ready');
    statusText.alignment = 'left';

    // ---- Scrollable container ----
    var scrollGroup = win.add('group');
    scrollGroup.orientation = 'row';
    scrollGroup.alignChildren = 'fill';
    scrollGroup.preferredSize.height = 350;

    var contentPanel = scrollGroup.add('panel', undefined, 'Properties');
    contentPanel.orientation = 'column';
    contentPanel.alignChildren = 'left';
    contentPanel.preferredSize.height = 350;

    var scrollBar = scrollGroup.add('scrollbar', undefined, 0, 0, 100);
    scrollBar.preferredSize.width = 16;
    scrollBar.preferredSize.height = 350;

    var innerGroup = contentPanel.add('group');
    innerGroup.orientation = 'column';
    innerGroup.alignChildren = 'left';

    // ---- Logging ----
    function log(msg) {
        try { $.writeln('[ShapeRevealer] ' + msg); } catch(e) {}
    }

    // ---- Safe property access ----
    function safeGetProperty(obj, key) {
        try {
            if (!obj) return null;
            if (typeof obj.property !== 'function') return null;
            return obj.property(key);
        } catch(e) {
            log('safeGetProperty error for key "' + key + '": ' + e);
            return null;
        }
    }

    function safeNumProperties(obj) {
        try {
            if (!obj) return 0;
            return obj.numProperties || 0;
        } catch(e) {
            log('safeNumProperties error: ' + e);
            return 0;
        }
    }

    function safePropertyType(prop) {
        try {
            if (!prop) return -1;
            return prop.propertyType;
        } catch(e) {
            log('safePropertyType error: ' + e);
            return -1;
        }
    }

    function safeMatchName(prop) {
        try {
            if (!prop) return '';
            return prop.matchName || '';
        } catch(e) {
            log('safeMatchName error: ' + e);
            return '';
        }
    }

    function safeName(prop) {
        try {
            if (!prop) return '';
            return prop.name || '';
        } catch(e) {
            log('safeName error: ' + e);
            return '';
        }
    }

    function safeSelected(prop) {
        try {
            if (!prop) return false;
            return prop.selected || false;
        } catch(e) {
            log('safeSelected error: ' + e);
            return false;
        }
    }

    // ---- Get containing layer ----
    function getContainingLayer(prop) {
        try { return prop.propertyGroup(prop.propertyDepth); } catch (e) { return null; }
    }

    // ---- Get matchName path ----
    function getMatchNamePath(prop) {
        var path = [];
        try {
            var current = prop;
            while (current && current.parentProperty) {
                var mn = safeMatchName(current);
                if (mn) path.unshift(mn);
                current = current.parentProperty;
            }
        } catch(e) {
            log('getMatchNamePath error: ' + e);
        }
        return path;
    }

    // ---- Search for property by matchName path ----
    function findPropertyByMatchPath(rootGroup, path, depth) {
        try {
            if (!rootGroup || !path || depth >= path.length) return null;
            var targetName = path[depth];
            if (!targetName) return null;
            var num = safeNumProperties(rootGroup);
            for (var i = 1; i <= num; i++) {
                var p = safeGetProperty(rootGroup, i);
                if (!p) continue;
                if (safeMatchName(p) === targetName) {
                    if (depth === path.length - 1) {
                        return p;
                    } else {
                        if (isGroupType(safePropertyType(p))) {
                            return findPropertyByMatchPath(p, path, depth + 1);
                        }
                    }
                }
            }
        } catch(e) {
            log('findPropertyByMatchPath error: ' + e);
        }
        return null;
    }

    // ---- Collect leaf properties up to depth ----
    function collectProperties(propGroup, depth, currentDepth) {
        var result = [];
        try {
            if (!propGroup) return result;
            if (!isGroupType(safePropertyType(propGroup))) return result;
            var num = safeNumProperties(propGroup);
            for (var i = 1; i <= num; i++) {
                var p = safeGetProperty(propGroup, i);
                if (!p) continue;
                var type = safePropertyType(p);
                if (type === PropertyType.PROPERTY) {
                    result.push(p);
                } else if (isGroupType(type)) {
                    if (depth === -1 || currentDepth < depth) {
                        result = result.concat(collectProperties(p, depth, currentDepth + 1));
                    }
                }
            }
        } catch(e) {
            log('collectProperties error: ' + e);
        }
        return result;
    }

    // ---- Get selected shape groups ----
    function getSelectedShapeGroups() {
        var activeItem = app.project.activeItem;
        if (!activeItem || !(activeItem instanceof CompItem)) {
            log('No active composition');
            return [];
        }

        var groups = [];

        try {
            // 1. Check selected properties
            var selected = activeItem.selectedProperties;
            if (selected && selected.length > 0) {
                for (var i = 0; i < selected.length; i++) {
                    var p = selected[i];
                    if (!p) continue;
                    if (isGroupType(safePropertyType(p))) {
                        var mn = safeMatchName(p);
                        if (mn && (mn.indexOf('ADBE Vector') !== -1 || mn.indexOf('ADBE Shape') !== -1)) {
                            var layer = getContainingLayer(p);
                            groups.push({ layer: layer, group: p });
                        }
                    }
                }
                if (groups.length > 0) return groups;
            }

            // 2. Check selected layers
            var layers = activeItem.selectedLayers;
            if (layers && layers.length > 0) {
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if (!layer) continue;
                    var contents = null;

                    // Try standard match name
                    contents = safeGetProperty(layer, "ADBE Root Vectors Group");
                    if (!contents) {
                        var num = safeNumProperties(layer);
                        for (var j = 1; j <= num; j++) {
                            var prop = safeGetProperty(layer, j);
                            if (!prop) continue;
                            if (isGroupType(safePropertyType(prop))) {
                                var mn = safeMatchName(prop);
                                if (mn === 'ADBE Root Vectors Group' || mn === 'ADBE Shape Layer' || (mn && mn.indexOf('ADBE Vector') !== -1)) {
                                    contents = prop;
                                    break;
                                }
                            }
                        }
                    }
                    if (contents) {
                        groups.push({ layer: layer, group: contents });
                    } else {
                        log('No Contents group for layer: ' + safeName(layer));
                    }
                }
            } else {
                log('No layers selected.');
            }
        } catch(e) {
            log('getSelectedShapeGroups error: ' + e);
        }
        return groups;
    }

    // ---- Rebuild grid ----
    function rebuild() {
        try {
            // Clear innerGroup
            while (innerGroup.children.length > 0) {
                innerGroup.remove(innerGroup.children[0]);
            }

            var shapeData = getSelectedShapeGroups();
            statusText.text = 'Groups found: ' + shapeData.length;
            log('Groups: ' + shapeData.length);

            if (shapeData.length === 0) {
                innerGroup.add('statictext', undefined, 'Select a shape layer or shape group(s).');
                updateScrollbar();
                return;
            }

            var depthText = depthDD.selection.text;
            var depth = depthText === 'All' ? -1 : parseInt(depthText, 10);

            var allProps = [];
            var propMeta = [];

            for (var g = 0; g < shapeData.length; g++) {
                var data = shapeData[g];
                var group = data.group;
                var props = collectProperties(group, depth, 1);
                for (var p = 0; p < props.length; p++) {
                    var prop = props[p];
                    allProps.push(prop);
                    propMeta.push({
                        matchPath: getMatchNamePath(prop),
                        name: safeName(prop)
                    });
                }
            }

            statusText.text = 'Groups: ' + shapeData.length + ' | Properties: ' + allProps.length;
            log('Properties: ' + allProps.length);

            if (allProps.length === 0) {
                innerGroup.add('statictext', undefined, 'No properties found at this depth.');
                updateScrollbar();
                return;
            }

            // Combine and sort
            var combined = [];
            for (var ci = 0; ci < allProps.length; ci++) combined.push({ prop: allProps[ci], meta: propMeta[ci] });
            combined.sort(function(a, b) { return safeName(a.prop).localeCompare(safeName(b.prop)); });

            var grid = innerGroup.add('group');
            grid.orientation = 'column';
            grid.alignChildren = 'left';

            var row;
            for (var i = 0; i < combined.length; i++) {
                if (i % COLUMNS === 0) {
                    row = grid.add('group');
                    row.orientation = 'row';
                    row.alignChildren = 'left';
                    row.spacing = 5;
                }
                var prop = combined[i].prop;
                var meta = combined[i].meta;
                var cb = row.add('checkbox', undefined, safeName(prop));
                cb.value = safeSelected(prop);
                cb.data = {
                    matchPath: meta.matchPath
                };

                cb.onClick = function() {
                    try {
                        var activeItem = app.project.activeItem;
                        if (!activeItem || !(activeItem instanceof CompItem)) {
                            alert('No active composition.');
                            this.value = !this.value;
                            return;
                        }
                        var layers = activeItem.selectedLayers;
                        if (!layers || layers.length === 0) {
                            alert('Select a shape layer.');
                            this.value = !this.value;
                            return;
                        }
                        var layer = layers[0];
                        var contents = safeGetProperty(layer, "ADBE Root Vectors Group");
                        if (!contents) {
                            var num = safeNumProperties(layer);
                            for (var j = 1; j <= num; j++) {
                                var p = safeGetProperty(layer, j);
                                if (!p) continue;
                                if (isGroupType(safePropertyType(p))) {
                                    var mn = safeMatchName(p);
                                    if (mn === 'ADBE Root Vectors Group' || mn === 'ADBE Shape Layer' || (mn && mn.indexOf('ADBE Vector') !== -1)) {
                                        contents = p;
                                        break;
                                    }
                                }
                            }
                        }
                        if (!contents) {
                            alert('Could not find Contents group. Click Refresh.');
                            this.value = !this.value;
                            return;
                        }
                        var liveProp = findPropertyByMatchPath(contents, this.data.matchPath, 0);
                        if (!liveProp) {
                            alert('Property not found. Click Refresh.');
                            this.value = !this.value;
                            return;
                        }
                        liveProp.selected = this.value;
                        try { app.executeCommand(26); } catch(e) {}
                    } catch(e) {
                        log('Checkbox click error: ' + e);
                        alert('Error: ' + e.message + '\nClick Refresh.');
                        this.value = !this.value;
                    }
                };
            }

            try { app.executeCommand(26); } catch(e) {}
            updateScrollbar();

        } catch(e) {
            log('Rebuild error: ' + e);
            alert('Rebuild error: ' + e.message + '\nCheck Console for details.');
            statusText.text = 'Error: ' + e.message;
        }
    }

    // ---- Scrollbar logic ----
    function updateScrollbar() {
        try {
            // Safely get content height, fallback to 0
            var contentHeight = 0;
            try {
                var ps = innerGroup.preferredSize;
                if (ps && !(ps instanceof Error)) {
                    contentHeight = ps.height || 0;
                }
            } catch(e) {}

            // Safely get view height, fallback to default
            var viewHeight = 350;
            try {
                var ps2 = contentPanel.preferredSize;
                if (ps2 && !(ps2 instanceof Error)) {
                    viewHeight = ps2.height || 350;
                }
            } catch(e) {}

            var maxScroll = Math.max(0, contentHeight - viewHeight);
            scrollBar.maxvalue = Math.max(0, maxScroll);
            scrollBar.value = 0;
            innerGroup.location.y = 0;
            scrollBar.enabled = (maxScroll > 0);
        } catch(e) {
            log('updateScrollbar error: ' + e);
        }
    }

    scrollBar.onChanging = function() {
        var yOffset = -this.value;
        innerGroup.location.y = yOffset;
    };

    win.onResize = function() {
        updateScrollbar();
    };

    // ---- Events ----
    refreshBtn.onClick = rebuild;
    depthDD.onChange = rebuild;

    DP.footer(win, { id: "propup", name: TOOL, version: VERSION });

    // ---- Show if floating, THEN build ----
    if (!(thisObj && thisObj.add)) {
        win.show();
    }
    rebuild();

})(this);