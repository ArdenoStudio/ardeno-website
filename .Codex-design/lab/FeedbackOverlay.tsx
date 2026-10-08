import React, { useEffect, useState } from 'react';
import { backgroundVariants } from './data/fixtures';
type Note = { variant: string; target: string; text: string };
export function FeedbackOverlay({ targetName, selectedVariant }: { targetName: string; selectedVariant: string }) {
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState(false);
  const [target, setTarget] = useState({ variant: selectedVariant, selector: 'Whole sequence' });
  const [comment, setComment] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [direction, setDirection] = useState('');
  const [status, setStatus] = useState('');
  const [exportText, setExportText] = useState('');
  useEffect(() => {
    if (!picking) return;
    document.body.classList.add('ml-picking');
    const pick = (event: MouseEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!element || element.closest('[data-feedback]')) return;
      const variant = element.closest<HTMLElement>('[data-variant]')?.dataset.variant;
      if (!variant) return;
      event.preventDefault(); event.stopPropagation();
      const scene = element.closest('.ml-scene');
      setTarget({ variant, selector: scene ? `[data-variant="${variant}"] .ml-scene` : `[data-variant="${variant}"] ${element.tagName.toLowerCase()}` });
      setPicking(false); setStatus(`Commenting on variant ${variant}.`);
    };
    document.addEventListener('click', pick, true);
    return () => { document.body.classList.remove('ml-picking'); document.removeEventListener('click', pick, true); };
  }, [picking]);
  const copy = async () => {
    if (!direction.trim()) { setStatus('Add an overall direction before copying.'); return; }
    const text = `## Design Lab Feedback\n\n**Target:** ${targetName}\n\n${notes.map(n => `### Variant ${n.variant}\n**${n.target}**\n${n.text}`).join('\n\n')}\n\n### Overall Direction\n${direction}`;
    setExportText(text);
    try { await navigator.clipboard.writeText(text); setStatus('Copied. Paste your feedback into this chat.'); }
    catch { setStatus('Select and copy the feedback below, then paste it into this chat.'); }
  };
  return <aside className="ml-feedback" data-feedback="true" aria-label="Design feedback">
    <button className="ml-feedback-toggle" onClick={() => { setOpen(!open); setPicking(false); setTarget({ variant: selectedVariant, selector: 'Whole sequence' }); }} aria-expanded={open}>{open ? 'Close feedback' : `Add feedback${notes.length ? ` (${notes.length})` : ''}`}</button>
    {open && <div className="ml-feedback-panel"><h2>Your notes</h2><p>Pick an element to comment on, or leave a note about the selected sequence.</p><button className="ml-button" aria-pressed={picking} onClick={() => setPicking(!picking)}>{picking ? 'Cancel picking' : 'Pick an element'}</button>
      <label>Variant<select value={target.variant} onChange={e => setTarget({ variant: e.target.value, selector: 'Whole sequence' })}>{backgroundVariants.map(v => <option key={v.id} value={v.id}>{v.id} · {v.name}</option>)}</select></label>
      <label>Comment<textarea value={comment} maxLength={2000} onChange={e => setComment(e.target.value)} placeholder="What works? What would you change?" rows={3} /></label>
      <button className="ml-button" disabled={!comment.trim()} onClick={() => { setNotes(current => [...current, { variant: target.variant, target: target.selector, text: comment.trim() }]); setComment(''); setStatus('Note saved.'); }}>Save note</button>
      {notes.map((n, i) => <div className="ml-note" key={i}><span>Variant {n.variant}</span><p>{n.text}</p><button aria-label={`Remove note ${i + 1}`} onClick={() => setNotes(current => current.filter((_, index) => index !== i))}>Remove</button></div>)}
      <label>Overall direction <span>required to copy</span><textarea value={direction} maxLength={3000} onChange={e => setDirection(e.target.value)} placeholder="For example: N, with M’s moving light." rows={3} /></label>
      <button className="ml-button ml-primary" onClick={copy}>Copy feedback for chat</button><p role="status">{status}</p>
      {exportText && <label>Feedback to paste<textarea readOnly value={exportText} rows={5} /></label>}
    </div>}
  </aside>;
}
