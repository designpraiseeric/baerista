# DockView

A CEP panel for After Effects that acts as a real docked browser: drag a link
in and it opens right inside the panel, alongside your composition, no
alt-tabbing to a separate browser window.

## What it does

- **Drag & drop** — drag a link from anywhere (browser tab, Slack, Notes,
  Frame.io review email, etc.) and drop it on the panel. It opens in a new
  tab inside DockView.
- **Tabs that stay alive** — switching tabs doesn't reload them, so you can
  keep a Frame.io review open in one tab and a reference site in another,
  both loaded at once.
- **Split view** — click the split-view button to view two tabs side by
  side at the same time, in the same panel. Shift-click a tab to send it to
  the right-hand pane.
- **Drop onto a tab** — dropping a new link directly onto an existing tab
  navigates that tab instead of opening a duplicate one.
- **Persistence** — your open tabs survive closing and reopening the panel
  (stored locally, per machine).
- **Back / forward / reload / address bar** — the basics you'd expect from
  a browser, scoped to whichever pane you last clicked into.

## Install (macOS)

1. Copy the whole `DockView` folder to:
   `~/Library/Application Support/Adobe/CEP/extensions/`
   (create the `extensions` folder if it doesn't exist yet)

2. Turn on debug mode so After Effects will load an unsigned extension.
   Open Terminal and run:

   ```
   defaults write com.adobe.CSXS.9 PlayerDebugMode 1
   defaults write com.adobe.CSXS.10 PlayerDebugMode 1
   defaults write com.adobe.CSXS.11 PlayerDebugMode 1
   defaults write com.adobe.CSXS.12 PlayerDebugMode 1
   sudo killall cfprefsd
   ```

   (Running it for all four CSXS versions covers whichever one your AE 2026
   build actually uses — harmless to set the ones you don't need.)

3. Fully quit and reopen After Effects.

4. Open it from **Window → Extensions → DockView**.

## Signing in (Google Docs, Drive, etc.)

Four approaches, in the order they were actually tried and ruled in/out —
not guesswork, each was tested:

1. **Sign in inside the embedded iframe.** Doesn't work — Google refuses to
   run its sign-in flow inside any iframe, anywhere.
2. **Pop a second same-engine window via `window.open()`.** Doesn't work —
   this CEP host's embedded Chromium returns no window from that call.
3. **Navigate the main panel's own top-level page to the sign-in URL.**
   Google allowed the sign-in this way, but it **crashed After Effects**.
4. **Open a second, separate CEP extension window (`ModelessDialog`) via
   `requestOpenExtension()`** — CEP's own documented mechanism for a second
   window, rather than the unsupported `window.open()` or the main panel
   navigating itself. This is what the 👤 button does now: it opens a small
   sign-in window (`signin.html`, a completely separate extension/document
   from the main panel) and points it at the URL you were trying to load.
   The main DockView panel's own page never moves, which is the specific
   thing that crashed AE in attempt 3.

**Sign in in that window normally**, then close it and click Reload (↻) on
the tab back in the main panel — the session cookie should now be sitting
in the same CEF cookie store the panel's iframes read from, since dialog
and panel are both part of the same extension bundle.

**Be aware this is still not fully proven safe.** If attempt 3 crashed
because Google's page itself is too heavy for this CEP host's Chromium
build — rather than because of the panel navigating away from its own
origin — this could crash too, just in the dialog window instead of the
main one. **Test it in a throwaway/empty AE project first**, not a real
one, until it's confirmed stable. If it does crash, the panel and your
actual project should be unaffected since the crash would be scoped to
the separate dialog window — but confirm that before relying on it.

If this also turns out to be unsafe, the fallback that's already proven
not to touch AE at all is `csInterface.openURLInDefaultBrowser()` — opens
the link in your actual Safari/Chrome, a fully separate process. The
trade-off there: that's a different browser profile, so its session isn't
shared with DockView's embedded pages — you'd read/edit that page in your
normal browser rather than inside the panel. The code already falls back
to this automatically if `requestOpenExtension` isn't available.

## A real limitation worth knowing about (not a bug)

A small number of sites send a header (`X-Frame-Options` or a CSP
`frame-ancestors` rule) that tells every browser, including this panel,
"do not let anyone embed me in a frame." Banking sites and some Google
properties do this. There is no reliable way for any embedded-browser tool
to override that — it's enforced by the site itself, not by DockView.
Frame.io **review links** are built specifically to be embeddable (that's
the point of their share/review feature), so your main use case should load
fine. If something you drop in shows a blank white pane, that's the site's
own embed restriction — copy the link and open it in Safari/Chrome instead.

## Files

```
DockView/
├── CSXS/manifest.xml   — extension registration (targets AEFT, any recent version)
├── host/index.jsx       — empty stub (this panel never touches the AE project)
├── client/
│   ├── index.html
│   ├── style.css
│   └── main.js          — all the tab / drag-drop / split-view logic
└── .debug                — enables loading the unsigned extension
```

There's no build step — it's plain HTML/CSS/JS, so you can open
`client/main.js` and tweak it directly.
