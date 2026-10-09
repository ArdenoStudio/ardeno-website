"""Build Ardeno's Cal Sans identity refresh from the existing, unchanged A path."""
from pathlib import Path
import json, math, shutil, zipfile
from xml.etree import ElementTree as ET
from fontTools.ttLib import TTFont as FontToolsFont
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.reportLabPen import ReportLabPen
from fontTools.svgLib.path import parse_path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader

class CanvasPen(ReportLabPen):
    """FontTools' graphics pen with the PDF canvas path's close method."""
    def _closePath(self):
        self.path.close()

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output' / 'brand'
KIT = OUT / 'Ardeno-Cal-Sans-Brand-Kit-v3'
LOGOS, FONTS = KIT / 'logos', KIT / 'fonts'
for folder in (OUT, LOGOS, FONTS, ROOT / 'tmp' / 'pdfs'):
    folder.mkdir(parents=True, exist_ok=True)

INK, PAPER, SIGNAL, MUTED, RULE, DEEP = '#20211f', '#f4f4f2', '#ff3301', '#62635f', '#d8d9d4', '#151613'
FONT_SOURCE = ROOT / 'node_modules/@fontsource/cal-sans/files/cal-sans-latin-400-normal.woff'
FONT_PATH = FONTS / 'CalSans-Latin-Regular.ttf'
font = FontToolsFont(FONT_SOURCE)
font.flavor = None
font.save(FONT_PATH)
shutil.copy2(ROOT / 'node_modules/@fontsource/cal-sans/LICENSE', FONTS / 'OFL.txt')
shutil.copy2(FONT_SOURCE, FONTS / FONT_SOURCE.name)
pdfmetrics.registerFont(TTFont('CalSans', str(FONT_PATH)))
glyphs, cmap, UPM = font.getGlyphSet(), font.getBestCmap(), font['head'].unitsPerEm
source_logo = ET.parse(ROOT / 'public/ardeno-logo.svg').getroot()
MARK_PATH = source_logo.find('{http://www.w3.org/2000/svg}path').attrib['d']
mark_pen = BoundsPen(None)
parse_path(MARK_PATH, mark_pen)
MX0, MY0, MX1, MY1 = mark_pen.bounds
MW, MH = MX1 - MX0, MY1 - MY0

def glyph_bounds(value):
    pen = BoundsPen(glyphs)
    # Cal Sans's existing font metrics determine the logo; no faux weight or stretching.
    from fontTools.pens.transformPen import TransformPen
    advance = 0
    for char in value:
        glyph = glyphs[cmap[ord(char)]]
        glyph.draw(TransformPen(pen, (1, 0, 0, 1, advance, 0)))
        advance += glyph.width
    return pen.bounds, advance

WORDMARK = 'ardeno'
WB, ADV = glyph_bounds(WORDMARK)
MARK_SIZE, GAP = 100, 32
WORD_SIZE = MARK_SIZE * UPM / (WB[3] - WB[1])
WORD_W = (WB[2] - WB[0]) * WORD_SIZE / UPM
WORD_H = (WB[3] - WB[1]) * WORD_SIZE / UPM
WORD_TOP = (MARK_SIZE - WORD_H) / 2
WORD_BASE = WORD_TOP + WB[3] * WORD_SIZE / UPM
LOCK_W = MARK_SIZE * MW / MH + GAP + WORD_W

def outline_text(value, size, x, baseline, fill):
    pieces, advance = [], 0
    for char in value:
        glyph = glyphs[cmap[ord(char)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(pen)
        pieces.append(f'<path fill="{fill}" d="{pen.getCommands()}" transform="translate({x + advance * size / UPM:.6f} {baseline:.6f}) scale({size / UPM:.6f} {-size / UPM:.6f})"/>')
        advance += glyph.width
    return '\n'.join(pieces)

def svg_mark(x, y, size, fill):
    scale = size / MH
    return f'<path fill="{fill}" d="{MARK_PATH}" transform="translate({x:.6f} {y:.6f}) scale({scale:.8f}) translate({-MX0:.6f} {-MY0:.6f})"/>'

def export_svg(filename, width, height, content, label):
    (LOGOS / filename).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.6f} {height:.6f}" role="img" aria-label="{label}">\n<title>{label}</title>\n{content}\n</svg>\n', encoding='utf-8')

for variant, mark_color, text_color in [('primary', SIGNAL, INK), ('ink', INK, INK), ('reversed', SIGNAL, PAPER), ('white', PAPER, PAPER)]:
    content = svg_mark(8, 8, MARK_SIZE, mark_color) + '\n' + outline_text(WORDMARK, WORD_SIZE, 8 + MARK_SIZE * MW / MH + GAP - WB[0] * WORD_SIZE / UPM, 8 + WORD_BASE, text_color)
    export_svg(f'ardeno-lockup-{variant}.svg', LOCK_W + 16, 116, content, 'Ardeno Studio')
for variant, color in [('ink', INK), ('paper', PAPER), ('signal', SIGNAL)]:
    export_svg(f'ardeno-mark-{variant}.svg', MW + 16, MH + 16, svg_mark(8, 8, MH, color), 'Ardeno symbol')
    export_svg(f'ardeno-wordmark-{variant}.svg', WORD_W + 16, WORD_H + 16, outline_text(WORDMARK, WORD_SIZE, 8 - WB[0] * WORD_SIZE / UPM, 8 + WB[3] * WORD_SIZE / UPM, color), WORDMARK)
shutil.copy2(ROOT / 'public/brand/ardeno-glass-mark-selected.png', KIT / 'ardeno-glass-mark-selected.png')

def lum(hexvalue):
    values = [int(hexvalue[i:i+2],16)/255 for i in (1,3,5)]
    values = [v/12.92 if v <= .04045 else ((v+.055)/1.055)**2.4 for v in values]
    return sum(v*w for v,w in zip(values, (.2126,.7152,.0722)))
def contrast(a,b):
    high, low = sorted((lum(a),lum(b)),reverse=True)
    return (high+.05)/(low+.05)

tokens = {'version':'3.0','wordmark':'ardeno','font':{'family':'Cal Sans','weight':400,'synthesis':'none'},'colors':{'ink':INK,'paper':PAPER,'signal':SIGNAL,'muted':MUTED,'rule':RULE,'onSignal':DEEP},'spacing':[8,16,24,32,48,64,96],'motion':{'feedbackMs':160,'navigationMs':180,'respectReducedMotion':True}}
(KIT / 'brand-tokens.json').write_text(json.dumps(tokens,indent=2)+'\n', encoding='utf-8')
(KIT / 'brand-tokens.css').write_text(':root {\n  --font-display: "Cal Sans", sans-serif;\n  --font-body: "Cal Sans", sans-serif;\n  --font-ui: "Cal Sans", sans-serif;\n'+''.join(f'  --ardeno-{key}: {value};\n' for key,value in tokens['colors'].items())+'}\n.brand-type { font-weight: 400; font-synthesis: none; }\n',encoding='utf-8')

W, H, M = 1080, 675, 48
PDF = OUT / 'Ardeno-Brand-Guidelines-Cal-Sans-v3.pdf'
c = canvas.Canvas(str(PDF), pagesize=(W,H), pageCompression=1)
c.setTitle('Ardeno Studio | Lowercase Cal Sans Brand Guidelines | v3.0')
c.setAuthor('Ardeno Studio')
c.setSubject('An identity refresh retaining the existing A symbol and adopting Cal Sans throughout.')
PAGE = 0
TEXT_BOXES = []

def rect(x,top,w,h,fill,stroke=None):
    c.setFillColor(HexColor(fill))
    c.setStrokeColor(HexColor(stroke or fill))
    c.rect(x,H-top-h,w,h,stroke=bool(stroke),fill=1)

def line(x1,y1,x2,y2,color=RULE,width=.7):
    c.setStrokeColor(HexColor(color)); c.setLineWidth(width)
    c.line(x1,H-y1,x2,H-y2)

def text(value,x,top,size=14,color=INK):
    c.setFillColor(HexColor(color)); c.setFont('CalSans',size)
    baseline = H-top-size*.76
    c.drawString(x,baseline,value)
    width = pdfmetrics.stringWidth(value,'CalSans',size)
    TEXT_BOXES.append((PAGE,value,x,top,width,size))
    if x < M-2 or x+width > W-M+2 or top < 12 or top+size > H-16:
        raise ValueError(f'Text exceeds page: page {PAGE}: {value}')
    return width

def paragraph(value,x,top,width,size=14,color=MUTED,leading=None):
    leading = leading or size*1.5
    lines, current = [], ''
    for word in value.split():
        trial = (current+' '+word).strip()
        if pdfmetrics.stringWidth(trial,'CalSans',size) > width and current:
            lines.append(current); current=word
        else: current=trial
    if current: lines.append(current)
    for i, value in enumerate(lines): text(value,x,top+i*leading,size,color)
    return top + len(lines)*leading

def arrow(x,top,size=16,color=SIGNAL):
    line(x,top+size,x+size,top,color,1.6)
    line(x+size*.3,top,x+size,top,color,1.6)
    line(x+size,top,x+size,top+size*.7,color,1.6)

def mark(x,top,size=100,color=SIGNAL):
    c.saveState(); c.translate(x,H-top); c.scale(size/MH,-size/MH); c.translate(-MX0,-MY0)
    path = c.beginPath(); parse_path(MARK_PATH,CanvasPen(None,path))
    c.setFillColor(HexColor(color)); c.drawPath(path,fill=1,stroke=0)
    c.restoreState()

def lockup(x,top,width=500,mark_color=SIGNAL,word_color=INK):
    scale=width/LOCK_W
    mark(x,top,100*scale,mark_color)
    c.setFillColor(HexColor(word_color)); c.setFont('CalSans',WORD_SIZE*scale)
    c.drawString(x+(100*MW/MH+GAP-WB[0]*WORD_SIZE/UPM)*scale,H-top-WORD_BASE*scale,WORDMARK)
    return width,100*scale

def footer(title,dark=False):
    color = RULE if dark else MUTED
    line(M,H-44,W-M,H-44,'#42433f' if dark else RULE)
    text('ARDENO / BRAND GUIDELINES',M,H-30,10,color)
    text(title,400,H-30,10,color)
    text(f'{PAGE:02d} / 10',W-M-48,H-30,10,color)

def begin(title,dark=False):
    global PAGE
    PAGE+=1
    rect(0,0,W,H,INK if dark else PAPER)
    text(WORDMARK,M,28,23,PAPER if dark else INK)
    text('LOWERCASE IDENTITY / VERSION 3.0',W-285,36,10,RULE if dark else MUTED)
    footer(title,dark)

def end(): c.showPage()

# 01 / Cover
begin('A new chapter.')
text('Brand',M,135,106)
text('guidelines.',M,235,106)
mark(753,143,240)
line(M,411,W-M,411)
lockup(M,455,470)
text('The same symbol.',745,464,19)
text('A clearer voice.',745,492,19)
text('Cal Sans / Signal orange / Independent spirit',M,574,14,MUTED)
text('OCTOBER 2026',833,580,11,MUTED)
end()

# 02 / Brand foundation
begin('The studio.')
text('Small team.',M,132,76)
text('Big ideas.',M,208,76)
paragraph('An independent design and development studio in Colombo. Websites with character. Digital products with purpose.',M,333,480,19,INK,28)
paragraph('Keep the personality direct, curious, and human. The work feels ambitious; the conversation stays straightforward.',M,446,430,14)
for idx,(name,body) in enumerate([
    ('Clear by design.','Use plain language, purposeful layouts, and an obvious next step.'),
    ('Character in the details.','Let the A, the typography, and one strong accent do the talking.'),
    ('Close to the work.','Emphasize direct founder collaboration and thoughtful execution.'),
    ('Playful with purpose.','Use glass, dots, and stickers to add personality around real content.')]):
    top=132+idx*108
    text(f'0{idx+1}',654,top+4,10,MUTED)
    text(name,688,top,23)
    paragraph(body,688,top+37,330,14)
end()

# 03 / Logo family
begin('The identity.')
text('Same A. New wordmark.',M,107,48)
lockup(M,211,770)
paragraph('The existing A path is preserved. ardeno is set in lowercase Cal Sans, with natural spacing and a single weight. This is the selected wordmark.',M,383,830,15)
tiles=[(M,448,302,128,PAPER,'Ink'),(366,448,302,128,INK,'Reversed'),(684,448,348,128,SIGNAL,'Single colour')]
for x,y,w,h,bg,label in tiles:
    rect(x,y,w,h,bg,RULE if bg==PAPER else None)
    if label=='Ink': lockup(x+24,y+35,w-48,INK,INK)
    elif label=='Reversed': lockup(x+24,y+35,w-48,SIGNAL,PAPER)
    else: lockup(x+24,y+35,w-48,DEEP,DEEP)
    text(label,x+24,y+h-25,10,PAPER if bg==INK else INK)
end()

# 04 / Clear space and small sizes
begin('Logo rules.')
text('Give it room.',M,108,52)
x,y,lw=96,237,550
lh=100*lw/LOCK_W
unit=lh*.5
rect(x-unit,y-unit,lw+unit*2,lh+unit*2,PAPER,RULE)
lockup(x,y,lw)
line(x-unit,y-18,x,y-18,SIGNAL)
text('x',x-unit+8,y-40,12,SIGNAL)
text('x = half the symbol height',M,417,14)
paragraph('Keep at least x of clear space on every side. Measure from the visible artwork, not the SVG canvas.',M,450,560,14)
text('Minimum sizes',760,215,23)
text('Full lockup',760,265,14)
text('160 px / 40 mm wide',760,291,13,MUTED)
text('Wordmark only',760,343,14)
text('96 px / 25 mm wide',760,369,13,MUTED)
text('Symbol only',760,421,14)
text('24 px / 6 mm high',760,447,13,MUTED)
paragraph('These are proposed starting limits. Check the actual substrate and the smallest intended screen before release.',760,493,260,12)
line(M,550,687,550)
text('No stretching. No new outlines. No recolouring the glass asset.',M,569,13)
end()

# 05 / Typography
begin('One type family.')
text('Cal Sans.',M,109,85)
text('Aa',M,237,152)
paragraph('One font across the identity: wordmarks, headlines, paragraphs, labels, and interface text.',M,458,410,18,INK,27)
paragraph('Use the installed Regular / 400 cut. Build hierarchy with scale, spacing, and placement. Do not synthesize bold or italic.',M,552,420,12)
samples=[('Display / 64 / 1.0','Big ideas.',64),('Section / 36 / 1.1','Made with care.',36),('Body / 16 / 1.5','Good work starts with a clear conversation.',16),('Label / 12 / 1.4','COLOMBO / EVERYWHERE',12)]
tops=[239,350,441,518]
for (label,value,size),top in zip(samples,tops):
    text(label,558,top-30,10,MUTED)
    text(value,558,top,size)
    if size != 12: line(558,top+size+16,W-M,top+size+16)
text('ABCDEFGHIJKLMNOPQRSTUVWXYZ',M,412,16)
text('abcdefghijklmnopqrstuvwxyz 0123456789',M,435,14,MUTED)
end()

# 06 / Colour
begin('The palette.')
text('Paper. Ink. Signal.',M,108,54)
swatches=[('Paper',PAPER,'244 / 244 / 242'),('Ink',INK,'32 / 33 / 31'),('Signal',SIGNAL,'255 / 51 / 1'),('Muted',MUTED,'98 / 99 / 95'),('Rule',RULE,'216 / 217 / 212')]
for i,(name,color,rgb) in enumerate(swatches):
    x=M+i*200
    rect(x,223,184,142,color,RULE if color==PAPER else None)
    text(name,x,387,20)
    text(color.upper(),x,419,13,MUTED)
    text('RGB '+rgb,x,443,11,MUTED)
line(M,481,W-M,481)
text('Readable by default.',M,509,23)
paragraph(f'Ink on Paper: {contrast(INK,PAPER):.2f}:1. Muted on Paper: {contrast(MUTED,PAPER):.2f}:1. Deep ink #151613 on Signal: {contrast(DEEP,SIGNAL):.2f}:1.',M,549,535,13)
paragraph('For body text, aim for at least 4.5:1. Reserve orange on paper for large type, graphics, and accents; use deep ink for text on orange.',650,509,370,13)
text('Digital RGB masters. Convert print colours with the printer\'s ICC profile.',650,588,10,MUTED)
end()

# 07 / Graphic language
begin('The visual language.')
text('Structure, with a little play.',M,109,47)
rect(M,220,616,355,'#eeeeeb')
def dotted(value,x,top,size,color=MUTED):
    from fontTools.pens.transformPen import TransformPen
    c.saveState()
    path=c.beginPath(); pen=CanvasPen(glyphs,path)
    _,advance=glyph_bounds(value)
    cursor=0
    baseline=H-top-size*.76
    for char in value:
        glyph=glyphs[cmap[ord(char)]]
        glyph.draw(TransformPen(pen,(size/UPM,0,0,size/UPM,x+cursor*size/UPM,baseline)))
        cursor+=glyph.width
    c.clipPath(path,stroke=0,fill=0)
    c.setFillColor(HexColor(color))
    for dx in range(int(x),int(x+advance*size/UPM)+2,3):
        for dy in range(int(baseline-size*.1),int(baseline+size*.85)+2,3): c.circle(dx,dy,.62,stroke=0,fill=1)
    c.restoreState()
dotted('your next',M+25,247,88)
dotted('chapter.',M+25,337,88)
c.saveState(); c.setBlendMode('Multiply')
c.drawImage(ImageReader(str(KIT / 'ardeno-glass-mark-selected.png')),335,H-255-287,width=342,height=287,mask='auto')
c.restoreState()
for idx,(title,body) in enumerate([
    ('Dotted display type','An occasional expressive layer. Keep the message available as live, accessible text.'),
    ('Glass A','A digital expression of the mark. Preserve its supplied colours and transparency; pair with the flat identity.'),
    ('Paper stickers','Small objects can overlap display letters. Keep buttons, body copy, and navigation clear.')]):
    top=225+idx*118
    text(title,720,top,22)
    paragraph(body,720,top+38,305,13)
text('Use generous space, a clear grid, and one focal accent. Avoid visual clutter.',M,588,12,MUTED)
end()

# 08 / Voice
begin('How Ardeno sounds.')
text('Confident. Curious. Human.',M,109,48)
paragraph('Talk like the people doing the work. Be specific about the offer and honest about what has been made.',M,188,750,18,INK,27)
left,right=48,574
text('Say it plainly.',left,293,28)
text('Leave the noise behind.',right,293,28)
examples=[('Websites with character.','We create groundbreaking digital experiences.'),('Tell us what you have in mind.','Unlock limitless possibilities with our solutions.'),('Designed and built with the founders.','An award-winning team trusted by everyone.')]
for idx,(yes,no) in enumerate(examples):
    top=360+idx*71
    line(left,top-17,510,top-17)
    line(right,top-17,1032,top-17)
    text(yes,left,top,17)
    paragraph(no,right,top,450,15,MUTED,21)
paragraph('Use sentence case for everyday copy. Set the wordmark as ardeno; uppercase also suits short editorial headlines and labels. Call the brand Ardeno Studio in prose.',M,587,975,12)
end()

# 09 / Applications
begin('The identity in use.')
text('One system. Many surfaces.',M,109,48)
# A two-sided card sample, with real existing business details.
rect(M,221,340,183,INK)
mark(M+136,267,91,SIGNAL)
rect(M,420,340,183,PAPER,RULE)
lockup(M+24,447,190)
text('Independent digital studio',M+24,505,12)
text('Colombo, Sri Lanka',M+24,536,11,MUTED)
text('hello@ardenostudio.com',M+24,562,11)
text('Business card / front and back',M,614,10,MUTED)
# Social post, original copy and a single focal symbol.
rect(422,221,320,382,SIGNAL)
text(WORDMARK,446,248,25,DEEP)
text('Small team.',446,330,38,DEEP)
text('Big ideas.',446,375,38,DEEP)
mark(611,479,105,DEEP)
text('Studio post / sample composition',422,614,10,MUTED)
# Email signature / small identity context.
rect(776,221,256,382,PAPER,RULE)
text('Signature',796,246,17)
line(796,278,1012,278)
lockup(796,308,196)
text('Ardeno Studio',796,393,18)
paragraph('Design and development, directly with the founders.',796,431,210,13)
text('Colombo, Sri Lanka',796,513,11,MUTED)
paragraph('hello@ardenostudio.com',796,545,210,11,INK)
text('Email / sample composition',776,614,10,MUTED)
end()

# 10 / Handover
begin('Using the kit.',True)
text('Ready for the next chapter.',M,108,49,PAPER)
text('Your starting kit',M,209,26,PAPER)
for i,(title,body) in enumerate([
    ('10 outlined SVGs','Horizontal lockups, standalone wordmarks, and the unchanged A in light and dark variants.'),
    ('Cal Sans font files','The site\'s installed Latin subset as WOFF and TTF, with the SIL Open Font License.'),
    ('Colour and spacing tokens','JSON and CSS starters. Include the colour roles and use real font-weight 400.'),
    ('Selected glass A','The supplied PNG is included unchanged for digital compositions.')]):
    top=262+i*74
    text(title,M,top,18,PAPER)
    paragraph(body,M,top+30,496,12,RULE,17)
text('Rollout checklist',650,209,26,PAPER)
for i,value in enumerate([
    'Replace mixed-font wordmarks with the new masters.',
    'Use Cal Sans across the website, proposals, and socials.',
    'Retire the old dark-red palette as each asset is updated.',
    'Keep the A geometry and logo proportions intact.',
    'Check small sizes, contrast, and print proofs.',
    'Use the selected lowercase ardeno wordmark consistently.'
]):
    top=266+i*43
    rect(650,top+3,5,5,SIGNAL)
    paragraph(value,671,top,355,13,RULE,18)
text('Sources and production notes',650,552,13,PAPER)
text('Cal Sans: github.com/calcom/sans',650,578,11,RULE)
text('Contrast: W3C WCAG 2.2 / SC 1.4.3',650,598,11,RULE)
c.linkURL('https://github.com/calcom/sans',(650,H-592,1000,H-574),relative=0)
c.linkURL('https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',(650,H-612,1032,H-596),relative=0)
end()
c.save()

GUIDE_MD = f'''# Ardeno Studio - Cal Sans identity refresh

Version 3.0 - 6 October 2026. Selected identity: original A with lowercase ardeno in Cal Sans. Replaces the uppercase direction in version 2; public rollout remains a separate step.

## Foundation

Ardeno is an independent design and development studio in Colombo. The identity is direct, thoughtful, and playful around the edges. Use real work, direct founder collaboration, and clear scope as proof. Avoid invented clients, awards, or results.

## Logo

The A is the exact existing path from public/ardeno-logo.svg, normalized only to a tighter export canvas. Its shape is unchanged. The selected lowercase ardeno wordmark uses Cal Sans's real glyphs and natural spacing. SVG text is outlined so it renders without installed fonts. Use the primary horizontal orange A / ink wordmark on paper; use reversed on ink, and monochrome variants when required. Match the wordmark's visible wordmark height to the symbol height in the horizontal lockup, with a gap of 0.32 times the symbol height. The supplied glass A is a digital expression, not the small-size master.

Clear space: at least half the symbol height around visible artwork. Proposed minimums: full lockup 160 px / 40 mm wide; wordmark 96 px / 25 mm wide; symbol 24 px / 6 mm high. Verify the actual application. Never stretch, redraw, add outlines, or change the supplied glass asset's colours.

## Typography

Use Cal Sans throughout, at the installed Regular / 400 weight. Do not synthesize bold or italic. Suggested digital hierarchy: display 64-160 px / line-height 1.0; section 36-64 px / 1.1; body 16 px / 1.5; labels 12 px / 1.4. Use scale and space for emphasis. Keep normal letter spacing. Use ardeno in the wordmark; uppercase also suits short editorial headlines and labels. Everyday copy uses sentence case. Native live text remains accessible, even where a decorative dotted layer or sticker overlaps a headline.

The packaged fonts are the installed Fontsource Latin subset; use the official Cal Sans repository if extended language coverage is needed. The included font files retain the SIL Open Font License. [Official Cal Sans source](https://github.com/calcom/sans).

## Colour

| Role | HEX | RGB | Use |
| --- | --- | --- | --- |
| Paper | {PAPER.upper()} | 244, 244, 242 | Main background |
| Ink | {INK.upper()} | 32, 33, 31 | Primary type and dark surfaces |
| Signal | {SIGNAL.upper()} | 255, 51, 1 | Focal accents and brand mark |
| Muted | {MUTED.upper()} | 98, 99, 95 | Supporting readable text |
| Rule | {RULE.upper()} | 216, 217, 212 | Dividers; not body text |
| Deep ink | {DEEP.upper()} | 21, 22, 19 | Small text on orange |

Measured contrast: ink/paper {contrast(INK,PAPER):.2f}:1; muted/paper {contrast(MUTED,PAPER):.2f}:1; deep ink/signal {contrast(DEEP,SIGNAL):.2f}:1. Normal text needs at least 4.5:1; large text at least 3:1 under [WCAG 2.2 Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Orange/paper is {contrast(SIGNAL,PAPER):.2f}:1; reserve it for large text and accents. Print colours should be converted using the printer's ICC profile and verified on a proof.

## Graphic system

Use a clear grid, generous space, oversized type, one orange focal accent, and the unchanged glass A for expressive digital compositions. Dotted type is an occasional display treatment; plain text carries the accessible message. Photographic paper stickers can overlap display letters, while controls and essential body copy stay clear. Avoid gradients, invented symbol variants, and decorative overload. Use an 8 px spacing base. Feedback generally lasts 160 ms, navigation 180 ms; respect reduced-motion preferences.

## Voice

Confident, curious, and human. Prefer 'Websites with character', 'Tell us what you have in mind', and 'Designed and built with the founders' to vague claims about disruption or limitless possibilities. Write Ardeno Studio in prose and ardeno in the wordmark. Show existing live platforms and studio concepts honestly.

## Applications and rollout

The PDF shows sample business cards, a studio social post, and an email signature. They are layout examples, not print-ready artwork. The selected lowercase wordmark is now used on the local website and in this asset kit. Use these masters for proposals, signatures, and social profiles; check sizes, print proofs, contrast, and consistency before publishing. Earlier kits are retained as previous explorations.

## Package

- logos/: 10 SVG masters, all font outlines and original A geometry.
- fonts/: installed Cal Sans Latin WOFF, TTF conversion, and OFL.txt.
- ardeno-glass-mark-selected.png: the user-selected asset, unchanged.
- brand-tokens.json and brand-tokens.css: implementation starter values.
- Brand-Guidelines.md: editable source guidance.
- Ardeno-Brand-Guidelines-Cal-Sans-v3.pdf: visual 10-page guide.

Generated with scripts/create-brand-guide.py. Website wordmark changes are maintained separately in the website components.
'''
(KIT / 'Brand-Guidelines.md').write_text(GUIDE_MD,encoding='utf-8')
shutil.copy2(PDF,KIT / PDF.name)
with zipfile.ZipFile(OUT / 'Ardeno-Cal-Sans-Brand-Kit-v3.zip','w',zipfile.ZIP_DEFLATED) as z:
    for path in sorted(KIT.rglob('*')):
        if path.is_file(): z.write(path,path.relative_to(OUT))
audit={'pages':PAGE,'logoFiles':len(list(LOGOS.glob('*.svg'))),'pdfBytes':PDF.stat().st_size,'contrast':{f'{a}/{b}':contrast(a,b) for a,b in [(INK,PAPER),(MUTED,PAPER),(DEEP,SIGNAL),(SIGNAL,PAPER)]},'textBoxes':len(TEXT_BOXES),'markPathUnchanged':all(MARK_PATH in f.read_text() for f in LOGOS.glob('ardeno-mark-*.svg'))}
(ROOT/'tmp/pdfs/brand-guide-audit.json').write_text(json.dumps(audit,indent=2),encoding='utf-8')
print(json.dumps(audit,indent=2))
