# Baerista

DesignPraise's After Effects toolbar, and the update feed for every tool in it.

| Folder | What it is |
|---|---|
| `registry.json` | Every tool's current version, files, SHA-256 checksums and changelog. The bar and each standalone script read this to find updates. |
| `tools/<id>/` | Built, shipping version of each free tool. Don't edit these by hand. |
| `src/<id>/` | Tool sources. Each has one `//@@DP_CORE@@` line where the shared module goes. |
| `lib/dp-core.jsxinc` | Shared ScriptUI module: the dp mark (links to the site) and the update check/installer. |
| `cep/Baerista/` | The bar itself (CEP extension). |
| `assets/` | Small PNG marks embedded into ScriptUI panels. |

Paid tools are not stored here. They are served after a Gumroad licence check.

## Releasing an update

1. Edit `src/<id>/…` and bump the version inside the file (`VERSION`, or the `DP.footer` call).
2. Bump the same `version` and the `changelog` in `registry.json`.
3. Run `python3 build.py` (rebuilds `tools/` and refreshes checksums).
4. Commit and push. Installed copies see the update on their next check (bar: on open and every 6 h; standalone scripts: every 12 h).

## Installing the bar (development, unsigned)

1. macOS: `defaults write com.adobe.CSXS.11 PlayerDebugMode 1` (repeat for 12 if your AE uses it).
   Windows: `HKEY_CURRENT_USER\Software\Adobe\CSXS.11` → `PlayerDebugMode` (String) = `1`.
2. Copy `cep/Baerista` to `~/Library/Application Support/Adobe/CEP/extensions/` (macOS) or `%APPDATA%\Adobe\CEP\extensions\` (Windows).
3. Restart After Effects → Window → Extensions → Baerista.

Tools the bar installs live in `~/Library/Application Support/DesignPraise/Baerista/tools` (macOS) or `%APPDATA%\DesignPraise\Baerista\tools` (Windows). If After Effects' `Scripts/ScriptUI Panels` folder is writable, the bar also puts a copy there so the tool can dock (after one AE restart).

Standalone scripts update themselves only when **Preferences → Scripting & Expressions → Allow Scripts to Write Files and Access Network** is on.

By DesignPraise (@designpraiseeric).
