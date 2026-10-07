import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, Check, LoaderCircle, Mail, X } from 'lucide-react';
import { Turnstile } from '../../components/UI/Turnstile';
import { getStoredUtm } from '../../components/UI/trackUtm';

type Fields = { name: string; email: string; company: string; phone: string; message: string; website: string };
const initial: Fields = { name: '', email: '', company: '', phone: '', message: '', website: '' };
type State = 'idle' | 'sending' | 'success' | 'error';

export function ContactDialog({ open, onOpenChange, returnFocus, defaultEmail = '', defaultMessage = '' }: { open: boolean; onOpenChange: (value: boolean) => void; returnFocus: () => void; defaultEmail?: string; defaultMessage?: string }) {
  const [fields, setFields] = useState(initial);
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  // An email typed elsewhere on the page (the footer form) is filled in when the dialog opens.
  useEffect(() => { if (open && defaultEmail) setFields(current => ({ ...current, email: defaultEmail })); }, [open, defaultEmail]);
  // A quick-start chip on the page opens the dialog with the first sentence of the message written. It fills an empty box, swaps an
  // earlier starter (keeping whatever was typed after it), and never overwrites a message the visitor wrote themselves.
  const starter = useRef('');
  useEffect(() => {
    if (!open || !defaultMessage) return;
    const previous = starter.current;
    starter.current = defaultMessage;
    setFields(current => {
      if (!current.message.trim()) return { ...current, message: defaultMessage };
      if (previous && current.message.startsWith(previous)) return { ...current, message: defaultMessage + current.message.slice(previous.length) };
      return current;
    });
  }, [open, defaultMessage]);
  const local = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const needsChallenge = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY) && !local;
  const verify = useCallback((value: string) => setToken(value), []);
  const expire = useCallback(() => setToken(''), []);
  const update = (name: keyof Fields, value: string) => { setFields(current => ({ ...current, [name]: value })); if (state === 'error') { setState('idle'); setError(''); } };
  const close = (value: boolean) => { if (state === 'sending') return; onOpenChange(value); };
  const draftHref = `mailto:ardenostudio@gmail.com?subject=${encodeURIComponent(`Project enquiry${fields.company ? ` — ${fields.company}` : ''}`)}&body=${encodeURIComponent(`Hi Ardeno,\n\n${fields.message}\n\nName: ${fields.name}\nEmail: ${fields.email}\nCompany: ${fields.company || 'Not specified'}\nPhone: ${fields.phone || 'Not specified'}\n`)}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'sending') return;
    if (fields.website) return;
    if (fields.name.trim().length < 2 || fields.message.trim().length < 10) {
      setError('Please add your name and a short project description of at least 10 characters.');
      setState('error');
      return;
    }
    if (local) { window.location.href = draftHref; return; }
    if (needsChallenge && !token) { setError('Please complete the verification below before sending.'); setState('error'); return; }
    setState('sending'); setError('');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 20000);
    try {
      const utm = getStoredUtm();
      const response = await fetch('/api/send-email', { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify({ ...fields, name: fields.name.trim(), email: fields.email.trim(), message: fields.message.trim(), company: fields.company.trim() || '-', phone: fields.phone?.trim() || undefined, turnstileToken: token, utm_source: utm.utm_source || 'direct', utm_medium: utm.utm_medium || 'none', utm_campaign: utm.utm_campaign || 'none', page_path: window.location.pathname, page_url: window.location.href, referrer: document.referrer || 'direct', submitted_at: new Date().toISOString() }) });
      if (!response.ok) throw new Error('Delivery unavailable');
      setState('success'); setFields(initial); setToken('');
    } catch { setState('error'); setToken(''); setError('We couldn’t send your enquiry. Please try again, or email us directly below.'); }
    finally { window.clearTimeout(timer); }
  }

  return <Dialog.Root open={open} onOpenChange={close}><Dialog.Portal><Dialog.Overlay className="studio-overlay" /><Dialog.Content onCloseAutoFocus={event => { event.preventDefault(); returnFocus(); }} className="studio-modal contact-modal">
    <Dialog.Close asChild><button className="modal-close icon-button" aria-label="Close contact form" disabled={state === 'sending'}><X size={20} /></button></Dialog.Close>
    <div className="contact-dialog-aside"><span className="modal-eyebrow">LET’S MAKE SOMETHING GOOD.</span><Dialog.Title>{state === 'success' ? <>A good start.<br /><em>Thank you.</em></> : <>It starts<br />with <em>hello.</em></>}</Dialog.Title><Dialog.Description>Tell us a little about your idea. A rough sketch is more than enough.</Dialog.Description><div className="contact-dialog-links"><a href="mailto:ardenostudio@gmail.com"><Mail size={16} /> ardenostudio@gmail.com</a><a href="https://wa.me/94758504424" target="_blank" rel="noopener noreferrer">Prefer WhatsApp? <ArrowUpRight size={16} /></a><span>Colombo, Sri Lanka · Working globally</span></div></div>
    <div className="contact-dialog-form">{state === 'success' ? <div className="contact-success" role="status"><span><Check size={30} /></span><h3>Your enquiry is with us.</h3><p>We’ll get back to you at the email address you provided.</p><button className="site-button" onClick={() => { setState('idle'); onOpenChange(false); }}>Back to exploring <ArrowUpRight size={17} /></button></div> : <form onSubmit={submit}>
      <div className="form-row"><label>Your name <span>*</span><input name="name" value={fields.name} onChange={e => update('name', e.target.value)} autoComplete="name" placeholder="Alex, for example" required minLength={2} maxLength={100} disabled={state === 'sending'} /></label><label>Email address <span>*</span><input name="email" value={fields.email} onChange={e => update('email', e.target.value)} type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254} disabled={state === 'sending'} /></label></div>
      <div className="form-row"><label>Company <span className="optional">optional</span><input name="company" value={fields.company} onChange={e => update('company', e.target.value)} autoComplete="organization" placeholder="Your company or brand" maxLength={150} disabled={state === 'sending'} /></label><label>Phone or WhatsApp <span className="optional">optional</span><input name="phone" type="tel" value={fields.phone} onChange={e => update('phone', e.target.value)} autoComplete="tel" placeholder="e.g. +94 77 123 4567" maxLength={50} disabled={state === 'sending'} /></label></div>
      <label>A little about your project <span>*</span><textarea name="message" value={fields.message} onChange={e => update('message', e.target.value)} placeholder="What are you working on? What would you like to make happen?" required minLength={10} maxLength={5000} rows={4} disabled={state === 'sending'} /></label>
      <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="website" value={fields.website} onChange={e => update('website', e.target.value)} tabIndex={-1} autoComplete="off" /></label></div>
      {needsChallenge && <Turnstile key={state === 'error' ? 'retry' : 'initial'} onVerify={verify} onExpire={expire} />}
      {error && <p className="form-error" role="alert">{error}</p>}
      {local && <p className="local-form-note">This local preview opens an email draft. On the live site, enquiries are delivered directly to the studio.</p>}
      <button className="site-button form-submit" type="submit" disabled={state === 'sending'}>{state === 'sending' ? <><LoaderCircle size={17} className="sending-spinner" /> Sending…</> : <>{local ? 'Create email draft' : 'Send your enquiry'}<ArrowUpRight size={17} /></>}</button>
      <p className="form-privacy">We use your details only to respond to your enquiry.</p>
      {state === 'error' && <a className="form-fallback" href={draftHref}>Email your enquiry instead <ArrowUpRight size={15} /></a>}
    </form>}</div>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}
