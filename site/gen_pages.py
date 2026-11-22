#!/usr/bin/env python3
"""Write the tool landing pages into the website repo.

    python3 site/gen_pages.py ../designpraiseeric-site

Copy comes from site/content.py; versions and Gumroad links from registry.json.
Pages go to <site>/tools/<id>/index.html plus <site>/tools/index.html.
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "site"))
from content import PAGES, ORDER
import icons as ICONS

SHOP = "https://designpraiseeric.gumroad.com"
MARK_SVG = open(os.path.join(ROOT, "cep", "Baerista", "img", "mark.svg"), encoding="utf-8").read()
MARK_SVG = re.sub(r'<svg ', '<svg aria-hidden="true" ', MARK_SVG, count=1)
THEME_BTN = ('<button class="theme" id="theme" type="button" aria-label="Switch theme"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">'
             '<circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>'
             '<path d="M12 7.5a4.5 4.5 0 0 0 0 9z" fill="currentColor" stroke="none"/></svg></button>')
KIND = {"scriptui-panel": "Dockable script", "cep": "Panel extension", "bar": "Toolbar (panel extension)"}
NEEDS = {"scriptui-panel": "After Effects CC 2019 or newer", "cep": "After Effects 2022 or newer", "bar": "After Effects 2022 or newer"}
INSTALL = {
    "scriptui-panel": "Easiest: install it from Baerista. On its own: copy the <code>.jsx</code> into After Effects' <code>Scripts/ScriptUI Panels</code> folder, restart, and open it from the Window menu. For update checks, turn on <i>Preferences › Scripting &amp; Expressions › Allow Scripts to Write Files and Access Network</i>.",
    "cep": "Easiest: install it from Baerista, then restart After Effects once. On its own: install the <code>.zxp</code> for your system (Mac or Windows) with a ZXP installer, such as the free ZXP Installer from aescripts, then restart After Effects and open Window › Extensions.",
    "bar": "Install the <code>.zxp</code> for your system (Mac or Windows) with a ZXP installer, such as the free ZXP Installer from aescripts. Restart After Effects and open Window › Extensions › Baerista. Every other tool installs from there.",
}

def esc(s): return html.escape(s, quote=True)

def head(title, desc, icon="/favicon.svg"):
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(desc)}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(desc)}">
<meta name="theme-color" content="#0e0820">
<link rel="icon" href="{icon}" type="image/svg+xml">
<script>try{{document.documentElement.dataset.theme=localStorage.getItem("dp-theme")||"dark"}}catch(e){{document.documentElement.dataset.theme="dark"}}</script>
<link rel="stylesheet" href="/tools/tools.css">
</head>
<body>
<div class="wrap">
<header class="top">
  <a class="brand" href="/tools/">{MARK_SVG}<span>designpraise eric</span></a>
  <nav><a href="/tools/">All tools</a>{THEME_BTN}</nav>
</header>
'''

NEWS = '''<section class="news">
  <div data-dp-news data-dp-news-topics="tools" data-title="Tool updates by email" data-lead="New tools and new versions of the ones you use, with what changed. Only when there’s something new."></div>
</section>
'''

FOOT = '''<footer class="bottom"><span>© 2026 DesignPraise Studio, Lagos</span><span>Free tools, name your price</span></footer>
</div>
<script>document.getElementById("theme").onclick=function(){var r=document.documentElement,n=r.dataset.theme==="dark"?"light":"dark";r.dataset.theme=n;try{localStorage.setItem("dp-theme",n)}catch(e){}};</script>
<script src="/tools/demos.js" defer></script>
<script src="/js/seasons.js" defer></script>
<script src="/js/seasons-art.js" defer></script>
<script src="/js/dp-extras.js" defer></script>
</body>
</html>
'''

def tool_page(tid, p, entry):
    kind = "bar" if tid == "baerista" else entry.get("kind", "scriptui-panel")
    version = entry["version"]
    buy = entry.get("gumroad") or SHOP
    out = head(f'{p["name"]} — After Effects {"toolbar" if kind == "bar" else "tool"} by DesignPraise Eric', p["lede"], f"/img/icons/{tid}.svg")
    out += f'''<main>
<div class="hero split">
  <div>
    <img class="appicon rise" src="/img/icons/{tid}.svg" width="76" height="76" alt="">
    <div class="kicker rise"><span class="pill">{esc(p["tag"])}</span><span>v{esc(version)}</span></div>
    <h1 class="rise r2">{esc(p["name"])}</h1>
    <p class="lede rise r3">{esc(p["lede"])}</p>
    <div class="cta rise r4">
      <a class="btn solid" href="{esc(buy)}" rel="noopener">Get {esc(p["name"])}</a>
      {'' if kind == "bar" else '<a class="btn line" href="/tools/baerista/">Get it with Baerista</a>'}
    </div>
    <p class="price rise r4">Free — name your price if you'd like to support it.</p>
  </div>
  <div class="stage rise r3" data-demo="{tid}" data-dur="{p.get("dur", 6)}"><svg viewBox="0 0 640 360" role="img" aria-label="{esc(p["name"])} in action"></svg></div>
</div>

<section>
  <h2>What it does</h2>
  <p class="lede" style="max-width:62ch;margin:0">{esc(p["what"])}</p>
</section>

<section>
  <h2>How it works</h2>
  <ol class="steps">{"".join("<li>" + esc(s) + "</li>" for s in p["steps"])}</ol>
</section>

<section>
  <h2>Details</h2>
  <ul class="feats">{"".join("<li><b>" + esc(a) + "</b><span>" + esc(b) + "</span></li>" for a, b in p["feats"])}</ul>
</section>

<section>
  <h2>Install</h2>
  <div class="specs">
    <div class="spec"><small>Version</small>{esc(version)}</div>
    <div class="spec"><small>Type</small>{KIND[kind]}</div>
    <div class="spec"><small>Needs</small>{NEEDS[kind]}</div>
    <div class="spec"><small>Price</small>Name your price, from free</div>
  </div>
  <p class="note" style="margin-top:18px">{INSTALL[kind]}</p>
  {'' if not entry.get("changelog") else '<p class="note"><b>What’s new in ' + esc(version) + ':</b> ' + esc(entry["changelog"]) + '</p>'}
</section>
<section class="news">
  <div data-dp-news data-dp-news-topics="tools" data-title="Tool updates by email" data-lead="New tools and new versions of the ones you use, with what changed. Only when there’s something new."></div>
</section>
</main>
'''
    return out + FOOT

def index_page(reg_by_id):
    out = head("After Effects tools by DesignPraise Eric", "Free After Effects scripts and panels, with Baerista to install and update them all.")
    out += '''<main>
<div class="hero">
  <div>
    <div class="kicker rise"><span class="pill">After Effects</span><span>free · name your price</span></div>
    <h1 class="rise r2">Tools</h1>
    <p class="lede rise r3">Scripts and panels I built for my own motion work. Get them one by one, or install Baerista and get them all, kept up to date.</p>
  </div>
</div>
<div class="grid">
'''
    for tid in ORDER:
        p = PAGES[tid]
        v = reg_by_id[tid]["version"]
        mono = "".join(w[0] for w in p["name"].split()[:2]) if " " in p["name"] else p["name"][:2]
        out += f'''<a class="card" href="/tools/{tid}/"><div class="c">
  <div class="f"><img class="ico" src="/img/icons/{tid}.svg" width="42" height="42" alt=""><div><h3>{esc(p["name"])}</h3><p>{esc(p["tag"])}</p></div><span class="v">v{esc(v)}</span></div>
  <div class="f b"><h3>{esc(p["name"])}</h3><p>{esc(p["lede"])}</p></div>
</div></a>
'''
    out += "</div>\n" + NEWS + "</main>\n"
    return out + FOOT.replace('<script src="/tools/demos.js" defer></script>\n', "")

def main():
    site = sys.argv[1]
    reg = json.load(open(os.path.join(ROOT, "registry.json")))
    by_id = {t["id"]: t for t in reg["tools"]}
    by_id["baerista"] = {"version": reg["bar"]["version"], "gumroad": reg["bar"].get("gumroad"), "changelog": reg["bar"].get("changelog"), "kind": "bar"}
    idir = os.path.join(site, "img", "icons"); os.makedirs(idir, exist_ok=True)
    for tid in ORDER:
        open(os.path.join(idir, tid + ".svg"), "w", encoding="utf-8").write(ICONS.tile(tid))
    for tid in ORDER:
        d = os.path.join(site, "tools", tid)
        os.makedirs(d, exist_ok=True)
        open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(tool_page(tid, PAGES[tid], by_id[tid]))
    open(os.path.join(site, "tools", "index.html"), "w", encoding="utf-8").write(index_page(by_id))
    print("wrote", len(ORDER), "tool pages + index")

if __name__ == "__main__":
    main()
