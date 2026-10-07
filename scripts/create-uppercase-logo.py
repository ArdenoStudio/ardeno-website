"""Preview the original Ardeno A with an uppercase Cal Sans wordmark."""
from pathlib import Path
from xml.etree import ElementTree as ET
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.svgLib.path import parse_path
from fontTools.pens.transformPen import TransformPen

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/brand/uppercase-original'
OUT.mkdir(parents=True,exist_ok=True)
font=TTFont(ROOT/'node_modules/@fontsource/cal-sans/files/cal-sans-latin-400-normal.woff')
glyphs,cmap,upm=font.getGlyphSet(),font.getBestCmap(),font['head'].unitsPerEm
INK,PAPER,ORANGE,MUTED='#20211f','#f4f4f2','#ff3301','#62635f'
original=ET.parse(ROOT/'public/ardeno-logo.svg').getroot().find('{http://www.w3.org/2000/svg}path').attrib['d']
pen=BoundsPen(None);parse_path(original,pen)
mx0,my0,mx1,my1=pen.bounds
mw,mh=mx1-mx0,my1-my0

def text(value,x,baseline,size,color=INK):
    paths,advance=[],0
    for char in value:
        glyph=glyphs[cmap[ord(char)]];pen=SVGPathPen(glyphs);glyph.draw(pen)
        paths.append(f'<path fill="{color}" d="{pen.getCommands()}" transform="translate({x+advance*size/upm:.6f} {baseline}) scale({size/upm} {-size/upm})"/>')
        advance+=glyph.width
    return ''.join(paths)

word_bounds=BoundsPen(glyphs);advance=0
for char in 'ARDENO':
    glyph=glyphs[cmap[ord(char)]]
    glyph.draw(TransformPen(word_bounds,(1,0,0,1,advance,0)));advance+=glyph.width
wx0,wy0,wx1,wy1=word_bounds.bounds
word_size=100*upm/(wy1-wy0)
word_width=(wx1-wx0)*word_size/upm
unit_width=100*mw/mh+32+word_width

def mark(x,y,height,color=ORANGE):
    return f'<path fill="{color}" d="{original}" transform="translate({x} {y}) scale({height/mh}) translate({-mx0} {-my0})"/>'

def lockup(x,y,width,color=INK,symbol=ORANGE):
    factor=width/unit_width;height=100*factor;size=word_size*factor
    return mark(x,y,height,symbol)+text('ARDENO',x+(100*mw/mh+32)*factor-wx0*size/upm,y+wy1*size/upm,size,color),height

def save(name,w,h,body,title):
    (OUT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.6f} {h:.6f}" role="img" aria-label="{title}"><title>{title}</title>{body}</svg>',encoding='utf-8')

board=f'<rect width="1600" height="1010" fill="{PAPER}"/>'
board+=text('ardeno / wordmark exploration',64,72,24)
board+=text('Original A + Cal Sans',1245,72,21,MUTED)
board+='<path d="M64 110H1536" stroke="#d8d9d4"/>'
large,height=lockup(104,260,1392)
board+=large
board+=text('ARDENO, in all caps.',64,568,43)
board+=text('The original symbol. A more assertive wordmark.',64,611,23,MUTED)
board+=f'<rect x="64" y="678" width="840" height="252" rx="4" fill="{INK}"/>'
small,h=lockup(118,766,732,PAPER)
board+=small
board+=f'<rect x="928" y="678" width="608" height="252" rx="4" fill="{ORANGE}"/>'
board+=mark(1200,706,64,INK)
word_only_size=67
word_only_width=(wx1-wx0)*word_only_size/upm
board+=text('ARDENO',1232-word_only_width/2-wx0*word_only_size/upm,864,word_only_size,INK)
board+=text('Cal Sans / original A preserved / uppercase concept',64,976,19,MUTED)
save('Ardeno-Uppercase-Original-A.svg',1600,1010,board,'Original Ardeno A with ARDENO in uppercase Cal Sans')
for variant,word_color,mark_color in [('primary',INK,ORANGE),('ink',INK,INK),('reversed',PAPER,ORANGE),('white',PAPER,PAPER)]:
    content,h=lockup(16,16,1000,word_color,mark_color)
    save(f'ardeno-uppercase-{variant}.svg',1032,h+32,content,'ARDENO uppercase Cal Sans logo with the original A')
for name,fixed in [('preview',False),('export',True)]:
    style='width:1600px;height:1010px' if fixed else 'width:100%;height:auto'
    (OUT/f'{name}.html').write_text(f'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ARDENO / original A and uppercase Cal Sans</title><style>html,body{{margin:0;background:{PAPER}}}img{{display:block;{style}}}</style><img src="Ardeno-Uppercase-Original-A.svg" alt="The original Ardeno A paired with ARDENO in all-caps Cal Sans."></html>',encoding='utf-8')
print('Original path retained; uppercase wordmark outlined. Lockup aspect ratio:',round(unit_width/100,3))
