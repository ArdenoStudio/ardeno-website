import React from 'react';
<<<<<<< HEAD

export const AboutPage: React.FC<{ onOpenContact: () => void }> = ({ onOpenContact }) => {
    return (
        <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">About Ardeno Studio</h1>
            <p className="text-zinc-400 text-lg mb-8">
                We are a digital product studio crafting exceptional web experiences and branding solutions. Our new About page is coming soon.
            </p>
            <button
                onClick={onOpenContact}
                className="px-8 py-3 bg-white text-black font-medium rounded hover:bg-zinc-200 transition-colors"
            >
                Get in Touch
            </button>
        </div>
    );
};
=======
import { motion } from 'framer-motion';
import { ArrowUpRight, Minus } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "'Syne', sans-serif";
const FONT_B = "'Manrope', sans-serif";
const RED = '#E50914';

interface AboutPageProps {
    onOpenContact?: () => void;
}

const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
    children, delay = 0, className = '',
}) => (
    <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.85, ease: EASE, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

const TEAM = [
    {
        name: 'Suven Seoras',
        role: 'Founder & Creative Director',
        bio: 'Leads design strategy and client experience. Obsessed with details that make the difference between good and unforgettable.',
        whatsapp: 'https://wa.me/94758504424',
    },
    {
        name: 'Ovindu Karunaratne',
        role: 'Co-Founder & Lead Developer',
        bio: 'Turns bold ideas into fast, flawless code. Specialises in interactive experiences and performance-first builds.',
        whatsapp: 'https://wa.me/94762485456',
    },
];

const VALUES = [
    {
        num: '01',
        title: 'Refuse to blend in',
        body: 'Every brand has something worth amplifying. We dig until we find it, then build around it.',
    },
    {
        num: '02',
        title: 'Craft over convenience',
        body: 'Templates are fast. Craft is better. We choose the harder path every time because the results speak for themselves.',
    },
    {
        num: '03',
        title: 'Strategy before pixels',
        body: 'Beautiful design without purpose is decoration. Everything we ship is rooted in how your customers think and decide.',
    },
    {
        num: '04',
        title: 'Built to last',
        body: 'We build for longevity — clean code, scalable architecture, and sites that age gracefully.',
    },
];

export const AboutPage: React.FC<AboutPageProps> = ({ onOpenContact }) => {
    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        window.scrollTo(0, 0);
    };

    return (
        <div className="bg-[#080809] text-white min-h-screen overflow-x-hidden" style={{ fontFamily: FONT_B }}>

            {/* ── Grain ── */}
            <div
                className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundSize: '128px',
                }}
            />

            {/* ── Ambient glow ── */}
            <div
                className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[60vh]"
                style={{ background: `radial-gradient(ellipse at top, rgba(229,9,20,0.07) 0%, transparent 65%)` }}
            />

            {/* ── Top bar ── */}
            <div
                className="w-full h-px"
                style={{ background: `linear-gradient(90deg, transparent, rgba(229,9,20,0.2) 20%, rgba(255,255,255,0.07) 50%, rgba(229,9,20,0.2) 80%, transparent)` }}
            />

            {/* ── Nav strip ── */}
            <div className="relative z-10 container mx-auto px-6 md:px-12 pt-7 pb-0 flex items-center justify-between">
                <a
                    href="/"
                    onClick={handleBack}
                    className="flex items-center gap-3 group select-none"
                >
                    <img src="/ardeno-logo.svg" alt="Ardeno Studio" className="h-9 w-auto" draggable={false} />
                    <span
                        className="hidden sm:block text-[10px] tracking-[0.22em] uppercase"
                        style={{ fontFamily: FONT_H, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}
                    >
                        Ardeno Studio
                    </span>
                </a>

                <a
                    href="/"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-[11px] tracking-[0.12em] uppercase text-zinc-500 hover:text-white transition-colors duration-200"
                    style={{ fontFamily: FONT_B, fontWeight: 500 }}
                >
                    ← Back to site
                </a>
            </div>

            {/* ═══════════════════ HERO ═══════════════════ */}
            <section className="relative z-10 container mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-20 md:pb-28">

                <FadeUp>
                    <div className="flex items-center gap-3 mb-10">
                        <Minus className="w-3.5 h-3.5 stroke-[1.5] shrink-0" style={{ color: RED }} />
                        <span
                            className="text-[13px] tracking-[0.22em] uppercase"
                            style={{ fontFamily: FONT_B, fontWeight: 500, color: '#a0a0a0' }}
                        >
                            About us
                        </span>
                    </div>
                </FadeUp>

                <div className="max-w-4xl">
                    <FadeUp delay={0.08}>
                        <h1
                            className="leading-[0.95] tracking-[-0.03em] text-white mb-8"
                            style={{
                                fontFamily: FONT_H,
                                fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                                fontWeight: 800,
                            }}
                        >
                            We build websites
                            <br />
                            for brands that{' '}
                            <span
                                className="relative inline-block"
                                style={{ color: RED }}
                            >
                                refuse
                                <motion.span
                                    className="absolute left-0 bottom-0 h-[3px] rounded-full"
                                    style={{ background: `linear-gradient(90deg, ${RED}, transparent)`, originX: 0, width: '100%' }}
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.2, ease: EASE, delay: 0.6 }}
                                />
                            </span>
                            <br />
                            to blend in.
                        </h1>
                    </FadeUp>

                    <FadeUp delay={0.18}>
                        <p
                            className="leading-[1.75] max-w-2xl"
                            style={{ fontFamily: FONT_B, fontSize: '1rem', fontWeight: 300, color: '#6b6b76' }}
                        >
                            Ardeno Studio is a premium web design and development agency based in Sri Lanka.
                            We craft immersive digital products — strategic at the core, cinematic on the surface.
                            Built to convert, load fast, and own every screen.
                        </p>
                    </FadeUp>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />

            {/* ═══════════════════ STORY ═══════════════════ */}
            <section className="relative z-10 container mx-auto px-6 md:px-12 py-20 md:py-28">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">

                    <FadeUp>
                        <div className="flex items-center gap-3 mb-8">
                            <Minus className="w-3.5 h-3.5 stroke-[1.5] shrink-0" style={{ color: RED }} />
                            <span
                                className="text-[13px] tracking-[0.22em] uppercase"
                                style={{ fontFamily: FONT_B, fontWeight: 500, color: '#a0a0a0' }}
                            >
                                Our story
                            </span>
                        </div>

                        <h2
                            className="leading-[1.1] tracking-[-0.02em] text-white mb-0"
                            style={{
                                fontFamily: FONT_H,
                                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                                fontWeight: 700,
                            }}
                        >
                            Born from
                            <br />
                            a frustration
                            <br />
                            <em style={{ color: '#8c8c96', fontWeight: 700 }}>with average.</em>
                        </h2>
                    </FadeUp>

                    <FadeUp delay={0.12}>
                        <div className="space-y-6 pt-2 lg:pt-16">
                            <p
                                className="leading-[1.8]"
                                style={{ fontFamily: FONT_B, fontSize: '0.95rem', fontWeight: 400, color: '#7a7a84' }}
                            >
                                Ardeno was founded on a simple belief — most websites look the same because
                                most agencies play it safe. We started building for businesses that wanted more:
                                more identity, more presence, more results.
                            </p>
                            <p
                                className="leading-[1.8]"
                                style={{ fontFamily: FONT_B, fontSize: '0.95rem', fontWeight: 400, color: '#7a7a84' }}
                            >
                                Every project we take on is approached as if it's the only one. No templates,
                                no shortcuts, no "that'll do." We're obsessive about the details because the
                                details are what people remember.
                            </p>
                            <p
                                className="leading-[1.8]"
                                style={{ fontFamily: FONT_B, fontSize: '0.95rem', fontWeight: 400, color: '#7a7a84' }}
                            >
                                Based in Colombo, working globally — we've helped businesses across hospitality,
                                retail, aviation, and professional services build digital presences that actually
                                reflect their ambition.
                            </p>
                        </div>
                    </FadeUp>
                </div>
            </section>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />

            {/* ═══════════════════ STATS ═══════════════════ */}
            <section className="relative z-10 container mx-auto px-6 md:px-12 py-16 md:py-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/[0.06]">
                    {[
                        { val: '100%', label: 'Custom built' },
                        { val: '∞', label: 'Revisions' },
                        { val: '24hr', label: 'Reply time' },
                        { val: '2–3', label: 'Slots open now' },
                    ].map((stat, i) => (
                        <FadeUp key={stat.label} delay={i * 0.07}>
                            <div className="flex flex-col gap-2 md:px-10 first:pl-0 last:pr-0">
                                <span
                                    className="leading-none"
                                    style={{ fontFamily: FONT_H, fontSize: 'clamp(2.2rem, 4vw, 3rem)', fontWeight: 800, color: '#fff' }}
                                >
                                    {stat.val}
                                </span>
                                <span
                                    className="text-[11px] tracking-[0.18em] uppercase"
                                    style={{ fontFamily: FONT_B, fontWeight: 500, color: '#666' }}
                                >
                                    {stat.label}
                                </span>
                            </div>
                        </FadeUp>
                    ))}
                </div>
            </section>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />

            {/* ═══════════════════ VALUES ═══════════════════ */}
            <section className="relative z-10 container mx-auto px-6 md:px-12 py-20 md:py-28">

                <FadeUp>
                    <div className="flex items-center gap-3 mb-14">
                        <Minus className="w-3.5 h-3.5 stroke-[1.5] shrink-0" style={{ color: RED }} />
                        <span
                            className="text-[13px] tracking-[0.22em] uppercase"
                            style={{ fontFamily: FONT_B, fontWeight: 500, color: '#a0a0a0' }}
                        >
                            What drives us
                        </span>
                    </div>
                </FadeUp>

                <div className="grid grid-cols-1 md:grid-cols-2" style={{ border: '1px solid rgba(255,255,255,0.055)', borderRadius: '12px', overflow: 'hidden' }}>
                    {VALUES.map((v, i) => (
                        <FadeUp key={v.num} delay={i * 0.08} className="flex">
                            <motion.div
                                className="flex-1 p-8 md:p-10 group cursor-default"
                                style={{ background: 'rgba(255,255,255,0.015)', borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.055)' : 'none', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.055)' : 'none' }}
                                whileHover={{ background: 'rgba(229,9,20,0.04)' }}
                                transition={{ duration: 0.3 }}
                            >
                                <div
                                    className="text-[11px] tracking-[0.22em] uppercase mb-5"
                                    style={{ fontFamily: FONT_B, fontWeight: 600, color: RED }}
                                >
                                    {v.num}
                                </div>
                                <h3
                                    className="mb-3 leading-[1.2]"
                                    style={{ fontFamily: FONT_H, fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}
                                >
                                    {v.title}
                                </h3>
                                <p
                                    className="leading-[1.8]"
                                    style={{ fontFamily: FONT_B, fontSize: '0.95rem', fontWeight: 400, color: '#6b6b76' }}
                                >
                                    {v.body}
                                </p>
                            </motion.div>
                        </FadeUp>
                    ))}
                </div>
            </section>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />

            {/* ═══════════════════ TEAM ═══════════════════ */}
            <section className="relative z-10 container mx-auto px-6 md:px-12 py-20 md:py-28">

                <FadeUp>
                    <div className="flex items-center gap-3 mb-14">
                        <Minus className="w-3.5 h-3.5 stroke-[1.5] shrink-0" style={{ color: RED }} />
                        <span
                            className="text-[13px] tracking-[0.22em] uppercase"
                            style={{ fontFamily: FONT_B, fontWeight: 500, color: '#a0a0a0' }}
                        >
                            The team
                        </span>
                    </div>
                </FadeUp>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {TEAM.map((member, i) => (
                        <FadeUp key={member.name} delay={i * 0.1}>
                            <motion.div
                                className="group p-8 md:p-10 rounded-xl relative overflow-hidden"
                                style={{
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                }}
                                whileHover={{ borderColor: 'rgba(229,9,20,0.25)', background: 'rgba(229,9,20,0.03)' }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Red accent top line */}
                                <motion.div
                                    className="absolute top-0 left-0 h-[2px] rounded-full"
                                    style={{ background: `linear-gradient(90deg, ${RED}, transparent)`, originX: 0, width: '100%' }}
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.1 }}
                                />

                                <div className="mb-6">
                                    <h3
                                        className="mb-1 leading-[1.2]"
                                        style={{ fontFamily: FONT_H, fontSize: '1rem', fontWeight: 600, color: '#fff' }}
                                    >
                                        {member.name}
                                    </h3>
                                    <span
                                        className="text-[11px] tracking-[0.16em] uppercase"
                                        style={{ fontFamily: FONT_B, fontWeight: 500, color: RED }}
                                    >
                                        {member.role}
                                    </span>
                                </div>

                                <p
                                    className="leading-[1.8] mb-8"
                                    style={{ fontFamily: FONT_B, fontSize: '0.95rem', fontWeight: 400, color: '#6b6b76' }}
                                >
                                    {member.bio}
                                </p>

                                <a
                                    href={member.whatsapp}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase transition-colors duration-200"
                                    style={{ fontFamily: FONT_B, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
                                >
                                    WhatsApp
                                    <ArrowUpRight className="w-3 h-3" />
                                </a>
                            </motion.div>
                        </FadeUp>
                    ))}
                </div>
            </section>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />

            {/* ═══════════════════ CTA ═══════════════════ */}
            <section className="relative z-10 container mx-auto px-6 md:px-12 py-20 md:py-28 text-center">

                {/* Ambient glow */}
                <div
                    className="pointer-events-none absolute inset-0"
                    style={{ background: `radial-gradient(ellipse at center, rgba(229,9,20,0.06) 0%, transparent 65%)` }}
                />

                <FadeUp>
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <Minus className="w-3.5 h-3.5 stroke-[1.5] shrink-0" style={{ color: RED }} />
                        <span
                            className="text-[13px] tracking-[0.22em] uppercase"
                            style={{ fontFamily: FONT_B, fontWeight: 500, color: '#a0a0a0' }}
                        >
                            Ready to start
                        </span>
                        <Minus className="w-3.5 h-3.5 stroke-[1.5] shrink-0 rotate-180" style={{ color: RED }} />
                    </div>
                </FadeUp>

                <FadeUp delay={0.08}>
                    <h2
                        className="leading-[1.0] tracking-[-0.03em] text-white mb-8 mx-auto"
                        style={{
                            fontFamily: FONT_H,
                            fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                            fontWeight: 800,
                            maxWidth: '700px',
                        }}
                    >
                        Let's build something
                        <br />
                        <em style={{ color: '#8c8c96', fontWeight: 800 }}>the internet remembers.</em>
                    </h2>
                </FadeUp>

                <FadeUp delay={0.16}>
                    <motion.button
                        onClick={() => onOpenContact?.()}
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-white text-[12px] tracking-[0.14em] uppercase"
                        style={{
                            fontFamily: FONT_B,
                            fontWeight: 600,
                            background: RED,
                            boxShadow: '0 0 28px rgba(229,9,20,0.25)',
                        }}
                        whileHover={{ scale: 1.04, boxShadow: '0 0 44px rgba(229,9,20,0.45)' }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.2 }}
                    >
                        Start a project
                        <ArrowUpRight className="w-3.5 h-3.5" />
                    </motion.button>
                </FadeUp>
            </section>

            {/* Bottom bar */}
            <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />
            <div className="container mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
                <span
                    className="text-[11px] text-zinc-500 tracking-[0.18em] uppercase"
                    style={{ fontFamily: FONT_B }}
                >
                    © {new Date().getFullYear()} Ardeno Studio. All rights reserved.
                </span>
                <a
                    href="/"
                    onClick={handleBack}
                    className="text-[11px] text-zinc-500 hover:text-white tracking-[0.12em] uppercase transition-colors duration-200"
                    style={{ fontFamily: FONT_B }}
                >
                    ← Back
                </a>
            </div>
        </div>
    );
};
>>>>>>> 4093a32593814b7c93fe62474d4fdcb6f6be709c
