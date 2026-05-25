import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, ArrowUpRight, Plus, X } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "'Instrument Serif', Georgia, serif";
const FONT_B = "'Sora', sans-serif";
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
    items: FAQItem[];
}

const FAQS: FAQCategory[] = [
    {
        label: 'Pricing & Budgets',
        items: [
            {
                q: 'How much does a website from Ardeno cost?',
                a: 'Every project is scoped individually because every business is different. Pricing is determined by the complexity, custom features, and specific goals of your project. We provide a clear, itemised custom quote after a brief discovery call to ensure you only pay for exactly what you need — with no hidden fees.',
            },
            {
                q: 'Do you offer payment plans?',
                a: 'Yes. We typically work with a 30% upfront deposit and 70% on delivery. For larger projects we can structure milestone-based payments. Reach out and we\'ll find something that works.',
            },
            {
                q: 'What\'s included in the price?',
                a: 'Design, development, responsive layout (mobile + desktop), basic SEO setup, and one round of revisions post-launch. Hosting, domain registration, and ongoing maintenance are separate — we\'ll outline these clearly before you commit.',
            },
        ],
    },
    {
        label: 'Timeline & Process',
        items: [
            {
                q: 'How long does it take to build a website?',
                a: 'A standard business website takes 2–4 weeks from kick-off to launch. More complex builds — portals, e-commerce, custom systems — typically run 4–8 weeks. We\'ll give you a realistic timeline before we start and keep you updated throughout.',
            },
            {
                q: 'What does your process look like?',
                a: 'We follow four stages: Discovery (understanding your business, goals, and audience), Design (wireframes and visual concepts for your approval), Development (building the approved design into a fast, production-ready site), and Launch (final testing, handover, and go-live). You\'re involved at every key decision point.',
            },
            {
                q: 'Do I need to prepare anything before we start?',
                a: 'It helps to have your logo, brand colours (if any), copy/text content, and any images ready. If you don\'t have these, we can advise on what you need — and in some cases help source or create them.',
            },
        ],
    },
    {
        label: 'Revisions & Ownership',
        items: [
            {
                q: 'How many revisions do I get?',
                a: 'Unlimited revisions during the design phase — we keep refining until you\'re genuinely happy before we build a single line of code. Post-launch, each project includes one round of revisions. Additional changes after that are billed at our standard hourly rate.',
            },
            {
                q: 'Who owns the website after it\'s built?',
                a: 'You do. Once final payment is made, full ownership of the code and design passes to you. No lock-in, no licensing fees, no surprises.',
            },
            {
                q: 'Can I update the website myself after launch?',
                a: 'Yes. If you\'d like a CMS (content management system) we can integrate one so you can update text and images without touching code. We\'ll also provide documentation and a handover walkthrough.',
            },
        ],
    },
    {
        label: 'Services & Scope',
        items: [
            {
                q: 'Do you only build websites?',
                a: 'Primarily yes — but we also build custom web applications, client portals, booking systems, and internal dashboards. If it lives in a browser, we can likely build it.',
            },
            {
                q: 'Do you do ongoing maintenance?',
                a: 'We offer monthly maintenance packages for businesses that want ongoing support — updates, backups, security patches, and minor content changes. Ask us about this when we chat.',
            },
            {
                q: 'Do you work with clients outside Sri Lanka?',
                a: 'Absolutely. We work remotely with clients globally. All communication, reviews, and approvals happen online — time zones haven\'t been a problem yet.',
            },
            {
                q: 'Can you redesign my existing website?',
                a: 'Yes. Redesigns are one of our most common projects. We\'ll audit what\'s working, what isn\'t, and rebuild from a stronger foundation — keeping what matters, fixing what doesn\'t.',
            },
        ],
    },
];

const AccordionItem: React.FC<{ item: FAQItem; index: number }> = ({ item, index }) => {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: EASE, delay: index * 0.05 }}
            style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-start justify-between gap-6 py-6 text-left group"
                aria-expanded={open}
            >
                <span
                    className="leading-[1.5] transition-colors duration-200"
                    style={{
                        fontFamily: FONT_B,
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: open ? '#fff' : 'rgba(255,255,255,0.82)',
                    }}
                >
                    {item.q}
                </span>

                <span
                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center mt-0.5 transition-all duration-300"
                    style={{
                        border: `1px solid ${open ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        background: open ? 'rgba(229,9,20,0.08)' : 'transparent',
                        color: open ? RED : 'rgba(255,255,255,0.4)',
                    }}
                >
                    <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.28, ease: EASE }}>
                        <Plus className="w-3.5 h-3.5" />
                    </motion.span>
                </span>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.38, ease: EASE }}
                        style={{ overflow: 'hidden' }}
                    >
                        <p
                            className="pb-6 pr-12 leading-[1.8]"
                            style={{ fontFamily: FONT_B, fontSize: '0.95rem', fontWeight: 400, color: '#6b6b76' }}
                        >
                            {item.a}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const FAQPage: React.FC<FAQPageProps> = ({ onOpenContact }) => {
    const [activeCategory, setActiveCategory] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const res = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', message: '' });
                setTimeout(() => {
                    setIsModalOpen(false);
                    setStatus('idle');
                }, 2000);
            } else {
                const data = await res.json();
                setStatus('error');
                setErrorMessage(data.error || 'Something went wrong');
            }
        } catch (err) {
            setStatus('error');
            setErrorMessage('Network error. Please try again.');
        }
    };

    const openAIChat = () => {
        const isOpen = document.querySelector('[role="dialog"][aria-label="AI assistant"]');
        if (isOpen) return;
        const fab = document.getElementById('ardeno-ai-fab') as HTMLButtonElement | null;
        fab?.click();
    };

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo(0, 0);
    };

    return (
        <div className="bg-[#080809] text-white min-h-screen overflow-x-hidden" style={{ fontFamily: FONT_B }}>

            {/* Grain */}
            <div
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px',
                }}
            />

            {/* Ambient glow */}
            <div
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[70vw] h-[50vh]"
                style={{ background: 'radial-gradient(ellipse at top, rgba(229,9,20,0.06) 0%, transparent 65%)' }}
            />

            {/* Top border */}
            <div
                className="w-full h-px"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.2) 20%, rgba(255,255,255,0.07) 50%, rgba(229,9,20,0.2) 80%, transparent)' }}
            />

            {/* Nav strip */}
            <div className="relative z-10 container mx-auto px-6 md:px-12 pt-7 flex items-center justify-between">
                <a href="/" onClick={handleBack} className="flex items-center gap-3 select-none">
                    <img src="/ardeno-logo.svg" alt="Ardeno Studio" className="h-9 w-auto" draggable={false} />
                    <span
                        className="hidden sm:block text-[10px] tracking-[0.22em] uppercase"
                        style={{ fontFamily: FONT_B, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}
                    >
                        Ardeno Studio
                    </span>
                </a>
                <a
                    href="/"
                    onClick={handleBack}
                    className="text-[11px] tracking-[0.12em] uppercase text-zinc-500 hover:text-white transition-colors duration-200"
                    style={{ fontFamily: FONT_B, fontWeight: 500 }}
                >
                    ← Back to site
                </a>
            </div>

            {/* ═══════════════════ HERO ═══════════════════ */}
            <section className="relative z-10 container mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-16">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE }}
                >
                    <div className="flex items-center gap-3 mb-10">
                        <Minus className="w-3.5 h-3.5 stroke-[1.5] shrink-0" style={{ color: RED }} />
                        <span
                            className="text-[13px] tracking-[0.22em] uppercase"
                            style={{ fontFamily: FONT_B, fontWeight: 500, color: '#a0a0a0' }}
                        >
                            Frequently asked questions
                        </span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        <h1
                            className="leading-[1.02] tracking-[-0.01em] text-white"
                            style={{
                                fontFamily: FONT_H,
                                fontSize: 'clamp(2.4rem, 5vw, 4.4rem)',
                                fontWeight: 400,
                                maxWidth: '750px',
                            }}
                        >
                            Everything you
                            <br />
                            wanted to{' '}
                            <em style={{ color: 'rgba(161,161,170,0.55)', fontStyle: 'italic' }}>ask.</em>
                        </h1>

                        <p
                            className="leading-[1.8] max-w-xs lg:mb-2"
                            style={{ fontFamily: FONT_B, fontSize: '0.9rem', fontWeight: 400, color: '#6b6b76' }}
                        >
                            Can&apos;t find your answer here?{' '}
                            <button
                                onClick={openAIChat}
                                className="transition-colors duration-200"
                                style={{ color: RED, fontWeight: 500, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                                onMouseEnter={e => (e.currentTarget.style.color = '#ff2030')}
                                onMouseLeave={e => (e.currentTarget.style.color = RED)}
                            >
                                Ask our AI assistant
                            </button>{' '}
                            for an instant response.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />

            {/* ═══════════════════ FAQ BODY ═══════════════════ */}
            <section className="relative z-10 container mx-auto px-6 md:px-12 py-16 md:py-24">
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-20">

                    {/* ── Category sidebar ── */}
                    <div className="lg:w-56 flex-shrink-0">
                        <div className="lg:sticky lg:top-24 flex flex-row lg:flex-col gap-2 flex-wrap">
                            {FAQS.map((cat, i) => (
                                <button
                                    key={cat.label}
                                    onClick={() => setActiveCategory(i)}
                                    className="text-left px-4 py-2.5 rounded-lg transition-all duration-200 text-[12px] tracking-[0.05em] whitespace-nowrap"
                                    style={{
                                        fontFamily: FONT_B,
                                        fontWeight: activeCategory === i ? 600 : 500,
                                        background: activeCategory === i ? 'rgba(229,9,20,0.08)' : 'transparent',
                                        border: `1px solid ${activeCategory === i ? 'rgba(229,9,20,0.25)' : 'rgba(255,255,255,0.06)'}`,
                                        color: activeCategory === i ? '#fff' : 'rgba(255,255,255,0.45)',
                                    }}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Questions ── */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.32, ease: EASE }}
                            >
                                <div
                                    className="text-[11px] tracking-[0.2em] uppercase mb-8"
                                    style={{ fontFamily: FONT_B, fontWeight: 600, color: RED }}
                                >
                                    {FAQS[activeCategory].label}
                                </div>

                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                                    {FAQS[activeCategory].items.map((item, i) => (
                                        <AccordionItem key={item.q} item={item} index={i} />
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />

            {/* ═══════════════════ CTA ═══════════════════ */}
            <section className="relative z-10 container mx-auto px-6 md:px-12 py-20 md:py-24">
                <div
                    className="rounded-2xl p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative overflow-hidden"
                    style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.07)',
                    }}
                >
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{ background: 'radial-gradient(ellipse at left, rgba(229,9,20,0.05) 0%, transparent 60%)' }}
                    />

                    <div className="relative z-10">
                        <h2
                            className="mb-3 leading-[1.1]"
                            style={{ fontFamily: FONT_H, fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 400, color: '#fff' }}
                        >
                            Still have questions?
                        </h2>
                        <p
                            className="leading-[1.7]"
                            style={{ fontFamily: FONT_B, fontSize: '0.9rem', fontWeight: 400, color: '#6b6b76', maxWidth: '380px' }}
                        >
                            We reply within 24 hours. No templates, no bots — just a direct conversation with the people building your site.
                        </p>
                    </div>

                    <motion.button
                        onClick={() => setIsModalOpen(true)}
                        className="relative z-10 flex-shrink-0 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-white text-[12px] tracking-[0.14em] uppercase"
                        style={{
                            fontFamily: FONT_B,
                            fontWeight: 600,
                            background: RED,
                            boxShadow: '0 0 24px rgba(229,9,20,0.22)',
                        }}
                        whileHover={{ scale: 1.04, boxShadow: '0 0 40px rgba(229,9,20,0.42)' }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                    >
                        Start a conversation
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </motion.button>
                </div>
            </section>

            {/* ═══════════════════ MODAL ═══════════════════ */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className="relative w-full max-w-lg bg-[#0d0d0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 style={{ fontFamily: FONT_H, fontSize: '2rem', fontWeight: 400 }}>Ask us anything</h3>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {status === 'success' ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center py-12"
                                    >
                                        <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <h4 style={{ fontFamily: FONT_H, fontSize: '1.5rem', marginBottom: '8px' }}>Message Sent!</h4>
                                        <p style={{ color: '#6b6b76', fontSize: '0.9rem' }}>We&apos;ll get back to you within 24 hours.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Your Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                placeholder="John Doe"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Email Address</label>
                                            <input
                                                required
                                                type="email"
                                                value={formData.email}
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                placeholder="john@example.com"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold ml-1">Message</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.message}
                                                onChange={e => setFormData({ ...formData, message: e.target.value })}
                                                placeholder="How can we help you?"
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                                            />
                                        </div>

                                        {status === 'error' && (
                                            <p className="text-red-500 text-[12px] ml-1">{errorMessage}</p>
                                        )}

                                        <button
                                            disabled={status === 'loading'}
                                            type="submit"
                                            className="w-full bg-[#E50914] hover:bg-[#ff1a1a] disabled:opacity-50 text-white rounded-xl py-4 font-semibold text-[13px] tracking-wider uppercase transition-all flex items-center justify-center gap-2 mt-4"
                                            style={{ boxShadow: '0 8px 24px rgba(229,9,20,0.25)' }}
                                        >
                                            {status === 'loading' ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <>Send Message <ArrowUpRight size={16} /></>
                                            )}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
