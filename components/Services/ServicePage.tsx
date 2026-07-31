import React, { useId, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowUpRight,
  Bot,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  Layers3,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import servicePagesConfig from '../../service-pages.json';
import { Footer } from '../Layout/Footer';

export type ServicePageKey = keyof typeof servicePagesConfig.pages;

type ServicePageProps = {
  pageKey: ServicePageKey;
  onOpenContact?: () => void;
};

const FONT_DISPLAY = 'var(--font-display)';
const FONT_BODY = 'var(--font-body)';
const FONT_BRAND = 'var(--font-brand)';
const FONT_UI = 'var(--font-ui)';
const RED = '#E50914';

const ICONS: Record<string, LucideIcon> = {
  bot: Bot,
  calendar: CalendarCheck,
  monitor: MonitorSmartphone,
  refresh: RefreshCw,
};

const navigateTo = (href: string) => {
  if (href.startsWith('mailto:') || href.startsWith('http')) {
    window.location.href = href;
    return;
  }

  window.history.pushState({}, '', href);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo(0, 0);
};

const ServiceFaqItem: React.FC<{
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}> = ({ question, answer, open, onToggle }) => {
  const panelId = useId();
  const buttonId = useId();

  return (
    <article
      className="service-faq-item"
      data-open={open ? 'true' : 'false'}
    >
      <h3 className="service-faq-heading">
        <button
          type="button"
          id={buttonId}
          className="service-faq-trigger"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span>{question}</span>
          <ChevronDown className="service-faq-chevron h-4 w-4 flex-shrink-0" aria-hidden="true" />
        </button>
      </h3>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!open}
        className="service-faq-panel"
      >
        <p className="service-faq-answer">{answer}</p>
      </div>
    </article>
  );
};

export const ServicePage: React.FC<ServicePageProps> = ({ pageKey, onOpenContact }) => {
  const page = servicePagesConfig.pages[pageKey];
  const Icon = ICONS[page.icon] ?? Layers3;
  const isGuide = page.kind === 'guide';
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const outcomesHeadingId = useId();
  const processHeadingId = useId();
  const faqsHeadingId = useId();
  const relatedHeadingId = useId();

  const proofItems = [
    page.process?.length
      ? { label: 'Typical timeline', value: `${page.process.length}-step path` }
      : null,
    page.idealFor?.[0]
      ? {
          label: 'Best for',
          value: page.idealFor[0].replace(/\.$/, '').split(',')[0].trim(),
        }
      : page.shortLabel
        ? { label: 'Best for', value: page.shortLabel }
        : null,
    page.outcomes?.length
      ? {
          label: 'Deliverables',
          value: `${page.outcomes.length} included`,
        }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const startProject = () => {
    if (onOpenContact) {
      onOpenContact();
      return;
    }

    window.location.href = 'mailto:ardenostudio@gmail.com?subject=Ardeno%20project%20question';
  };

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('http') || href.startsWith('mailto:')) return;
    event.preventDefault();
    navigateTo(href);
  };

  const handleServicesClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent('docs:exit', { detail: { hash: '#services' } }));
  };

  return (
    <div className="service-page bg-[#050506] text-white" style={{ fontFamily: FONT_BODY }}>
      <style>{`
        .service-page {
          min-height: 100vh;
          overflow-x: clip;
          background:
            linear-gradient(180deg, rgba(229,9,20,0.06), rgba(5,5,6,0) 330px),
            #050506;
        }
        .service-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 140px;
        }
        .service-shell {
          width: min(100%, 1160px);
          margin: 0 auto;
          padding-left: 24px;
          padding-right: 24px;
        }
        .service-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 60;
          padding: 16px 16px 0;
          pointer-events: none;
        }
        .service-header-inner {
          pointer-events: auto;
          width: min(100%, 1040px);
          height: 64px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 0 18px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.09);
          background: linear-gradient(180deg, rgba(10,10,11,0.9), rgba(10,10,11,0.76));
          box-shadow: 0 18px 50px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04);
          backdrop-filter: blur(18px) saturate(140%);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
        }
        .service-header-title {
          display: block;
          font-family: ${FONT_BRAND};
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
        }
        .service-header-subtitle {
          display: block;
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 800;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
        }
        .service-button,
        .service-link-button,
        .service-related-link {
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .service-button:focus-visible,
        .service-link-button:focus-visible,
        .service-related-link:focus-visible {
          outline: 2px solid rgba(229,9,20,0.9);
          outline-offset: 3px;
        }
        .service-link-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.035);
          color: rgba(255,255,255,0.66);
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
        }
        .service-link-button:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.055);
        }
        .service-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 46px;
          border-radius: 999px;
          padding: 0 20px;
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .service-button[data-variant="primary"] {
          border: 1px solid rgba(255,70,70,0.45);
          background: linear-gradient(180deg, #ff2a2a 0%, #E50914 100%);
          color: #fff;
          box-shadow: 0 10px 28px rgba(229,9,20,0.22);
        }
        .service-button[data-variant="primary"]:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 0 4px rgba(229,9,20,0.14), 0 14px 34px rgba(229,9,20,0.3);
        }
        .service-button[data-variant="secondary"] {
          border: 1px solid rgba(255,255,255,0.11);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.72);
        }
        .service-button[data-variant="secondary"]:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.24);
          background: rgba(255,255,255,0.055);
        }
        .service-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 48px;
          align-items: end;
        }
        .service-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 800;
          color: rgba(255,255,255,0.54);
          text-transform: uppercase;
        }
        .service-eyebrow::before {
          content: "";
          width: 30px;
          height: 1px;
          background: ${RED};
        }
        .service-title {
          margin-top: 24px;
          max-width: 850px;
          font-family: ${FONT_DISPLAY};
          font-size: 74px;
          line-height: 0.98;
          font-weight: 400;
          color: #fff;
          letter-spacing: 0;
        }
        .service-copy {
          margin-top: 24px;
          max-width: 680px;
          font-size: 15px;
          line-height: 1.85;
          color: rgba(255,255,255,0.62);
        }
        .service-panel {
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.09);
          background: linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.026));
          box-shadow: 0 24px 70px rgba(0,0,0,0.32);
          padding: 24px;
        }
        .service-icon-box {
          display: flex;
          height: 52px;
          width: 52px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid rgba(229,9,20,0.25);
          background: rgba(229,9,20,0.1);
          color: ${RED};
        }
        .service-list {
          display: grid;
          gap: 10px;
          margin: 20px 0 0;
          padding: 0;
          list-style: none;
        }
        .service-list-item {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          font-size: 13px;
          line-height: 1.65;
          color: rgba(255,255,255,0.6);
        }
        .service-section {
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 54px;
          padding-bottom: 54px;
        }
        .service-section-title {
          font-family: ${FONT_DISPLAY};
          font-size: 46px;
          line-height: 1.02;
          color: #fff;
          letter-spacing: 0;
        }
        .service-section-copy {
          font-size: 14px;
          line-height: 1.85;
          color: rgba(255,255,255,0.58);
        }
        .service-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .service-card {
          min-height: 118px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          padding: 18px;
        }
        .service-process {
          counter-reset: process;
          display: grid;
          gap: 10px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .service-process-item {
          counter-increment: process;
          display: grid;
          grid-template-columns: 52px minmax(0, 1fr);
          gap: 16px;
          align-items: center;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          padding: 14px;
        }
        .service-process-item::before {
          content: counter(process, decimal-leading-zero);
          display: flex;
          height: 42px;
          width: 42px;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: rgba(229,9,20,0.1);
          color: ${RED};
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 900;
        }
        .service-related {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .service-related-link {
          display: flex;
          min-height: 86px;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          padding: 18px;
          color: rgba(255,255,255,0.78);
          text-decoration: none;
        }
        .service-related-link:hover {
          color: #fff;
          border-color: rgba(229,9,20,0.34);
          background: rgba(229,9,20,0.06);
          transform: translateY(-1px);
        }
        .service-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.38);
          list-style: none;
          padding: 0;
          margin-left: 0;
        }
        .service-breadcrumb li {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .service-breadcrumb li + li::before {
          content: "/";
          color: rgba(255,255,255,0.22);
          margin-right: 2px;
        }
        .service-breadcrumb a {
          color: rgba(255,255,255,0.48);
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .service-breadcrumb a:hover {
          color: #fff;
        }
        .service-breadcrumb [aria-current="page"] {
          color: rgba(255,255,255,0.82);
        }
        .service-proof-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 28px;
          padding: 18px 0 0;
          border-top: 1px solid rgba(255,255,255,0.08);
          list-style: none;
        }
        .service-proof-strip li {
          min-width: 0;
        }
        .service-proof-label {
          display: block;
          font-family: ${FONT_UI};
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.38);
          margin-bottom: 8px;
        }
        .service-proof-value {
          display: block;
          font-size: 14px;
          line-height: 1.45;
          color: rgba(255,255,255,0.78);
        }
        .service-faq-list {
          display: grid;
          gap: 12px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .service-faq-item {
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          overflow: hidden;
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .service-faq-item[data-open="true"] {
          border-color: rgba(229,9,20,0.42);
          background: linear-gradient(180deg, rgba(229,9,20,0.1), rgba(255,255,255,0.03));
          box-shadow: inset 3px 0 0 ${RED};
        }
        .service-faq-heading {
          margin: 0;
        }
        .service-faq-trigger {
          display: flex;
          width: 100%;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 18px;
          border: 0;
          background: transparent;
          color: #fff;
          text-align: left;
          cursor: pointer;
          font-family: ${FONT_DISPLAY};
          font-size: 18px;
          line-height: 1.3;
        }
        .service-faq-trigger:focus-visible {
          outline: 2px solid rgba(229,9,20,0.9);
          outline-offset: -2px;
        }
        .service-faq-chevron {
          color: rgba(255,255,255,0.4);
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .service-faq-item[data-open="true"] .service-faq-chevron {
          transform: rotate(180deg);
          color: ${RED};
        }
        .service-faq-panel {
          padding: 0 18px 18px;
        }
        .service-faq-answer {
          margin: 0;
          font-size: 14px;
          line-height: 1.75;
          color: rgba(255,255,255,0.58);
        }
        @media (max-width: 980px) {
          .service-hero,
          .service-grid,
          .service-related,
          .service-faq-list,
          .service-proof-strip {
            grid-template-columns: 1fr;
          }
          .service-title {
            font-size: 58px;
          }
        }
        @media (max-width: 720px) {
          .service-shell {
            padding-left: 20px;
            padding-right: 20px;
          }
          .service-header {
            padding: 12px 12px 0;
          }
          .service-header-inner {
            height: 58px;
            border-radius: 24px;
            padding: 0 14px;
          }
          .service-header-subtitle,
          .service-header-action {
            display: none;
          }
          .service-link-button {
            min-height: 36px;
            padding: 0 12px;
          }
          .service-title {
            font-size: 44px;
            line-height: 1.03;
          }
          .service-section-title {
            font-size: 34px;
          }
          .service-copy {
            font-size: 14px;
          }
        }
      `}</style>

      <header className="service-header">
        <div className="service-header-inner">
          <a
            href="/"
            onClick={(event) => handleLinkClick(event, '/')}
            className="flex min-w-0 items-center gap-3 no-underline"
          >
            <img src="/ardeno-logo.svg" alt="Ardeno Studio" className="h-9 w-auto flex-shrink-0" draggable={false} />
            <span className="min-w-0">
              <span className="service-header-title">ARDENO</span>
              <span className="service-header-subtitle">/ {isGuide ? 'Guide' : 'Service'}</span>
            </span>
          </a>

          <div className="flex-1" />

          <a href="/" onClick={(event) => handleLinkClick(event, '/')} className="service-link-button">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Site</span>
          </a>

          <button type="button" onClick={startProject} className="service-button service-header-action" data-variant="primary">
            Start project
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-28">
        <section className="service-shell pb-16 pt-12 md:pb-20 md:pt-20">
          <nav aria-label="Breadcrumb">
            <ol className="service-breadcrumb">
              <li>
                <a href="/" onClick={(event) => handleLinkClick(event, '/')}>
                  Home
                </a>
              </li>
              <li>
                <a href="/#services" onClick={handleServicesClick}>
                  Services
                </a>
              </li>
              <li>
                <span aria-current="page">{page.shortLabel || page.eyebrow}</span>
              </li>
            </ol>
          </nav>

          <motion.div initial={false} className="service-hero">
            <div className="min-w-0">
              <div className="service-eyebrow">{page.eyebrow}</div>
              <h1 className="service-title">{page.title}</h1>
              <p className="service-copy">{page.intro}</p>
              <p className="service-copy">{page.summary}</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={startProject} className="service-button" data-variant="primary">
                  Talk to Ardeno
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
                <a
                  href="/faq"
                  onClick={(event) => handleLinkClick(event, '/faq')}
                  className="service-button"
                  data-variant="secondary"
                >
                  Read FAQ
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>

              {proofItems.length > 0 && (
                <ul className="service-proof-strip" aria-label="Service overview">
                  {proofItems.map((item) => (
                    <li key={item.label}>
                      <span className="service-proof-label">{item.label}</span>
                      <span className="service-proof-value">{item.value}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <aside className="service-panel" aria-label={`${page.shortLabel} summary`}>
              <div className="service-icon-box">
                <Icon className="h-6 w-6" />
              </div>
              <p className="mt-6 text-[11px] font-bold uppercase text-[#E50914]" style={{ fontFamily: FONT_UI }}>
                {isGuide ? 'Decision support' : 'Best fit'}
              </p>
              <ul className="service-list">
                {page.idealFor.map((item) => (
                  <li className="service-list-item" key={item}>
                    <CheckCircle2 className="mt-1 h-4 w-4 text-[#E50914]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </motion.div>
        </section>

        <section className="service-shell service-section" aria-labelledby={outcomesHeadingId}>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase text-[#E50914]" style={{ fontFamily: FONT_UI }}>
                What changes
              </p>
              <h2 id={outcomesHeadingId} className="service-section-title">
                {isGuide ? 'Decision criteria.' : 'Practical outcomes.'}
              </h2>
            </div>
            <p className="service-section-copy max-w-xl">
              Each page is written around what customers actually ask before they trust a web partner.
            </p>
          </div>

          <div className="service-grid">
            {page.outcomes.map((outcome) => (
              <div className="service-card" key={outcome}>
                <ShieldCheck className="mb-5 h-4 w-4 text-[#E50914]" aria-hidden="true" />
                <p className="text-[14px] leading-7 text-white/72">{outcome}</p>
              </div>
            ))}
          </div>
        </section>

        {page.sections.map((section, sectionIndex) => {
          const sectionHeadingId = `service-section-${sectionIndex}`;
          return (
            <section
              className="service-shell service-section"
              key={section.title}
              aria-labelledby={sectionHeadingId}
            >
              <div className="grid gap-10 md:grid-cols-[0.72fr_1fr] md:gap-16">
                <h2 id={sectionHeadingId} className="service-section-title">
                  {section.title}
                </h2>
                <div className="min-w-0">
                  {section.body.map((paragraph) => (
                    <p className="service-section-copy mb-5" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                  <ul className="service-list">
                    {section.bullets.map((item) => (
                      <li className="service-list-item" key={item}>
                        <CheckCircle2 className="mt-1 h-4 w-4 text-[#E50914]" aria-hidden="true" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}

        <section className="service-shell service-section" aria-labelledby={processHeadingId}>
          <div className="grid gap-10 md:grid-cols-[0.72fr_1fr] md:gap-16">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase text-[#E50914]" style={{ fontFamily: FONT_UI }}>
                How Ardeno handles it
              </p>
              <h2 id={processHeadingId} className="service-section-title">
                {isGuide ? 'A clear choice before build.' : 'A scoped build path.'}
              </h2>
            </div>
            <ol className="service-process">
              {page.process.map((step) => (
                <li className="service-process-item" key={step}>
                  <p className="text-[14px] leading-7 text-white/70">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="service-shell service-section" aria-labelledby={faqsHeadingId}>
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-bold uppercase text-[#E50914]" style={{ fontFamily: FONT_UI }}>
              Direct answers
            </p>
            <h2 id={faqsHeadingId} className="service-section-title">
              Questions this page answers.
            </h2>
          </div>

          <div className="service-faq-list">
            {page.faqs.map((item, index) => (
              <ServiceFaqItem
                key={item.question}
                question={item.question}
                answer={item.answer}
                open={openFaq === index}
                onToggle={() => setOpenFaq((current) => (current === index ? null : index))}
              />
            ))}
          </div>
        </section>

        <section className="service-shell service-section pb-20" aria-labelledby={relatedHeadingId}>
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase text-[#E50914]" style={{ fontFamily: FONT_UI }}>
                Keep reading
              </p>
              <h2 id={relatedHeadingId} className="service-section-title">
                Related Ardeno pages.
              </h2>
            </div>
            <button type="button" onClick={startProject} className="service-button self-start md:self-auto" data-variant="primary">
              Start a project
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="service-related">
            {page.related.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(event) => handleLinkClick(event, item.href)}
                className="service-related-link"
              >
                <span className="text-[14px] font-semibold">{item.label}</span>
                <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-[#E50914]" />
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer onOpenContact={startProject} />
    </div>
  );
};
