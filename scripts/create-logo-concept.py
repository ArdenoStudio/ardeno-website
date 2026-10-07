"""Draw an original vector logo exploration; preserve the existing identity files."""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/brand/logo-concept-ribbon'
OUT.mkdir(parents=True, exist_ok=True)
font = TTFont(ROOT / 'node_modules/@fontsource/cal-sans/files/cal-sans-latin-400-normal.woff')
glyphs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font['head'].unitsPerEm
INK, PAPER, ORANGE = '#20211f', '#f4f4f2', '#ff3301'

# Two independent ribbons with a rising, curved seam. Rounded ends are drawn
# into the outline so the mark remains identical in flat and dimensional use.
LEFT = 'M134 808 C112 818 96 799 108 776 L420 150 C442 106 491 103 517 141 L620 290 C636 313 632 335 610 354 C476 468 373 599 315 748 C308 767 295 780 275 785 Z'
RIGHT = 'M660 376 C674 365 691 371 700 388 L894 778 C907 804 889 825 864 816 L670 750 C649 743 634 727 628 705 L579 573 C569 546 573 525 589 504 C617 467 638 423 647 393 C650 385 654 380 660 376 Z'

def text(value, x, baseline, size, color=INK):
    result, advance = [], 0
    for char in value:
        glyph = glyphs[cmap[ord(char)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(pen)
        result.append(f'<path fill="{color}" d="{pen.getCommands()}" transform="translate({x+advance*size/upm:.4f} {baseline}) scale({size/upm} {-size/upm})"/>')
        advance += glyph.width
    return '\n'.join(result)

def mark(x, y, height, color=ORANGE):
    scale = height / 719
    return f'<g fill="{color}" transform="translate({x} {y}) scale({scale}) translate(-103 -106)"><path d="{LEFT}"/><path d="{RIGHT}"/></g>'

def lockup(x, y, height, color=INK, symbol=ORANGE):
    # The lowercase letters have the same optical height as the A.
    return mark(x,y,height,symbol) + text('ardeno',x+height*1.35,y+height*.96,height*1.37,color)

def save(name, width, height, body, label):
    (OUT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-label="{label}"><title>{label}</title>{body}</svg>',encoding='utf-8')

body = f'<rect width="1600" height="1060" fill="{PAPER}"/>'
body += text('ardeno / identity exploration',64,75,24)
body += text('01 / curved ribbons',1275,75,20,'#62635f')
body += '<path d="M64 110H1536" stroke="#d8d9d4"/>'
body += lockup(150,245,225)
body += text('A familiar idea. A softer signature.',64,642,36)
body += text('Two pieces. One continuous rhythm.',64,683,20,'#62635f')
body += f'<rect x="64" y="750" width="704" height="225" rx="4" fill="{INK}"/>'
body += lockup(135,805,100,PAPER)
body += f'<rect x="792" y="750" width="440" height="225" rx="4" fill="{ORANGE}"/>'
body += mark(930,790,143,INK)
body += '<rect x="1256" y="750" width="280" height="225" rx="4" fill="#e9e9e5"/>'
body += f'<rect x="1354" y="799" width="84" height="84" rx="20" fill="{INK}"/>'
body += mark(1371,814,54,ORANGE)
body += text('Small-size check',1320,927,18)
body += text('Cal Sans / Ardeno orange / original vector concept',64,1024,18,'#62635f')
save('Ardeno-Ribbon-A-Concept.svg',1600,1060,body,'Ardeno logo concept: two curved ribbons with a Cal Sans wordmark')
for name, color, symbol in [('primary',INK,ORANGE),('reversed',PAPER,ORANGE),('ink',INK,INK)]:
    save(f'ardeno-ribbon-lockup-{name}.svg',1130,220,lockup(12,15,185,color,symbol),'Ardeno ribbon concept lockup')
for name,color in [('signal',ORANGE),('ink',INK),('paper',PAPER)]:
    save(f'ardeno-ribbon-mark-{name}.svg',860,775,mark(18,18,739,color),'Ardeno ribbon A concept')
(OUT/'preview.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><title>Ardeno / ribbon A concept</title><style>html,body{margin:0;padding:0;background:#f4f4f2}img{display:block;width:1600px;height:1060px}</style><img src="Ardeno-Ribbon-A-Concept.svg" alt="Ardeno logo exploration: curved ribbon A and Cal Sans wordmark, with dark and orange variations."></html>',encoding='utf-8')
print(OUT / 'Ardeno-Ribbon-A-Concept.svg')
