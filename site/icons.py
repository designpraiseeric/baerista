# DesignPraise product icon family — 64-unit grid, monoline, round caps.
A={'amber':'#ffa800','aqua':'#03eed8','volt':'#03ee63','sun':'#eed903','magenta':'#d903ee','azure':'#038eee','lilac':'#a57bff'}
W='#ffffff'
def s(d,c=W,w=4.2,extra=''): return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"{extra}/>'
def f(d,c): return f'<path d="{d}" fill="{c}"/>'
def dot(x,y,r,c): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{c}"/>'
G={}
G['baerista']=('amber',lambda a: s('M18 30h26v6a10 10 0 0 1-10 10h-6a10 10 0 0 1-10-10z')+s('M44 32.5h2a4.5 4.5 0 0 1 0 9h-3')+s('M17 52h28')+s('M27 25c-3-3 3-5 0-9',a,3.6)+s('M35 25c-3-3 3-5 0-9',a,3.6))
G['aline']=('aqua',lambda a: s('M12 44L52 24')+dot(21,39.5,4,W)+dot(32,34,4,W)+s('M43 13.5v9',a,3.4)+s('M39.5 19.5l3.5 3.5 3.5-3.5',a,3.4)+dot(43,29.5,4.6,a))
G['compensate']=('volt',lambda a: s('M20 24h10a8 8 0 0 1 0 16H20a8 8 0 0 1 0-16z')+s('M45 17v30',a)+s('M50.5 28l4 4-4 4',a,3.4))
G['bouncer']=('sun',lambda a: s('M12 48h40',W,3,' stroke-opacity=".3"')+s('M12 48C21 48 22 16 32 17.5S38 30 42.5 28.5 47 25 49 25.5')+dot(49,25.5,4.8,a))
G['textjam']=('magenta',lambda a: s('M13 17h24M25 17v31')+f'<rect x="38.5" y="25" width="11" height="11" rx="2.8" transform="rotate(16 44 30.5)" fill="{a}"/>'+f'<rect x="40" y="40" width="8" height="8" rx="2.2" transform="rotate(-20 44 44)" fill="none" stroke="{a}" stroke-width="3.2"/>'+dot(46,16.5,2.8,a))
G['slicer']=('amber',lambda a: s('M29 29.2C24.5 21.5 11 21 11 32s13.5 10.5 18 2.8')+s('M35 29.2C39.5 21.5 53 21 53 32s-13.5 10.5-18 2.8',a))
G['notable']=('sun',lambda a: s('M17 14h20l10 10v22a4 4 0 0 1-4 4H21a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4z')+s('M37 14v10h10')+s('M23 26h8M23 32h16',W,3.4)+s('M23 42c2.5-4 5 4 7.5 0s5 4 7.5 0',a,3.4))
G['precompkit']=('aqua',lambda a: f'<rect x="13" y="13" width="26" height="26" rx="6" fill="none" stroke="{W}" stroke-width="4.2"/>'+f'<rect x="25" y="25" width="26" height="26" rx="6" fill="url(#tg)" stroke="{a}" stroke-width="4.2"/>'+f'<rect x="32" y="32" width="12" height="12" rx="3" fill="{a}" fill-opacity=".9"/>')
G['dockview']=('azure',lambda a: f'<rect x="11" y="15" width="42" height="34" rx="6" fill="none" stroke="{W}" stroke-width="4.2"/>'+s('M11 24h42')+dot(17,19.5,1.6,W)+dot(22,19.5,1.6,W)+f'<rect x="37" y="29" width="11" height="15" rx="2.5" fill="{a}"/>'+s('M17 31h13M17 37h9',W,3.2))
G['dockdocs']=('volt',lambda a: s('M14 22v-4a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v4h18a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4z')+f'<path d="M32 21v-4a3 3 0 0 1 3-3h7a3 3 0 0 1 3 3v4z" fill="{a}"/>'+s('M21 33h22M21 40h14',W,3.2))
G['guided']=('magenta',lambda a: s('M12 41h40M41 12v40',W,3,' stroke-opacity=".4"')+s('M12 23h40M23 12v40',W,3.8)+f'<rect x="17.5" y="17.5" width="11" height="11" rx="2.4" transform="rotate(45 23 23)" fill="{a}"/>'+dot(41,41,3.2,W))
G['propup']=('volt',lambda a: s('M17 16h8a4 4 0 0 1 0 8h-8a4 4 0 0 1 0-8z',W,3.4)+dot(17,20,2,W)+s('M36 20h14',W,3.4)+f'<rect x="12.3" y="27.3" width="17.4" height="9.4" rx="4.7" fill="{a}"/>'+dot(25,32,2.6,'#3a0896')+s('M36 32h14',a,3.4)+s('M17 40h8a4 4 0 0 1 0 8h-8a4 4 0 0 1 0-8z',W,3.4)+dot(17,44,2,W)+s('M36 44h10',W,3.4))
G['auff']=('magenta',lambda a: s('M13 27h7l9-8v26l-9-8h-7z')+s('M37 26.5a8 8 0 0 1 0 11',W,3.6)+s('M42.5 21.5a15 15 0 0 1 0 21',W,3.6)+s('M33 18L51 46',a,4.2))
G['compyle']=('azure',lambda a: s('M32 14l18 9-18 9-18-9z',a)+s('M14 32l18 9 18-9')+s('M14 41l18 9 18-9'))
G['footlogwork']=('amber',lambda a: s('M32 13A19 19 0 0 0 32 51')+s('M32 13A19 19 0 0 1 32 51',a)+s('M22.5 40.5C25 31 30 26.5 41.5 24.5',W,3.6))
ORDER=['baerista','aline','compensate','bouncer','textjam','slicer','notable','precompkit','dockview','dockdocs','guided','propup','auff','compyle','footlogwork']
DEFS='<defs><linearGradient id="tg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#7a1cff"/><stop offset="1" stop-color="#4a05b8"/></linearGradient></defs>'
def tile(k,size=None):
    acc,fn=G[k]; a=A[acc]
    sz=f' width="{size}" height="{size}"' if size else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"{sz}>{DEFS}<rect width="64" height="64" rx="15" fill="url(#tg)"/><rect x=".5" y=".5" width="63" height="63" rx="14.5" fill="none" stroke="#fff" stroke-opacity=".14"/>{fn(a)}</svg>'
def glyph(k,size=None):
    acc,fn=G[k]; a=A[acc]
    sz=f' width="{size}" height="{size}"' if size else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"{sz}>{DEFS}{fn(a)}</svg>'
if __name__=='__main__':
    import os,subprocess
    os.makedirs('svg',exist_ok=True)
    for k in ORDER:
        open(f'svg/{k}.svg','w').write(tile(k))
        subprocess.run(['rsvg-convert','-w','256',f'svg/{k}.svg','-o',f'svg/{k}.png'])
    from PIL import Image
    sh=Image.new('RGB',(5*300,3*300),(14,8,32))
    for i,k in enumerate(ORDER):
        im=Image.open(f'svg/{k}.png').convert('RGBA'); sh.paste(im,((i%5)*300+22,(i//5)*300+22),im)
    sh.save('/tmp/icons.png')
