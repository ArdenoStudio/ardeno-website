import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Minus } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const CHART_VALS = [20, 35, 50, 45, 75, 95, 85];

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const QUART: [number, number, number, number] = [0.76, 0, 0.24, 1];

// Font constants — Instrument Serif loaded globally in layout.tsx
const FONT_H = "'Instrument Serif', Georgia, serif";
const FONT_B = "'Sora', sans-serif";

// ─── Char-by-char animated headline ──────────────────────────────────────────
const AnimatedText: React.FC<{
  text: string;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  italic?: boolean;
  color?: string;
}> = ({ text, className, style, delay = 0, italic, color }) => {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className={className} style={{ ...style, display: "inline" }}>
      {words.map((word, wi) => (
        <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {word.split("").map((char, ci) => {
            const globalIndex =
              words.slice(0, wi).join(" ").length + (wi > 0 ? 1 : 0) + ci;
            return (
              <motion.span
                key={ci}
                style={{
                  display: "inline-block",
                  fontStyle: italic ? "italic" : "normal",
                  color,
                }}
                initial={reduced ? {} : { opacity: 0, y: 50, rotateX: -30, filter: "blur(5px)" }}
                animate={reduced ? {} : { opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.65, delay: delay + globalIndex * 0.026, ease: EASE }}
              >
                {char}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && (
            <motion.span
              style={{ display: "inline-block" }}
              initial={reduced ? {} : { opacity: 0 }}
              animate={reduced ? {} : { opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: delay + words.slice(0, wi + 1).join(" ").length * 0.026,
              }}
            >
              &nbsp;
            </motion.span>
          )}
        </span>
      ))}
    </span>
  );
};

// ─── "refuse" with animated SVG squiggle underline ───────────────────────────
const RefuseWord: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const reduced = useReducedMotion();
  const CHARS = ["r", "e", "f", "u", "s", "e"];

  return (
    <span style={{ display: "inline-block", position: "relative", paddingBottom: 6 }}>
      <svg
        aria-hidden
        viewBox="0 0 80 8"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          bottom: -2,
          left: 0,
          width: "100%",
          height: 8,
          overflow: "visible",
        }}
      >
        <motion.path
          d="M 0 4 Q 10 1 20 4 Q 30 7 40 4 Q 50 1 60 4 Q 70 7 80 4"
          fill="none"
          stroke="#E50914"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 0.7, delay: delay + 0.55, ease: EASE },
            opacity: { duration: 0.1, delay: delay + 0.55 },
          }}
        />
      </svg>

      <style>{`
        @keyframes refuseGlow {
          0%, 100% { text-shadow: 0 0 6px rgba(229,9,20,0.4), 0 0 20px rgba(229,9,20,0.15); }
          50%       { text-shadow: 0 0 14px rgba(255,50,30,0.8), 0 0 40px rgba(229,9,20,0.4); }
        }
        .refuse-char {
          animation: refuseGlow 3.5s ease-in-out infinite;
          color: #E50914;
          font-style: italic;
          display: inline-block;
        }
      `}</style>

      {CHARS.map((char, i) => (
        <motion.span
          key={i}
          className="refuse-char"
          initial={reduced ? {} : { opacity: 0, y: 50, filter: "blur(5px)" }}
          animate={reduced ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.62, delay: delay + i * 0.028, ease: EASE }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
};

// ─── Magnetic button hook ─────────────────────────────────────────────────────
function useMagnetic(strength = 0.25) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 20, mass: 0.5 });
  const y = useSpring(0, { stiffness: 200, damping: 20, mass: 0.5 });
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  };
  const onLeave = () => { x.set(0); y.set(0); };
  return { ref, x, y, onMove, onLeave };
}

// ─── Primary CTA ──────────────────────────────────────────────────────────────
const PrimaryButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const mag = useMagnetic(0.28);
  const [hov, setHov] = useState(false);
  const [tap, setTap] = useState(false);

  return (
    <motion.button
      ref={mag.ref}
      style={{ x: mag.x, y: mag.y, fontFamily: FONT_B, background: "#E50914", letterSpacing: "0.04em", border: "1px solid rgba(229,9,20,0.5)" }}
      onMouseMove={mag.onMove}
      onMouseLeave={() => { mag.onLeave(); setHov(false); }}
      onMouseEnter={() => setHov(true)}
      onMouseDown={() => setTap(true)}
      onMouseUp={() => { setTap(false); onClick?.(); }}
      animate={{
        scale: tap ? 0.95 : 1,
        boxShadow: hov
          ? "0 0 0 5px rgba(229,9,20,0.12), 0 8px 32px rgba(229,9,20,0.35)"
          : "0 0 0 0px rgba(229,9,20,0), 0 4px 16px rgba(229,9,20,0.2)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative overflow-hidden flex items-center gap-2.5 px-7 py-4 rounded-full text-[13px] font-semibold text-white"
    >
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-[#080809]"
        animate={{ scale: hov ? 1 : 0 }}
        transition={{ duration: 0.45, ease: EASE }}
        style={{ borderRadius: "inherit" }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.14) 50%,transparent 70%)",
          skewX: "-15deg",
        }}
        animate={{ x: hov ? "260%" : "-110%" }}
        transition={{ duration: 0.6, ease: EASE }}
      />
      <span className="relative z-10 overflow-hidden flex flex-col" style={{ height: "1.3em" }}>
        <motion.span
          style={{ lineHeight: "1.3em" }}
          animate={{ y: hov ? "-100%" : "0%" }}
          transition={{ duration: 0.36, ease: QUART }}
        >
          Start a Project
        </motion.span>
        <motion.span
          className="absolute top-full"
          style={{ lineHeight: "1.3em", color: hov ? "#E50914" : "#fff" }}
          animate={{ y: hov ? "-100%" : "0%" }}
          transition={{ duration: 0.36, ease: QUART }}
        >
          Start a Project
        </motion.span>
      </span>
      <motion.span
        className="relative z-10"
        animate={{ x: hov ? 3 : 0, y: hov ? -3 : 0, color: hov ? "#E50914" : "#fff" }}
        transition={{ duration: 0.3 }}
      >
        <ArrowUpRight size={16} />
      </motion.span>
    </motion.button>
  );
};

// ─── Secondary CTA ────────────────────────────────────────────────────────────
const SecondaryButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const mag = useMagnetic(0.2);
  const [hov, setHov] = useState(false);

  return (
    <motion.button
      ref={mag.ref}
      style={{ x: mag.x, y: mag.y, fontFamily: FONT_B, color: hov ? "#fff" : "#71717a", letterSpacing: "0.04em", transition: "color 0.28s" }}
      onMouseMove={mag.onMove}
      onMouseLeave={() => { mag.onLeave(); setHov(false); }}
      onMouseEnter={() => setHov(true)}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      animate={{
        borderColor: hov ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
        backgroundColor: hov ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden flex items-center gap-2 px-7 py-4 rounded-full text-[13px] font-medium border"
    >
      <motion.span
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.05) 50%,transparent 70%)",
          skewX: "-15deg",
        }}
        animate={{ x: hov ? "200%" : "-100%" }}
        transition={{ duration: 0.55 }}
      />
      <span className="relative overflow-hidden flex flex-col" style={{ height: "1.3em" }}>
        <motion.span
          style={{ lineHeight: "1.3em" }}
          animate={{ y: hov ? "-100%" : "0%" }}
          transition={{ duration: 0.34, ease: QUART }}
        >
          View Projects
        </motion.span>
        <motion.span
          className="absolute top-full text-white"
          style={{ lineHeight: "1.3em" }}
          animate={{ y: hov ? "-100%" : "0%" }}
          transition={{ duration: 0.34, ease: QUART }}
        >
          View Projects
        </motion.span>
      </span>
      <motion.span
        animate={{ x: hov ? 0 : -6, opacity: hov ? 1 : 0, rotate: hov ? 0 : -45 }}
        transition={{ duration: 0.28 }}
      >
        <ArrowUpRight size={14} />
      </motion.span>
    </motion.button>
  );
};

// ─── Metrics card ─────────────────────────────────────────────────────────────
const MetricsCard: React.FC<{ yParallax: any; style?: React.CSSProperties }> = ({
  yParallax,
  style,
}) => {
  const reduced = useReducedMotion();
  const rawY = useMotionValue(0);
  const floatY = useSpring(rawY, { stiffness: 32, damping: 10 });

  useEffect(() => {
    if (reduced) return;
    let t = 0;
    const id = setInterval(() => { t += 0.035; rawY.set(Math.sin(t) * 7); }, 16);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <motion.div
      style={{ ...style, y: yParallax }}
      initial={{ opacity: 0, x: 28, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 1.0, delay: 0.9, ease: EASE }}
    >
      <motion.div
        style={{
          y: floatY,
          width: 210,
          background: "rgba(12,12,16,0.82)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          boxShadow: "0 24px 56px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.07)",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.4), transparent)" }} />
        <div style={{ padding: "14px 14px 12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontFamily: FONT_B, fontSize: 11, color: "rgba(161,161,170,0.8)" }}>Monthly Visits</span>
            <motion.span
              style={{
                fontFamily: FONT_B, fontSize: 10, fontWeight: 700,
                color: "#E50914", background: "rgba(229,9,20,0.08)",
                border: "1px solid rgba(229,9,20,0.18)",
                padding: "2px 8px", borderRadius: 999,
              }}
              animate={{ opacity: [0.65, 1, 0.65] }}
              transition={{ duration: 2.8, repeat: Infinity }}
            >
              ↑ 24.5%
            </motion.span>
          </div>
          <div style={{ height: 68 }}>
            {/* Inline SVG bar chart — replaces recharts (~180 KB gzipped saved) */}
            <svg
              viewBox="0 0 200 60"
              preserveAspectRatio="none"
              style={{ width: "100%", height: "100%", display: "block" }}
              aria-hidden="true"
            >
              <defs>
                <clipPath id="hbc">
                  <rect x="0" y="0" width="200" height="60" />
                </clipPath>
              </defs>
              <g clipPath="url(#hbc)">
                {CHART_VALS.map((val, i) => {
                  const h = (val / 95) * 60;
                  return (
                    <rect
                      key={i}
                      x={i * 30}
                      y={57 - h}
                      width={20}
                      height={h + 6}
                      rx={3}
                      fill="#E50914"
                      opacity={0.8}
                    />
                  );
                })}
              </g>
            </svg>
          </div>
          <div style={{ marginTop: 6, display: "flex", justifyContent: "space-between" }}>
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i} style={{ fontFamily: FONT_B, fontSize: 9, color: "rgba(113,113,122,0.7)" }}>{d}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Status pill ──────────────────────────────────────────────────────────────
const StatusPill: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const reduced = useReducedMotion();
  const rawY = useMotionValue(0);
  const floatY = useSpring(rawY, { stiffness: 24, damping: 9 });

  useEffect(() => {
    if (reduced) return;
    let t = Math.PI;
    const id = setInterval(() => { t += 0.028; rawY.set(Math.sin(t) * 9); }, 16);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.0, delay: 1.1, ease: EASE }}
    >
      <motion.div
        style={{
          y: floatY,
          background: "rgba(10,10,14,0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)",
          borderRadius: 14,
          display: "flex", alignItems: "center", gap: 12,
          padding: "11px 15px",
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            <img src="https://picsum.photos/100/100?random=50" alt="PM" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          </div>
          <span style={{ position: "absolute", bottom: -1, right: -1, width: 11, height: 11, borderRadius: "50%", background: "#22c55e", border: "2px solid #0a0a0e", display: "block" }}>
            <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "#22c55e", animation: "statusPing 1.8s cubic-bezier(0,0,0.2,1) infinite", opacity: 0.6 }} />
          </span>
        </div>
        <div>
          <p style={{ fontFamily: FONT_B, fontSize: 10, color: "rgba(113,113,122,0.85)", marginBottom: 2 }}>Project Manager</p>
          <p style={{ fontFamily: FONT_B, fontSize: 13, fontWeight: 600, color: "#fff" }}>Active now</p>
        </div>
        <style>{`@keyframes statusPing { 75%,100% { transform: scale(2); opacity: 0; } }`}</style>
      </motion.div>
    </motion.div>
  );
};

// ─── Projects ticker ──────────────────────────────────────────────────────────
const ProjectsTicker: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  const reduced = useReducedMotion();
  const rawY = useMotionValue(0);
  const floatY = useSpring(rawY, { stiffness: 20, damping: 8 });

  useEffect(() => {
    if (reduced) return;
    let t = Math.PI * 0.5;
    const id = setInterval(() => { t += 0.022; rawY.set(Math.sin(t) * 6); }, 16);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <motion.div
      style={style}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 1.25, ease: EASE }}
    >
      <motion.div
        style={{
          y: floatY,
          background: "rgba(12,12,16,0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 12px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          borderRadius: 12,
          display: "flex", alignItems: "center", gap: 10,
          padding: "9px 14px",
        }}
      >
        <div style={{ display: "flex" }}>
          {[51, 52, 53].map((seed, i) => (
            <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", overflow: "hidden", border: "2px solid #0c0c10", marginLeft: i > 0 ? -8 : 0 }}>
              <img src={`https://picsum.photos/50/50?random=${seed}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontFamily: FONT_B, fontSize: 12, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>24+ projects</p>
          <p style={{ fontFamily: FONT_B, fontSize: 10, color: "rgba(113,113,122,0.8)", marginTop: 1 }}>delivered</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
export const Hero: React.FC<{ onOpenContact?: () => void }> = ({ onOpenContact }) => {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();

  const yMock = useTransform(scrollY, [0, 800], [0, reduced ? 0 : 75]);
  const yCard = useTransform(scrollY, [0, 800], [0, reduced ? 0 : -55]);
  const yLeft = useTransform(scrollY, [0, 800], [0, reduced ? 0 : -35]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);
  const scaleHero = useTransform(scrollY, [0, 500], [1, 0.95]);



  const mockRef = useRef<HTMLDivElement>(null);
  const rotX = useSpring(0, { stiffness: 90, damping: 18 });
  const rotY = useSpring(0, { stiffness: 90, damping: 18 });

  const onMockMove = (e: React.MouseEvent) => {
    if (reduced || !mockRef.current) return;
    const r = mockRef.current.getBoundingClientRect();
    rotX.set(-((e.clientY - r.top) / r.height - 0.5) * 9);
    rotY.set(((e.clientX - r.left) / r.width - 0.5) * 9);
  };
  const onMockLeave = () => { rotX.set(0); rotY.set(0); };

  const headlineDelay = 0.18;

  return (
    <section
      className="relative w-full flex flex-col overflow-hidden bg-[#080809] pt-24 pb-16 md:pb-24 lg:pb-0 lg:h-[100svh]"
    >
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 z-[2] opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      {/* Red ambient glow */}
      <motion.div
        className="pointer-events-none absolute z-[0]"
        style={{
          right: "-8%", top: "10%",
          width: "52vw", height: "52vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(229,9,20,0.11) 0%, transparent 65%)",
        }}
        animate={reduced ? {} : { opacity: [0.5, 0.9, 0.5], scale: [1, 1.07, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.04 }}
        className="relative z-10 container mx-auto px-6 md:px-12 py-3 flex items-center gap-4"
        style={{ fontFamily: FONT_B }}
      >
        <Minus className="w-3.5 h-3.5 text-[#E50914] stroke-[1.5] shrink-0" />
        <span className="text-[12px] tracking-[0.22em] text-zinc-200 uppercase font-medium">
          Digital Design Studio
        </span>
        <div className="flex-1" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="hidden md:flex items-center gap-2"
        >
          <span className="text-[11px] tracking-[0.18em] text-zinc-600 uppercase" style={{ fontFamily: FONT_B }}>
            Est. 2026
          </span>
        </motion.div>
      </motion.div>

      {/* Main layout */}
      <motion.div
        style={{ y: yLeft, opacity: opacityHero, scale: scaleHero }}
        className="relative z-10 flex-1 flex flex-col container mx-auto px-6 md:px-12 py-6 min-h-0"
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start flex-1">

          {/* LEFT */}
          <div className="w-full lg:w-[52%] flex flex-col justify-start">

            {/* Headline — Instrument Serif, fontWeight 400 */}
            <div
              className="text-[clamp(2.8rem,5.8vw,5.4rem)] leading-[1.04] tracking-[-0.02em] text-white mb-5 lg:mb-6"
              style={{ fontFamily: FONT_H, transformStyle: "preserve-3d" }}
            >
              <div>
                <AnimatedText
                  text="Websites for"
                  delay={headlineDelay}
                  style={{ fontWeight: 400 }}
                />
              </div>
              <div>
                <AnimatedText
                  text="brands that"
                  delay={headlineDelay + 0.16}
                  italic
                  color="rgba(161,161,170,0.55)"
                  style={{ fontWeight: 400 }}
                />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "0 0.22em" }}>
                <RefuseWord delay={headlineDelay + 0.34} />
                <AnimatedText
                  text="to blend in"
                  delay={headlineDelay + 0.52}
                  style={{ fontWeight: 400 }}
                />
              </div>
            </div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.75, delay: headlineDelay + 1.05, ease: EASE }}
              className="text-[15px] max-w-[360px] leading-[1.8] mb-7"
              style={{ fontFamily: FONT_B, color: '#c0c0c0' }}
            >
              We craft immersive digital products — strategic at the core,
              cinematic on the surface. Built to convert, load fast, and own every screen.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: headlineDelay + 1.22, ease: EASE }}
              className="flex flex-col sm:flex-row gap-3 items-start mb-6"
            >
              <div>
                <PrimaryButton onClick={onOpenContact} />
                <p className="text-[12px] text-zinc-500 mt-2 ml-1" style={{ fontFamily: FONT_B }}>
                  Reply within 24 hrs
                </p>
              </div>
              <div>
                <SecondaryButton onClick={() => {
                  document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
                }} />
                <p className="text-[12px] text-zinc-500 mt-2 ml-1" style={{ fontFamily: FONT_B }}>
                  Taking on new work
                </p>
              </div>
            </motion.div>

            {/* Status bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: headlineDelay + 1.4, ease: EASE }}
              className="flex items-center gap-5 pt-5 border-t border-white/[0.06] max-w-xs"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-55" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[12px] text-emerald-400/85 font-medium" style={{ fontFamily: FONT_B }}>
                  Available now
                </span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <span className="text-[12px] text-zinc-500" style={{ fontFamily: FONT_B }}>
                2–3 project slots open
              </span>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: headlineDelay + 1.6, ease: EASE }}
              style={{
                fontFamily: FONT_B,
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                width: "100%",
                gap: 8,
                marginTop: 32,
                paddingTop: 24,
                borderTop: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {[["∞", "Revisions"], ["100%", "Custom Built"], ["Weekly", "Portal Updates"]].map(([num, label]) => (
                <div key={label} className="flex flex-col gap-0.5 items-center">
                  {num === "∞" ? (
                    <motion.span
                      className="text-[26px] font-bold tracking-tight"
                      animate={{
                        textShadow: [
                          "0 0 8px rgba(229,9,20,0)",
                          "0 0 16px rgba(229,9,20,0.9), 0 0 32px rgba(229,9,20,0.4)",
                          "0 0 8px rgba(229,9,20,0)",
                        ],
                        color: ["#ffffff", "#E50914", "#ffffff"],
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 1,
                      }}
                      style={{ display: "inline-block", fontSize: "48px", lineHeight: 1 }}
                    >
                      ∞
                    </motion.span>
                  ) : (
                    <span className="text-[26px] font-bold text-white tracking-tight">{num}</span>
                  )}
                  <span className="text-[12px] text-zinc-400 tracking-[0.12em] uppercase">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — mockup */}
          <div className="hidden lg:flex w-full lg:w-[48%] relative justify-end items-center">
            <motion.div
              ref={mockRef}
              style={{ y: yMock, rotateX: rotX, rotateY: rotY, transformPerspective: 1800 }}
              initial={{ opacity: 0, y: 36, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
              onMouseMove={onMockMove}
              onMouseLeave={onMockLeave}
              className="relative w-full max-w-[380px]"
            >
              {/* Gradient border */}
              <div
                className="absolute -inset-[1px] rounded-2xl z-0"
                style={{
                  background: "linear-gradient(135deg, rgba(229,9,20,0.28) 0%, rgba(255,255,255,0.05) 45%, transparent 100%)",
                }}
              />

              {/* Glass browser */}
              <div
                className="relative rounded-2xl overflow-hidden z-10"
                style={{
                  background: "rgba(10,10,14,0.72)",
                  backdropFilter: "blur(32px)",
                  WebkitBackdropFilter: "blur(32px)",
                  boxShadow: "0 72px 100px -24px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.07)",
                }}
              >
                {/* Browser chrome */}
                <div
                  className="h-9 flex items-center px-4 gap-2 border-b border-white/[0.05]"
                  style={{ background: "rgba(18,18,22,0.9)" }}
                >
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E50914]/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/25" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/20" />
                  </div>
                  <div
                    className="mx-auto flex items-center gap-1.5 rounded-md px-3 py-0.5 w-44 border border-white/[0.05]"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400/75" />
                    <span className="text-[10px] text-zinc-500" style={{ fontFamily: FONT_B }}>
                      ardenostudio.lk
                    </span>
                  </div>
                </div>

                {/* Screenshot */}
                <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
                  <img
                    src="https://picsum.photos/800/1000?grayscale"
                    alt="Preview"
                    width={800}
                    height={1000}
                    className="w-full h-full object-cover"
                    style={{ opacity: 0.38 }}
                    loading="eager"
                    fetchPriority="low"
                    decoding="async"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(to top, #080809 0%, rgba(8,8,9,0.45) 45%, transparent 100%)",
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between">
                    <div className="space-y-2">
                      <div className="h-1.5 w-12 bg-zinc-500/40 rounded-full" />
                      <div className="h-5 w-36 bg-white/70 rounded" />
                      <div className="h-1.5 w-20 bg-zinc-600/40 rounded-full" />
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.1, borderColor: "rgba(229,9,20,0.5)" }}
                      transition={{ duration: 0.2 }}
                      className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-white cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)" }}
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <MetricsCard
                yParallax={yCard}
                style={{ position: "absolute", top: "8%", right: "-52px", zIndex: 30 }}
              />
              <StatusPill
                style={{ position: "absolute", bottom: "28%", left: "-48px", zIndex: 30 }}
              />
            </motion.div>
          </div>

        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 0.9 }}
        className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2.5 z-30"
      >
        <span className="text-[9px] tracking-[0.5em] text-zinc-600 uppercase" style={{ fontFamily: FONT_B }}>
          Scroll
        </span>
        <div className="w-px h-12 bg-white/[0.07] rounded-full relative overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full rounded-full bg-[#E50914]"
            style={{ height: "35%" }}
            animate={{ y: ["-100%", "380%"] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
          />
        </div>
      </motion.div>

      {/* Bottom divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.3, delay: 0.08, ease: EASE }}
        className="absolute bottom-0 left-0 right-0 h-px origin-left z-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.05) 70%, transparent)",
        }}
      />
    </section>
  );
};