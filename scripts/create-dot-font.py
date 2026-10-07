"""Build Ardeno Dot: a display-only, dotted derivative of the installed Cal Sans."""
from io import BytesIO
from pathlib import Path
import json
import math
import shutil
import zipfile

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont, newTable
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
KIT = ROOT / 'output/brand/Ardeno-Dot-Font'
PUBLIC = ROOT / 'public/brand/fonts'
KIT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)
source = TTFont(ROOT / 'node_modules/@fontsource/cal-sans/files/cal-sans-latin-400-normal.woff')
source.flavor = None
stream = BytesIO()
source.save(stream)
stream.seek(0)
upm = source['head'].unitsPerEm
raster_font = ImageFont.truetype(stream, upm)
cmap = source.getBestCmap()
pitch, radius = 22, 5.1  # Coarser dots remain distinct at responsive display sizes.
coordinate_scale = 4  # Give small circle curves enough precision after rasterization.
glyph_order = ['.notdef'] + list(dict.fromkeys(cmap.values()))
glyphs, metrics, counts = {}, {}, {}


def circle(pen, x, y):
    def point(px, py):
        return round(px * coordinate_scale), round(py * coordinate_scale)

    pen.moveTo(point(x + radius, y))
    for arc in range(8):
        middle = (arc + .5) * math.pi / 4
        end = (arc + 1) * math.pi / 4
        control_radius = radius / math.cos(math.pi / 8)
        pen.qCurveTo(
            point(x + control_radius * math.cos(middle), y + control_radius * math.sin(middle)),
            point(x + radius * math.cos(end), y + radius * math.sin(end)),
        )
    pen.closePath()


for name in glyph_order:
    pen = TTGlyphPen(None)
    characters = [chr(code) for code, glyph in cmap.items() if glyph == name]
    dots = 0
    if name == '.notdef':
        for x in range(44, 419, pitch):
            for y in range(0, 661, pitch):
                if x in (44, 418) or y in (0, 660):
                    circle(pen, x, y)
                    dots += 1
    elif characters:
        char = characters[0]
        left, top, right, bottom = raster_font.getbbox(char, anchor='ls')
        if right > left and bottom > top:
            mask = Image.new('L', (right - left + 2, bottom - top + 2))
            ImageDraw.Draw(mask).text((-left, -top), char, font=raster_font, anchor='ls', fill=255)
            pixels = mask.load()
            # Keep whole dots inside the original silhouette, including counters.
            for x in range(math.ceil(left / pitch) * pitch, right, pitch):
                for y in range(math.ceil(-bottom / pitch) * pitch, -top, pitch):
                    px, py = x - left, -y - top
                    edge = math.ceil(radius)
                    probes = ((px, py), (px - edge, py), (px + edge, py), (px, py - edge), (px, py + edge))
                    if all(0 <= a < mask.width and 0 <= b < mask.height and pixels[a, b] >= 200 for a, b in probes):
                        circle(pen, x, y)
                        dots += 1
    glyph = pen.glyph()
    glyphs[name] = glyph
    # Preserve the source advance width; derive bearings from the new dot outlines.
    advance = source['hmtx'][name][0] if name in source['hmtx'].metrics else 460
    if dots:
        glyph.recalcBounds(None)
    metrics[name] = (advance * coordinate_scale, glyph.xMin if dots else 0)
    counts[name] = dots

builder = FontBuilder(upm * coordinate_scale, isTTF=True)
builder.setupGlyphOrder(glyph_order)
builder.setupCharacterMap(cmap)
builder.setupGlyf(glyphs)
builder.setupHorizontalMetrics(metrics)
builder.setupHorizontalHeader(ascent=source['hhea'].ascent * coordinate_scale,
                              descent=source['hhea'].descent * coordinate_scale,
                              lineGap=source['hhea'].lineGap * coordinate_scale)
builder.setupNameTable({
    'familyName': 'Ardeno Dot', 'styleName': 'Regular',
    'uniqueFontIdentifier': 'ArdenoDot-Regular-1.100',
    'fullName': 'Ardeno Dot Regular', 'psName': 'ArdenoDot-Regular',
    'version': 'Version 1.100',
    'copyright': 'Original Cal Sans: Copyright 2021 The Cal Sans Project Authors (https://github.com/calcom/font). Dotted derivative: Ardeno Studio, 2026.',
    'description': 'Dotted display derivative of Cal Sans. An independent Ardeno Studio modification; not an official Cal Sans release.',
    'licenseDescription': (ROOT / 'node_modules/@fontsource/cal-sans/LICENSE').read_text(encoding='utf-8'),
    'licenseInfoURL': 'https://openfontlicense.org',
})
original_os2 = source['OS/2']
builder.setupOS2(sTypoAscender=original_os2.sTypoAscender * coordinate_scale,
                 sTypoDescender=original_os2.sTypoDescender * coordinate_scale,
                 sTypoLineGap=original_os2.sTypoLineGap * coordinate_scale,
                 usWinAscent=original_os2.usWinAscent * coordinate_scale,
                 usWinDescent=original_os2.usWinDescent * coordinate_scale,
                 sxHeight=original_os2.sxHeight * coordinate_scale,
                 sCapHeight=original_os2.sCapHeight * coordinate_scale, usWeightClass=400, fsType=0)
builder.setupPost()
builder.setupMaxp()
font = builder.font
font['gasp'] = newTable('gasp')
font['gasp'].gaspRange = {65535: 10}  # Grayscale smoothing, without grid-fitting tiny dots.
font.save(KIT / 'ArdenoDot-Regular.ttf')
font.flavor = 'woff'
font.save(KIT / 'ArdenoDot-Regular.woff')
shutil.copy2(KIT / 'ArdenoDot-Regular.woff', PUBLIC / 'ardeno-dot-regular.woff')
shutil.copy2(ROOT / 'node_modules/@fontsource/cal-sans/LICENSE', KIT / 'OFL.txt')
shutil.copy2(KIT / 'OFL.txt', PUBLIC / 'ardeno-dot-OFL.txt')
(KIT / 'README.md').write_text('''# Ardeno Dot

A real installable dotted display font derived from the website's Cal Sans Regular.
Version 1.100 uses larger, more separated dots and precise curves to reduce screen moire.
It retains Cal Sans's character widths and vertical metrics. Each glyph consists
of small closed dot outlines, rather than a texture applied over solid letters.

Install ArdenoDot-Regular.ttf for desktop design software. Use the WOFF for web.
Includes the 224 Unicode characters supported by the source Latin font: uppercase,
lowercase, digits, punctuation, and its accented Latin characters. Best at 100px
and larger. Use standard Cal Sans for body copy and the primary wordmark.

```css
@font-face {
  font-family: "Ardeno Dot";
  src: url("ArdenoDot-Regular.woff") format("woff");
  font-weight: 400;
  font-style: normal;
}
.dotted-heading { font-family: "Ardeno Dot", sans-serif; font-weight: 400; }
```

Independent modification by Ardeno Studio, not an official Cal Sans release.
Distributed under the SIL Open Font License 1.1; keep OFL.txt with the font.
Source: the installed @fontsource/cal-sans 5.3.0 Latin Regular font.
Rebuild using scripts/create-dot-font.py (FontTools and Pillow).
''', encoding='utf-8')
with zipfile.ZipFile(ROOT / 'output/brand/Ardeno-Dot-Font.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted(KIT.iterdir()):
        archive.write(path, f'Ardeno-Dot-Font/{path.name}')
print(json.dumps({'characters': len(cmap), 'glyphs': len(glyph_order), 'dots': sum(counts.values()),
                  'webFontBytes': (PUBLIC / 'ardeno-dot-regular.woff').stat().st_size,
                  'heroGlyphDotCounts': {c: counts[cmap[ord(c)]] for c in 'yournextchap.'}}, indent=2))
