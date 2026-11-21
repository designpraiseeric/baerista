// Baerista host functions (ExtendScript). Called from js/bar.js through CSInterface.evalScript.

function baerista_panelsFolder() {
    // App-level ScriptUI Panels folder, where dockable copies must live.
    var candidates = [];
    try {
        var pkg = Folder.appPackage;
        candidates.push(pkg.fsName + "/Scripts/ScriptUI Panels");          // Windows: ...\Support Files
        candidates.push(pkg.parent.fsName + "/Scripts/ScriptUI Panels");   // macOS: next to the .app
    } catch (e) {}
    for (var i = 0; i < candidates.length; i++) {
        var f = Folder(candidates[i]);
        if (f.exists) return f.fsName;
    }
    return "";
}

function baerista_aeVersion() { return app.version; }

// Opens a tool. Prefers the docked Window-menu entry; otherwise runs the file as a floating panel.
function baerista_launch(menuName, path) {
    try {
        var id = app.findMenuCommandId(menuName);
        if (id) { app.executeCommand(id); return "docked"; }
    } catch (e) {}
    var f = File(path);
    if (!f.exists) return "missing";
    try { $.evalFile(f); return "floating"; }
    catch (e2) { return "error:" + e2.toString(); }
}
