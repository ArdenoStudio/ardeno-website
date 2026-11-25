import React, { useRef, useState } from 'react';
import { ArrowUpRight, ShieldCheck, SprayCan, type LucideIcon } from 'lucide-react';
import { useReveal } from './interactions';

// Featured work on the homepage, as boards of tiles (a photo, palette, typefaces, statement, logo, a strip and a tall photo) with a caption.
// The tile plan follows the Blent case study the user picked on Pinterest; everything in a board is the client's own.
//  - Ceylon Hygiene Solutions opens Selected work: the Clear Care direction ChsBranding.tsx explores on its project page, plus screens of
//    the live website. It leads to the project page.
// Styles: brandBoard.css (imported in ArdenoWebsite.tsx after website.css).

type Picture = { src: string; alt: string; place?: string; ground?: string; fit?: 'contain' };
type Chip = { Icon: LucideIcon; bg: string; fg: string };
type Board = {
  id: string;
  title: string;
  kind: string;
  href: string;
  more: string;
  note: string;
  mirrored?: boolean;
  card: Picture;
  wide: Picture;
  palette: { name: string; hex: string }[];
  statement: { bg: string; fg: string; parts: (string | Chip)[] };
  logo: { src: string; width: number; height: number; size: string; bg: string };
  strip: { bg: string; columns: string; phoneColumns: string; shots: Picture[] };
  tall: Picture;
  faces: [string, string];
};

const CHS = '/images/projects/ceylon-hygiene';

export const CHS_BOARD: Board = {
  id: 'ceylon-hygiene',
  title: 'Ceylon Hygiene Solutions',
  kind: 'Featured work · Brand identity & website',
  href: '/projects/ceylon-hygiene',
  more: 'See the whole identity',
  note: 'Card, fleet, stationery, cap and kit images are AI-generated design concepts.',
  card: { src: `${CHS}/communication-05-small.webp`, alt: 'Concept: a gloved hand holding a navy CHS business card', place: '50% 18%', ground: '#d4d4d4' },
  wide: { src: `${CHS}/fleet-05.webp`, alt: 'Concept: a CHS trailer seen from above', place: '50% 56%', ground: '#0b1a30' },
  palette: [{ name: 'Navy', hex: '#063362' }, { name: 'Green', hex: '#087D2A' }, { name: 'White', hex: '#FFFFFF' }],
  statement: { bg: '#063362', fg: '#ffffff', parts: ['Complete', { Icon: SprayCan, bg: '#087d2a', fg: '#ffffff' }, 'care, total', { Icon: ShieldCheck, bg: '#ffffff', fg: '#063362' }, 'confidence'] },
  logo: { src: `${CHS}/clear-care-logo.svg`, width: 860, height: 420, size: '80%', bg: '#d2dde9' },
  strip: {
    bg: '#0b1a30', columns: '1fr 1.75fr 1fr .62fr', phoneColumns: '1fr 1.9fr .66fr',
    shots: [
      { src: `${CHS}/communication-03-small.webp`, alt: 'Concept: CHS letterhead on navy', place: '50% 42%' },
      { src: '/images/boards/ceylon-hygiene/s1.webp', alt: 'The live CHS website', place: '0 0' },
      { src: `${CHS}/people-05-small.webp`, alt: 'Concept: a navy CHS cap', place: '50% 72%' },
      { src: '/images/boards/ceylon-hygiene/m1.webp', alt: 'The live CHS website on a phone', place: '0 0' },
    ],
  },
  tall: { src: `${CHS}/people-09-small.webp`, alt: 'Concept: a CHS kit bag with a branded bottle and towel', ground: '#063362' },
  faces: ['Display', 'Supporting type'],
};

const ALPHABET = ['Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm', 'Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz', '0 1 2 3 4 5 6 7 8 9'];
const order = (i: number, extra?: React.CSSProperties) => ({ '--i': i, ...extra }) as React.CSSProperties;
const Cover = ({ picture }: { picture: Picture }) => <img className="board-cover" src={picture.src} alt={picture.alt} style={{ objectPosition: picture.place }} loading="lazy" decoding="async" />;

// The palette's dots name their colour on hover, focus or tap.
function Palette({ colours }: { colours: Board['palette'] }) {
  const [active, setActive] = useState<number | null>(null);
  const colour = active === null ? null : colours[active];
  return <div className="board-palette" role="group" aria-label="Colour palette" onPointerLeave={() => setActive(null)}>
    <div className="board-dots">{colours.map((item, i) => <button key={item.hex} type="button" style={{ background: item.hex }} aria-label={`${item.name}, ${item.hex}`} aria-pressed={active === i} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} onClick={() => setActive(i)} />)}</div>
    <span className="board-hex" data-show={colour ? '' : undefined} aria-hidden="true">{colour ? `${colour.name} ${colour.hex}` : ' '}</span>
  </div>;
}

export function BrandBoard({ board }: { board: Board }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, 0.05);
  const external = /^https?:/.test(board.href);
  const link = { href: board.href, ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}) };
  const { statement, logo, strip } = board;
  return <article ref={ref} className={board.mirrored ? 'brand-board is-mirrored' : 'brand-board'} aria-labelledby={`board-${board.id}`}>
    <div className="board-grid">
      <div className="board-tile board-card" style={order(0, { background: board.card.ground })}><Cover picture={board.card} /></div>
      <div className="board-tile board-wide" style={order(1, { background: board.wide.ground })}><Cover picture={board.wide} /><Palette colours={board.palette} /></div>
      <div className="board-tile board-type" style={order(2)}>{['Cal Sans', 'Inter'].map((name, i) => <div key={name} className={`board-face ${i ? 'is-inter' : 'is-display'}`}>
        <strong>{name}</strong><small>{board.faces[i]}</small>
        <p aria-hidden="true">{ALPHABET.map(line => <span key={line}>{line}</span>)}</p>
      </div>)}</div>
      <div className="board-tile board-statement" style={order(3, { background: statement.bg, color: statement.fg })}>
        <p>{statement.parts.map((part, i) => typeof part === 'string'
          ? <React.Fragment key={i}>{part} </React.Fragment>
          : <React.Fragment key={i}><span className="board-chip" style={{ background: part.bg, color: part.fg }} aria-hidden="true"><part.Icon strokeWidth={2.2} /></span>{' '}</React.Fragment>)}</p>
      </div>
      <a className="board-tile board-logo" style={order(4, { background: logo.bg })} {...link} aria-label={external ? `Visit the ${board.title} website (opens in a new tab)` : `View the ${board.title} project`}><img src={logo.src} alt="" width={logo.width} height={logo.height} style={{ width: logo.size }} loading="lazy" decoding="async" /><span className="board-open" aria-hidden="true"><ArrowUpRight size={24} /></span></a>
      <div className="board-tile board-strip" style={order(5, { background: strip.bg })}>
        <div className="board-shots" style={{ '--columns': strip.columns, '--phone-columns': strip.phoneColumns } as React.CSSProperties}>{strip.shots.map(shot => <img key={shot.src} src={shot.src} alt={shot.alt} style={{ objectPosition: shot.place, background: shot.ground, objectFit: shot.fit }} loading="lazy" decoding="async" />)}</div>
      </div>
      <div className="board-tile board-tall" style={order(6, { background: board.tall.ground })}><Cover picture={board.tall} /></div>
    </div>
    <div className="board-caption">
      <div><h3 id={`board-${board.id}`}><a {...link}><span className="ul">{board.title}</span></a></h3><p>{board.kind}</p></div>
      <p className="board-note">{board.note}</p>
      <a className="board-more" {...link}><span className="ul">{board.more}</span><ArrowUpRight size={18} aria-hidden="true" />{external && <span className="sr-only"> (opens in a new tab)</span>}</a>
    </div>
  </article>;
}
