#!/usr/bin/env python3
"""Render the season illustrations (lib/dp-seasons-art.js) to PNGs for the website.

    python3 site/render_seasons.py ../designpraiseeric-site

Writes img/seasons/icon/<id>.png (24 px, used by the ScriptUI tools, which download them on the day)
and img/seasons/<id>.jpg (1200 x 500 banner for newsletter emails). Advent gets one per week.
Needs Playwright and Chrome. Run it again whenever the art or colours change.
"""
import asyncio, json, os, subprocess, sys
from playwright.async_api import async_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NODE = r'''
const S=require(process.argv[1]+'/lib/dp-seasons.js'),A=require(process.argv[1]+'/lib/dp-seasons-art.js');
const seen={},out=[];
for(let y=2026;y<=2028;y++)for(const s of S.year(y)){
  const variants=s.id==='advent'?[1,2,3,4]:[0];
  for(const w of variants){const k=w?'advent-'+w:s.id; if(seen[k])continue; seen[k]=1;
    const o=Object.assign({},s,{week:w}); out.push({key:k,title:s.title,colors:s.colors,svgDark:A.svg(o,'#1a0d3e'),svgLight:A.svg(o,'#f4f0ff')});}}
console.log(JSON.stringify(out));
'''

async def main(site):
    items = json.loads(subprocess.check_output(["node", "-e", NODE, ROOT]))
    os.makedirs(os.path.join(site, "img", "seasons", "icon"), exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=os.environ.get("CHROME", "/usr/bin/google-chrome"))
        icon = await b.new_page(viewport={"width": 24, "height": 24})
        banner = await b.new_page(viewport={"width": 1200, "height": 500})
        for it in items:
            # Icon: drawn for AE's dark panels, transparent background.
            await icon.set_content(f'<body style="margin:0;background:transparent">{it["svgLight"].replace("<svg ", "<svg width=24 height=24 ")}</body>')
            await icon.screenshot(path=os.path.join(site, "img", "seasons", "icon", it["key"] + ".png"), omit_background=True)
            c = it["colors"]
            await banner.set_content(f'''<body style="margin:0;width:1200px;height:500px;overflow:hidden;background:#fbfaff;position:relative">
<div style="position:absolute;inset:0;background:radial-gradient(60% 90% at 10% 10%,{c[0]}33,transparent 60%),radial-gradient(60% 90% at 90% 90%,{c[2]}33,transparent 60%),radial-gradient(40% 60% at 80% 10%,{c[1]}22,transparent 60%)"></div>
<div style="position:absolute;left:0;right:0;top:0;height:10px;background:linear-gradient(90deg,{c[0]} 0 33.3%,{c[1]} 33.3% 66.6%,{c[2]} 66.6%)"></div>
<div style="position:absolute;left:50%;top:50%;width:340px;height:340px;transform:translate(-50%,-46%)">{it["svgDark"].replace("<svg ", "<svg width=340 height=340 ")}</div></body>''')
            await banner.screenshot(path=os.path.join(site, "img", "seasons", it["key"] + ".jpg"), type="jpeg", quality=86)
            print("rendered", it["key"])
        await b.close()

asyncio.run(main(sys.argv[1]))
