# Baerista

DesignPraise's After Effects toolbar, and the update feed for every tool in it.

| Folder | What it is |
|---|---|
| `registry.json` | Every tool's current version, files, SHA-256 checksums and changelog. The bar and each standalone script read this to find updates. |
| `tools/<id>/` | Built, shipping version of each free tool. Don't edit these by hand. |
| `src/<id>/` | Tool sources. Each has one `//@@DP_CORE@@` line where the shared module goes. |
| `lib/dp-core.jsxinc` | Shared ScriptUI module: the dp mark (links to the site) and the update check/installer. |
| `cep/Baerista/` | The bar itself (CEP extension). |
| `lib/dp-seasons.js` | Calendar of greetings (Christian year, Nigerian public days, Eid greetings for Muslim neighbours), each with its colours. Shared by every tool, the bar and the website. |
| `lib/dp-seasons-art.js` | One original illustration per special day (SVG). `site/render_seasons.py` turns them into the site's PNG icons and email banners. |
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

## Paid tools

Paid tools never go in this repo. They live in the private repo `designpraiseeric-tools-paid`:

```
products.json            { "<tool id>": "<Gumroad product id>" }
paid/<tool id>/<file>    the tool's files
```

In this repo's `registry.json` a paid tool looks like any other entry, plus `"tier": "paid"`,
`"product": "<Gumroad product id>"` and `"gumroad": "<listing URL>"`; its file paths start with `paid/`
and carry their SHA-256 as usual. Baerista asks for the buyer's licence key and downloads through
`designpraiseeric.pages.dev/api/paid`, which checks the key with Gumroad first.

One-time setup:
1. On each paid Gumroad product, switch on "Generate a unique license key per sale".
2. Create a fine-grained GitHub token with Contents: read-only on `designpraiseeric-tools-paid` only.
3. In Cloudflare (Workers & Pages → designpraiseeric → Settings → Variables and secrets) add it as `PAID_GITHUB_TOKEN`, then redeploy.

## Seasonal greetings
On special days every tool shows a one-line greeting above its footer; hover or click it for the verse. Panels (CEP) show the same as a strip that opens on click.
- Pictures: panels and the site draw the SVG; ScriptUI tools download a 24 px PNG from the site (`img/seasons/icon/`) on the day and keep it in the user's data folder. After changing art or colours run `python3 site/render_seasons.py ../designpraiseeric-site` and copy `lib/dp-seasons-art.js` to the site's `js/seasons-art.js`.
- Days and wording: `lib/dp-seasons.js` (keep it ES3 — ExtendScript runs it). `python3 build.py` puts it into every ScriptUI tool and into each panel's `dp/dp-season.js`. Copy it to the website's `js/seasons.js` too.
- Tests: `node tests/seasons.test.js`.
- Preview a date — ScriptUI: run `app.settings.saveSetting("DesignPraise_Updates","season_date","2026-12-25")` once (clear it with `""`); panels: `localStorage.setItem("dp.seasonDate","2026-12-25")` in the panel's debug console.
