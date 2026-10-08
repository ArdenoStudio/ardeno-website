import React from 'react';
import { ArrowLeft, ArrowUpRight, Mail } from 'lucide-react';
import { Footer, SiteHeader } from './Site';
import { ContactForm } from './ContactForm';
import { useSiteInteractions } from './interactions';
import './contactPage.css';

export function ContactPage({ onContact }: { onContact: (email?: string, message?: string) => void }) {
  useSiteInteractions();
  return <div className="site-shell contact-page-shell" id="top">
    <a className="site-skip-link" href="#enquiry">Skip to enquiry form</a>
    <SiteHeader onContact={onContact} />
    <main className="contact-page" id="page-content" tabIndex={-1}>
      <div className="contact-page-topline"><a href="/" className="portfolio-back"><ArrowLeft size={16} aria-hidden="true" /><span className="ul">Back to the studio</span></a><span>Colombo ↗ Everywhere</span></div>
      <div className="contact-page-grid">
        <section className="contact-page-intro" aria-labelledby="contact-title">
          <span className="portfolio-eyebrow">A new chapter starts here</span>
          <h1 id="contact-title" tabIndex={-1}>It starts<br />with hello<span>.</span></h1>
          <p className="contact-page-lead">A new idea, a fresh start, or something you’re still figuring out. We’d love to hear it.</p>
          <div className="contact-page-direct"><a href="mailto:ardenostudio@gmail.com"><Mail size={18} aria-hidden="true" /><span className="ul">ardenostudio@gmail.com</span><ArrowUpRight size={17} aria-hidden="true" /></a><a href="https://wa.me/94758504424" target="_blank" rel="noopener noreferrer"><span className="ul">Prefer WhatsApp?</span><ArrowUpRight size={17} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a></div>
          <div className="contact-page-next"><span className="status-dot" aria-hidden="true" /><p>We reply within 24 hours.<br /><span>You’ll speak directly with the founders.</span></p></div>
        </section>
        <section className="contact-page-enquiry" id="enquiry" aria-labelledby="enquiry-title">
          <div className="contact-page-form-heading"><span className="portfolio-eyebrow">Tell us a little</span><h2 id="enquiry-title">What do you have in mind?</h2><p>A rough sketch is enough. We’ll work out the details together.</p></div>
          <ContactForm />
        </section>
      </div>
    </main>
    <Footer onContact={onContact} />
  </div>;
}
