import React, { useEffect, useRef, useState } from 'react';
import { Site } from './Site';
import { ContactDialog } from './ContactDialog';
import { trackUtmParams } from '../UI/trackUtm';
import { applySeoToDocument } from '../../seo';
import './website.css';
import './navigation.css';
import './hero.css';
import './interactions.css';
import './brand.css';
import './footer.css';
import './contact.css';
import './built.css';

export default function ArdenoWebsite() {
  const [contact, setContact] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState('');
  const [prefillMessage, setPrefillMessage] = useState('');
  const contactTrigger = useRef<HTMLElement | null>(null);
  // Most callers pass this straight to onClick, so only strings count as an email or a message starter to prefill.
  const openContact = (email?: unknown, message?: unknown) => {
    setPrefillEmail(typeof email === 'string' ? email : '');
    setPrefillMessage(typeof message === 'string' ? message : '');
    contactTrigger.current = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : null;
    setContact(true);
  };

  useEffect(() => {
    applySeoToDocument('home');
    trackUtmParams();
    const url = new URL(window.location.href);
    if (url.searchParams.has('design_lab') || url.searchParams.has('direction')) {
      url.searchParams.delete('design_lab'); url.searchParams.delete('direction');
      window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
    }
    if (window.location.hash) {
      window.requestAnimationFrame(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView());
    }
  }, []);

  const returnContactFocus = () => {
    const target = contactTrigger.current?.isConnected
      ? contactTrigger.current
      : document.querySelector<HTMLButtonElement>('.header-contact');
    target?.focus();
  };

  return <div className="ardeno-site"><Site onContact={openContact} /><ContactDialog open={contact} onOpenChange={setContact} returnFocus={returnContactFocus} defaultEmail={prefillEmail} defaultMessage={prefillMessage} /></div>;
}
