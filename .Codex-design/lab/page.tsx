import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowLeft, ArrowUpRight, Maximize2, Pause, Play, RotateCcw, X } from 'lucide-react';
import { backgroundVariants, type Variant } from './data/fixtures';
import { Mark, PatternPoster, Scene, type SceneHandle } from './Scene';
import { FeedbackOverlay } from './FeedbackOverlay';
import './lab.css';

export default function LoaderLab() {
  const [selected, setSelected] = useState<Variant>(backgroundVariants[3]);
  const choices: readonly Variant[] = backgroundVariants;
  const [autoPlay, setAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const player = useRef<SceneHandle>(null);
  const fullPlayer = useRef<SceneHandle>(null);
  const fullScreenTrigger = useRef<HTMLButtonElement>(null);
  const onTime = useCallback((t: number) => setProgress(t), []);
  const onPlaying = useCallback((value: boolean) => setPlaying(value), []);
  const currentPlayer = () => fullscreen ? fullPlayer.current : player.current;
  useEffect(() => { if (!choices.some(v => v.id === selected.id)) setSelected(choices[0]); }, [choices, selected.id]);
  useEffect(() => {
    const oldTitle = document.title;
    document.title = 'Ardeno — Background Motion Lab';
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const oldRobots = robots?.content;
    if (robots) robots.content = 'noindex, nofollow';
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(media.matches);
    media.addEventListener('change', change);
    return () => { document.title = oldTitle; if (robots && oldRobots) robots.content = oldRobots; media.removeEventListener('change', change); };
  }, []);
  const choose = (variant: Variant) => { if (variant.id === selected.id) currentPlayer()?.replay(); else { setAutoPlay(true); setSelected(variant); } };
  const controls = () => <div className="ml-controls">
    <button className="ml-button" onClick={() => currentPlayer()?.replay()}><RotateCcw size={16} aria-hidden="true" /> Replay</button>
    <button className="ml-button" disabled={reduced} onClick={() => playing ? currentPlayer()?.pause() : currentPlayer()?.play()} aria-label={playing ? 'Pause animation' : 'Play animation'}>{playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}{playing ? 'Pause' : 'Play'}</button>
    <label className="ml-timeline">Timeline<input type="range" min={0} max={selected.duration} step={10} value={Math.round(progress)} onChange={e => currentPlayer()?.seek(Number(e.target.value))} aria-valuetext={`${(progress / 1000).toFixed(2)} seconds`} /></label>
    <span className="ml-time">{(progress / 1000).toFixed(2)} / {(selected.duration / 1000).toFixed(2)}s</span>
    <label className="ml-speed">Speed<select value={speed} onChange={e => setSpeed(Number(e.target.value))}><option value={0.5}>0.5×</option><option value={0.75}>0.75×</option><option value={1}>1×</option></select></label>
    <button className="ml-button ml-skip" onClick={() => currentPlayer()?.seek(selected.duration)}>Skip intro <ArrowUpRight size={16} aria-hidden="true" /></button>
  </div>;

  return <div className="ml-lab">
    <header className="ml-header"><a href="/" className="ml-home"><Mark /><span>ardeno</span></a><span>Motion studies / 05</span><a href="/" className="ml-back"><ArrowLeft size={15} aria-hidden="true" /> Back to the website</a></header>
    <main>
      <section className="ml-intro"><div><span className="ml-eyebrow">The background takes the lead.</span><h1>A little motion.<br />A lot of character<span>.</span></h1></div><div className="ml-intro-copy"><p>Just the Ardeno Studio wordmark and the woven background you picked. Five ways to bring it to life, with smooth springs and a clean reveal.</p><span>Ink / Paper · 1.5-second entrance · Local previews</span></div></section>
      <section className="ml-showcase" aria-label="Animated loader comparison">
        <div className="ml-selector" role="group" aria-label="Choose animation variant">{choices.map(v => <button key={v.id} aria-pressed={selected.id === v.id} onClick={() => choose(v)}><span>{v.id}</span>{v.name}{v.id === 'N' && <small>Our pick</small>}</button>)}</div>
        <div className="ml-preview-heading"><span><b>{selected.id}</b> {selected.name}</span><div><span>{selected.palette}</span><button ref={fullScreenTrigger} className="ml-button" onClick={() => setFullscreen(true)}><Maximize2 size={15} aria-hidden="true" /> Full screen</button></div></div>
        <Scene ref={player} variant={selected} speed={speed} reduced={reduced} autoPlay={autoPlay && !fullscreen} initialTime={fullscreen || autoPlay ? 0 : 550} onTime={onTime} onPlaying={onPlaying} />
        {controls()}
        <div className="ml-sequence-note"><p>{selected.description}</p><span>{reduced ? 'Reduced motion: static preview. Scrub or skip to see the reveal.' : selected.note}</span></div>
      </section>
      <section className="ml-collection" aria-labelledby="ml-directions"><div className="ml-section-heading"><h2 id="ml-directions">Five movements. One palette.</h2><p>Same wordmark. A different feeling.</p></div><div className="ml-card-grid">{choices.map(v => <article className={`ml-card ${selected.id === v.id ? 'is-selected' : ''}`} data-variant={v.id} key={v.id}><button className="ml-card-preview" aria-label={`Watch ${v.id}: ${v.name}`} onClick={() => { choose(v); document.querySelector('.ml-showcase')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' }); }}><PatternPoster variant={v} /><span><Play size={18} aria-hidden="true" /> Watch this one</span></button><div className="ml-card-copy"><div><span>{v.id} / {v.axis}</span><span>{(v.duration / 1000).toFixed(2)}s</span></div><h3>{v.name}</h3><p>{v.description}</p><small>{v.note}</small></div></article>)}</div></section>
      <section className="ml-research"><span className="ml-eyebrow">The thinking behind it</span><h2>Expressive. Then at rest.</h2><p>Apple’s motion guidance favours brief, precise animation and springs that come naturally to rest. Applied here: more movement in the background, a steady wordmark, and a short fade into the ready page. Reduced motion gives you a static composition.</p><div><a href="https://developer.apple.com/design/human-interface-guidelines/motion" target="_blank" rel="noopener noreferrer">Apple: motion ↗<span className="ml-sr-only"> (opens in a new tab)</span></a><a href="https://developer.apple.com/videos/play/wwdc2023/10158/" target="_blank" rel="noopener noreferrer">Apple: animate with springs ↗<span className="ml-sr-only"> (opens in a new tab)</span></a><a href="https://developer.apple.com/design/human-interface-guidelines/loading" target="_blank" rel="noopener noreferrer">Apple: loading ↗<span className="ml-sr-only"> (opens in a new tab)</span></a></div><p className="ml-recommendation">N is my pick: the ripple gives the pattern a moment of energy while the studio name stays clear. Try M for a more cinematic sweep, or L for a flowing texture.</p></section>
    </main>
    <footer className="ml-footer"><span>Ardeno / Motion lab</span><span>Choose a letter, or use Add feedback to leave notes.</span></footer>
    <FeedbackOverlay targetName="Ardeno background entrance" selectedVariant={selected.id} />
    <Dialog.Root open={fullscreen} onOpenChange={open => { setFullscreen(open); if (!open) setAutoPlay(false); }}><Dialog.Portal><Dialog.Overlay className="ml-fullscreen-overlay" /><Dialog.Content className="ml-fullscreen" onCloseAutoFocus={event => { event.preventDefault(); fullScreenTrigger.current?.focus(); }}><div className="ml-fullscreen-bar"><Dialog.Title>{selected.id} / {selected.name}</Dialog.Title><Dialog.Description className="ml-sr-only">Full-screen animation preview. Use replay, pause or the timeline below. Escape closes this preview.</Dialog.Description><button className="ml-button" onClick={() => { const i = choices.findIndex(v => v.id === selected.id); choose(choices[(i + 1) % choices.length]); }}>Next direction <ArrowUpRight size={16} aria-hidden="true" /></button><Dialog.Close asChild><button className="ml-button ml-icon" aria-label="Close full screen"><X size={20} /></button></Dialog.Close></div><Scene ref={fullPlayer} variant={selected} speed={speed} reduced={reduced} onTime={onTime} onPlaying={onPlaying} />{controls()}</Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
}
