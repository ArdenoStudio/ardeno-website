import React, { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, Check, LoaderCircle } from 'lucide-react';
import { Turnstile } from '../UI/Turnstile';
import { getStoredUtm } from '../UI/trackUtm';

type Fields = { name: string; email: string; company: string; phone: string; budget: string; message: string; website: string };
const initial: Fields = { name: '', email: '', company: '', phone: '', budget: '', message: '', website: '' };
const budgetOptions = ['Under LKR 50,000', 'LKR 50,000 - 150,000', 'LKR 150,000 - 500,000', 'LKR 500,000 - 1,000,000', 'LKR 1,000,000+', "Let's discuss"];
type State = 'idle' | 'sending' | 'success' | 'error';


// Keep an unfinished enquiry when visitors browse away and return during this visit.
// It stays in memory; contact details are never put in URLs or persistent browser storage.
let visitDraft = initial;
let messageStarter = '';
export function prepareContactDraft(email?: string, message?: string) {
  if (email) visitDraft = { ...visitDraft, email };
  if (message) {
    if (!visitDraft.message.trim()) visitDraft = { ...visitDraft, message };
    else if (messageStarter && visitDraft.message.startsWith(messageStarter)) visitDraft = { ...visitDraft, message: message + visitDraft.message.slice(messageStarter.length) };
    messageStarter = message;
  }
  window.dispatchEvent(new Event('ardeno:contact-prefill'));
}

// onDone: where the sheet shows the form, the success message's button closes the sheet instead of going to the homepage.
// onSent: told when an enquiry has gone through, so the sheet can play its "sent" close.
export function ContactForm({ onDone, onSent }: { onDone?: () => void; onSent?: () => void } = {}) {
  const [fields, setFields] = useState(visitDraft);
  useEffect(() => { visitDraft = fields; }, [fields]);
  const [state, setState] = useState<State>('idle');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  useEffect(() => {
    const prefill = () => setFields(visitDraft);
    window.addEventListener('ardeno:contact-prefill', prefill);
    return () => window.removeEventListener('ardeno:contact-prefill', prefill);
  }, []);
  const local = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
  const needsChallenge = Boolean(import.meta.env.VITE_TURNSTILE_SITE_KEY) && !local;
  const verify = useCallback((value: string) => setToken(value), []);
  const expire = useCallback(() => setToken(''), []);
  const update = (name: keyof Fields, value: string) => { setFields(current => ({ ...current, [name]: value })); if (state === 'error') { setState('idle'); setError(''); } };
  const draftHref = `mailto:hello@ardenostudio.com?subject=${encodeURIComponent(`Project enquiry${fields.company ? ` — ${fields.company}` : ''}`)}&body=${encodeURIComponent(`Hi Ardeno,\n\n${fields.message}\n\nName: ${fields.name}\nEmail: ${fields.email}\nCompany: ${fields.company || 'Not specified'}\nPhone: ${fields.phone || 'Not specified'}\nBudget: ${fields.budget || 'Not specified'}\n`)}`;

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
      setState('success'); setFields(initial); messageStarter = ''; setToken(''); onSent?.();
    } catch { setState('error'); setToken(''); setError('We couldn’t send your enquiry. Please try again, or email us directly below.'); }
    finally { window.clearTimeout(timer); }
  }


  return <div className="contact-dialog-form">{state === 'success' ? <div className="contact-success" role="status"><span><Check size={30} /></span><h3>Your enquiry is with us.</h3><p>We’ll get back to you at the email address you provided.</p>{onDone ? <button type="button" className="site-button" onClick={onDone}>Back to exploring <ArrowUpRight size={17} /></button> : <a className="site-button" href="/">Back to exploring <ArrowUpRight size={17} /></a>}</div> : <form onSubmit={submit}>
      <div className="form-row"><label>Your name <span>*</span><input name="name" value={fields.name} onChange={e => update('name', e.target.value)} autoComplete="name" placeholder="Alex, for example" required minLength={2} maxLength={80} disabled={state === 'sending'} /></label><label>Email address <span>*</span><input name="email" value={fields.email} onChange={e => update('email', e.target.value)} type="email" autoComplete="email" placeholder="you@company.com" required maxLength={254} disabled={state === 'sending'} /></label></div>
      <div className="form-row"><label>Company <span className="optional">optional</span><input name="company" value={fields.company} onChange={e => update('company', e.target.value)} autoComplete="organization" placeholder="Your company or brand" maxLength={120} disabled={state === 'sending'} /></label><label>Phone or WhatsApp <span className="optional">optional</span><input name="phone" type="tel" value={fields.phone} onChange={e => update('phone', e.target.value)} autoComplete="tel" placeholder="e.g. +94 77 123 4567" maxLength={80} disabled={state === 'sending'} /></label></div>
      <label>Budget range <span className="optional">optional</span><select name="budget" value={fields.budget} onChange={e => update('budget', e.target.value)} disabled={state === 'sending'}><option value="">Select a range</option>{budgetOptions.map(budget => <option key={budget} value={budget}>{budget}</option>)}</select></label>
      <label>A little about your project <span>*</span><textarea name="message" value={fields.message} onChange={e => update('message', e.target.value)} placeholder="What are you working on? What would you like to make happen?" required minLength={10} maxLength={4000} rows={4} disabled={state === 'sending'} /></label>
      <div className="honeypot" aria-hidden="true"><label>Leave this empty<input name="website" value={fields.website} onChange={e => update('website', e.target.value)} tabIndex={-1} autoComplete="off" /></label></div>
      {needsChallenge && <Turnstile key={state === 'error' ? 'retry' : 'initial'} onVerify={verify} onExpire={expire} />}
      {error && <p className="form-error" role="alert">{error}</p>}
      {local && <p className="local-form-note">This local preview opens an email draft. On the live site, enquiries are delivered directly to the studio.</p>}
      <button className="site-button form-submit" type="submit" disabled={state === 'sending'}>{state === 'sending' ? <><LoaderCircle size={17} className="sending-spinner" /> Sending…</> : <>{local ? 'Create email draft' : 'Send your enquiry'}<ArrowUpRight size={17} /></>}</button>
      <p className="form-privacy">We use your details only to respond to your enquiry.</p>
      {state === 'error' && <a className="form-fallback" href={draftHref}>Email your enquiry instead <ArrowUpRight size={15} /></a>}
    </form>}</div>;
}
