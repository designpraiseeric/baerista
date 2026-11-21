// DockDocs host script (ExtendScript side)
// Runs inside After Effects' scripting engine. Kept minimal on purpose —
// this panel is primarily a document viewer and doesn't need to touch
// the AE project. Hook is here if you want to extend it later, e.g.
// naming a tab after the active comp, or writing notes back into
// a text layer.

function dd_getActiveCompName() {
    if (app.project && app.project.activeItem && app.project.activeItem instanceof CompItem) {
        return app.project.activeItem.name;
    }
    return "";
}

function dd_ping() {
    return "DockDocs host ready — AE " + app.version;
}
