# CHS portfolio source

The CHS project page includes the existing website and the branding work in the client's **Brand Guidelines** folder. The source files are preserved; the site uses separate optimized WebP copies and native logo SVGs.

The gallery covers 47 selected application views in six families: people, fleet, packaging/equipment, signage/spaces, print/communication and service illustrations. Earlier iterations, blank photographs, internal QA crops and third-party reference photographs are excluded. The four-view shirt and van sets and the selected quality application set supply the latest examples in their families. The tabletop cap is used because the file named `chs-embroidered-cap-detail-v1.png` depicts a shirt pocket.

The Clear Care application route retains the CHS symbol. The source master colours are navy `#063362`, green `#087D2A` and white. The documented font pairing is Cal Sans and Inter. Foundation studies and the formal logo refresh comparison are available in the identity study disclosure.

The supplied guide and application README describe the physical applications as concept studies, including generated imagery and fictional sample contact details. The page preserves that distinction. The live website is a separate completed deliverable. The 40-page guideline, two-page quick reference and foundation studies are copied as PDFs and only load when a visitor opens their links.

To regenerate the portfolio assets, run `scripts/prepare-chs-branding.py` with the client's `Brand Guidelines` folder as its argument. It requires Pillow and does not change the source work.
