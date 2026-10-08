"""Prepare portfolio copies from the CHS client folder; never modify the source work."""
import argparse
import json
import shutil
from pathlib import Path
from PIL import Image, ImageDraw

parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path, help='CHS Brand Guidelines folder')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
destination = root / 'public/images/projects/ceylon-hygiene'
destination.mkdir(parents=True, exist_ok=True)

# Selected versions across every application family, excluding superseded iterations,
# blank generation inputs, third-party reference photos and internal QA crops.
groups = [
    ('people', 'Uniforms & people', [
        ('shirt-mannequin-four-views-v1/chs-shirt-three-quarter-v1.png', 'Work shirt · three-quarter', 'CHS navy and white work shirt on a mannequin, viewed at an angle'),
        ('shirt-mannequin-four-views-v1/chs-shirt-front-v1.png', 'Work shirt · front', 'Front view of the CHS work shirt with its chest identity'),
        ('shirt-mannequin-four-views-v1/chs-shirt-back-v1.png', 'Work shirt · back', 'Back view of the CHS branded work shirt'),
        ('shirt-mannequin-four-views-v1/chs-shirt-side-v1.png', 'Work shirt · side', 'Side view of the CHS work shirt'),
        ('chs-embroidered-cap-tabletop-v1.png', 'Embroidered cap', 'CHS monogram and company name embroidered onto a navy cap'),
        ('chs-staff-badge-lanyard-v1.png', 'Staff ID & lanyard', 'CHS staff identification badge and branded lanyard concept'),
        ('chs-quality-applications-v1/04-uniform-seam-label.png', 'Uniform seam label', 'A small CHS woven label attached to a garment seam'),
        ('chs-quality-applications-v1/05-linen-woven-tag.png', 'Linen woven tag', 'CHS woven identity tag attached to folded linen'),
        ('chs-quality-applications-v1/06-staff-kit.png', 'Staff essentials', 'CHS staff tote bag, drink bottle and towel concept'),
    ]),
    ('fleet', 'Vehicles & fleet', [
        ('van-four-views-v1/chs-van-side-v1.png', 'Service van · side', 'Side view of a CHS service van wrap concept in navy, green and white'),
        ('van-four-views-v1/chs-van-front-v1.png', 'Service van · front', 'Front view of the CHS service van concept'),
        ('van-four-views-v1/chs-van-rear-v1.png', 'Service van · rear', 'Rear view of the CHS service van concept'),
        ('van-four-views-v1/chs-van-rear-three-quarter-v1.png', 'Service van · three-quarter', 'Rear three-quarter view of the CHS service van concept'),
        ('chs-truck-refined-wrap-v2-clean.png', 'Supply truck', 'CHS branded supply truck wrap concept'),
    ]),
    ('equipment', 'Packaging & equipment', [
        ('chs-quality-applications-v1/12-spray-refill-kit-v2.png', 'Spray & refill kit', 'CHS branded spray bottle and refill packaging concept'),
        ('chs-quality-applications-v1/13-bulk-supply-carton-v2.png', 'Bulk container & carton', 'CHS bulk supply container and cardboard carton concept'),
        ('chs-working-containers-concept-v2.png', 'Working containers', 'CHS identity applied to working cleaning containers'),
        ('chs-bulk-held-container-v5-realism.png', 'Container in use', 'A gloved hand holding a CHS branded supply container concept'),
        ('chs-bottle-refill-family-v2-realism.png', 'Bottle & refill family', 'A coordinated family of CHS working bottles and refills'),
        ('chs-textile-storage-concept-v1.png', 'Cloths & storage', 'Organised cleaning textiles and storage carrying the CHS identity'),
        ('chs-janitorial-trolley-concept-v1.png', 'Janitorial trolley', 'CHS branded janitorial trolley with an organised cleaning kit'),
        ('chs-floor-kit-concept-v1.png', 'Floor-care kit', 'CHS floor-care equipment concept'),
        ('chs-washroom-dispenser-concept-v1.png', 'Washroom dispenser', 'CHS identity applied to a washroom dispenser and service touchpoint'),
    ]),
    ('places', 'Signage & spaces', [
        ('chs-quality-applications-v1/03-facade-sign.png', 'Facade sign', 'Dimensional CHS monogram and company lettering on a building facade'),
        ('chs-quality-applications-v1/07-reception.png', 'Reception identity', 'CHS identity applied to a reception wall and desk'),
        ('chs-quality-applications-v1/08-storefront-window.png', 'Window vinyl', 'CHS logo and service lettering applied to storefront glass'),
        ('chs-quality-applications-v1/09-entrance-signage.png', 'Entrance signage', 'CHS entrance wall signage and glass monogram concept'),
        ('chs-safety-onsite-signs-concept-v1.png', 'On-site safety signs', 'CHS branded on-site cleaning and safety sign concepts'),
        ('chs-feather-banners-v1.png', 'Feather banners', 'CHS identity on outdoor feather banner concepts'),
        ('chs-outdoor-poster-v1.png', 'Outdoor poster', 'CHS service message and brand identity on an outdoor poster concept'),
    ]),
    ('communication', 'Print & communication', [
        ('chs-quality-applications-v1/01-service-agreement.png', 'Service agreement & folder', 'CHS service agreement sheets and presentation folder concept'),
        ('chs-quality-applications-v1/02-operating-procedure.png', 'Operating procedure', 'CHS branded operating procedure document concept'),
        ('chs-quality-applications-v1/11-letterhead.png', 'Letterhead', 'CHS letterhead with restrained identity and supporting details'),
        ('chs-quality-applications-v1/10-email-signature.png', 'Email signature', 'CHS email signature layout with sample contact details'),
        ('chs-gloved-brand-card-v2.png', 'Business card · front', 'A gloved hand holding the front of a CHS branded business card concept'),
        ('chs-gloved-brand-card-reverse-v1.png', 'Business card · reverse', 'Reverse side of a CHS business card concept'),
        ('chs-promotional-kit-concept-v1.png', 'Promotional kit', 'CHS branded promotional and everyday items concept'),
        ('../../tmp/pdfs/page-32.png', 'Proposal & service overview', 'CHS brand guideline spread showing proposal and service overview layouts'),
        ('../../tmp/pdfs/page-33.png', 'Quotation & invoice', 'CHS brand guideline spread showing quotation and invoice layouts'),
        ('../../tmp/pdfs/page-34.png', 'Daily records', 'CHS brand guideline spread showing daily operational record layouts'),
        ('../../tmp/pdfs/page-36.png', 'Social & digital layouts', 'CHS brand guideline spread showing social and digital communication concepts'),
    ]),
    ('illustrations', 'Service illustrations', [
        ('chs-floor-kit-concept-v1.png', 'Floor care', 'CHS visual concept for floor-care tools'),
        ('workplace-care-chs-colours-v1.png', 'Workplace care', 'Workplace cleaning illustration in the CHS brand colours'),
        ('washroom-care-chs-colours-v2.png', 'Washroom care', 'Washroom maintenance illustration in the CHS brand colours'),
        ('glass-cleaning-chs-colours-v4.png', 'Glass & touchpoints', 'Glass cleaning illustration in the CHS brand colours'),
        ('pantry-care-chs-colours-v1.png', 'Pantry care', 'Pantry care illustration in the CHS brand colours'),
        ('manpower-chs-colours-v1.png', 'People & planning', 'Staffing and manpower illustration in the CHS brand colours'),
    ]),
]

data = []
sheet_images = []
for group_id, label, items in groups:
    assets = []
    for index, (filename, title, alt) in enumerate(items, 1):
        source = (args.source / 'assets/mockups' / filename).resolve()
        stem = f'{group_id}-{index:02}'
        with Image.open(source) as original:
            image = original.copy()
            image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
            image.save(destination / f'{stem}.webp', 'WEBP', quality=87, method=6)
            width, height = image.size
            image.thumbnail((800, 800), Image.Resampling.LANCZOS)
            image.save(destination / f'{stem}-small.webp', 'WEBP', quality=82, method=6)
            preview = image.convert('RGB')
            preview.thumbnail((230, 155))
            sheet_images.append((preview, stem + ' ' + title))
        assets.append({'id': stem, 'title': title, 'alt': alt, 'src': f'/images/projects/ceylon-hygiene/{stem}.webp', 'width': width, 'height': height})
    data.append({'id': group_id, 'label': label, 'items': assets})

for source, filename in [
    ('output/brand-directions/chs-direction-01-lockup.svg', 'clear-care-logo.svg'),
    ('output/brand-directions/chs-direction-01-lockup-white-green.svg', 'clear-care-logo-reversed.svg'),
    ('assets/logo/chs-monogram.svg', 'monogram.svg'),
]:
    shutil.copyfile(args.source / source, destination / filename)
for source, filename in [
    ('output/brand-directions/CHS-brand-direction-comparison.png', 'identity-directions.webp'),
    ('assets/logo/chs-logo-refresh-comparison.png', 'logo-refresh.webp'),
    ('tmp/pdfs/page-01.png', 'guidelines-cover.webp'),
]:
    with Image.open(args.source / source) as image:
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        image.save(destination / filename, 'WEBP', quality=90, method=6)
downloads = root / 'public/projects/ceylon-hygiene'
downloads.mkdir(parents=True, exist_ok=True)
for name in ['CHS-brand-guidelines-v1.pdf', 'CHS-brand-quick-reference-v1.pdf', 'CHS-brand-foundation-directions.pdf']:
    shutil.copyfile(args.source / 'output/pdf' / name, downloads / name)
(root / 'data/chs-branding.json').write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

# Contact sheet for visual review of the selected local artwork.
sheet = Image.new('RGB', (1250, ((len(sheet_images) + 4) // 5) * 190), '#eeeeea')
draw = ImageDraw.Draw(sheet)
for index, (image, label) in enumerate(sheet_images):
    x, y = (index % 5) * 250, (index // 5) * 190
    sheet.paste(image, (x + (250 - image.width) // 2, y + 5))
    draw.text((x + 8, y + 163), label, fill='#242424')
(root / 'tmp').mkdir(exist_ok=True)
sheet.save(root / 'tmp/chs-branding-contact-sheet.jpg', quality=88)
print(f'Prepared {sum(len(group[2]) for group in groups)} application images and three PDF documents.')
