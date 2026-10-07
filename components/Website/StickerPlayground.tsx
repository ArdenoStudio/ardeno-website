import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw } from 'lucide-react';
import { cn } from './utils';

const stickers = [
  { id: 'mark', name: 'Glass Ardeno logo', src: 'ardeno-glass-mark-selected.png', width: 1369, height: 1149 },
  { id: 'clip', name: 'Orange binder clip', src: 'studio-binder-clip.png', width: 1254, height: 1254 },
  { id: 'coffee', name: 'Iced coffee', src: 'studio-iced-coffee.png', width: 1225, height: 1284 },
  { id: 'key', name: 'Command key', src: 'studio-command-key.png', width: 1254, height: 1254 },
];
type Position = { x: number; y: number; width: number; height: number };
type Pickup = { index: number; origin: Position; wasMoved: boolean; mode: 'pointer' | 'place' | 'keyboard'; pointerId?: number; startX: number; startY: number; offsetX: number; offsetY: number; moved: boolean };

export function StickerPlayground({ canvasRef, filter, children }: { canvasRef: React.RefObject<HTMLDivElement | null>; filter: string; children: React.ReactNode }) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const positionsRef = useRef<Position[]>([]);
  const homes = useRef<Position[]>([]);
  const moved = useRef(new Set<number>());
  const pickup = useRef<Pickup | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const [positions, setPositions] = useState<Position[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const [front, setFront] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const hintId = useId();

  const commit = (next: Position[]) => { positionsRef.current = next; setPositions(next); };
  const place = (index: number, x: number, y: number) => {
    const canvas = canvasRef.current;
    const current = positionsRef.current[index];
    if (!canvas || !current) return;
    const next = { ...current, x: Math.max(0, Math.min(x, canvas.clientWidth - current.width)), y: Math.max(0, Math.min(y, canvas.clientHeight - current.height)) };
    commit(positionsRef.current.map((position, i) => i === index ? next : position));
    moved.current.add(index);
  };
  const finish = (cancel = false) => {
    const current = pickup.current;
    if (!current) return;
    if (cancel) {
      commit(positionsRef.current.map((position, i) => i === current.index ? current.origin : position));
      if (!current.wasMoved) moved.current.delete(current.index);
    }
    setAnnouncement(`${stickers[current.index].name} ${cancel ? 'returned to its previous spot' : 'stuck in place'}.`);
    pickup.current = null;
    setActive(null);
  };
  const followPointer = () => {
    const current = pickup.current;
    const canvas = canvasRef.current;
    if (!current || !canvas || current.mode === 'keyboard' || (!current.moved && current.mode === 'pointer')) return;
    const rect = canvas.getBoundingClientRect();
    place(current.index, pointer.current.x - rect.left - current.offsetX, pointer.current.y - rect.top - current.offsetY);
  };
  const release = (event: { pointerId: number }) => {
    const current = pickup.current;
    if (current?.mode !== 'pointer' || current.pointerId !== event.pointerId) return;
    if (current.moved) { followPointer(); finish(); }
    else { current.mode = 'place'; current.pointerId = undefined; setAnnouncement(`${stickers[current.index].name} picked up. Click anywhere on the page to place it. Escape cancels.`); }
  };
  const move = (event: { pointerId: number; clientX: number; clientY: number }) => {
    const current = pickup.current;
    if (!current || (current.pointerId !== undefined && current.pointerId !== event.pointerId)) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 5) current.moved = true;
    followPointer();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const anchors = anchorRef.current;
    if (!canvas || !anchors) return;
    let previousWidth = canvas.clientWidth;
    const measure = () => {
      const canvasRect = canvas.getBoundingClientRect();
      homes.current = Array.from<Element>(anchors.children).map(element => {
        const rect = element.getBoundingClientRect();
        return { x: rect.left - canvasRect.left, y: rect.top - canvasRect.top, width: rect.width, height: rect.height };
      });
      const ratio = canvas.clientWidth / previousWidth;
      commit(homes.current.map((home, index) => {
        const old = positionsRef.current[index];
        if (!old || !moved.current.has(index)) return home;
        return { ...home, x: Math.max(0, Math.min(old.x * ratio, canvas.clientWidth - home.width)), y: Math.max(0, Math.min(old.y, canvas.clientHeight - home.height)) };
      }));
      previousWidth = canvas.clientWidth;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    observer.observe(anchors);
    return () => observer.disconnect();
  }, [canvasRef]);

  // A carried sticker follows the pointer even beyond its original section.
  useEffect(() => {
    if (active === null) return;
    const drop = (event: PointerEvent) => {
      if (pickup.current?.mode !== 'place' || (event.target instanceof Element && event.target.closest('.sticker-button, .sticker-reset'))) return;
      pointer.current = { x: event.clientX, y: event.clientY };
      followPointer();
      event.preventDefault();
      event.stopPropagation();
      // Placing on a link should paste the sticker, without opening that link.
      document.addEventListener('click', blockClick, { capture: true, once: true });
      window.setTimeout(() => document.removeEventListener('click', blockClick, true), 500);
      finish();
    };
    const blockClick = (event: MouseEvent) => { event.preventDefault(); event.stopPropagation(); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); finish(true); } };
    const cancel = () => finish(true);
    let frame = 0;
    const autoScroll = () => {
      const current = pickup.current;
      if (current?.mode === 'pointer' && current.moved) {
        const edge = 64;
        const speed = pointer.current.y < edge ? -12 : pointer.current.y > window.innerHeight - edge ? 12 : 0;
        if (speed) { window.scrollBy({ top: speed, behavior: 'instant' }); followPointer(); }
      }
      frame = requestAnimationFrame(autoScroll);
    };
    frame = requestAnimationFrame(autoScroll);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('scroll', followPointer, { passive: true });
    window.addEventListener('keydown', escape);
    window.addEventListener('blur', cancel);
    document.addEventListener('pointerdown', drop, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('scroll', followPointer);
      window.removeEventListener('keydown', escape);
      window.removeEventListener('blur', cancel);
      document.removeEventListener('pointerdown', drop, true);
      // Keep the one-shot click guard until the placing click has completed.
    };
  }, [active]);

  return <>
    <div className="studio-statement-scene">{children}<div ref={anchorRef} className="studio-objects" aria-hidden="true">{stickers.map(sticker => <span key={sticker.id} className={`studio-object object-${sticker.id}`} style={{ aspectRatio: `${sticker.width}/${sticker.height}` }} />)}</div></div>
    {canvasRef.current && positions.length > 0 && createPortal(<div className="sticker-page-layer" style={{ '--sticker-filter': `url(#${filter})` } as React.CSSProperties}>
      {stickers.map((sticker, index) => <button key={sticker.id} type="button" className={cn('sticker-button', `sticker-${sticker.id}`, active === index && 'is-lifted', front === index && 'is-front')}
        style={{ width: positions[index].width, height: positions[index].height, transform: `translate3d(${positions[index].x}px, ${positions[index].y}px, 0)` }}
        aria-label={`${sticker.name} sticker`} aria-pressed={active === index} aria-describedby={hintId}
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0) return;
          if (pickup.current?.index === index && pickup.current.mode === 'place') { finish(); return; }
          if (pickup.current) finish();
          const rect = event.currentTarget.getBoundingClientRect();
          pickup.current = { index, origin: { ...positionsRef.current[index] }, wasMoved: moved.current.has(index), mode: 'pointer', pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, moved: false };
          pointer.current = { x: event.clientX, y: event.clientY };
          event.currentTarget.setPointerCapture(event.pointerId);
          setActive(index); setFront(index);
          setAnnouncement(`${sticker.name} picked up.`);
        }}
        onPointerUp={release}
        onPointerMove={move}
        onClick={event => {
          if (event.detail !== 0) return;
          if (pickup.current?.index === index) { finish(); return; }
          if (pickup.current) finish();
          pickup.current = { index, origin: { ...positionsRef.current[index] }, wasMoved: moved.current.has(index), mode: 'keyboard', startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false };
          setActive(index); setFront(index);
          setAnnouncement(`${sticker.name} picked up. Use arrow keys to move, Shift for larger steps. Enter or Space places it. Escape cancels.`);
        }}
        onKeyDown={event => {
          if (pickup.current?.index !== index || !event.key.startsWith('Arrow')) return;
          event.preventDefault();
          pickup.current.mode = 'keyboard';
          const step = event.shiftKey ? 80 : 16;
          const position = positionsRef.current[index];
          place(index, position.x + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0), position.y + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0));
        }}
        onBlur={() => { if (pickup.current?.mode === 'keyboard' && pickup.current.index === index) finish(); }}>
        <img className={cn('sticker-art', sticker.id !== 'mark' && 'studio-sticker')} src={`/brand/${sticker.src}`} alt="" width={sticker.width} height={sticker.height} loading="lazy" decoding="async" draggable={false} />
      </button>)}
    </div>, canvasRef.current)}
    <div className="sticker-tools"><p id={hintId}>Make it yours. Drag a sticker, or click to pick up and place.<span className="sr-only"> Keyboard: Enter or Space picks up, arrow keys move, Shift moves farther, Enter or Space places, Escape cancels.</span></p><button type="button" className="sticker-reset" onClick={() => { pickup.current = null; setActive(null); setFront(null); moved.current.clear(); commit(homes.current.map(position => ({ ...position }))); setAnnouncement('All stickers returned to their original spots.'); }}><RotateCcw size={14} aria-hidden="true" /> Reset stickers</button></div>
    <span className="sr-only" role="status">{announcement}</span>
  </>;
}
