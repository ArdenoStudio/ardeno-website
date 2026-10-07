"""Three independent Ardeno symbol explorations, without the existing A."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/brand/new-logo-directions'
OUT.mkdir(parents=True, exist_ok=True)
font = TTFont(ROOT/'node_modules/@fontsource/cal-sans/files/cal-sans-latin-400-normal.woff')
glyphs, cmap, upm = font.getGlyphSet(), font.getBestCmap(), font['head'].unitsPerEm
INK, PAPER, ORANGE, MUTED = '#20211f', '#f4f4f2', '#ff3301', '#62635f'

def text(value,x,baseline,size,color=INK):
    paths, advance = [],0
    for char in value:
        glyph=glyphs[cmap[ord(char)]]
        pen=SVGPathPen(glyphs); glyph.draw(pen)
        paths.append(f'<path fill="{color}" d="{pen.getCommands()}" transform="translate({x+advance*size/upm:.4f} {baseline}) scale({size/upm} {-size/upm})"/>')
        advance+=glyph.width
    return ''.join(paths)

def symbol(name,x,y,size,color=ORANGE):
    # Shared 280-unit canvas; each concept has its own independent construction.
    if name=='loop':
        shape=f'<path d="M198 130 C198 82 162 44 117 44 C72 44 38 82 38 130 C38 178 73 211 117 211 C160 211 198 176 198 130 Z M198 55 L198 185 C198 209 215 224 242 215" fill="none" stroke="{color}" stroke-width="41" stroke-linecap="round" stroke-linejoin="round"/>'
    elif name=='offset':
        shape=f'<g fill="{color}"><path d="M43 28 H150 V75 H75 V185 H123 V232 H43 Q28 232 28 217 V43 Q28 28 43 28 Z"/><path d="M168 48 H237 Q252 48 252 63 V237 Q252 252 237 252 H130 V205 H205 V95 H168 Z"/></g>'
    else:
        shape=f'<path fill="{color}" fill-rule="evenodd" d="M258 140 A118 118 0 1 1 22 140 A118 118 0 1 1 258 140 Z M226 120 A68 68 0 1 0 90 120 A68 68 0 1 0 226 120 Z"/><circle cx="169" cy="110" r="23" fill="{color}"/>'
    return f'<g transform="translate({x} {y}) scale({size/280})">{shape}</g>'

def lockup(name,x,y,height=150,color=INK,mark_color=ORANGE):
    return symbol(name,x,y,height,mark_color)+text('ardeno',x+height+28,y+height*.87,height*1.14,color)

def save(name,w,h,content,title):
    (OUT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}"><title>{title}</title>{content}</svg>',encoding='utf-8')

body=f'<rect width="1600" height="1580" fill="{PAPER}"/>'
body+=text('ardeno / a fresh start',64,66,23)
body+=text('New shapes. Same Ardeno.',64,145,57)
body+=text('Three independent directions / Cal Sans / Ardeno orange',64,192,21,MUTED)

directions=[
 ('loop','01 / Loop','A continuous lowercase a. Personal, fluid, approachable.'),
 ('offset','02 / Offset','An open studio frame. Precise, modular, architectural.'),
 ('orbit','03 / Orbit','An off-centre aperture. Curious, expressive, a little unexpected.')
]
for i,(name,title,description) in enumerate(directions):
    top=250+i*415
    body+=f'<path d="M64 {top} H1536" stroke="#d8d9d4"/>'
    body+=text(title,64,top+55,29)
    body+=text(description,64,top+94,21,MUTED)
    body+=lockup(name,70,top+155,170)
    body+=f'<rect x="1080" y="{top+34}" width="456" height="320" rx="6" fill="{INK}"/>'
    body+=symbol(name,1190,top+58,220,ORANGE)
    body+=text('ardeno',1221,top+320,56,PAPER)
    body+=text('Single colour',64,top+367,18,MUTED)
    body+=symbol(name,199,top+337,42,INK)
    body+=text('Small icon',312,top+367,18,MUTED)
    body+=f'<rect x="417" y="{top+333}" width="44" height="44" rx="10" fill="{INK}"/>'
    body+=symbol(name,421,top+337,36,ORANGE)
    for version,word_color,mark_color in [('primary',INK,ORANGE),('ink',INK,INK),('reversed',PAPER,ORANGE)]:
        save(f'ardeno-{name}-lockup-{version}.svg',1000,220,lockup(name,10,15,190,word_color,mark_color),f'Ardeno {name} concept lockup')
        save(f'ardeno-{name}-mark-{version}.svg',280,280,symbol(name,0,0,280,mark_color),f'Ardeno {name} concept symbol')

body+=text('Original vector explorations / select a direction before refining the identity.',64,1543,19,MUTED)
save('Ardeno-New-Logo-Directions.svg',1600,1580,body,'Three completely new Ardeno logo directions: Loop, Offset, and Orbit')
(OUT/'preview.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ardeno / completely new logo concepts</title><style>html,body{margin:0;background:#f4f4f2}img{display:block;width:100%;height:auto}</style><img src="Ardeno-New-Logo-Directions.svg" alt="Three new Ardeno logo concepts: Loop, Offset and Orbit."></html>',encoding='utf-8')
(OUT/'export.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Ardeno / concept board export</title><style>html,body{margin:0;background:#f4f4f2}img{display:block;width:1600px;height:1580px}</style><img src="Ardeno-New-Logo-Directions.svg" alt="Three new Ardeno logo concepts: Loop, Offset and Orbit."></html>',encoding='utf-8')
print(OUT/'preview.html')
