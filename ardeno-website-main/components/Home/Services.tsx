import React, { useRef, useCallback, useState, useEffect } from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useSpring,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Minus, ArrowUpRight, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Service = {
  id: string;
  title: string;
  description: string;
  detail: string;
  deliverables: string[];
  tag: string;
  icon: React.ReactNode;
};

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const FONT_HEADING = "'Instrument Serif', Georgia, serif";
const FONT_BODY = "'Sora', sans-serif";

// ─── Data ─────────────────────────────────────────────────────────────────────
const SERVICES: Service[] = [
  {
    id: "01",
    title: "Premium Web Design",
    description:
      "Bespoke UI/UX design that captures your brand essence. We don't use templates; we build digital masterpieces.",
    detail: `Every pixel is intentional. We begin with a deep discovery phase — understanding your audience, your competitors, and what makes your brand irreplaceable.`,
    deliverables: [
      "Brand visual system",
      "Figma design files",
      "Component library",
      "Motion guidelines",
    ],
    tag: "UI / UX",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    id: "02",
    title: "Creative Development",
    description:
      "Fluid animations, WebGL interactions, and rock-solid code. Performance meets artistry on every build.",
    detail: `We write code the way designers think — with intention, creativity, and obsessive attention to detail. Our stack is modern and battle-tested: React, Next.js, TypeScript, and Framer Motion for buttery-smooth interactions.`,
    deliverables: [
      "Next.js / React codebase",
      "WebGL / Three.js scenes",
      "CMS integration",
      "95+ Lighthouse score",
    ],
    tag: "WebGL",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
  },
  {
    id: "03",
    title: "Conversion Strategy",
    description:
      "Beautiful websites that sell. We use data-driven layouts to turn visitors into high-value clients.",
    detail: `A website that doesn't convert is just an expensive brochure. We treat every layout decision as a hypothesis — informed by heatmaps, session recordings, and conversion data from hundreds of projects.`,
    deliverables: [
      "CRO audit & roadmap",
      "Analytics instrumentation",
      "A/B test framework",
      "30-day post-launch review",
    ],
    tag: "CRO",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>
    ),
  },
  {
    id: "04",
    title: "Mobile First",
    description:
      "Seamless experiences across all devices. Your site will look stunning on a 4K monitor and an iPhone.",
    detail: `More than 60% of web traffic is mobile — yet most agencies design on desktop and "adapt" to mobile as an afterthought. We flip that entirely.`,
    deliverables: [
      "Mobile-first responsive layout",
      "Real-device QA",
      "Touch interaction design",
      "Adaptive asset delivery",
    ],
    tag: "Responsive",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="2" width="10" height="20" rx="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
];

// ─── Modal ────────────────────────────────────────────────────────────────────
const Modal: React.FC<{ service: Service; onClose: () => void }> = ({
  service,
  onClose,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleStartProject = () => {
    onClose();
    setTimeout(() => {
      const el =
        document.getElementById("contact") ||
        document.querySelector("footer");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const paragraphs = service.detail.split("\n\n");

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: "rgba(4,4,5,0.84)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-[520px] rounded-2xl overflow-hidden flex flex-col"
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 12 }}
        transition={{ duration: 0.4, ease: EASE }}
        style={{
          maxHeight: "85vh",
          overflowY: "auto",
          background: "#0c0c0e",
          boxShadow: "0 48px 96px -24px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.07)",
        }}
      >

        <div className="relative z-10 pt-4 pb-5 px-4 sm:px-6">
          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: EASE, delay: 0.06 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#E50914] shrink-0"
                style={{
                  background: "rgba(229,9,20,0.06)",
                  border: "1px solid rgba(229,9,20,0.15)",
                }}
              >
                {service.icon}
              </motion.div>
              <div>
                <span
                  className="text-[10px] text-[#E50914] tracking-[0.28em] block mb-0.5"
                  style={{ fontFamily: FONT_BODY, fontWeight: 600 }}
                >
                  {service.id}
                </span>
                <h3
                  className="text-[1.35rem] text-white leading-tight tracking-[-0.02em]"
                  style={{ fontFamily: FONT_HEADING, fontWeight: 700 }}
                >
                  {service.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-500 hover:text-white transition-colors duration-200 shrink-0 mt-0.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* ── Lead sentence — larger type ── */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
            className="text-zinc-200 mb-3"
            style={{ fontSize: 13, lineHeight: 1.75, fontFamily: FONT_BODY }}
          >
            {paragraphs[0]}
          </motion.p>

          <div className="h-px bg-white/[0.06]" style={{ marginTop: 0, marginBottom: 12 }} />

          {/* ── Detail paragraphs (2 & 3, smaller) ── */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              show: {
                transition: { staggerChildren: 0.06, delayChildren: 0.15 },
              },
            }}
          >
            {/* ── Deliverables ── */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.42, ease: EASE },
                },
              }}
              className="border-t border-white/[0.06]"
              style={{ marginTop: 12, paddingTop: 12 }}
            >
              <span
                className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 mb-4 block"
                style={{ fontFamily: FONT_BODY, fontWeight: 600 }}
              >
                What you get
              </span>
              <div className="grid grid-cols-2 gap-1.5" style={{ marginTop: 12 }}>
                {service.deliverables.map((item) => (
                  <div key={item} style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.03)",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.75)",
                    fontFamily: FONT_BODY,
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ color: "#E50914", fontSize: 16 }}>→</span> {item}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* ── CTA ── */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.38, ease: EASE },
                },
              }}
              className="mt-7 flex items-center gap-4"
            >
              <motion.button
                onClick={handleStartProject}
                className="flex items-center gap-2 text-[12px] font-semibold text-white px-5 py-2.5 rounded-full"
                style={{
                  fontFamily: FONT_BODY,
                  background: "#E50914",
                  boxShadow: "0 0 24px rgba(229,9,20,0.25)",
                }}
                whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(229,9,20,0.4)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Start a project
                <ArrowUpRight size={13} />
              </motion.button>
              <button
                onClick={onClose}
                className="text-[12px] text-zinc-600 tracking-[0.15em] uppercase hover:text-zinc-300 transition-colors duration-200"
                style={{ fontFamily: FONT_BODY }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Service Card ─────────────────────────────────────────────────────────────
const ServiceCard: React.FC<{
  service: Service;
  index: number;
  onOpen: () => void;
}> = ({ service, index, onOpen }) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rotateX = useTransform(rawY, [-70, 70], [4, -4]);
  const rotateY = useTransform(rawX, [-70, 70], [-4, 4]);
  const springRotX = useSpring(rotateX, { stiffness: 140, damping: 28, mass: 0.5 });
  const springRotY = useSpring(rotateY, { stiffness: 140, damping: 28, mass: 0.5 });
  const [hovered, setHovered] = useState(false);

  const resetTilt = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    rawX.set(e.clientX - r.left - r.width / 2);
    rawY.set(e.clientY - r.top - r.height / 2);
  }

  function onLeave() {
    resetTilt();
    setHovered(false);
  }

  function handleOpen() {
    resetTilt();
    setHovered(false);
    setTimeout(onOpen, 30);
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: EASE, delay: index * 0.09 }}
      style={{
        rotateX: springRotX,
        rotateY: springRotY,
        transformPerspective: 1200,
        willChange: "transform",
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onHoverStart={() => setHovered(true)}
      className="group relative cursor-pointer"
      onClick={handleOpen}
    >
      {/* Border glow */}
      <motion.div
        className="absolute -inset-[1px] rounded-2xl z-0"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.45 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(229,9,20,0.25) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)",
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 h-full flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: hovered ? "rgba(18,18,22,0.8)" : "rgba(12,12,14,0.55)",
          border: `1px solid ${hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.07)"}`,
          boxShadow: hovered
            ? "0 28px 56px -14px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)"
            : "0 4px 20px -4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
          transition: "background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-0"
          initial={{ x: "-110%", opacity: 0 }}
          animate={hovered ? { x: "110%", opacity: 1 } : { x: "-110%", opacity: 0 }}
          transition={{ duration: 0.65, ease: "easeInOut" }}
          style={{
            background:
              "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.04) 50%, transparent 70%)",
            skewX: "-15deg",
          }}
        />

        {/* Subtle red top glow on hover */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background:
              "radial-gradient(ellipse at 50% -10%, rgba(229,9,20,0.09) 0%, transparent 55%)",
          }}
        />

        {/* Frosted top rim */}
        <div
          className="absolute top-0 left-0 right-0 h-px pointer-events-none z-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 30%, rgba(255,255,255,0.16) 50%, rgba(255,255,255,0.12) 70%, transparent)",
          }}
        />

        <div className="relative z-10 p-6 flex flex-col h-full">
          {/* Top row: index + tag */}
          <div className="flex items-center justify-between mb-7">
            <motion.span
              className="text-[11px] font-bold text-[#E50914] tracking-[0.2em]"
              style={{ fontFamily: FONT_BODY }}
              animate={{ opacity: hovered ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            >
              {service.id}
            </motion.span>
            <span
              className="text-[11px] font-semibold tracking-[0.14em] uppercase rounded-full px-2.5 py-1"
              style={{
                fontFamily: FONT_BODY,
                color: hovered ? "rgba(200,200,208,1)" : "#888888",
                border: `1px solid ${hovered ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.09)"}`,
                transition: "all 0.35s ease",
              }}
            >
              {service.tag}
            </span>
          </div>

          {/* Icon */}
          <motion.div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#E50914] mb-5"
            animate={
              hovered
                ? {
                  y: -2,
                  borderColor: "rgba(229,9,20,0.28)",
                  background: "rgba(229,9,20,0.09)",
                }
                : {
                  y: 0,
                  borderColor: "rgba(255,255,255,0.07)",
                  background: "rgba(229,9,20,0.04)",
                }
            }
            transition={{ duration: 0.35, ease: EASE }}
            style={{ border: "1px solid" }}
          >
            {service.icon}
          </motion.div>

          {/* Title */}
          <h3
            className="text-[1.15rem] text-white leading-snug mb-3 tracking-[-0.015em]"
            style={{ fontFamily: FONT_HEADING, fontWeight: 700 }}
          >
            {service.title}
          </h3>

          {/* Description */}
          <p
            className="text-[14px] leading-[1.75] flex-1"
            style={{
              fontFamily: FONT_BODY,
              color: hovered ? "rgba(200,200,208,1)" : "#aaaaaa",
              transition: "color 0.4s ease",
            }}
          >
            {service.description}
          </p>

          {/* Footer — replaces the disconnected arrow */}
          <div
            className="mt-6 pt-5 flex items-center justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* "Learn more" text link — slides in on hover */}
            <div className="flex items-center gap-2 overflow-hidden">
              <motion.div
                className="h-px bg-[#E50914] origin-left"
                animate={{ width: hovered ? 12 : 0, opacity: hovered ? 1 : 0 }}
                transition={{ duration: 0.28, ease: EASE }}
              />
              <motion.span
                className="text-[10px] tracking-[0.18em] uppercase"
                animate={{
                  color: hovered ? "#E50914" : "rgba(60,60,70,1)",
                  opacity: hovered ? 1 : 0,
                  x: hovered ? 0 : -6,
                }}
                transition={{ duration: 0.28, ease: EASE }}
                style={{ fontFamily: FONT_BODY, fontWeight: 600 }}
              >
                Learn more
              </motion.span>
            </div>

            {/* Arrow button */}
            <motion.div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              animate={
                hovered
                  ? {
                    borderColor: "rgba(229,9,20,0.4)",
                    color: "#E50914",
                    scale: 1.1,
                    background: "rgba(229,9,20,0.07)",
                  }
                  : {
                    borderColor: "rgba(255,255,255,0.08)",
                    color: "rgb(60,60,70)",
                    scale: 1,
                    background: "rgba(255,255,255,0.02)",
                  }
              }
              transition={{ duration: 0.25, ease: EASE }}
              style={{ border: "1px solid" }}
            >
              <motion.span
                animate={{ x: hovered ? 1 : 0, y: hovered ? -1 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: "inline-flex" }}
              >
                <ArrowUpRight size={12} />
              </motion.span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Services Section ─────────────────────────────────────────────────────────
export const Services: React.FC = () => {
  const reduced = useReducedMotion();
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeService = SERVICES.find((s) => s.id === activeId) ?? null;

  useEffect(() => {
    document.body.style.overflow = activeId ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeId]);

  return (
    <section
      id="services"
      className="relative w-full overflow-hidden bg-[#080809] py-28 md:py-36"
    >
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute top-[-10%] left-1/2 -translate-x-1/2 w-[55vw] h-[55vw] rounded-full z-[0]"
        style={{
          background:
            "radial-gradient(circle, rgba(229,9,20,0.055) 0%, transparent 65%)",
        }}
        animate={
          reduced
            ? {}
            : { opacity: [0.5, 1, 0.5], scale: [1, 1.06, 1] }
        }
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* ── Label row ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center gap-3 mb-10"
        >
          <Minus className="w-3.5 h-3.5 text-[#E50914] stroke-[1.5] shrink-0" />
          <span
            className="text-[13px] tracking-[0.22em] uppercase"
            style={{ fontFamily: FONT_BODY, fontWeight: 500, color: '#a0a0a0' }}
          >
            Our Expertise
          </span>
          <div className="flex-1 h-px bg-white/[0.05] ml-1" />
          <span
            className="text-[12px] tracking-[0.2em] uppercase"
            style={{ fontFamily: FONT_BODY, color: '#888888' }}
          >
            04 Services
          </span>
        </motion.div>

        {/* ── Heading block ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: EASE }}
            className="leading-[1.05] text-white"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4.6rem)",
              fontFamily: FONT_HEADING,
              fontWeight: 700,
              letterSpacing: "-0.025em",
              maxWidth: "18ch",
            }}
          >
            Everything you need to{" "}
            <em
              className="not-italic"
              style={{ fontWeight: 300, color: "#8c8c96" }}
            >
              dominate
            </em>{" "}
            your market.
          </motion.h2>

          {/* Subtext — pulled closer to heading, left-aligned on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.72, ease: EASE, delay: 0.1 }}
            className="md:max-w-[240px] md:pb-2 shrink-0"
          >
            {/* Red accent line above */}
            <div
              className="w-6 h-px bg-[#E50914] mb-4 hidden md:block"
              style={{ opacity: 0.7 }}
            />
            <p
              className="text-[15px] leading-[1.8]"
              style={{ fontFamily: FONT_BODY, color: '#c0c0c0' }}
            >
              Four core disciplines. One agency. Infinite competitive edge for
              brands that refuse to be ignored.
            </p>
          </motion.div>
        </div>

        {/* ── Cards grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {SERVICES.map((service, i) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={i}
              onOpen={() => setActiveId(service.id)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeService && (
          <Modal
            key={activeService.id}
            service={activeService}
            onClose={() => setActiveId(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};