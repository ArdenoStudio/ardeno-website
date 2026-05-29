import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ChevronRight,
    Menu,
    X,
    ArrowLeft,
    ArrowUpRight,
    Zap,
    Globe,
    Layers,
    BookOpen,
    Shield,
    Clock,
    PlayCircle,
    Briefcase,
    Sparkles,
} from 'lucide-react';

// Typography / colour tokens
// Match Hero typography
const FONT_DISPLAY = "'Instrument Serif', Georgia, serif"; // Hero headline font
const FONT_BODY = "'Sora', system-ui, -apple-system, 'Segoe UI', sans-serif"; // clean UI/body font
const FONT_BRAND = "'Bricolage Grotesque', sans-serif";
const FONT_UI = "'DM Sans', system-ui, -apple-system, 'Segoe UI', sans-serif";
const RED = '#E50914';
const RED_DIM = 'rgba(229,9,20,0.18)';
const RED_GLOW = 'rgba(229,9,20,0.10)';
const BG_MAIN = '#050506';
const BG_SIDEBAR = 'rgba(10,10,11,0.92)';
const BORDER = 'rgba(255,255,255,0.09)';
const BORDER_STRONG = 'rgba(255,255,255,0.14)';
const TEXT_SOFT = 'rgba(255,255,255,0.62)';
const TEXT_DIM = 'rgba(255,255,255,0.38)';
const PANEL = 'rgba(255,255,255,0.035)';
const PANEL_HOVER = 'rgba(255,255,255,0.055)';

// ─── Sidebar data ──────────────────────────────────────────────────────────
interface SidebarItem {
    id: string;
    label: string;
}
interface SidebarSection {
    group: string;
    icon: React.ReactNode;
    items: SidebarItem[];
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
    {
        group: 'Getting Started',
        icon: <PlayCircle size={13} />,
        items: [
            { id: 'overview', label: 'Overview' },
            { id: 'how-we-work', label: 'How We Work' },
            { id: 'our-process', label: 'Our Process' },
        ],
    },
    {
        group: 'Services',
        icon: <Layers size={13} />,
        items: [
            { id: 'brand-identity', label: 'Brand Identity' },
            { id: 'web-design', label: 'Web Design' },
            { id: 'web-development', label: 'Web Development' },
            { id: 'motion-ui', label: 'Motion & UI' },
        ],
    },
    {
        group: 'Working With Us',
        icon: <Briefcase size={13} />,
        items: [
            { id: 'starting-a-project', label: 'Starting a Project' },
            { id: 'timelines-deliverables', label: 'Timelines & Deliverables' },
            { id: 'revisions-policy', label: 'Revisions Policy' },
            { id: 'pricing', label: 'Pricing' },
        ],
    },
    {
        group: 'Legal',
        icon: <Shield size={13} />,
        items: [
            { id: 'terms-of-engagement', label: 'Terms of Engagement' },
            { id: 'privacy-policy', label: 'Privacy Policy' },
            { id: 'nda-requests', label: 'NDA Requests' },
        ],
    },
];

const ALL_ITEMS = SIDEBAR_SECTIONS.flatMap((s) => s.items);
const findSection = (id: string) => SIDEBAR_SECTIONS.find((s) => s.items.some((i) => i.id === id));
const labelFor = (id: string) => ALL_ITEMS.find((i) => i.id === id)?.label ?? id;

// ─── DocContent helper (declared BEFORE PAGE_CONTENT) ─────────────────────
function DocContent({
    title,
    lead,
    sections,
}: {
    title: string;
    lead: string;
    sections: { heading: string; body: string }[];
}) {
    return (
        <article>
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 18,
                    fontFamily: FONT_UI,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: TEXT_DIM,
                }}
            >
                <span style={{ width: 28, height: 1, background: RED, display: 'inline-block' }} />
                Studio Operating Notes
            </div>

            <h1
                className="docs-content-title"
                style={{
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: 0,
                    lineHeight: 1.02,
                    marginBottom: 18,
                    overflow: 'visible',
                }}
            >
                {title}
            </h1>

            <p
                style={{
                    fontFamily: FONT_BODY,
                    fontSize: 15,
                    color: TEXT_SOFT,
                    lineHeight: 1.85,
                    marginBottom: 34,
                    maxWidth: 720,
                }}
            >
                {lead}
            </p>

            <div style={{ display: 'grid', gap: 0, borderTop: `1px solid ${BORDER}` }}>
                {sections.map((s, i) => (
                    <section
                        key={i}
                        className="docs-content-row"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '64px minmax(0, 1fr)',
                            gap: 22,
                            padding: '24px 0',
                            borderBottom: `1px solid ${BORDER}`,
                        }}
                    >
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 8,
                                border: `1px solid ${BORDER_STRONG}`,
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.065), rgba(255,255,255,0.018))',
                                color: RED,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: FONT_UI,
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: '0.08em',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                            }}
                        >
                            {String(i + 1).padStart(2, '0')}
                        </div>

                        <div>
                            <h2
                                style={{
                                    fontFamily: FONT_BRAND,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    color: '#fff',
                                    marginBottom: 9,
                                    letterSpacing: 0,
                                    lineHeight: 1.18,
                                }}
                            >
                                {s.heading}
                            </h2>

                            <p
                                style={{
                                    fontFamily: FONT_BODY,
                                    fontSize: 14,
                                    color: 'rgba(255,255,255,0.54)',
                                    lineHeight: 1.85,
                                    maxWidth: 720,
                                }}
                            >
                                {s.body}
                            </p>
                        </div>
                    </section>
                ))}
            </div>
        </article>
    );
}

// ─── Page content map ─────────────────────────────────────────────────────
const PAGE_CONTENT: Record<string, React.ReactNode> = {
    overview: null, // rendered inline in component

    'how-we-work': (
        <DocContent
            title="How We Work"
            lead="Ardeno Studio operates as a tight-knit creative and technical collective — small enough to care deeply, skilled enough to compete globally."
            sections={[
                {
                    heading: 'Collaboration First',
                    body: 'We embed ourselves in your business goals from day one. Every decision — from layout to micro-copy — is made with your audience and objectives at the centre.',
                },
                {
                    heading: 'Iterative Design',
                    body: "We work in fast, focused cycles. You'll see real work early, not polished decks. Feedback is woven into each sprint so nothing is ever a surprise at delivery.",
                },
                {
                    heading: 'Radical Transparency',
                    body: "You'll always know where your project stands. We share access to live previews, Figma files, and project boards throughout the engagement.",
                },
            ]}
        />
    ),

    'our-process': (
        <DocContent
            title="Our Process"
            lead="Every Ardeno Studio project follows a battle-tested five-phase arc — ensuring nothing is left to chance."
            sections={[
                { heading: '01 — Discovery', body: 'We begin with a deep-dive into your brand, audience, and goals. Competitive audits, user research, and strategic briefing.' },
                { heading: '02 — Concept', body: 'Moodboards, visual direction, and content architecture. We align on the look, feel, and tone before a single pixel is pushed.' },
                { heading: '03 — Design', body: 'High-fidelity UI in Figma. Motion principles defined. Responsive break-points mapped. Two structured feedback rounds.' },
                { heading: '04 — Build', body: 'Production-grade front-end development. Animations, interactions, CMS integration, and full QA across devices.' },
                { heading: '05 — Launch & Handoff', body: 'Deployment, performance optimisation, and a thorough handoff — including recorded walkthroughs and documentation.' },
            ]}
        />
    ),

    'brand-identity': (
        <div>
            <DocContent
                title="Brand Identity"
                lead="A brand is more than a logo. We build complete visual systems that scale from business cards to billboards."
                sections={[
                    {
                        heading: "What's Included",
                        body: 'Logo suite (primary, secondary, icon), colour palette, typography system, iconography, brand voice guidelines, and a comprehensive brand book.',
                    },
                    { heading: 'Deliverables', body: 'All source files (AI, SVG, PDF), web-ready exports, and a Figma component library pre-loaded with your brand tokens.' },
                    { heading: 'Timeline', body: 'Brand projects typically run 3 to 5 weeks depending on complexity and feedback turnaround.' },
                ]}
            />
            <a
                href="/brand"
                onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, '', '/brand');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    window.scrollTo(0, 0);
                }}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: '2rem',
                    padding: '0.85rem 1.1rem',
                    borderRadius: 999,
                    border: '1px solid rgba(229,9,20,0.32)',
                    background: 'rgba(229,9,20,0.09)',
                    color: '#fff',
                    fontFamily: FONT_BODY,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                }}
            >
                View Identity System <ArrowUpRight size={13} />
            </a>
        </div>
    ),

    'web-design': (
        <DocContent
            title="Web Design"
            lead="Bespoke interfaces that reflect your brand with precision. No templates. No shortcuts."
            sections={[
                { heading: 'Our Approach', body: 'We design in Figma at full fidelity — desktop, tablet, and mobile — with defined interaction states before any code is written.' },
                { heading: 'Scope', body: 'Landing pages, multi-page marketing sites, web applications, e-commerce flows, and microsites.' },
                { heading: 'Motion Design', body: 'Every project includes a thoughtful motion layer: scroll animations, hover states, page transitions, and loading sequences.' },
            ]}
        />
    ),

    'web-development': (
        <DocContent
            title="Web Development"
            lead="Performance-obsessed, animation-forward front-end development using modern frameworks."
            sections={[
                {
                    heading: 'Stack',
                    body: 'React / Next.js · TypeScript · Tailwind CSS · Framer Motion · GSAP · Three.js for WebGL projects. Hosting on Vercel, Netlify, or your platform of choice.',
                },
                {
                    heading: 'Performance',
                    body: 'Lighthouse 90+ scores are a baseline, not a stretch goal. We audit Core Web Vitals, image pipelines, and script loading on every project.',
                },
                {
                    heading: 'CMS Integration',
                    body: 'Sanity, Contentful, or a headless WordPress — we build the editing experience so your team can own the content long-term.',
                },
            ]}
        />
    ),

    'motion-ui': (
        <DocContent
            title="Motion & UI"
            lead="The difference between a good website and an unforgettable one is movement. We obsess over both."
            sections={[
                { heading: 'Micro-interactions', body: 'Hover states, button feedback, form validation, and loading skeletons — every touchpoint is considered and polished.' },
                { heading: 'Scroll & Reveal', body: 'Parallax, clip-path reveals, staggered text animations, and scroll-progress indicators built with Framer Motion and GSAP.' },
                { heading: 'Lottie & SVG Animation', body: 'For hero illustrations, loaders, and icon animations — lightweight, resolution-independent, and controllable in code.' },
            ]}
        />
    ),

    'starting-a-project': (
        <DocContent
            title="Starting a Project"
            lead="Getting started with Ardeno Studio is straightforward. Here is everything you need to know."
            sections={[
                { heading: 'Step 1 — Reach Out', body: 'Use the Start Project button on our site or email ardenostudio@gmail.com with a brief description of your project and timeline.' },
                { heading: 'Step 2 — Discovery Call', body: 'A 30 to 45 minute video call to understand your goals, scope, and budget range. No commitment required.' },
                { heading: 'Step 3 — Proposal', body: "We'll send a detailed proposal within 48 hours — scope, deliverables, timeline, and pricing — all in plain language." },
                { heading: 'Step 4 — Kick-Off', body: 'Once you sign off, we schedule a kick-off session and your project enters our active pipeline within one week.' },
            ]}
        />
    ),

    'timelines-deliverables': (
        <DocContent
            title="Timelines & Deliverables"
            lead="We believe in honest timelines. Below are our standard estimates — your project scope and feedback speed are the biggest variables."
            sections={[
                { heading: 'Brand Identity', body: '3 to 5 weeks. Two rounds of creative direction, two rounds of refinement. Final files delivered via a shared drive.' },
                { heading: 'Web Design (UI Only)', body: '2 to 4 weeks per stage. Desktop, mobile, interaction specs. Delivered as a Figma file with a component library.' },
                { heading: 'Web Design + Development', body: '6 to 12 weeks full-stack. Complexity, integrations, and CMS setup are the main timeline drivers.' },
                { heading: 'Expedited Projects', body: 'Rush timelines are available at a 30% premium. Discuss availability at the proposal stage.' },
            ]}
        />
    ),

    'revisions-policy': (
        <DocContent
            title="Revisions Policy"
            lead="Revisions are an expected and healthy part of the creative process. Here is how we handle them."
            sections={[
                { heading: 'Included Rounds', body: 'Every project includes two structured feedback rounds per major phase (Design, Development). This is documented in your contract.' },
                { heading: 'What Counts as a Revision', body: 'Changes within the agreed scope and direction — colour tweaks, copy adjustments, layout shifts. Scope changes are treated as additions.' },
                { heading: 'Additional Rounds', body: "Extra revision rounds are billed at our hourly rate. We'll always flag this before proceeding." },
                { heading: 'Our Commitment', body: "We'd rather hear every piece of feedback than deliver something you're not proud to put your name on." },
            ]}
        />
    ),

    pricing: (
        <DocContent
            title="Pricing"
            lead="We do not publish fixed price lists. Every project is unique and scoped individually based on your specific requirements, timeline, and deliverables."
            sections={[
                {
                    heading: 'Custom Proposals',
                    body: 'After a brief discovery call to understand your goals, we provide a detailed custom proposal outlining clear timelines and a precise cost estimate tailored to your project.',
                },
                {
                    heading: 'What Drives Cost?',
                    body: 'Pricing is primarily determined by the complexity of the project—including custom animations, backend integrations, CMS requirements, and overall scope.',
                },
                {
                    heading: 'Transparent Estimates',
                    body: 'We believe in no surprises. Every proposal breaks down deliverables so you know exactly what goes into the final cost before any work begins.',
                },
                {
                    heading: 'Ongoing Collaboration',
                    body: 'For continuous support and feature additions post-launch, we offer flexible design and development retainers tailored to the evolving needs of your business.',
                },
            ]}
        />
    ),

    'terms-of-engagement': (
        <DocContent
            title="Terms of Engagement"
            lead="These terms govern all projects and engagements with Ardeno Studio. By signing a proposal you agree to these terms."
            sections={[
                { heading: 'Payment Schedule', body: '30% deposit to begin. 70% upon final delivery, before files are released. For larger projects, milestone-based billing may apply.' },
                {
                    heading: 'Intellectual Property',
                    body: 'All design and code created during the project transfers to you upon full payment. We retain the right to showcase work in our portfolio unless otherwise agreed.',
                },
                { heading: 'Cancellations', body: 'The deposit is non-refundable if the client cancels. If we cancel for any reason, the deposit is returned in full.' },
                { heading: 'Liability', body: "Ardeno Studio's liability is limited to the total project fee. We are not liable for indirect or consequential damages." },
            ]}
        />
    ),

    'privacy-policy': (
        <DocContent
            title="Privacy Policy"
            lead="Ardeno Studio takes your privacy seriously. Here is a plain-language summary of how we handle your data."
            sections={[
                { heading: 'Data We Collect', body: 'When you contact us we collect your name, email, company, budget range, project message, page path, referrer, submission time, and campaign parameters if present. The AI assistant stores recent chat history in your browser and sends your messages to our server so it can respond.' },
                { heading: 'How We Use It', body: 'We use this information to reply to enquiries, qualify project fit, prevent spam or abuse, improve the website, and deliver agreed client work. We do not sell or rent personal data.' },
                { heading: 'Service Providers', body: 'The website runs on Vercel. Enquiry emails are processed through Resend and delivered to our admin inbox. The AI assistant uses our server-side AI provider key. Optional analytics only loads after cookie consent. Turnstile may be used to verify public forms.' },
                { heading: 'Storage', body: 'Lead details are stored in our email/admin systems. Project files may later be stored in Google Drive, Figma, Notion, GitHub, or similar project tools with access limited to the delivery team. Browser chat history and campaign data remain on your device unless you clear them.' },
                { heading: 'Retention & Security', body: 'We keep enquiry data only as long as needed for sales, support, legal, and operational records. Server routes validate inputs, rate-limit abuse, avoid exposing secrets to the browser, and return generic production errors.' },
                { heading: 'Your Rights', body: "You may request access, correction, or deletion of your data at any time by emailing ardenostudio@gmail.com. We'll action reasonable requests within 7 business days unless a legal or operational retention need applies." },
            ]}
        />
    ),

    'nda-requests': (
        <DocContent
            title="NDA Requests"
            lead="We handle sensitive projects regularly and are fully comfortable signing mutual NDAs before any discussion begins."
            sections={[
                { heading: 'How to Request an NDA', body: "Email ardenostudio@gmail.com with the subject line 'NDA Request' and we'll send a mutual NDA within one business day." },
                { heading: 'What We Cover', body: 'All project details, client identity, business information, and any proprietary materials shared during the engagement.' },
                { heading: 'Portfolio Clauses', body: 'If you require work to remain confidential and out of our portfolio, we include a portfolio exclusion clause in both the NDA and your project contract.' },
            ]}
        />
    ),
};

// ─── Quick-start card data ─────────────────────────────────────────────────
const QUICK_CARDS = [
    {
        icon: <Zap size={20} />,
        title: 'Start a Project',
        desc: 'Ready to build something exceptional? Reach out and kick things off.',
        href: '#contact',
        label: 'Get in touch',
    },
    {
        icon: <Globe size={20} />,
        title: 'View Our Services',
        desc: 'Explore the full range of creative services Ardeno Studio offers.',
        href: '#services',
        label: 'See services',
    },
    {
        icon: <BookOpen size={20} />,
        title: 'Our Process',
        desc: 'Learn how we take a project from initial brief to final launch.',
        href: '#process',
        label: 'Read the process',
    },
];

// ─── QuickCard ─────────────────────────────────────────────────────────────
const QuickCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    desc: string;
    href: string;
    label: string;
    onOpenContact: () => void;
}> = ({ icon, title, desc, href, label, onOpenContact }) => {
    const [hov, setHov] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();

        if (href === '#contact') {
            onOpenContact();
            return;
        }

        // exit docs and focus a hash on the main site
        window.dispatchEvent(new CustomEvent('docs:exit', { detail: { hash: href } }));
    };

    return (
        <motion.button
            type="button"
            onHoverStart={() => setHov(true)}
            onHoverEnd={() => setHov(false)}
            onClick={handleClick}
            style={{
                width: '100%',
                minHeight: 188,
                borderRadius: 8,
                border: `1px solid ${hov ? 'rgba(229,9,20,0.35)' : BORDER}`,
                background: hov
                    ? 'linear-gradient(180deg, rgba(229,9,20,0.13), rgba(255,255,255,0.035))'
                    : 'linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.02))',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                textAlign: 'left',
                whiteSpace: 'normal',
                boxShadow: hov ? '0 18px 60px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.06)' : 'inset 0 1px 0 rgba(255,255,255,0.045)',
            }}
        >
            <div
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: `1px solid ${hov ? 'rgba(229,9,20,0.36)' : 'rgba(255,255,255,0.08)'}`,
                    background: hov ? 'rgba(229,9,20,0.16)' : 'rgba(255,255,255,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: hov ? RED : 'rgba(255,255,255,0.4)',
                    marginBottom: 14,
                    transition: 'all 0.25s ease',
                }}
            >
                {icon}
            </div>

            <h3
                style={{
                    fontFamily: FONT_BRAND,
                    fontSize: 17,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 8,
                    letterSpacing: 0,
                    lineHeight: 1.15,
                }}
            >
                {title}
            </h3>

            <p
                style={{
                    fontFamily: FONT_BODY,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.52)',
                    lineHeight: 1.7,
                    marginBottom: 16,
                }}
            >
                {desc}
            </p>

            <span
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    fontFamily: FONT_BODY,
                    fontSize: 11,
                    fontWeight: 700,
                    color: hov ? RED : 'rgba(255,255,255,0.35)',
                    letterSpacing: '0.10em',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s ease',
                }}
            >
                {label} <ArrowUpRight size={11} />
            </span>
        </motion.button>
    );
};

// ─── SidebarContent ────────────────────────────────────────────────────────
const SidebarContent: React.FC<{
    sections: SidebarSection[];
    activeId: string;
    onNavigate: (id: string) => void;
    filterItems: (items: SidebarItem[]) => SidebarItem[];
    hasMatchingItems: boolean;
    searchQuery: string;
}> = ({ sections, activeId, onNavigate, filterItems, hasMatchingItems, searchQuery }) => (
    <div>
        <div style={{ padding: '0 16px 24px' }}>
            <div
                style={{
                    borderRadius: 8,
                    border: `1px solid ${BORDER}`,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.052), rgba(255,255,255,0.018))',
                    padding: 16,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                    <span
                        style={{
                            fontFamily: FONT_UI,
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: TEXT_DIM,
                        }}
                    >
                        Client Manual
                    </span>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: RED, boxShadow: `0 0 18px ${RED}` }} />
                </div>
                <p style={{ fontFamily: FONT_BRAND, fontSize: 20, lineHeight: 1.05, color: '#fff', margin: 0, letterSpacing: 0 }}>
                    Process, scope, pricing, and legal clarity.
                </p>
            </div>
        </div>

        {!hasMatchingItems && searchQuery && (
            <p style={{ fontFamily: FONT_BODY, fontSize: 12, color: 'rgba(255,255,255,0.28)', padding: '0 20px' }}>
                No results for &quot;{searchQuery}&quot;
            </p>
        )}

        {sections.map((section) => {
            const filtered = filterItems(section.items);
            if (filtered.length === 0) return null;

            return (
                <div key={section.group} style={{ marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 20px', marginBottom: 6 }}>
                        <span style={{ color: 'rgba(255,255,255,0.25)' }}>{section.icon}</span>
                        <span
                            style={{
                                fontFamily: FONT_UI,
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.33)',
                            }}
                        >
                            {section.group}
                        </span>
                    </div>

                    {filtered.map((item) => {
                        const isActive = item.id === activeId;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    padding: '8px 20px',
                                    paddingLeft: isActive ? 17 : 20,
                                    background: isActive ? 'linear-gradient(90deg, rgba(229,9,20,0.13), rgba(229,9,20,0.02))' : 'transparent',
                                    border: 'none',
                                    borderLeft: isActive ? `3px solid ${RED}` : '3px solid transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.18s ease',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)';
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                                }}
                            >
                                <span
                                    style={{
                                        fontFamily: FONT_BODY,
                                        fontSize: 12,
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? '#fff' : 'rgba(255,255,255,0.54)',
                                        transition: 'color 0.15s ease',
                                        lineHeight: 1.45,
                                    }}
                                >
                                    {item.label}
                                </span>

                                {isActive && (
                                    <span
                                        style={{
                                            marginLeft: 'auto',
                                            width: 4,
                                            height: 4,
                                            borderRadius: '50%',
                                            background: RED,
                                            boxShadow: `0 0 6px ${RED}`,
                                            flexShrink: 0,
                                        }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            );
        })}
    </div>
);

// ─── DocPager ──────────────────────────────────────────────────────────────
const DocPager: React.FC<{ activeId: string; onNavigate: (id: string) => void }> = ({ activeId, onNavigate }) => {
    const idx = ALL_ITEMS.findIndex((i) => i.id === activeId);
    const prev = idx > 0 ? ALL_ITEMS[idx - 1] : null;
    const next = idx < ALL_ITEMS.length - 1 ? ALL_ITEMS[idx + 1] : null;
    if (!prev && !next) return null;

    const btnStyle: React.CSSProperties = {
        fontFamily: FONT_BODY,
        fontSize: 12,
        color: 'rgba(255,255,255,0.62)',
        background: PANEL,
        border: `1px solid ${BORDER}`,
        borderRadius: 8,
        padding: '13px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        transition: 'all 0.2s ease',
        minHeight: 48,
        maxWidth: 280,
        textAlign: 'left',
    };

    return (
        <div className="docs-pager" style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 40 }}>
            {prev ? (
                <button
                    onClick={() => onNavigate(prev.id)}
                    style={btnStyle}
                    onMouseEnter={(e) => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.color = '#fff';
                        b.style.borderColor = RED_DIM;
                        b.style.background = PANEL_HOVER;
                    }}
                    onMouseLeave={(e) => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.color = 'rgba(255,255,255,0.62)';
                        b.style.borderColor = BORDER;
                        b.style.background = PANEL;
                    }}
                >
                    &larr; {prev.label}
                </button>
            ) : (
                <div />
            )}

            {next && (
                <button
                    onClick={() => onNavigate(next.id)}
                    style={btnStyle}
                    onMouseEnter={(e) => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.color = '#fff';
                        b.style.borderColor = RED_DIM;
                        b.style.background = PANEL_HOVER;
                    }}
                    onMouseLeave={(e) => {
                        const b = e.currentTarget as HTMLButtonElement;
                        b.style.color = 'rgba(255,255,255,0.62)';
                        b.style.borderColor = BORDER;
                        b.style.background = PANEL;
                    }}
                >
                    {next.label} &rarr;
                </button>
            )}
        </div>
    );
};

// ─── Main DocsPage ─────────────────────────────────────────────────────────
export const DocsPage: React.FC<{ onOpenContact: () => void }> = ({ onOpenContact }) => {
    const [activeId, setActiveId] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchFocused, setSearchFocused] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const currentSection = findSection(activeId);

    const filterItems = useCallback(
        (items: SidebarItem[]) =>
            searchQuery ? items.filter((i) => i.label.toLowerCase().includes(searchQuery.toLowerCase())) : items,
        [searchQuery],
    );

    const hasMatchingItems = SIDEBAR_SECTIONS.some((s) => filterItems(s.items).length > 0);

    useEffect(() => {
        if (sidebarOpen) {
            document.body.classList.add('nav-open');
        } else {
            document.body.classList.remove('nav-open');
        }
    }, [sidebarOpen]);

    const navigate = (id: string) => {
        setActiveId(id);
        setSidebarOpen(false);
        setSearchQuery('');
    };

    // ✅ breadcrumb click targets
    const exitDocs = (hash?: string) => {
        window.dispatchEvent(new CustomEvent('docs:exit', hash ? { detail: { hash } } : undefined));
    };

    useEffect(() => {
        const h = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };
        window.addEventListener('keydown', h);
        return () => window.removeEventListener('keydown', h);
    }, []);

    useEffect(() => {
        contentRef.current?.scrollTo({ top: 0 });
        window.scrollTo({ top: 0 });
    }, [activeId]);

    // ── Overview content ───────────────────────────────────────────────────
    const overviewContent = (
        <div>
            <section className="docs-overview-hero">
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 22,
                        border: `1px solid ${BORDER}`,
                        background: 'rgba(255,255,255,0.035)',
                        borderRadius: 999,
                        padding: '8px 12px',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                >
                    <Sparkles size={13} color={RED} />
                    <span
                        style={{
                            fontFamily: FONT_UI,
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.18em',
                            textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.64)',
                        }}
                    >
                        Ardeno Studio Docs
                    </span>
                </div>

                <h1
                    className="docs-hero-title"
                    style={{
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 700,
                        color: '#fff',
                        letterSpacing: 0,
                        lineHeight: 0.96,
                        marginBottom: 22,
                    }}
                >
                    Build clarity before we build the site.
                </h1>

                <p
                    style={{
                        fontFamily: FONT_BODY,
                        fontSize: 16,
                        color: 'rgba(255,255,255,0.66)',
                        lineHeight: 1.85,
                        maxWidth: 690,
                        marginBottom: 28,
                    }}
                >
                    Our docs now work like a client operating manual: process, scope, timelines, privacy, pricing logic, and handoff expectations in one focused place.
                </p>

                <div className="docs-hero-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                    <button
                        type="button"
                        onClick={onOpenContact}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            minHeight: 46,
                            padding: '0 20px',
                            borderRadius: 999,
                            border: '1px solid rgba(229,9,20,0.46)',
                            background: RED,
                            color: '#fff',
                            fontFamily: FONT_UI,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            boxShadow: '0 18px 44px rgba(229,9,20,0.18)',
                        }}
                    >
                        Start a Project <ArrowUpRight size={13} />
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('our-process')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            minHeight: 46,
                            padding: '0 18px',
                            borderRadius: 999,
                            border: `1px solid ${BORDER_STRONG}`,
                            background: 'rgba(255,255,255,0.035)',
                            color: 'rgba(255,255,255,0.78)',
                            fontFamily: FONT_UI,
                            fontSize: 11,
                            fontWeight: 800,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                        }}
                    >
                        Read Process <ChevronRight size={13} />
                    </button>
                </div>
            </section>

            <div className="docs-proof-strip">
                {[
                    ['5', 'Project phases'],
                    ['2', 'Structured feedback rounds'],
                    ['90+', 'Performance baseline'],
                ].map(([value, label]) => (
                    <div key={label}>
                        <strong style={{ display: 'block', fontFamily: FONT_BRAND, fontSize: 30, color: '#fff', lineHeight: 1 }}>{value}</strong>
                        <span
                            style={{
                                display: 'block',
                                marginTop: 8,
                                fontFamily: FONT_UI,
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: '0.13em',
                                textTransform: 'uppercase',
                                color: TEXT_DIM,
                            }}
                        >
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            <section style={{ marginTop: 42 }}>
                <p
                    style={{
                        fontFamily: FONT_UI,
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        color: TEXT_DIM,
                        fontWeight: 800,
                        marginBottom: 16,
                    }}
                >
                    Quick Start
                </p>

                <div className="docs-quick-grid">
                    {QUICK_CARDS.map((card, i) => (
                        <QuickCard key={i} {...card} onOpenContact={onOpenContact} />
                    ))}
                </div>
            </section>

            <section style={{ marginTop: 46, paddingTop: 28, borderTop: `1px solid ${BORDER}` }}>
                <div className="docs-next-row">
                    <div>
                        <p
                            style={{
                                fontFamily: FONT_UI,
                                fontSize: 10,
                                letterSpacing: '0.2em',
                                textTransform: 'uppercase',
                                color: TEXT_DIM,
                                fontWeight: 800,
                                marginBottom: 8,
                            }}
                        >
                            Browse by Intent
                        </p>
                        <h2 style={{ fontFamily: FONT_BRAND, fontSize: 24, lineHeight: 1.08, letterSpacing: 0, color: '#fff', margin: 0 }}>
                            Jump straight to the part of the engagement you are deciding on.
                        </h2>
                    </div>

                    <div className="docs-chip-list">
                        {ALL_ITEMS.filter((i) => i.id !== 'overview')
                            .slice(0, 8)
                            .map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.id)}
                                    style={{
                                        fontFamily: FONT_BODY,
                                        fontSize: 12,
                                        color: 'rgba(255,255,255,0.62)',
                                        background: PANEL,
                                        border: `1px solid ${BORDER}`,
                                        borderRadius: 999,
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        const b = e.currentTarget as HTMLButtonElement;
                                        b.style.color = '#fff';
                                        b.style.borderColor = RED_DIM;
                                        b.style.background = RED_GLOW;
                                    }}
                                    onMouseLeave={(e) => {
                                        const b = e.currentTarget as HTMLButtonElement;
                                        b.style.color = 'rgba(255,255,255,0.62)';
                                        b.style.borderColor = BORDER;
                                        b.style.background = PANEL;
                                    }}
                                >
                                    {item.label}
                                </button>
                            ))}
                    </div>
                </div>
            </section>
        </div>
    );

    const renderedContent =
        activeId === 'overview'
            ? overviewContent
            : PAGE_CONTENT[activeId] ?? (
                <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: FONT_BODY, fontSize: 14 }}>Content coming soon…</p>
            );

    return (
        <div
            style={{
                minHeight: '100vh',
                background: BG_MAIN,
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                isolation: 'isolate',
                overflow: 'hidden',
            }}
        >
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: -2,
                    pointerEvents: 'none',
                    background:
                        'linear-gradient(115deg, rgba(229,9,20,0.10) 0%, rgba(5,5,6,0) 32%), linear-gradient(180deg, rgba(255,255,255,0.035), rgba(255,255,255,0) 24%), #050506',
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: -1,
                    pointerEvents: 'none',
                    opacity: 0.22,
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                    backgroundSize: '88px 88px',
                    maskImage: 'linear-gradient(to bottom, black, transparent 72%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 72%)',
                }}
            />
            {/* ── TOP BAR ── */}
            <header
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 80,
                    height: 72,
                    background: 'rgba(5,5,6,0.78)',
                    backdropFilter: 'blur(22px)',
                    WebkitBackdropFilter: 'blur(22px)',
                    borderBottom: `1px solid ${BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 24px',
                    gap: 16,
                    boxShadow: '0 20px 70px rgba(0,0,0,0.24)',
                }}
            >
                {/* Hamburger — hidden on desktop via CSS */}
                <button
                    id="docs-sidebar-toggle"
                    onClick={() => setSidebarOpen((v) => !v)}
                    aria-label="Toggle sidebar"
                    className="docs-mobile-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 38,
                        height: 38,
                        borderRadius: 8,
                        border: `1px solid ${BORDER}`,
                        background: PANEL,
                        color: 'rgba(255,255,255,0.68)',
                        cursor: 'pointer',
                        flexShrink: 0,
                    }}
                >
                    {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
                </button>

                {/* Logo */}
                <a
                    href="/"
                    id="docs-home-link"
                    onClick={(e) => {
                        e.preventDefault();
                        exitDocs();
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', flexShrink: 0 }}
                >
                    <img src="/ardeno-logo.svg" alt="Ardeno Studio" style={{ height: 30, width: 'auto' }} />
                    <span style={{ fontFamily: FONT_BRAND, fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>ARDENO</span>
                    <span
                        className="docs-header-ext"
                        style={{ fontFamily: FONT_UI, fontSize: 11, color: 'rgba(255,255,255,0.38)', letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 800 }}
                    >
                        / DOCS
                    </span>
                </a>

                <div style={{ flex: 1 }} />

                {/* Back to site */}
                <a
                    href="/"
                    onClick={(e) => {
                        e.preventDefault();
                        exitDocs();
                    }}
                    className="docs-header-back-button"
                    style={{
                        fontFamily: FONT_UI,
                        fontWeight: 800,
                        fontSize: 11,
                        letterSpacing: '0.14em',
                        textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.62)',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginRight: 8,
                        transition: 'color 0.2s ease',
                        whiteSpace: 'nowrap',
                        minHeight: 38,
                        padding: '0 14px',
                        borderRadius: 999,
                        border: `1px solid ${BORDER}`,
                        background: PANEL,
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = '#fff')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.62)')}
                >
                    <ArrowLeft size={13} />
                    <span>Site</span>
                </a>

                {/* Search */}
                <div className="docs-search-wrap" style={{ position: 'relative', width: '100%', maxWidth: 340, flexShrink: 1 }}>
                    <Search
                        size={13}
                        style={{
                            position: 'absolute',
                            left: 14,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: searchFocused ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.32)',
                            pointerEvents: 'none',
                            transition: 'color 0.2s',
                        }}
                    />
                    <input
                        id="docs-search-input"
                        type="text"
                        placeholder="Search docs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        style={{
                            width: '100%',
                            minHeight: 38,
                            padding: '8px 14px 8px 38px',
                            borderRadius: 999,
                            background: searchFocused ? 'rgba(255,255,255,0.07)' : PANEL,
                            border: `1px solid ${searchFocused ? RED_DIM : BORDER}`,
                            color: '#fff',
                            fontFamily: FONT_BODY,
                            fontSize: 12,
                            outline: 'none',
                            transition: 'all 0.25s ease',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>
            </header>

            {/* ── BODY ── */}
            <div style={{ display: 'flex', flex: 1, paddingTop: 72, position: 'relative', zIndex: 1 }}>
                {/* Desktop sidebar */}
                <aside
                    className="docs-sidebar-desktop"
                    style={{
                        width: 288,
                        flexShrink: 0,
                        position: 'fixed',
                        top: 72,
                        bottom: 0,
                        left: 0,
                        background: BG_SIDEBAR,
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        borderRight: `1px solid ${BORDER}`,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        padding: '28px 0 34px',
                    }}
                >
                    <SidebarContent
                        sections={SIDEBAR_SECTIONS}
                        activeId={activeId}
                        onNavigate={navigate}
                        filterItems={filterItems}
                        hasMatchingItems={hasMatchingItems}
                        searchQuery={searchQuery}
                    />
                </aside>

                {/* Mobile drawer */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => setSidebarOpen(false)}
                                className="docs-mobile-backdrop"
                                style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
                            />
                            <motion.aside
                                initial={{ x: '-100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '-100%' }}
                                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                                className="docs-mobile-drawer"
                                style={{
                                    position: 'fixed',
                                    top: 72,
                                    left: 0,
                                    bottom: 0,
                                    width: 288,
                                    zIndex: 75,
                                    background: BG_SIDEBAR,
                                    backdropFilter: 'blur(18px)',
                                    WebkitBackdropFilter: 'blur(18px)',
                                    borderRight: `1px solid ${BORDER}`,
                                    overflowY: 'auto',
                                    padding: '28px 0 34px',
                                }}
                            >
                                <SidebarContent
                                    sections={SIDEBAR_SECTIONS}
                                    activeId={activeId}
                                    onNavigate={navigate}
                                    filterItems={filterItems}
                                    hasMatchingItems={hasMatchingItems}
                                    searchQuery={searchQuery}
                                />
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main content */}
                <main ref={contentRef} className="docs-main-content" style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
                    <div className="docs-content-wrap">

                        <nav
                            aria-label="breadcrumb"
                            className="docs-breadcrumb"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 34,
                                border: `1px solid ${BORDER}`,
                                background: PANEL,
                                borderRadius: 999,
                                padding: '8px 10px',
                                maxWidth: '100%',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.045)',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => navigate('overview')}
                                style={{
                                    fontFamily: FONT_UI,
                                    fontSize: 10,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.42)',
                                    fontWeight: 800,
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '0 2px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)')}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.42)')}
                            >
                                Docs
                            </button>

                            <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />

                            <button
                                type="button"
                                onClick={() => {
                                    const group = currentSection?.group ?? 'Getting Started';
                                    const first = SIDEBAR_SECTIONS.find((s) => s.group === group)?.items?.[0]?.id;
                                    if (first) navigate(first);
                                    else navigate('overview');
                                }}
                                style={{
                                    fontFamily: FONT_UI,
                                    fontSize: 10,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.42)',
                                    fontWeight: 800,
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '0 2px',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.65)')}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.42)')}
                            >
                                {currentSection?.group ?? 'Getting Started'}
                            </button>

                            <ChevronRight size={11} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />

                            <span
                                className="docs-breadcrumb-current"
                                style={{
                                    fontFamily: FONT_UI,
                                    fontSize: 10,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: '#fff',
                                    fontWeight: 800,
                                    minWidth: 0,
                                }}
                            >
                                {labelFor(activeId)}
                            </span>
                        </nav>

                        {/* ...keep everything below exactly as you already have it (AnimatePresence, content, etc.) */}

                        {/* Animated page content */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                                style={{ overflow: 'visible', position: 'relative' }}
                            >
                                {renderedContent}
                            </motion.div>
                        </AnimatePresence>

                        {/* Last updated timestamp */}
                        <div
                            style={{
                                marginTop: 64,
                                paddingTop: 24,
                                borderTop: `1px solid ${BORDER}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <Clock size={11} style={{ color: RED }} />
                            <span style={{ fontFamily: FONT_UI, fontSize: 11, color: TEXT_DIM, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 800 }}>
                                Last updated: May 2026
                            </span>
                        </div>

                        {/* Prev / Next */}
                        <DocPager activeId={activeId} onNavigate={navigate} />
                    </div>
                </main>
            </div>

            {/* Scoped responsive CSS */}
            <style>{`
        .docs-content-wrap {
          width: min(100%, 980px);
          margin: 0 auto;
          padding: 62px 36px 96px;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        .docs-hero-title {
          font-size: 4.35rem;
          max-width: 760px;
          overflow-wrap: break-word;
          text-wrap: balance;
        }
        .docs-content-title {
          font-size: 3.1rem;
          max-width: 760px;
          overflow-wrap: break-word;
          text-wrap: balance;
        }
        .docs-overview-hero {
          padding: 26px 0 36px;
          border-bottom: 1px solid rgba(255,255,255,0.09);
        }
        .docs-proof-strip {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-top: 20px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,0.09);
        }
        .docs-proof-strip > div {
          border-left: 1px solid rgba(255,255,255,0.09);
          padding-left: 18px;
        }
        .docs-proof-strip > div:first-child {
          border-left: 0;
          padding-left: 0;
        }
        .docs-quick-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        .docs-next-row {
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(280px, 1fr);
          gap: 28px;
          align-items: start;
        }
        .docs-chip-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: flex-end;
        }
        .docs-breadcrumb {
          box-sizing: border-box;
        }
        .docs-hero-actions > button {
          max-width: 100%;
        }
        @media (min-width: 768px) {
          .docs-mobile-btn { display: none !important; }
          .docs-mobile-backdrop,
          .docs-mobile-drawer { display: none !important; }
          .docs-main-content { margin-left: 288px !important; }
        }
        @media (max-width: 900px) {
          .docs-quick-grid,
          .docs-next-row { grid-template-columns: 1fr; }
          .docs-chip-list { justify-content: flex-start; }
        }
        @media (max-width: 640px) {
          .docs-search-wrap { display: none !important; }
          .docs-header-ext { display: none !important; }
          .docs-content-wrap {
            width: min(100%, 390px);
            margin: 0;
            padding: 38px 20px 74px;
          }
          .docs-hero-title { font-size: 2.45rem; line-height: 1.02; }
          .docs-content-title { font-size: 2.45rem; }
          .docs-hero-actions {
            flex-direction: column;
            align-items: stretch !important;
          }
          .docs-hero-actions > button {
            width: 100%;
            flex: 1 1 auto;
          }
          .docs-proof-strip { grid-template-columns: 1fr; gap: 0; }
          .docs-proof-strip > div,
          .docs-proof-strip > div:first-child {
            border-left: 0;
            padding: 16px 0;
            border-bottom: 1px solid rgba(255,255,255,0.09);
          }
          .docs-proof-strip > div:last-child { border-bottom: 0; }
          .docs-breadcrumb {
            width: 100%;
            overflow-x: auto;
            justify-content: flex-start;
          }
          .docs-content-row {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .docs-quick-grid > button {
            min-width: 0;
          }
          .docs-pager {
            flex-direction: column;
          }
          .docs-pager button {
            max-width: none !important;
            width: 100%;
            justify-content: space-between;
          }
        }
        @media (max-width: 767px) {
          .docs-sidebar-desktop { display: none !important; }
          .docs-main-content { margin-left: 0 !important; }
          .docs-header-back-button { font-size: 0 !important; gap: 0 !important; }
          .docs-header-back-button svg { width: 14px; height: 14px; }
          .docs-header-back-button span { display: none !important; }
        }
        .docs-sidebar-desktop::-webkit-scrollbar,
        .docs-mobile-drawer::-webkit-scrollbar { width: 4px; }
        .docs-sidebar-desktop::-webkit-scrollbar-track,
        .docs-mobile-drawer::-webkit-scrollbar-track { background: transparent; }
        .docs-sidebar-desktop::-webkit-scrollbar-thumb,
        .docs-mobile-drawer::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>
        </div>
    );
};
