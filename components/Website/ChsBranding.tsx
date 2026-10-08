import React, { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowRight, ArrowUpRight, Plus, X } from 'lucide-react';
import groups from '../../data/chs-branding.json';
import '@fontsource-variable/inter';
import './chsBranding.css';

type BrandImage = (typeof groups)[number]['items'][number];
const base = '/images/projects/ceylon-hygiene';
const allImages = groups.flatMap(group => group.items);
const openingOrder = ['fleet-01', 'people-01', 'communication-01', 'places-01', 'equipment-01', 'people-09', 'fleet-05', 'communication-05', 'people-05', 'equipment-02', 'places-02', 'equipment-07'];
const orderedImages = [...openingOrder.map(id => allImages.find(item => item.id === id)!), ...allImages.filter(item => !openingOrder.includes(item.id))];

export function ChsBranding() {
  const [category, setCategory] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState<BrandImage | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const images = category === 'all' ? orderedImages : groups.find(group => group.id === category)!.items;
  const visible = category === 'all' && !expanded ? images.slice(0, 12) : images;
  const activeIndex = active ? images.findIndex(image => image.id === active.id) : -1;
  const move = (direction: number) => {
    const next = images[activeIndex + direction];
    if (next) setActive(next);
  };

  return <section className="chs-branding" id="brand-identity" aria-labelledby="chs-brand-title">
    <div className="chs-brand-intro">
      <span className="portfolio-eyebrow">Beyond the website · Brand identity</span>
      <div className="chs-brand-intro-grid"><h2 id="chs-brand-title">One identity.<br />Every touchpoint.</h2><div><p>From a shirt seam to the side of a service van. We explored how Ceylon Hygiene Solutions could look and feel wherever its work takes it.</p><p>The Clear Care direction keeps the recognisable CHS symbol, refreshes the company lettering, and gives the whole system a calm, consistent voice.</p></div></div>
    </div>
    <div className="chs-logo-grid" aria-label="Clear Care identity">
      <figure className="chs-logo-panel"><img src={`${base}/clear-care-logo.svg`} alt="Clear Care CHS logo with the original navy and green monogram and refreshed company lettering" width={860} height={420} loading="lazy" /><figcaption>Clear Care · Primary signature</figcaption></figure>
      <figure className="chs-logo-panel chs-logo-panel-dark"><img src={`${base}/clear-care-logo-reversed.svg`} alt="White and green CHS logo on navy" width={860} height={420} loading="lazy" /><figcaption>Reversed signature · Navy ground</figcaption></figure>
    </div>
    <div className="chs-foundations">
      <div className="chs-foundation-copy"><span className="portfolio-eyebrow">The foundations</span><h3>Familiar mark.<br />Clearer voice.</h3><p>The original symbol’s geometry stays intact. Cal Sans brings clarity to the company name and headings; Inter handles the supporting details. Navy leads, green provides a restrained accent, and white gives the work room to breathe.</p></div>
      <div className="chs-foundation-specimen"><div className="chs-palette" aria-label="CHS identity colours">{[{name:'Navy',hex:'#063362'},{name:'Green',hex:'#087D2A'},{name:'White',hex:'#FFFFFF'}].map(colour => <div key={colour.name} className={colour.name === 'White' ? 'chs-swatch chs-swatch-white' : 'chs-swatch'} style={{backgroundColor:colour.hex}}><span>{colour.name}</span><span>{colour.hex}</span></div>)}</div><div className="chs-type-specimen"><div><span>Cal Sans · Display</span><p>Complete care.</p></div><div><span>Inter · Supporting type</span><p>Total confidence.<br />Clear details. Everyday consistency.</p></div></div></div>
    </div>
    <details className="chs-identity-study"><summary><span>Explore the identity studies</span><Plus size={18} aria-hidden="true" /></summary><div><figure><img src={`${base}/identity-directions.webp`} alt="Three CHS identity studies: Clear Care, Field Ready and Quiet Assurance" loading="lazy" decoding="async" /><figcaption>Three foundation directions, with Clear Care carried into the application concepts.</figcaption></figure><figure><img src={`${base}/logo-refresh.webp`} alt="Original CHS logo compared with the proposed typographic refresh" loading="lazy" decoding="async" /><figcaption>The original symbol, with a refreshed typographic hierarchy.</figcaption></figure></div></details>
    <div className="chs-applications" aria-labelledby="chs-applications-title">
      <div className="chs-applications-heading"><div><span className="portfolio-eyebrow">The identity in use</span><h3 id="chs-applications-title">Made to carry<br />through the day.</h3></div><p>Uniforms, fleet, working kits, spaces and communication. Explore the application studies, down to the small details.</p></div>
      <p className="chs-concept-note">Application images are AI-generated design concepts. They show the proposed branding, rather than completed production or CHS-owned inventory. Sample names and contact details are placeholders.</p>
      <div className="chs-gallery-filters" role="group" aria-label="Filter brand applications">{[{id:'all',label:'All applications'}, ...groups].map(group => <button key={group.id} type="button" aria-pressed={category === group.id} aria-controls="chs-application-gallery" onClick={() => {setCategory(group.id);setExpanded(false);}}>{group.label}<span>{group.id === 'all' ? allImages.length : groups.find(item => item.id === group.id)!.items.length}</span></button>)}</div>
      <p className="chs-gallery-status" role="status">Showing {visible.length} of {images.length} applications · Select an image for a closer look</p>
      <div className="chs-application-grid" id="chs-application-gallery">{visible.map(image => <figure className="chs-application" key={image.id}><button type="button" className="chs-image-button" aria-label={`View ${image.title.toLowerCase()} concept`} onClick={event => {returnFocus.current = event.currentTarget;setActive(image);}}><img src={image.src.replace('.webp','-small.webp')} srcSet={`${image.src.replace('.webp','-small.webp')} 800w, ${image.src} 1600w`} sizes="(max-width: 580px) 88vw, (max-width: 1100px) 44vw, 42vw" alt={image.alt} width={image.width} height={image.height} loading="lazy" decoding="async" /><span className="chs-image-open" aria-hidden="true"><Plus size={19} /></span></button><figcaption><span>{image.title}</span><span>Concept</span></figcaption></figure>)}</div>
      {category === 'all' && !expanded && <button type="button" className="site-button chs-show-all" onClick={() => setExpanded(true)}>Explore all {allImages.length} applications<Plus size={18} aria-hidden="true" /></button>}
    </div>
    <div className="chs-guidelines"><figure><img src={`${base}/guidelines-cover.webp`} alt="CHS brand guidelines cover: Complete care. Total confidence." width={1600} height={1000} loading="lazy" decoding="async" /></figure><div><span className="portfolio-eyebrow">The system, documented</span><h3>A guide for<br />what comes next.</h3><p>A 40-page concept guide brings the identity together: logo use, colour, typography, layouts, applications and a framework for production handover. A compact reference keeps the essentials close.</p><div className="chs-document-links"><a href="/projects/ceylon-hygiene/CHS-brand-guidelines-v1.pdf" target="_blank" rel="noopener noreferrer">Brand guidelines <span>40 pages · PDF · 40 MB<ArrowUpRight size={17} aria-hidden="true" /></span><span className="sr-only"> (opens in a new tab)</span></a><a href="/projects/ceylon-hygiene/CHS-brand-quick-reference-v1.pdf" target="_blank" rel="noopener noreferrer">Quick reference <span>2 pages · PDF · 76 KB<ArrowUpRight size={17} aria-hidden="true" /></span><span className="sr-only"> (opens in a new tab)</span></a><a href="/projects/ceylon-hygiene/CHS-brand-foundation-directions.pdf" target="_blank" rel="noopener noreferrer">Foundation studies <span>PDF · 69 KB<ArrowUpRight size={17} aria-hidden="true" /></span><span className="sr-only"> (opens in a new tab)</span></a></div><p className="chs-guidelines-note">Concept editions · Physical applications remain subject to artwork preparation and supplier proofs.</p></div></div>
    <Dialog.Root open={Boolean(active)} onOpenChange={open => {if (!open) setActive(null);}}><Dialog.Portal><Dialog.Overlay className="chs-viewer-overlay" /><Dialog.Content className="chs-viewer" onCloseAutoFocus={event => {event.preventDefault();returnFocus.current?.focus();}} onKeyDown={event => {if (event.key === 'ArrowLeft') {event.preventDefault();move(-1);} if (event.key === 'ArrowRight') {event.preventDefault();move(1);}}}>
      <div className="chs-viewer-top"><Dialog.Title>{active?.title}</Dialog.Title><Dialog.Close className="chs-viewer-close" aria-label="Close image"><X size={23} aria-hidden="true" /></Dialog.Close></div>
      <Dialog.Description className="sr-only">CHS branding concept. Use the previous and next buttons or arrow keys to explore; press Escape to close.</Dialog.Description>
      {active && <img className="chs-viewer-image" src={active.src} alt={active.alt} width={active.width} height={active.height} />}
      <div className="chs-viewer-bottom"><button type="button" onClick={() => move(-1)} disabled={activeIndex <= 0} aria-label="Previous concept"><ArrowLeft size={20} aria-hidden="true" /></button><span role="status">{activeIndex + 1} / {images.length} · Concept study</span><button type="button" onClick={() => move(1)} disabled={activeIndex === images.length - 1} aria-label="Next concept"><ArrowRight size={20} aria-hidden="true" /></button></div>
    </Dialog.Content></Dialog.Portal></Dialog.Root>
  </section>;
}
