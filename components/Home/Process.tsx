import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  memo,
} from "react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from "framer-motion";
import { Minus } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "'Instrument Serif', Georgia, serif";
const FONT_B = "'Sora', sans-serif";

const STEPS = [
  {
    num: "01",
    title: "Discovery & Strategy",
    desc: "We immerse ourselves in your brand ecosystem to uncover distinct opportunities and define the KPIs that actually move the needle.",
    chips: ["Stakeholder interviews", "Competitor audit", "KPI framework"],
    chipsMobile: ["Stakeholder", "Competitor audit"],
    duration: "1–2 wks",
    progress: 100,
  },
  {
    num: "02",
    title: "UX & Wireframing",
    desc: "Architecting the user journey with data-driven blueprints that prioritise conversion, clarity, and engagement at every touchpoint.",
    chips: ["Journey mapping", "Low-fi wireframes", "User testing"],
    chipsMobile: ["Journey mapping", "User testing"],
    duration: "2–3 wks",
    progress: 100,
  },
  {
    num: "03",
    title: "Visual Design",
    desc: "Crafting high-fidelity interfaces with cinematic motion and a visual language that commands attention without shouting.",
    chips: ["Design system", "Motion spec", "Figma prototype"],
    chipsMobile: ["Design system", "Motion spec"],
    duration: "2–4 wks",
    progress: 58,
  },
  {
    num: "04",
    title: "Development & Launch",
    desc: "Engineering robust, scalable solutions on modern frameworks — performance optimised, SEO ready, and built to scale from day one.",
    chips: ["React / Next.js", "CI/CD pipeline", "Lighthouse 95+"],
    chipsMobile: ["React / Next.js", "Lighthouse 95+"],
    duration: "4–6 wks",
    progress: 0,
  },
] as const;

// ─── Perf-safe animated counter — writes directly to DOM, zero re-renders ────
const AnimatedCounter = memo(({ value }: { value: number }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number>(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const start = prevRef.current;
    const end = value;
    if (start === end) return;
    prevRef.current = end;
    const t0 = performance.now();
    const dur = 550;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      if (spanRef.current)
        spanRef.current.textContent = String(Math.round(start + (end - start) * e));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <span ref={spanRef}>{value}</span>;
});
AnimatedCounter.displayName = "AnimatedCounter";

// ─── Scroll sentinel — triggers when element centre crosses viewport midpoint ─
const ScrollSentinel = memo(({
  index,
  onActivate,
}: {
  index: number;
  onActivate: (i: number) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  // Fires when ~30% of element is visible from top
  const inView = useInView(ref, { margin: "-30% 0px -60% 0px" });

  useEffect(() => {
    if (inView) onActivate(index);
  }, [inView, index, onActivate]);

  return <div ref={ref} className="absolute inset-0 pointer-events-none" />;
});
ScrollSentinel.displayName = "ScrollSentinel";

// ─── Step row — memoised so siblings don't re-render on hover ─────────────────
const StepRow = memo(({
  step,
  index,
  isActive,
  isPast,
  isLast,
  onHover,
  onScrollActivate,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isActive: boolean;
  isPast: boolean;
  isLast: boolean;
  onHover: (i: number) => void;
  onScrollActivate: (i: number) => void;
}) => {
  const reduced = useReducedMotion();

  // Memoised hover handler — stable reference, no lambda on every render
  const handleEnter = useCallback(() => onHover(index), [onHover, index]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, ease: EASE, delay: index * 0.07 }}
      // pl-12 on mobile (saves ~1rem), pl-16 on desktop
      className="relative pl-12 md:pl-16 group"
      onMouseEnter={handleEnter}
      style={{ cursor: "default" }}
    >
      {/* Scroll sentinel — only active on mobile (lg hidden) */}
      <div className="lg:hidden">
        <ScrollSentinel index={index} onActivate={onScrollActivate} />
      </div>

      {/* Ghost number — desktop only, hidden on mobile */}
      <div
        className="hidden md:block absolute -left-4 top-1/2 -translate-y-1/2 select-none pointer-events-none"
        style={{
          fontFamily: FONT_H,
          fontWeight: 700,
          fontSize: "clamp(4rem, 8vw, 8rem)",
          lineHeight: 1,
          // CSS transition instead of framer — no JS overhead
          color: isActive ? "rgba(229,9,20,0.07)" : "rgba(255,255,255,0.022)",
          transition: "color 0.5s ease",
          letterSpacing: "-0.04em",
          // Force GPU layer — prevents repaint on sibling updates
          transform: "translate3d(0, -50%, 0)",
          willChange: "color",
          zIndex: 0,
        }}
      >
        {step.num}
      </div>

      {/* Step circle */}
      <div
        className="absolute left-0 top-1 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center z-10 overflow-hidden"
        style={{
          border: `1px solid ${isActive
              ? "rgba(229,9,20,0.55)"
              : isPast
                ? "rgba(255,255,255,0.12)"
                : "rgba(255,255,255,0.07)"
            }`,
          background: isActive ? "rgba(229,9,20,0.06)" : "#080809",
          boxShadow: isActive
            ? "0 0 0 4px rgba(229,9,20,0.06), 0 0 16px rgba(229,9,20,0.1)"
            : "none",
          // CSS transition — no spring physics overhead
          transition: "border-color 0.35s ease, background 0.35s ease, box-shadow 0.35s ease",
        }}
      >
        {/* Pulse ring — only when active, only if not reduced */}
        {isActive && !reduced && (
          <motion.span
            className="absolute inset-0 rounded-full border border-[#E50914]/20"
            animate={{ scale: [1, 1.8], opacity: [0.35, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
          />
        )}

        {isPast ? (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 6.5l2.5 2.5 4.5-5"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <span
            style={{
              fontFamily: FONT_B,
              fontSize: "9px",
              fontWeight: 500,
              color: isActive ? "#E50914" : "rgba(255,255,255,0.18)",
              transition: "color 0.3s ease",
            }}
          >
            {step.num}
          </span>
        )}
      </div>

      {/* Connector line */}
      {!isLast && (
        <div
          className="absolute left-[15px] md:left-[17px] z-0"
          style={{
            top: "34px",
            width: "1px",
            // Height covers the pb-8 (mobile) or pb-14 (desktop) gap
            height: "calc(100% - 34px + 2rem)",
            background: isPast
              ? "linear-gradient(to bottom, rgba(229,9,20,0.4), rgba(229,9,20,0.04))"
              : "rgba(255,255,255,0.05)",
            transition: "background 0.55s ease",
          }}
        />
      )}

      {/* Flowing dot — only active+desktop, skip on mobile for perf */}
      {!isLast && isActive && !reduced && (
        <motion.div
          className="hidden md:block absolute z-20 rounded-full"
          style={{
            left: "16px",
            top: "34px",
            width: 3,
            height: 3,
            background: "#E50914",
            boxShadow: "0 0 8px rgba(229,9,20,0.7)",
          }}
          animate={{ y: [0, 44, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Content */}
      <div
        className="relative z-10 pb-8 md:pb-14"
        style={{
          opacity: isPast ? 0.28 : isActive ? 1 : 0.45,
          transition: "opacity 0.4s ease",
        }}
      >
        {/* Title + duration badge */}
        <div className="flex items-baseline gap-2.5 mb-2 flex-wrap">
          <motion.h3
            animate={{
              color: isActive ? "#fff" : "rgba(255,255,255,0.42)",
              scale: isActive ? 1.045 : 1,
            }}
            transition={{ duration: 0.38, ease: EASE }}
            style={{
              fontFamily: FONT_H,
              fontWeight: 400,
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              transformOrigin: "left center",
              display: "inline-block",
            }}
          >
            {step.title}
          </motion.h3>

          {/* Duration — CSS transition, no AnimatePresence */}
          <span
            style={{
              fontFamily: FONT_B,
              fontSize: "8px",
              letterSpacing: "0.14em",
              color: "#E50914",
              padding: "2px 7px",
              borderRadius: 999,
              border: "1px solid rgba(229,9,20,0.2)",
              background: "rgba(229,9,20,0.05)",
              whiteSpace: "nowrap",
              opacity: isActive ? 1 : 0,
              transform: isActive ? "translateX(0)" : "translateX(-6px)",
              transition: "opacity 0.25s ease, transform 0.25s ease",
            }}
          >
            {step.duration}
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: FONT_B,
            fontSize: "13px",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.28)",
            marginBottom: "0.75rem",
          }}
        >
          {step.desc}
        </p>

        {/* Chips — 2 on mobile, all on desktop */}
        <div className="flex flex-wrap gap-1.5">
          {/* Mobile: show shorter chip labels */}
          {step.chipsMobile.map((chip) => (
            <span
              key={chip}
              className="md:hidden"
              style={{
                fontFamily: FONT_B,
                fontSize: "8px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 999,
                border: `1px solid ${isActive ? "rgba(229,9,20,0.18)" : "rgba(255,255,255,0.05)"}`,
                color: isActive ? "rgba(229,9,20,0.75)" : "rgba(255,255,255,0.14)",
                background: isActive ? "rgba(229,9,20,0.04)" : "transparent",
                transition: "all 0.3s ease",
              }}
            >
              {chip}
            </span>
          ))}

          {/* Desktop: full chip labels */}
          {step.chips.map((chip) => (
            <span
              key={chip}
              className="hidden md:inline-block"
              style={{
                fontFamily: FONT_B,
                fontSize: "8px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                padding: "3px 9px",
                borderRadius: 999,
                border: `1px solid ${isActive ? "rgba(229,9,20,0.18)" : "rgba(255,255,255,0.05)"}`,
                color: isActive ? "rgba(229,9,20,0.75)" : "rgba(255,255,255,0.14)",
                background: isActive ? "rgba(229,9,20,0.04)" : "transparent",
                transition: "all 0.3s ease",
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
});
StepRow.displayName = "StepRow";

// ─── Dashboard — memoised, only re-renders when activeStep changes ─────────────
const Dashboard = memo(({ activeStep }: { activeStep: number }) => {
  const reduced = useReducedMotion();
  const overallProgress = Math.round(
    STEPS.reduce((acc, s, i) => {
      if (i < activeStep) return acc + 100;
      if (i === activeStep) return acc + s.progress;
      return acc;
    }, 0) / STEPS.length
  );

  return (
    <div className="sticky top-24">
      {/* Stacked shadow cards */}
      <div
        className="absolute inset-4 rounded-2xl"
        style={{
          background: "rgba(14,14,16,0.35)",
          border: "1px solid rgba(255,255,255,0.03)",
          transform: "rotate(-2deg)",
        }}
      />
      <div
        className="absolute inset-4 rounded-2xl"
        style={{
          background: "rgba(14,14,16,0.2)",
          border: "1px solid rgba(229,9,20,0.03)",
          transform: "rotate(1.2deg)",
        }}
      />

      {/* Main card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "#0E0E10",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow:
            "0 48px 80px -16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {/* Screen glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% -10%, rgba(229,9,20,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Pulsing top accent */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(229,9,20,0.45) 40%, rgba(229,9,20,0.45) 60%, transparent)",
          }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Chrome bar */}
        <div
          className="h-10 flex items-center px-4 gap-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(8,8,9,0.92)" }}
        >
          <div className="flex gap-1.5">
            {["rgba(229,9,20,0.55)", "rgba(255,200,0,0.2)", "rgba(40,200,60,0.16)"].map(
              (c, j) => (
                <div key={j} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              )
            )}
          </div>
          <div className="flex-1 flex justify-center">
            <div
              className="flex items-center gap-1.5 px-3 py-0.5 rounded-md"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] text-zinc-500" style={{ fontFamily: FONT_B }}>
                ardenostudio.lk
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 relative z-10">
          {/* Header */}
          <div
            className="flex items-center justify-between mb-6 pb-5"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                style={{
                  background: "linear-gradient(135deg, #1c1c1e, #2a2a2e)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontFamily: FONT_B,
                }}
              >
                AS
              </div>
              <div>
                <div
                  className="text-[13px] text-white"
                  style={{ fontFamily: FONT_H, fontWeight: 700 }}
                >
                  Project Timeline
                </div>
                <div className="text-[9.5px] text-zinc-600" style={{ fontFamily: FONT_B }}>
                  Active engagement
                </div>
              </div>
            </div>
            <motion.div
              className="px-2.5 py-1 rounded-full text-[8.5px] font-bold tracking-[0.2em] uppercase"
              style={{
                background: "rgba(74,222,128,0.06)",
                border: "1px solid rgba(74,222,128,0.14)",
                color: "#4ade80",
                fontFamily: FONT_B,
              }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              ● Active
            </motion.div>
          </div>

          {/* Step rows */}
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              const barW = done ? 100 : active ? step.progress : 0;

              return (
                <div key={step.num} className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-0.5 shrink-0 w-4 h-4">
                    {done ? (
                      <svg viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7.5" stroke="rgba(255,255,255,0.1)" />
                        <path
                          d="M5 8.5l2 2 4-4"
                          stroke="rgba(255,255,255,0.22)"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : active ? (
                      <motion.svg
                        viewBox="0 0 16 16"
                        fill="none"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      >
                        <circle cx="8" cy="8" r="7.5" stroke="rgba(229,9,20,0.4)" />
                        <motion.circle
                          cx="8"
                          cy="8"
                          r="3"
                          fill="#E50914"
                          animate={{ r: [2.5, 3.5, 2.5] }}
                          transition={{ duration: 1.8, repeat: Infinity }}
                        />
                      </motion.svg>
                    ) : (
                      <svg viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7.5" stroke="rgba(255,255,255,0.05)" />
                      </svg>
                    )}
                  </div>

                  {/* Progress bar row */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className="text-[11.5px]"
                        style={{
                          fontFamily: FONT_B,
                          fontWeight: active ? 600 : 400,
                          color: active
                            ? "#fff"
                            : done
                              ? "rgba(255,255,255,0.2)"
                              : "rgba(255,255,255,0.18)",
                          transition: "color 0.4s ease",
                        }}
                      >
                        {step.title}
                      </span>
                      <span
                        className="text-[9px] tabular-nums"
                        style={{
                          fontFamily: FONT_B,
                          color: active
                            ? "#E50914"
                            : done
                              ? "rgba(255,255,255,0.14)"
                              : "rgba(255,255,255,0.07)",
                          transition: "color 0.4s ease",
                        }}
                      >
                        {done ? "100%" : active ? `${step.progress}%` : "—"}
                      </span>
                    </div>
                    <div
                      className="h-[3px] w-full rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: active
                            ? "linear-gradient(90deg, #E50914, #ff4040)"
                            : done
                              ? "rgba(255,255,255,0.1)"
                              : "transparent",
                        }}
                        initial={{ width: "0%" }}
                        animate={{ width: `${barW}%` }}
                        transition={{ duration: 0.9, ease: EASE, delay: 0.08 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer stat */}
          <div
            className="mt-6 pt-5 flex items-end justify-between"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div>
              <div
                className="text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1.5"
                style={{ fontFamily: FONT_B }}
              >
                Current phase
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  className="text-[13px] text-white"
                  style={{ fontFamily: FONT_B, fontWeight: 600 }}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.22 }}
                >
                  {STEPS[activeStep]?.title}
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="text-right">
              <div
                className="text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1"
                style={{ fontFamily: FONT_B }}
              >
                Overall progress
              </div>
              <div
                className="text-[2rem] leading-none tabular-nums"
                style={{
                  fontFamily: FONT_H,
                  fontWeight: 700,
                  color: "#E50914",
                  letterSpacing: "-0.03em",
                }}
              >
                <AnimatedCounter value={overallProgress} />
                <span className="text-[1.1rem]">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
Dashboard.displayName = "Dashboard";

// ─── Main ─────────────────────────────────────────────────────────────────────
export const Process: React.FC = () => {
  const reduced = useReducedMotion();
  const [activeStep, setActiveStep] = useState(0);

  // Stable callback — never recreated
  const handleHover = useCallback((i: number) => setActiveStep(i), []);
  const handleScrollActivate = useCallback((i: number) => setActiveStep(i), []);

  return (
    <section
      id="process"
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

      {/* Ambient glow — CSS only, no Framer animation */}
      <div
        className="pointer-events-none absolute bottom-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full z-0"
        style={{
          background: "radial-gradient(circle, rgba(229,9,20,0.05) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center gap-3 mb-10"
        >
          <Minus className="w-3.5 h-3.5 text-[#E50914] stroke-[1.5] shrink-0" />
          <span
            className="text-[11px] tracking-[0.28em] text-zinc-400 uppercase"
            style={{ fontFamily: FONT_B, fontWeight: 500 }}
          >
            The Framework
          </span>
          <div className="flex-1 h-px bg-white/[0.05] ml-1" />
          <span className="text-[11px] tracking-[0.2em] text-zinc-600 uppercase" style={{ fontFamily: FONT_B }}>
            04 Steps
          </span>
        </motion.div>

        {/* Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-24">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{
              fontFamily: FONT_H,
              fontWeight: 700,
              fontSize: "clamp(2.2rem, 5vw, 4.6rem)",
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              color: "#fff",
              maxWidth: "16ch",
            }}
          >
            We don't just{" "}
            <em
              className="not-italic"
              style={{ color: "rgba(255,255,255,0.2)", fontWeight: 300 }}
            >
              build.
            </em>
            <br />
            We engineer{" "}
            <span className="relative inline-block">
              <em
                className="not-italic"
                style={{ color: "rgba(255,255,255,0.2)", fontWeight: 300 }}
              >
                success.
              </em>
              <motion.span
                className="absolute left-0 bottom-0.5 h-[2px] rounded-full"
                style={{
                  background: "linear-gradient(90deg, #E50914, transparent)",
                  originX: 0,
                  width: "100%",
                }}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.0, ease: EASE, delay: 0.5 }}
              />
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
            className="md:max-w-[220px] md:pb-2 shrink-0"
          >
            <div className="w-5 h-px bg-[#E50914] mb-4 hidden md:block" style={{ opacity: 0.55 }} />
            <p className="text-[13px] text-zinc-500 leading-[1.8]" style={{ fontFamily: FONT_B }}>
              Our proven process bridges creative vision and technical reality,
              ensuring every decision drives measurable results.
            </p>
          </motion.div>
        </div>

        {/* Two column */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 lg:gap-16 items-start">
          {/* Steps */}
          <div className="relative">
            {STEPS.map((step, i) => (
              <StepRow
                key={step.num}
                step={step}
                index={i}
                isActive={activeStep === i}
                isPast={i < activeStep}
                isLast={i === STEPS.length - 1}
                onHover={handleHover}
                onScrollActivate={handleScrollActivate}
              />
            ))}
          </div>

          {/* Dashboard — desktop only */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="hidden lg:block"
          >
            <Dashboard activeStep={activeStep} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};