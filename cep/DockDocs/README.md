# DockDocs — dockable document viewer for After Effects

A CEP panel that docks like any native AE panel and displays PDF, DOCX,
Markdown, TXT/JSON/CSV/LOG, RTF (plain-text fallback), and common image
formats in a tabbed viewer — so reference docs, briefs, scripts, or specs
can sit right inside your AE workspace instead of alt-tabbing out.

Docking itself isn't something the extension has to implement — any CEP
panel is natively dockable/floatable/tabbable in AE, the same as
Effects Controls or Project. What this gives you is a real multi-format
viewer *inside* that dockable frame, with tabs, zoom, search, drag-drop,
and session recall (reopens your last-open files on panel launch).

## What's inside

```
DockDocs/
  CSXS/manifest.xml     — extension registration (panel type, host = AEFT)
  host/main.jsx          — minimal ExtendScript bridge (stub for later)
  index.html             — panel shell
  css/style.css          — dark theme, syncs to AE's live panel color
  js/main.js              — all panel logic
  js/CSInterface.js       — Adobe's official CEP interop lib (from Adobe-CEP/CEP-Resources)
  js/pdf.min.js + pdf.worker.min.js — PDF.js, bundled locally
  js/marked.min.js        — Markdown → HTML
  js/mammoth.browser.min.js — DOCX → HTML
  icons/icon.png
  .debug                  — enables Chrome remote debugging on port 8092
```

Everything needed to render documents is bundled locally in `js/` — no
CDN calls at runtime, which matters because CEP panels don't reliably
have internet access and you don't want a panel that breaks the moment
Wi-Fi hiccups mid-render.

## Install (unsigned dev install — fastest path)

**1. Enable unsigned extensions** (one-time, per machine):

- **macOS**: open Terminal and run:
  ```
  defaults write com.adobe.CSXS.11 PlayerDebugMode 1
  ```
  If you're on an older/newer AE, also set CSXS.9, CSXS.10, CSXS.12 the
  same way — harmless to set several.

- **Windows**: open Registry Editor, and under each of
  `HKEY_CURRENT_USER\Software\Adobe\CSXS.9`,
  `HKEY_CURRENT_USER\Software\Adobe\CSXS.10`,
  `HKEY_CURRENT_USER\Software\Adobe\CSXS.11`,
  `HKEY_CURRENT_USER\Software\Adobe\CSXS.12`
  create a String value `PlayerDebugMode` = `1` (create the key if missing).

**2. Copy the folder into the CEP extensions directory:**

- **macOS**: `~/Library/Application Support/Adobe/CEP/extensions/DockDocs`
- **Windows**: `C:\Users\<you>\AppData\Roaming\Adobe\CEP\extensions\DockDocs`

(Copy the whole `DockDocs` folder there — the folder name doesn't have
to match, but keep it simple.)

**3. Restart After Effects.** Open it from **Window → Extensions →
DockDocs**. Drag its tab into any dock position like you would any
other panel.

## Using it

- **Open…** — native file picker, pick a PDF/DOCX/TXT/MD/RTF/image
- Drag a file from Finder/Explorer straight onto the panel
- Each open file gets its own tab; click ✕ to close
- **+ / –** zoom (re-renders PDF pages at the new scale; scales font
  size for text/markdown)
- Search box highlights matches in the active document and jumps to
  the first hit — works on PDF (via its real text layer, so PDF text
  is also selectable/copyable), Markdown, DOCX, and plain text
- Closing and reopening AE restores whatever tabs you had open

## Text selection

Selection is native browser Range/Selection throughout — including the
PDF text layer — not a custom hand-built selection system. That's a
deliberate choice: native selection is what gives you character-level
precision, double-click-to-select-a-word, drag-to-extend, and selection
flowing naturally across page boundaries, because it's the same
selection model every word processor and browser already uses. Building
a bespoke selection engine to chase edge cases (rectangular vs. stream
selection, table-column isolation, cross-page support...) tends to
under-deliver relative to just using what's already there and correct.
Copy (Cmd/Ctrl+C, or right-click Copy) writes plain text only, with two
CEP-specific fixes layered underneath so it actually reaches AE's
clipboard reliably:
- `registerKeyEventsInterest` is called with the correct macOS virtual
  keycode for C (8, not the DOM keyCode 67) — otherwise Cmd+C gets
  swallowed by AE's own Edit > Copy before this panel ever sees it.
- The clipboard write is forced to plain text only. Chromium's default
  copy of a DOM selection writes both text/plain and text/html, and
  AE's paste path seems to prefer the HTML format when present — which,
  for a PDF text layer, is a literal dump of absolutely-positioned
  `<span>` tags that AE can't usefully parse, so paste silently no-ops.
  Stripping it to text/plain fixes that.

## Known limits, honestly

- **RTF** is stripped to plain text — no bold/italic/tables preserved.
  If you need real fidelity, save as PDF or DOCX instead and open that.
- **DOCX** renders via Mammoth, which is good for prose (headings,
  lists, bold/italic, tables) but ignores complex layout — no floating
  images, columns, or precise pagination. Fine for briefs and scripts,
  not for a pixel-accurate reproduction of a laid-out document.
- No `.doc` (legacy binary Word) support — convert to `.docx` or PDF.
- PDF search matches per-page text layers; it doesn't build a
  cross-document index, so very large PDFs (100+ pages) will feel it
  when a query has many hits across many pages.

## Extending it

`host/main.jsx` is there so you can grow this into more than a viewer —
e.g. pull the active comp name into a tab title, or write annotations
back into a project note. Call into it from `main.js` via
`csInterface.evalScript("dd_ping()", callback)`.

If you want this rebuilt as a signed `.zxp` for distribution (rather
than the debug-mode unsigned install above), that's a separate step
using ZXPSignCmd — say the word and I'll set that up too.
