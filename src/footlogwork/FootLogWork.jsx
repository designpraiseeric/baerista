
(function (thisObj) {
    var TOOL = "FootLogWork", VERSION = "1.1.2";

//@@DP_CORE@@
    // ---------- UI Construction ----------
    function buildUI(thisObj) {
        var panel = (thisObj instanceof Panel) ? 
                    thisObj : 
                    new Window("palette", "FootLogWork", undefined, { resizeable: true });

        panel.orientation = "column";
        panel.alignChildren = ["fill", "top"];
        panel.spacing = 6;
        panel.margins = 10;

        // Title
        var titleGroup = panel.add("group");
        titleGroup.orientation = "row";
        titleGroup.alignChildren = "center";
        titleGroup.add("statictext", undefined, "FOOTLOGWORK", { font: "dialog", size: 16 });

        // Separator
        panel.add("panel", undefined, "").preferredSize.height = 2;

        // Source Layer dropdown
        var srcGroup = panel.add("group");
        srcGroup.orientation = "row";
        srcGroup.alignChildren = ["left", "center"];
        srcGroup.add("statictext", undefined, "Source Layer:");
        var srcDropdown = srcGroup.add("dropdownlist", undefined, []);
        srcDropdown.preferredSize.width = 180;

        // Reference Layer dropdown
        var refGroup = panel.add("group");
        refGroup.orientation = "row";
        refGroup.alignChildren = ["left", "center"];
        refGroup.add("statictext", undefined, "Reference Layer:");
        var refDropdown = refGroup.add("dropdownlist", undefined, []);
        refDropdown.preferredSize.width = 180;

        // Refresh layers button
        var refreshBtn = panel.add("button", undefined, "Refresh Layer List");
        refreshBtn.preferredSize.width = 140;

        // Buttons
        var btnGroup = panel.add("group");
        btnGroup.orientation = "row";
        btnGroup.spacing = 10;
        var logBtn = btnGroup.add("button", undefined, "Convert to Log");
        var matchBtn = btnGroup.add("button", undefined, "Color Match");

        // Progress bar
        var progressBar = panel.add("progressbar", undefined, 0, 100);
        progressBar.preferredSize.width = 300;
        var statusText = panel.add("statictext", undefined, "Ready");
        statusText.preferredSize.width = 300;

        DP.footer(panel, { id: "footlogwork", name: TOOL, version: VERSION });

        // ---------- Helper: Safely update UI ----------
        function safeUpdate() {
            if (panel instanceof Window) panel.update();
        }

        // ---------- Helper: populate dropdowns ----------
        function populateLayers() {
            var comp = app.project.activeItem;
            srcDropdown.removeAll();
            refDropdown.removeAll();
            
            if (!comp || !(comp instanceof CompItem)) {
                srcDropdown.add("item", "No comp active");
                refDropdown.add("item", "No comp active");
                return;
            }
            
            var layers = comp.layers;
            if (layers.length === 0) {
                srcDropdown.add("item", "No layers");
                refDropdown.add("item", "No layers");
                return;
            }
            
            for (var i = 1; i <= layers.length; i++) {
                var lyr = layers[i];
                var name = lyr.name;
                srcDropdown.add("item", i + ": " + name);
                refDropdown.add("item", i + ": " + name);
            }
            
            if (srcDropdown.items.length > 0) {
                srcDropdown.selection = 0;
                refDropdown.selection = 0;
            }
        }

        populateLayers();

        refreshBtn.onClick = function () {
            populateLayers();
        };

        // ---------- Helper: get selected layer by dropdown ----------
        function getLayerFromDropdown(dropdown) {
            var comp = app.project.activeItem;
            if (!comp || !(comp instanceof CompItem)) return null;
            
            var sel = dropdown.selection;
            if (sel === null) return null; 
            
            var text = sel.text; 
            var indexStr = text.split(":")[0];
            var index = parseInt(indexStr, 10);
            if (isNaN(index)) return null;
            return comp.layer(index);
        }

        // ---------- Sampling function (progress bar) ----------
        function getLayerStats(layer, time) {
            var comp = layer.containingComp;
            
            var rect = layer.sourceRectAtTime(time, false);
            var left = rect.left, top = rect.top, width = rect.width, height = rect.height;
                
            if (width <= 0 || height <= 0) {
                width = comp.width;
                height = comp.height;
                left = 0;
                top = 0;
            }

            var gridX = 16, gridY = 16;
            var sumR = 0, sumG = 0, sumB = 0;
            var sumSqR = 0, sumSqG = 0, sumSqB = 0;
            var count = 0;
            var textLayer = null;

            try {
                textLayer = comp.layers.addText("__sampler__");
                textLayer.guideLayer = true;
                textLayer.opacity.setValue(0);
                var srcTextProp = textLayer.property("Source Text");
                statusText.text = "Sampling...";
                progressBar.value = 30;
                safeUpdate();

                // One evaluation for all gridX × gridY cells; each sample averages its whole cell.
                var cw = width / gridX, ch = height / gridY;
                srcTextProp.expression =
                    "var L = thisComp.layer(" + layer.index + "), out = [];\n" +
                    "for (var ix = 0; ix < " + gridX + "; ix++) for (var iy = 0; iy < " + gridY + "; iy++) {\n" +
                    "  var p = L.sampleImage([" + left + " + " + cw + " * (ix + 0.5), " + top + " + " + ch + " * (iy + 0.5)], [" + (cw / 2) + ", " + (ch / 2) + "], true, time);\n" +
                    "  out.push(p[0].toFixed(6) + ',' + p[1].toFixed(6) + ',' + p[2].toFixed(6));\n" +
                    "}\nout.join(';');";
                var str = srcTextProp.valueAtTime(time, false).text;
                var cells = str.split(";");
                for (var c = 0; c < cells.length; c++) {
                    var parts = cells[c].split(",");
                    if (parts.length < 3) continue;
                    var r = parseFloat(parts[0]), g = parseFloat(parts[1]), b = parseFloat(parts[2]);
                    if (isNaN(r) || isNaN(g) || isNaN(b)) continue;
                    sumR += r; sumG += g; sumB += b;
                    sumSqR += r * r; sumSqG += g * g; sumSqB += b * b;
                    count++;
                }
            } catch(e) {
                alert("Error during sampling: " + e.toString());
                return null;
            } finally {
                if (textLayer) {
                    textLayer.remove();
                }
            }

            if (count === 0) return null;

            var meanR = sumR / count, meanG = sumG / count, meanB = sumB / count;
            var varR = (sumSqR / count) - meanR * meanR;
            var varG = (sumSqG / count) - meanG * meanG;
            var varB = (sumSqB / count) - meanB * meanB;

            statusText.text = "Sampling complete.";
            progressBar.value = 100;
            safeUpdate();

            return {
                meanR: meanR, meanG: meanG, meanB: meanB,
                stdR: Math.sqrt(Math.max(0, varR)), 
                stdG: Math.sqrt(Math.max(0, varG)), 
                stdB: Math.sqrt(Math.max(0, varB))
            };
        }

        // ---------- Apply Levels match (Corrected Match Name) ----------
        function applyColorMatch(sourceLayer, srcStats, refStats) {
            var effectsGroup = sourceLayer.property("ADBE Effect Parade") || sourceLayer.property("Effects");
            
            var effect;
            try {
                // Modern AE Match Name for Levels (Individual Controls)
                effect = effectsGroup.addProperty("ADBE Pro Levels2");
            } catch(e) {
                try {
                    // Legacy AE Match Name fallback
                    effect = effectsGroup.addProperty("ADBE Pro Levels");
                } catch(e2) {
                    alert("Could not apply Levels. Missing correct effect match name in this AE version.");
                    return;
                }
            }

            function setChannel(channel, inBlack, inWhite, gamma, outBlack, outWhite) {
                effect.property(channel + " Input Black").setValue(inBlack);
                effect.property(channel + " Input White").setValue(inWhite);
                effect.property(channel + " Gamma").setValue(gamma);
                effect.property(channel + " Output Black").setValue(outBlack);
                effect.property(channel + " Output White").setValue(outWhite);
            }

            function calcOutParams(srcMean, srcStd, refMean, refStd) {
                if (srcStd < 0.0001) srcStd = 1.0; 
                var scale = refStd / srcStd;
                var outBlack = refMean - srcMean * scale;
                var outWhite = outBlack + scale;
                
                outBlack = Math.max(0, Math.min(1, outBlack));
                outWhite = Math.max(0, Math.min(1, outWhite));
                if (outBlack >= outWhite) {
                    outBlack = 0; outWhite = 1;
                }
                return { outBlack: outBlack, outWhite: outWhite };
            }

            var rPar = calcOutParams(srcStats.meanR, srcStats.stdR, refStats.meanR, refStats.stdR);
            var gPar = calcOutParams(srcStats.meanG, srcStats.stdG, refStats.meanG, refStats.stdG);
            var bPar = calcOutParams(srcStats.meanB, srcStats.stdB, refStats.meanB, refStats.stdB);

            setChannel("Red", 0, 1, 1, rPar.outBlack, rPar.outWhite);
            setChannel("Green", 0, 1, 1, gPar.outBlack, gPar.outWhite);
            setChannel("Blue", 0, 1, 1, bPar.outBlack, bPar.outWhite);
        }

        // ---------- Convert to Log ----------
        function convertToLog(layer) {
            var effectsGroup = layer.property("ADBE Effect Parade") || layer.property("Effects");
            var cineon = effectsGroup.addProperty("ADBE Cineon Converter");
            cineon.property("Conversion Type").setValue(2);
        }

        // ---------- Button Handlers ----------
        logBtn.onClick = function () {
            var srcLayer;
            try {
                srcLayer = getLayerFromDropdown(srcDropdown);
            } catch(e) {
                alert("Error getting layer: " + e.toString());
                return;
            }
            
            if (!srcLayer) {
                alert("Please select a valid source layer.");
                return;
            }
            
            app.beginUndoGroup("FootLogWork Convert to Log");
            try {
                progressBar.value = 0;
                statusText.text = "Applying Cineon Log...";
                safeUpdate();
                
                convertToLog(srcLayer);
                
                progressBar.value = 100;
                statusText.text = "Converted to Log.";
                safeUpdate();
            } catch(e) {
                alert("Error: " + e.toString() + "\nLine: " + e.line);
            } finally {
                app.endUndoGroup();
            }
        };

        matchBtn.onClick = function () {
            var srcLayer, refLayer;
            try {
                srcLayer = getLayerFromDropdown(srcDropdown);
                refLayer = getLayerFromDropdown(refDropdown);
            } catch(e) {
                alert("Error getting layers: " + e.toString());
                return;
            }

            if (!srcLayer || !refLayer) {
                alert("Please select both source and reference layers.");
                return;
            }
            if (srcLayer === refLayer) {
                alert("Source and reference must be different layers.");
                return;
            }

            app.beginUndoGroup("FootLogWork Color Match");
            try {
                progressBar.value = 0;
                statusText.text = "Sampling source...";
                safeUpdate();

                var currentTime = srcLayer.containingComp.time;
                var srcStats = getLayerStats(srcLayer, currentTime);
                if (!srcStats) {
                    alert("Source sampling failed (no pixels or expression error).");
                    return;
                }

                progressBar.value = 0;
                statusText.text = "Sampling reference...";
                safeUpdate();
                
                var refStats = getLayerStats(refLayer, currentTime);
                if (!refStats) {
                    alert("Reference sampling failed.");
                    return;
                }

                progressBar.value = 0;
                statusText.text = "Applying color match...";
                safeUpdate();

                applyColorMatch(srcLayer, srcStats, refStats);

                progressBar.value = 100;
                statusText.text = "Color match complete.";
                safeUpdate();
            } catch(e) {
                alert("Error: " + e.toString() + "\nLine: " + e.line);
            } finally {
                app.endUndoGroup();
            }
        };

        return panel;
    }

    // ---------- Launch ----------
    var myPanel = buildUI(thisObj);
    if (myPanel instanceof Window) {
        myPanel.center();
        myPanel.show();
    } else {
        myPanel.layout.layout(true);
    }
})(this);
