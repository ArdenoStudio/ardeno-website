import React, { forwardRef, memo, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { spring } from 'framer-motion';
import { LOCKUP } from '../../components/Website/brandLockup';
import { type Variant } from './data/fixtures';
import { DensePattern } from './DensePattern';

const springCurve = spring({ stiffness: 260, damping: 27, mass: 0.7, keyframes: [0, 1] }).toString().split(' ').slice(1).join(' ');
const ease = 'cubic-bezier(.16,1,.3,1)';
export function Mark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 116 116" aria-hidden="true"><path d={LOCKUP.mark.d} transform={LOCKUP.mark.transform} fill="currentColor" /></svg>;
}
function Lockup() {
  return <svg viewBox={`0 0 ${LOCKUP.width} ${LOCKUP.height}`} aria-hidden="true"><path d={LOCKUP.mark.d} transform={LOCKUP.mark.transform} fill="#ff3301" />{LOCKUP.glyphs.map((g, i) => <path key={i} d={g.d} transform={g.transform} fill="#20211f" />)}</svg>;
}
function WebsiteReveal() {
  return <div className="ml-underlay" aria-hidden="true"><div className="ml-site-nav"><Lockup /><span>Work. &nbsp; Studio.</span><span>Let’s talk ↗</span></div><div className="ml-site-hero"><div><span className="ml-site-kicker">Independent minds. Shared ambition.</span><h2>We build brands,<br />products and<br />digital experiences.</h2><p>Websites with character. Products with purpose.</p><span className="ml-site-cta">Start a project ↗</span></div><div className="ml-site-art"><span>your next<br />chapter.</span><img src="/brand/ardeno-glass-mark-selected.png" alt="" /></div></div><span className="ml-ready">The page is ready. Replay to watch again.</span></div>;
}
function FocusMark({ variant }: { variant: Variant }) {
  if (variant.backgroundStudy) return <div className="ml-wordmark-focus"><div className="ml-wordmark-lockup"><img src="/brand/ardeno-wordmark-paper.svg" alt="" /><span>studio</span></div></div>;
  const asset = `/brand/ardeno-mark-${variant.colour === '#f4f4f2' ? 'paper' : variant.colour === '#20211f' ? 'ink' : 'signal'}.svg`;
  return <><div className="ml-dense-focus">{variant.id === 'I' ? <DensePattern shape colour={variant.colour} /> : <img src={asset} alt="" />}</div><div className="ml-dense-signature">ardeno<span>studio</span></div></>;
}
function BackgroundTexture({ variant, width = 1000, height = 600, poster = false }: { variant: Variant; width?: number; height?: number; poster?: boolean }) {
  const patternProps = { colour: variant.colour, tileSize: variant.patternSize, aligned: variant.patternAlignment === 'grid' };
  const effect = variant.backgroundEffect;
  return <div className={`ml-background-field ml-background-${effect ?? 'plain'}`} style={{ '--ml-texture-opacity': variant.patternOpacity ?? .06 } as React.CSSProperties}>
    {effect === 'rows' ? <div className="ml-bg-camera">{(['even', 'odd'] as const).map(stripe => <div className={`ml-bg-row ml-bg-row-${stripe}`} key={stripe}><DensePattern stripe={stripe} {...patternProps} /></div>)}</div>
      : effect === 'layers' ? Array.from({ length: 6 }, (_, i) => <div className="ml-bg-band" key={i} style={{ top: `${i / 6 * 100}%`, '--ml-band-index': i } as React.CSSProperties}><div className="ml-bg-band-sheet"><DensePattern {...patternProps} /></div></div>)
        : <div className="ml-bg-camera"><DensePattern className="ml-dense-base" {...patternProps} /></div>}
    {effect === 'light' && [0, 1].map(i => <div className={`ml-bg-highlight ml-bg-highlight-${i}`} key={i}><DensePattern {...patternProps} /></div>)}
    {effect === 'ripple' && !poster && <DensePattern className="ml-bg-pulse" spotlight ripple width={width} height={height} {...patternProps} />}
  </div>;
}

export type SceneHandle = { replay: () => void; play: () => void; pause: () => void; seek: (time: number) => void };
type Props = { variant: Variant; speed: number; reduced: boolean; autoPlay?: boolean; initialTime?: number; onTime: (time: number) => void; onPlaying: (playing: boolean) => void };
export const Scene = memo(forwardRef<SceneHandle, Props>(function Scene({ variant, speed, reduced, autoPlay = true, initialTime = 0, onTime, onPlaying }, ref) {
  const host = useRef<HTMLDivElement>(null);
  const animations = useRef<Animation[]>([]);
  const clock = useRef<Animation | null>(null);
  const raf = useRef(0);
  const tickCallback = useRef<() => void>(() => {});
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const cols = size.width < 600 ? 3 : 6;
  const rows = Math.max(3, Math.min(7, Math.ceil(size.height / (size.width / cols))));

  useLayoutEffect(() => {
    const el: HTMLDivElement = host.current!;
    const update = () => { const r = el.getBoundingClientRect(); if (r.width && r.height) setSize({ width: r.width, height: r.height }); };
    const observer = new ResizeObserver(update);
    observer.observe(el); update();
    return () => observer.disconnect();
  }, []);

  const pause = () => { animations.current.forEach(a => a.pause()); cancelAnimationFrame(raf.current); onPlaying(false); };
  const seek = (time: number) => { pause(); const t = Math.max(0, Math.min(variant.duration, time)); animations.current.forEach(a => { a.currentTime = t; }); onTime(t); };
  const play = () => {
    if (reduced) { seek(550); return; }
    if (Number(clock.current?.currentTime ?? 0) >= variant.duration) seek(0);
    animations.current.forEach(a => a.play());
    onPlaying(true); cancelAnimationFrame(raf.current); raf.current = requestAnimationFrame(() => tickCallback.current());
  };
  const replay = () => { seek(0); play(); };
  useImperativeHandle(ref, () => ({ play, pause, seek, replay }), [variant, reduced, onTime, onPlaying]);

  useEffect(() => {
    const el: HTMLDivElement = host.current!;
    const all: Animation[] = [];
    const add = (target: Element, frames: Keyframe[], duration: number, delay = 0, easing = ease, fill: FillMode = 'both') => {
      const a = target.animate(frames, { duration, delay, easing, fill }); a.pause(); all.push(a); return a;
    };
    const backdrop = el.querySelector('.ml-pattern')!;
    const cells = Array.from(el.querySelectorAll<HTMLElement>('.ml-cell'));
    const cellW = size.width / cols;
    const cellH = size.height / rows;
    if (variant.dense) {
      if (variant.backgroundStudy) {
        const wordmark = el.querySelector('.ml-wordmark-lockup')!;
        add(wordmark, [{ transform: 'translateY(12px) scale(.985)', opacity: 0 }, { transform: 'translateY(0px) scale(1)', opacity: 1 }], 480, 120, springCurve);
        add(wordmark, [{ transform: 'translateY(0px)', opacity: 1 }, { transform: 'translateY(-5px)', opacity: 0 }], 200, variant.duration - 340, ease, 'forwards');
        const camera = el.querySelector('.ml-bg-camera');
        if (variant.backgroundEffect === 'depth' && camera) {
          add(camera, [{ transform: 'perspective(1000px) rotateX(8deg) translateY(22px) scale(1.12)', opacity: .25 }, { transform: 'perspective(1000px) rotateX(0deg) translateY(0px) scale(1)', opacity: 1 }], 900, 0, springCurve);
        } else if (variant.backgroundEffect === 'rows') {
          el.querySelectorAll('.ml-bg-row').forEach((row, i) => add(row, [{ transform: `translateX(${i ? 40 : -40}px)`, opacity: (variant.patternOpacity ?? .06) * .2 }, { transform: 'translateX(0px)', opacity: variant.patternOpacity ?? .06 }], 900, i * 70, springCurve));
        } else if (variant.backgroundEffect === 'light') {
          if (camera) add(camera, [{ transform: 'scale(1.055)' }, { transform: 'scale(1)' }], 1000, 0, springCurve);
          el.querySelectorAll('.ml-bg-highlight').forEach((light, i) => add(light, [{ transform: 'translateX(-100%)', opacity: 0 }, { opacity: i ? .45 : 1, offset: .4 }, { transform: 'translateX(100%)', opacity: 0 }], 900, i * 180, 'cubic-bezier(.35,0,.2,1)'));
        } else if (variant.backgroundEffect === 'ripple') {
          if (camera) add(camera, [{ transform: 'scale(1.045)', opacity: .4 }, { transform: 'scale(1)', opacity: 1 }], 850, 0, springCurve);
          add(el.querySelector('.ml-dense-ripple')!, [{ transform: 'scale(.04)' }, { transform: 'scale(1.16)' }], 900, 80, 'cubic-bezier(.25,.65,.3,1)');
          add(el.querySelector('.ml-bg-pulse')!, [{ opacity: 0 }, { opacity: .15, offset: .25 }, { opacity: 0 }], 980, 40, 'linear');
        } else if (variant.backgroundEffect === 'layers') {
          el.querySelectorAll('.ml-bg-band').forEach((band, i) => {
            add(band, [{ transform: 'translateY(18px)', opacity: 0 }, { transform: 'translateY(0px)', opacity: 1 }], 600, i * 65, springCurve);
            add(band, [{ transform: 'translateY(0px)', opacity: 1 }, { transform: 'translateY(-14px)', opacity: 0 }], 260, variant.duration - 550 + i * 35, ease, 'forwards');
          });
        }
      } else {
        const focus = el.querySelector('.ml-dense-focus')!;
        add(focus, [{ transform: 'translateY(9px) scale(.98)', opacity: 0 }, { transform: 'translateY(0px) scale(1)', opacity: 1 }], 460, 0, springCurve);
        add(focus, [{ transform: 'translateY(0px) scale(1)', opacity: 1 }, { transform: 'translateY(-6px) scale(.99)', opacity: 0 }], 250, variant.duration - 430, ease, 'forwards');
        add(el.querySelector('.ml-dense-signature')!, [{ opacity: 0 }, { opacity: 1 }], 200, 180, ease);
        add(el.querySelector('.ml-dense-signature')!, [{ opacity: 1 }, { opacity: 0 }], 220, variant.duration - 350, ease, 'forwards');
        if (variant.id === 'F') {
          add(el.querySelector('.ml-dense-field')!, [{ transform: 'translate(-4px,4px)' }, { transform: 'translate(0px,0px)' }], 700, 0, springCurve);
        } else if (variant.id === 'G') {
          add(el.querySelector('.ml-dense-sheen')!, [{ transform: `translateX(${-size.width * .3}px)` }, { transform: `translateX(${size.width * 1.1}px)` }], 740, 0, 'cubic-bezier(.35,0,.2,1)');
        } else if (variant.id === 'H') {
          add(el.querySelector('.ml-dense-ripple')!, [{ transform: 'scale(0)' }, { transform: 'scale(1.02)' }], 850, 0, springCurve);
        } else if (variant.id === 'J') {
          el.querySelectorAll('.ml-dense-panel').forEach((panel, i) => add(panel, [{ transform: 'translateX(0%)' }, { transform: `translateX(${i ? 102 : -102}%)` }], 520, variant.duration - 720 + i * 40, springCurve, 'forwards'));
        }
      }
    }
    for (const cell of cells) {
      const c = Number(cell.dataset.col), r = Number(cell.dataset.row);
      const distance = Math.hypot(c - (cols - 1) / 2, r - (rows - 1) / 2);
      const stagger = distance * 50;
      if (variant.id === 'A') {
        add(cell, [{ transform: 'translateY(22px) scale(.72)', opacity: 0 }, { transform: 'translateY(0) scale(1)', opacity: 1 }], 450, stagger, springCurve);
        add(cell, [{ transform: 'translateY(0) scale(1)', opacity: 1 }, { transform: 'translateY(-18px) scale(.86)', opacity: 0 }], 280, 850 + (c + r) * 34, ease, 'forwards');
      } else if (variant.id === 'B') {
        const sign = r % 2 ? -1 : 1;
        add(cell, [{ transform: `translateX(${sign * cellW * .7}px)`, opacity: 0 }, { transform: 'translateX(0px)', opacity: 1 }], 550, r * 48, springCurve);
        add(cell, [{ transform: 'translateX(0px)', opacity: 1 }, { transform: `translateX(${-sign * cellW * .45}px)`, opacity: 0 }], 330, 850 + r * 40, ease, 'forwards');
      } else if (variant.id === 'C') {
        add(cell, [{ transform: 'perspective(600px) rotateX(85deg) translateY(28px)', opacity: 0 }, { transform: 'perspective(600px) rotateX(0deg) translateY(0px)', opacity: 1 }], 480, (c + r) * 32, springCurve);
        add(cell, [{ transform: 'perspective(600px) rotateY(0deg)', opacity: 1 }, { transform: 'perspective(600px) rotateY(-70deg)', opacity: 0 }], 260, 880 + (c + r) * 24, ease, 'forwards');
      } else if (variant.id === 'D') {
        const x = size.width / 2 - (c + .5) * cellW;
        const y = size.height / 2 - (r + .5) * cellH;
        add(cell, [{ transform: 'translate(0px,0px) scale(.7)', opacity: .16 }, { transform: `translate(${x}px,${y}px) scale(.85)`, opacity: .8 }], 760, 160 + stagger * .7, springCurve);
        add(cell, [{ opacity: .8 }, { opacity: 0 }], 110, 990, ease, 'forwards');
      }
    }
    if (variant.id === 'J') {
      add(backdrop, [{ opacity: 1 }, { opacity: 0 }], 180, variant.duration - 210, ease, 'forwards');
    } else if (variant.id === 'E') {
      el.querySelectorAll('.ml-column').forEach((column, i) => {
        add(column, [{ transform: 'translateY(20px)' }, { transform: 'translateY(0px)' }], 400, i * 35, springCurve);
        add(column, [{ transform: 'translateY(0%)' }, { transform: 'translateY(-105%)' }], 560, 720 + i * 65, springCurve, 'forwards');
      });
      add(backdrop, [{ opacity: 1 }, { opacity: 0 }], 50, 1620, ease, 'forwards');
    } else if (variant.id === 'C') {
      add(backdrop, [{ transform: 'translateY(0%)' }, { transform: 'translateY(-105%)' }], 420, 1200, ease, 'forwards');
    } else {
      add(backdrop, [{ opacity: 1 }, { opacity: 0 }], 260, variant.duration - 300, ease, 'forwards');
    }
    if (variant.id === 'D') {
      const centre = el.querySelector('.ml-centre')!;
      add(centre, [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'scale(1)' }], 220, 890, springCurve);
      add(centre, [{ opacity: 1, transform: 'translateY(0px)' }, { opacity: 0, transform: 'translateY(-16px)' }], 250, 1270, ease, 'forwards');
    }
    const timer = add(el.querySelector('.ml-clock')!, [{ opacity: 0 }, { opacity: 0 }], variant.duration, 0, 'linear');
    clock.current = timer; animations.current = all;
    let previous = -50;
    tickCallback.current = () => {
      const t = Number(timer.currentTime ?? 0);
      if (Math.abs(t - previous) > 40 || t >= variant.duration) { onTime(Math.min(t, variant.duration)); previous = t; }
      if (timer.playState === 'running') raf.current = requestAnimationFrame(() => tickCallback.current());
    };
    timer.onfinish = () => { cancelAnimationFrame(raf.current); onTime(variant.duration); onPlaying(false); };
    const startTime = Math.min(variant.duration, reduced ? 550 : initialTime);
    all.forEach(a => { a.playbackRate = speed; a.currentTime = startTime; });
    onTime(startTime);
    if (autoPlay && !reduced) { all.forEach(a => a.play()); onPlaying(true); raf.current = requestAnimationFrame(() => tickCallback.current()); }
    else onPlaying(false);
    return () => { cancelAnimationFrame(raf.current); all.forEach(a => a.cancel()); animations.current = []; clock.current = null; };
  }, [variant, cols, rows, size.width, size.height, reduced, autoPlay, initialTime, onTime, onPlaying]);
  useEffect(() => { animations.current.forEach(a => { a.playbackRate = speed; }); }, [speed]);

  const cell = (c: number, r: number, column = false) => <div key={`${c}-${r}`} className="ml-cell" data-col={c} data-row={r} style={{ left: column ? 0 : `${c / cols * 100}%`, top: `${r / rows * 100}%`, width: column ? '100%' : `${100 / cols}%`, height: `${100 / rows}%` }}><Mark /></div>;
  return <div ref={host} className={`ml-scene ml-variant-${variant.id}`} data-variant={variant.id} role="img" aria-label={`${variant.name}: ${variant.description}`}>
    <WebsiteReveal />
    <div className="ml-pattern" style={{ background: variant.background, color: variant.colour }} aria-hidden="true">
      {variant.dense ? <>
        {variant.backgroundStudy ? <BackgroundTexture variant={variant} width={size.width} height={size.height} /> : variant.id === 'J' ? [0, 1].map(i => <div className={`ml-dense-panel ml-dense-panel-${i}`} key={i}><DensePattern colour={variant.colour} /></div>) : <div className="ml-dense-field"><DensePattern className="ml-dense-base" colour={variant.colour} />{variant.id === 'G' && <div className="ml-dense-sheen" />}{variant.id === 'H' && <DensePattern className="ml-dense-highlight" spotlight colour={variant.colour} width={size.width + 40} height={size.height + 40} />}</div>}
        <FocusMark variant={variant} />
      </> : variant.id === 'E' ? Array.from({ length: cols }, (_, c) => <div className="ml-column" key={c} style={{ left: `${c / cols * 100}%`, width: `${100 / cols}%` }}>{Array.from({ length: rows }, (_, r) => cell(c, r, true))}</div>) : Array.from({ length: cols * rows }, (_, i) => cell(i % cols, Math.floor(i / cols)))}
      {variant.id === 'D' && <div className="ml-centre"><Mark /></div>}
      {!variant.dense && <div className="ml-pattern-word">ardeno<span>studio</span></div>}
    </div>
    <div className="ml-clock" />
  </div>;
}));

export function PatternPoster({ variant }: { variant: Variant }) {
  if (variant.dense) return <div className={`ml-dense-poster ml-variant-${variant.id}`} style={{ background: variant.background, color: variant.colour }} >{variant.backgroundStudy ? <BackgroundTexture variant={variant} poster /> : <DensePattern className="ml-dense-base" colour={variant.colour} />}<FocusMark variant={variant} />{variant.id === 'G' && <div className="ml-dense-poster-light" />}</div>;
  return <svg className={`ml-poster ml-poster-${variant.id}`} viewBox="0 0 600 300" aria-hidden="true" style={{ background: variant.background, color: variant.colour }}>
    {Array.from({ length: 24 }, (_, i) => { const c = i % 6, r = Math.floor(i / 6); return <svg key={i} x={c * 100 + (r % 2 && variant.id === 'B' ? 18 : 0) + 12} y={r * 75 + 2} width="76" height="70" viewBox="0 0 116 116" opacity={variant.id === 'D' ? .14 : 1}><path d={LOCKUP.mark.d} transform={LOCKUP.mark.transform} fill="currentColor" /></svg>; })}
    {variant.id === 'D' && <svg x="230" y="80" width="140" height="140" viewBox="0 0 116 116" color="#ff3301"><path d={LOCKUP.mark.d} transform={LOCKUP.mark.transform} fill="currentColor" /></svg>}
    {variant.id === 'E' && Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${(i + 1) * 100} 0V300`} stroke="#f4f4f2" strokeOpacity=".14" />)}
  </svg>;
}
