import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    Code2,
    HelpCircle,
    MessageCircle,
    Search,
    ShieldCheck,
    WalletCards,
    type LucideIcon,
} from 'lucide-react';
import { Footer } from '../Layout/Footer';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_DISPLAY = 'var(--font-display)';
const FONT_BODY = 'var(--font-body)';
const FONT_BRAND = 'var(--font-brand)';
const FONT_UI = 'var(--font-ui)';
const RED = '#E50914';

interface FAQPageProps {
    onOpenContact?: () => void;
}

interface FAQItem {
    q: string;
    a: string;
}

interface FAQCategory {
    label: string;
    summary: string;
    metric: string;
    icon: LucideIcon;
    items: FAQItem[];
}

const FAQS: FAQCategory[] = [
    {
        label: 'Pricing & Budgets',
        summary: 'How quotes, deposits, and included work are handled.',
        metric: 'Custom quote',
        icon: WalletCards,
        items: [
            {
                q: 'How much does a website from Ardeno cost?',
                a: 'Every project is scoped individually because every business is different. Pricing depends on complexity, custom features, content, integrations, and launch goals. After a short discovery call, we send a clear custom quote with the work broken down before you commit.',
            },
            {
                q: 'Do you offer payment plans?',
                a: "Yes. We usually work with a 30% upfront deposit and 70% on delivery. Larger projects can be split into milestones so the payment schedule matches the actual build progress.",
            },
            {
                q: "What's included in the price?",
                a: "Design, development, responsive layout, basic SEO setup, production launch checks, and one post-launch revision round are typically included. Hosting, domain registration, ongoing content updates, and maintenance are quoted separately so there are no surprise costs.",
            },
        ],
    },
    {
        label: 'Timeline & Process',
        summary: 'What happens from first call to launch.',
        metric: '2-8 weeks',
        icon: Clock3,
        items: [
            {
                q: 'How long does it take to build a website?',
                a: "A standard business website usually takes 2-4 weeks from kickoff to launch. More complex builds such as portals, e-commerce flows, dashboards, or custom systems usually run 4-8 weeks. We will give you a realistic timeline before work starts.",
            },
            {
                q: 'What does your process look like?',
                a: "We work through discovery, design, development, and launch. First we understand the business and audience, then design the experience, build the approved direction, test it properly, and hand it over with the key launch details documented.",
            },
            {
                q: 'Do I need to prepare anything before we start?',
                a: "Helpful starting material includes your logo, brand colors, website copy, service details, images, and links to sites you like or dislike. If you do not have these ready, we can help shape the content and recommend what is worth preparing first.",
            },
        ],
    },
    {
        label: 'Revisions & Ownership',
        summary: 'How control, handover, and revisions work.',
        metric: 'You own it',
        icon: ShieldCheck,
        items: [
            {
                q: 'How many revisions do I get?',
                a: "We refine the design during the agreed design phase until the direction is right before development starts. After launch, each project includes one revision round. Extra changes or new scope after that are quoted clearly before we proceed.",
            },
            {
                q: "Who owns the website after it's built?",
                a: 'You do. Once final payment is made, ownership of the delivered code and design passes to you. We avoid lock-in, hidden platform fees, and vague licensing terms.',
            },
            {
                q: 'Can I update the website myself after launch?',
                a: "Yes. If self-editing matters, we can build with a CMS or an admin-friendly content setup so you can update text, images, posts, or selected sections without touching code.",
            },
        ],
    },
    {
        label: 'Services & Scope',
        summary: 'What Ardeno builds beyond simple pages.',
        metric: 'Web + systems',
        icon: Code2,
        items: [
            {
                q: 'Do you only build websites?',
                a: 'Websites are the core, but we also build booking systems, client portals, admin dashboards, internal tools, AI-assisted lead flows, and custom web applications. If it lives in a browser and needs to work well, it is probably in scope.',
            },
            {
                q: 'Do you do ongoing maintenance?',
                a: 'Yes. We offer monthly maintenance for businesses that want ongoing support, updates, backups, security patches, content changes, and small improvements after launch.',
            },
            {
                q: 'Do you work with clients outside Sri Lanka?',
                a: 'Yes. We can work remotely with clients outside Sri Lanka. Calls, approvals, design reviews, and handover can all happen online.',
            },
            {
                q: 'Can you redesign my existing website?',
                a: "Yes. Redesigns are one of our most useful project types. We audit what is working, identify what is hurting trust or conversion, and rebuild from a stronger foundation while keeping anything worth preserving.",
            },
        ],
    },
];

const HIGHLIGHTS: { label: string; value: string; icon: LucideIcon }[] = [
    { label: 'Quote style', value: 'Clear scope', icon: WalletCards },
    { label: 'Launch pace', value: '2-8 weeks', icon: Clock3 },
    { label: 'Handover', value: 'No lock-in', icon: ShieldCheck },
];

const SUPPORT_ROUTES = [
    { label: 'Ask the AI assistant', action: 'ai', icon: MessageCircle },
    { label: 'Start a project', action: 'contact', icon: ArrowUpRight },
];

const AccordionItem: React.FC<{ item: FAQItem; index: number; defaultOpen?: boolean }> = ({
    item,
    index,
    defaultOpen = false,
}) => {
    const [open, setOpen] = useState(defaultOpen);
    const id = item.q.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, ease: EASE, delay: index * 0.04 }}
            className="faq-question-row"
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="faq-question-button group"
                aria-expanded={open}
                aria-controls={`${id}-answer`}
            >
                <span className="faq-question-text">{item.q}</span>
                <span className="faq-question-icon" aria-hidden="true">
                    <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.24, ease: EASE }}>
                        <ArrowUpRight className="h-4 w-4" />
                    </motion.span>
                </span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        id={`${id}-answer`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.34, ease: EASE }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p className="faq-answer">{item.a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const FAQPage: React.FC<FAQPageProps> = ({ onOpenContact }) => {
    const [activeCategory, setActiveCategory] = useState(0);
    const [query, setQuery] = useState('');

    const normalizedQuery = query.trim().toLowerCase();
    const totalQuestions = FAQS.reduce((total, category) => total + category.items.length, 0);

    const filteredCategories = useMemo(() => {
        if (!normalizedQuery) return FAQS;

        return FAQS
            .map((category) => ({
                ...category,
                items: category.items.filter((item) =>
                    `${category.label} ${category.summary} ${item.q} ${item.a}`.toLowerCase().includes(normalizedQuery)
                ),
            }))
            .filter((category) => category.items.length > 0);
    }, [normalizedQuery]);

    const active = FAQS[activeCategory] ?? FAQS[0];
    const displayedCategories = normalizedQuery ? filteredCategories : [active];
    const displayedCount = displayedCategories.reduce((total, category) => total + category.items.length, 0);

    const navigateHome = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        e.preventDefault();
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo(0, 0);
    };

    const startProject = () => {
        if (onOpenContact) {
            onOpenContact();
            return;
        }

        window.location.href = 'mailto:ardenostudio@gmail.com?subject=Project%20question';
    };

    const openAIChat = () => {
        const isOpen = document.querySelector('[role="dialog"][aria-label="AI assistant"]');
        if (isOpen) return;
        const fab = document.getElementById('ardeno-ai-fab') as HTMLButtonElement | null;
        fab?.click();
    };

    const handleSupportAction = (action: string) => {
        if (action === 'ai') {
            openAIChat();
            return;
        }

        startProject();
    };

    return (
        <div className="faq-page bg-[#050506] text-white" style={{ fontFamily: FONT_BODY }}>
            <style>{`
        .faq-page {
          min-height: 100vh;
          overflow-x: clip;
          background:
            linear-gradient(180deg, rgba(229,9,20,0.055), rgba(5,5,6,0) 280px),
            #050506;
        }
        .faq-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 140px;
        }
        .faq-shell {
          width: min(100%, 1180px);
          margin: 0 auto;
          padding-left: 24px;
          padding-right: 24px;
        }
        .faq-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 60;
          padding: 16px 16px 0;
          pointer-events: none;
        }
        .faq-header-inner {
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
        .faq-header-title {
          font-family: ${FONT_BRAND};
          font-size: 13px;
          font-weight: 800;
          color: #fff;
          text-transform: uppercase;
        }
        .faq-header-subtitle {
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 800;
          color: rgba(255,255,255,0.38);
          text-transform: uppercase;
        }
        .faq-nav-button,
        .faq-primary-button,
        .faq-secondary-button,
        .faq-category-button,
        .faq-support-button,
        .faq-question-button {
          transition: border-color 0.2s ease, background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .faq-nav-button:focus-visible,
        .faq-primary-button:focus-visible,
        .faq-secondary-button:focus-visible,
        .faq-category-button:focus-visible,
        .faq-support-button:focus-visible,
        .faq-question-button:focus-visible,
        .faq-search-input:focus-visible {
          outline: 2px solid rgba(229,9,20,0.9);
          outline-offset: 3px;
        }
        .faq-nav-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.035);
          color: rgba(255,255,255,0.64);
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          text-decoration: none;
          white-space: nowrap;
        }
        .faq-nav-button:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.2);
          background: rgba(255,255,255,0.055);
        }
        .faq-primary-button,
        .faq-secondary-button {
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
        .faq-primary-button {
          border: 1px solid rgba(255,70,70,0.45);
          background: linear-gradient(180deg, #ff2a2a 0%, #E50914 100%);
          color: #fff;
          box-shadow: 0 10px 28px rgba(229,9,20,0.22);
        }
        .faq-primary-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 0 0 4px rgba(229,9,20,0.14), 0 14px 34px rgba(229,9,20,0.3);
        }
        .faq-secondary-button {
          border: 1px solid rgba(255,255,255,0.11);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.72);
        }
        .faq-secondary-button:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.24);
          background: rgba(255,255,255,0.055);
        }
        .faq-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 48px;
          align-items: end;
        }
        .faq-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 800;
          color: rgba(255,255,255,0.54);
          text-transform: uppercase;
        }
        .faq-eyebrow::before {
          content: "";
          width: 30px;
          height: 1px;
          background: ${RED};
        }
        .faq-hero-title {
          margin-top: 24px;
          max-width: 820px;
          font-family: ${FONT_DISPLAY};
          font-size: 5.2rem;
          line-height: 0.96;
          font-weight: 400;
          color: #fff;
          letter-spacing: 0;
          text-wrap: balance;
        }
        .faq-hero-title em {
          color: rgba(255,255,255,0.42);
          font-style: italic;
        }
        .faq-hero-copy {
          margin-top: 24px;
          max-width: 620px;
          font-size: 15px;
          line-height: 1.85;
          color: rgba(255,255,255,0.62);
        }
        .faq-brief-panel {
          border: 1px solid rgba(255,255,255,0.09);
          background: linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02));
          border-radius: 18px;
          padding: 22px;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.045), 0 24px 70px rgba(0,0,0,0.28);
        }
        .faq-brief-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding: 16px 0 0;
          margin-top: 16px;
        }
        .faq-proof-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 0;
          margin-top: 48px;
          border-top: 1px solid rgba(255,255,255,0.09);
          border-bottom: 1px solid rgba(255,255,255,0.09);
        }
        .faq-proof-item {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
          padding: 20px 22px;
          border-left: 1px solid rgba(255,255,255,0.09);
        }
        .faq-proof-item:first-child {
          border-left: 0;
          padding-left: 0;
        }
        .faq-workspace {
          display: grid;
          grid-template-columns: 286px minmax(0, 1fr);
          gap: 44px;
          align-items: start;
        }
        .faq-sidebar {
          position: sticky;
          top: 100px;
        }
        .faq-search {
          position: relative;
          margin-bottom: 16px;
        }
        .faq-search-input {
          width: 100%;
          min-height: 48px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.035);
          color: #fff;
          font-family: ${FONT_BODY};
          font-size: 13px;
          padding: 0 16px 0 44px;
        }
        .faq-search-input::placeholder {
          color: rgba(255,255,255,0.32);
        }
        .faq-category-list {
          display: grid;
          gap: 8px;
          margin-top: 16px;
        }
        .faq-category-button {
          width: 100%;
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.025);
          color: rgba(255,255,255,0.58);
          text-align: left;
        }
        .faq-category-button:hover,
        .faq-category-button[data-active="true"] {
          color: #fff;
          border-color: rgba(229,9,20,0.26);
          background: rgba(229,9,20,0.075);
        }
        .faq-category-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(0,0,0,0.18);
          color: ${RED};
        }
        .faq-support-box {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,0.09);
        }
        .faq-support-button {
          width: 100%;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-top: 8px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.03);
          color: rgba(255,255,255,0.66);
          font-family: ${FONT_UI};
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .faq-support-button:hover {
          color: #fff;
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.055);
        }
        .faq-content-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 26px;
        }
        .faq-category-heading {
          font-family: ${FONT_DISPLAY};
          font-size: 3.2rem;
          line-height: 1;
          color: #fff;
          letter-spacing: 0;
        }
        .faq-question-group + .faq-question-group {
          margin-top: 44px;
        }
        .faq-question-row {
          border-top: 1px solid rgba(255,255,255,0.09);
        }
        .faq-question-row:last-child {
          border-bottom: 1px solid rgba(255,255,255,0.09);
        }
        .faq-question-button {
          width: 100%;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          padding: 24px 0;
          text-align: left;
          color: rgba(255,255,255,0.84);
        }
        .faq-question-button:hover {
          color: #fff;
        }
        .faq-question-text {
          font-size: 18px;
          font-weight: 650;
          line-height: 1.45;
        }
        .faq-question-icon {
          flex: 0 0 auto;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.025);
          color: rgba(255,255,255,0.5);
        }
        .faq-question-button:hover .faq-question-icon {
          color: ${RED};
          border-color: rgba(229,9,20,0.3);
          background: rgba(229,9,20,0.075);
        }
        .faq-answer {
          max-width: 780px;
          padding: 0 58px 26px 0;
          font-size: 14px;
          line-height: 1.9;
          color: rgba(255,255,255,0.62);
        }
        .faq-empty {
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 34px;
        }
        .faq-cta-band {
          border-top: 1px solid rgba(255,255,255,0.08);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          background:
            linear-gradient(90deg, rgba(229,9,20,0.09), transparent 36%),
            rgba(255,255,255,0.018);
        }
        @media (max-width: 1024px) {
          .faq-hero-grid,
          .faq-workspace {
            grid-template-columns: 1fr;
          }
          .faq-sidebar {
            position: relative;
            top: auto;
          }
          .faq-category-list {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .faq-brief-panel {
            max-width: 620px;
          }
        }
        @media (max-width: 720px) {
          .faq-shell {
            padding-left: 20px;
            padding-right: 20px;
          }
          .faq-header {
            padding: 12px 12px 0;
          }
          .faq-header-inner {
            height: 58px;
            border-radius: 24px;
            padding: 0 14px;
          }
          .faq-header-subtitle,
          .faq-header-action {
            display: none;
          }
          .faq-nav-button {
            min-height: 36px;
            padding: 0 12px;
          }
          .faq-hero-title {
            font-size: 3.1rem;
          }
          .faq-hero-copy {
            font-size: 14px;
          }
          .faq-proof-strip,
          .faq-category-list {
            grid-template-columns: 1fr;
          }
          .faq-proof-item,
          .faq-proof-item:first-child {
            border-left: 0;
            border-top: 1px solid rgba(255,255,255,0.09);
            padding: 18px 0;
          }
          .faq-proof-item:first-child {
            border-top: 0;
          }
          .faq-content-header {
            align-items: flex-start;
            flex-direction: column;
          }
          .faq-category-heading {
            font-size: 2.35rem;
          }
          .faq-question-button {
            gap: 16px;
            padding: 22px 0;
          }
          .faq-question-text {
            font-size: 16px;
          }
          .faq-answer {
            padding-right: 0;
          }
        }
      `}</style>

            <header className="faq-header">
                <div className="faq-header-inner">
                    <a href="/" onClick={navigateHome} className="flex min-w-0 items-center gap-3 no-underline">
                        <img src="/ardeno-logo.svg" alt="Ardeno Studio" className="h-9 w-auto flex-shrink-0" draggable={false} />
                        <span className="min-w-0">
                            <span className="faq-header-title block">ARDENO</span>
                            <span className="faq-header-subtitle block">/ FAQ</span>
                        </span>
                    </a>

                    <div className="flex-1" />

                    <a href="/" onClick={navigateHome} className="faq-nav-button">
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Site</span>
                    </a>

                    <button type="button" onClick={startProject} className="faq-primary-button faq-header-action">
                        Start project
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </header>

            <main className="relative z-10 pt-28">
                <section className="faq-shell pb-16 pt-12 md:pb-20 md:pt-20">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.75, ease: EASE }}
                        className="faq-hero-grid"
                    >
                        <div className="min-w-0">
                            <div className="faq-eyebrow">Frequently asked questions</div>
                            <h1 className="faq-hero-title">
                                Clear answers before <em>we build.</em>
                            </h1>
                            <p className="faq-hero-copy">
                                Pricing, timelines, ownership, revisions, maintenance, and scope explained in the same direct way we run projects.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <button type="button" onClick={startProject} className="faq-primary-button">
                                    Get a project answer
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>
                                <button type="button" onClick={openAIChat} className="faq-secondary-button">
                                    Ask AI assistant
                                    <MessageCircle className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        <aside className="faq-brief-panel" aria-label="FAQ summary">
                            <div className="flex items-start gap-4">
                                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[12px] border border-[#E50914]/25 bg-[#E50914]/10 text-[#E50914]">
                                    <HelpCircle className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase text-[#E50914]" style={{ fontFamily: FONT_UI }}>
                                        Project clarity
                                    </p>
                                    <p className="mt-2 text-[14px] leading-7 text-white/60">
                                        No generic agency talk. These answers map to how Ardeno scopes, builds, launches, and hands over work.
                                    </p>
                                </div>
                            </div>

                            <div className="faq-brief-row">
                                <span className="text-[12px] text-white/45">Questions covered</span>
                                <strong className="text-[22px] leading-none text-white" style={{ fontFamily: FONT_DISPLAY }}>
                                    {totalQuestions}
                                </strong>
                            </div>
                            <div className="faq-brief-row">
                                <span className="text-[12px] text-white/45">Best next step</span>
                                <button type="button" onClick={startProject} className="text-left text-[12px] font-bold text-white hover:text-[#E50914]">
                                    Send your brief
                                </button>
                            </div>
                        </aside>
                    </motion.div>

                    <div className="faq-proof-strip" aria-label="Project facts">
                        {HIGHLIGHTS.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="faq-proof-item">
                                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] border border-white/[0.09] bg-white/[0.035] text-[#E50914]">
                                    <Icon className="h-4 w-4" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[11px] text-white/38">{label}</span>
                                    <strong className="mt-1 block truncate text-[15px] text-white">{value}</strong>
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="border-y border-white/[0.08] bg-[#070708] py-14 md:py-20">
                    <div className="faq-shell faq-workspace">
                        <aside className="faq-sidebar" aria-label="FAQ categories">
                            <label className="sr-only" htmlFor="faq-search">
                                Search questions
                            </label>
                            <div className="faq-search">
                                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                                <input
                                    id="faq-search"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    className="faq-search-input"
                                    placeholder="Search pricing, timelines, ownership"
                                    type="search"
                                />
                            </div>

                            <div className="faq-category-list">
                                {FAQS.map((category, index) => {
                                    const Icon = category.icon;
                                    const isActive = !normalizedQuery && activeCategory === index;
                                    return (
                                        <button
                                            key={category.label}
                                            type="button"
                                            className="faq-category-button"
                                            data-active={isActive}
                                            onClick={() => {
                                                setQuery('');
                                                setActiveCategory(index);
                                            }}
                                        >
                                            <span className="faq-category-icon">
                                                <Icon className="h-4 w-4" />
                                            </span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-[13px] font-bold">{category.label}</span>
                                                <span className="mt-1 block truncate text-[11px] text-white/36">{category.metric}</span>
                                            </span>
                                            {isActive && <CheckCircle2 className="h-4 w-4 text-[#E50914]" />}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="faq-support-box">
                                <p className="text-[11px] font-bold uppercase text-white/35" style={{ fontFamily: FONT_UI }}>
                                    Need a direct answer?
                                </p>
                                {SUPPORT_ROUTES.map(({ label, action, icon: Icon }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        className="faq-support-button"
                                        onClick={() => handleSupportAction(action)}
                                    >
                                        <span>{label}</span>
                                        <Icon className="h-3.5 w-3.5" />
                                    </button>
                                ))}
                            </div>
                        </aside>

                        <div className="min-w-0">
                            <div className="faq-content-header">
                                <div className="min-w-0">
                                    <p className="mb-3 text-[11px] font-bold uppercase text-[#E50914]" style={{ fontFamily: FONT_UI }}>
                                        {normalizedQuery ? 'Search results' : active.label}
                                    </p>
                                    <h2 className="faq-category-heading">
                                        {normalizedQuery ? 'Matching answers' : active.label}
                                    </h2>
                                    <p className="mt-3 max-w-xl text-[14px] leading-7 text-white/50">
                                        {normalizedQuery ? `Showing ${displayedCount} answer${displayedCount === 1 ? '' : 's'} for "${query}".` : active.summary}
                                    </p>
                                </div>
                                {!normalizedQuery && (
                                    <span className="rounded-full border border-white/[0.1] bg-white/[0.035] px-4 py-2 text-[12px] text-white/55">
                                        {active.items.length} answers
                                    </span>
                                )}
                            </div>

                            {displayedCategories.length ? (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={normalizedQuery ? normalizedQuery : active.label}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.28, ease: EASE }}
                                    >
                                        {displayedCategories.map((category, categoryIndex) => (
                                            <div className="faq-question-group" key={category.label}>
                                                {normalizedQuery && (
                                                    <div className="mb-4 flex items-center gap-3">
                                                        <span className="h-px w-7 bg-[#E50914]" />
                                                        <p className="text-[12px] font-bold uppercase text-white/55" style={{ fontFamily: FONT_UI }}>
                                                            {category.label}
                                                        </p>
                                                    </div>
                                                )}
                                                {category.items.map((item, index) => (
                                                    <AccordionItem
                                                        key={`${category.label}-${item.q}`}
                                                        item={item}
                                                        index={index}
                                                        defaultOpen={!normalizedQuery && categoryIndex === 0 && index === 0}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                <div className="faq-empty">
                                    <p className="text-[18px] text-white" style={{ fontFamily: FONT_DISPLAY }}>
                                        No matching answer yet.
                                    </p>
                                    <p className="mt-3 max-w-lg text-[14px] leading-7 text-white/54">
                                        Send us the question and we will answer it directly. If it helps future clients, we can add it here too.
                                    </p>
                                    <button type="button" onClick={startProject} className="faq-primary-button mt-6">
                                        Ask Ardeno
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="faq-cta-band py-16 md:py-20">
                    <div className="faq-shell flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-[11px] font-bold uppercase text-[#E50914]" style={{ fontFamily: FONT_UI }}>
                                Ready to make it specific?
                            </p>
                            <h2 className="mt-4 text-[2.45rem] leading-none text-white md:text-[3.7rem]" style={{ fontFamily: FONT_DISPLAY }}>
                                Your project will have its own answers.
                            </h2>
                            <p className="mt-5 max-w-xl text-[14px] leading-7 text-white/55">
                                Tell us what you are trying to build, what exists today, and what needs to change. We will reply with the practical next step.
                            </p>
                        </div>
                        <button type="button" onClick={startProject} className="faq-primary-button self-start md:self-auto">
                            Start a conversation
                            <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </section>
            </main>

            <Footer onOpenContact={startProject} />
        </div>
    );
};
