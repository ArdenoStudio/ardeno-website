import React, { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";
import { ArrowUpRight, Minus } from "lucide-react";
import { HERO_FEATURED, PROJECTS } from "../../data/projects";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const QUART: [number, number, number, number] = [0.76, 0, 0.24, 1];
const FONT_H = "var(--font-display)";
const FONT_B = "var(--font-body)";

const AnimatedLine: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, className, style }) => {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduced ? {} : { opacity: 0, y: 36, filter: "blur(6px)" }}
      animate={reduced ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
};

const RefuseWord: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const reduced = useReducedMotion();
  return (
    <motion.span
      className="relative inline-block italic text-[#E50914]"
      style={{ paddingBottom: 6 }}
      initial={reduced ? {} : { opacity: 0, y: 36, filter: "blur(6px)" }}
      animate={reduced ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.75, delay, ease: EASE }}
    >
      <svg
        aria-hidden
        viewBox="0 0 80 8"
        preserveAspectRatio="none"
        className="absolute -bottom-0.5 left-0 w-full h-2 overflow-visible"
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
            pathLength: { duration: 0.65, delay: delay + 0.35, ease: EASE },
            opacity: { duration: 0.1, delay: delay + 0.35 },
          }}
        />
      </svg>
      refuse
    </motion.span>
  );
};

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
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };
  return { ref, x, y, onMove, onLeave };
}

const PrimaryButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const mag = useMagnetic(0.28);
  const [hov, setHov] = useState(false);

  return (
    <motion.button
      ref={mag.ref}
      style={{
        x: mag.x,
        y: mag.y,
        fontFamily: FONT_B,
        background: "#E50914",
        letterSpacing: "0.04em",
        border: "1px solid rgba(229,9,20,0.5)",
      }}
      onMouseMove={mag.onMove}
      onMouseLeave={() => {
        mag.onLeave();
        setHov(false);
      }}
      onMouseEnter={() => setHov(true)}
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      animate={{
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
      <span
        className="relative z-10"
        style={{ color: hov ? "#E50914" : "#fff", transition: "color 0.35s ease" }}
      >
        Start a Project
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

const SecondaryButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const mag = useMagnetic(0.2);
  const [hov, setHov] = useState(false);

  return (
    <motion.button
      ref={mag.ref}
      style={{
        x: mag.x,
        y: mag.y,
        fontFamily: FONT_B,
        color: hov ? "#fff" : "#71717a",
        letterSpacing: "0.04em",
      }}
      onMouseMove={mag.onMove}
      onMouseLeave={() => {
        mag.onLeave();
        setHov(false);
      }}
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

const LiveBuildBadge: React.FC = () => (
  <motion.a
    href={HERO_FEATURED.url}
    target="_blank"
    rel="noopener noreferrer"
    initial={{ opacity: 0, y: 16, scale: 0.94 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.85, delay: 1.05, ease: EASE }}
    whileHover={{ y: -4, borderColor: "rgba(229,9,20,0.35)" }}
    className="absolute -left-6 top-[14%] z-30 hidden xl:flex flex-col gap-2 rounded-2xl border border-white/[0.08] bg-[#0a0a0c]/90 backdrop-blur-xl px-4 py-3.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
  >
    <span
      className="text-[9px] tracking-[0.22em] uppercase text-zinc-500"
      style={{ fontFamily: FONT_B }}
    >
      Latest Launch
    </span>
    <span className="text-[14px] text-white leading-tight" style={{ fontFamily: FONT_H }}>
      {HERO_FEATURED.title}
    </span>
    <span
      className="inline-flex items-center gap-1.5 text-[10px] text-[#E50914] tracking-[0.12em] uppercase"
      style={{ fontFamily: FONT_B }}
    >
      Live site <ArrowUpRight size={11} />
    </span>
  </motion.a>
);

const ShippedStat: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.85, delay: 1.15, ease: EASE }}
    className="absolute -right-4 bottom-[18%] z-30 hidden xl:block rounded-2xl border border-white/[0.08] bg-[#0a0a0c]/90 backdrop-blur-xl px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
  >
    <p
      className="text-[9px] tracking-[0.22em] uppercase text-zinc-500 mb-1"
      style={{ fontFamily: FONT_B }}
    >
      Shipped
    </p>
    <p className="text-[28px] leading-none text-white" style={{ fontFamily: FONT_H }}>
      {PROJECTS.length}
      <span className="text-[14px] text-zinc-500 ml-1">projects</span>
    </p>
  </motion.div>
);

const MobileProjectStrip: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.95, ease: EASE }}
    className="lg:hidden mt-8 -mx-2"
  >
    <div className="flex items-center justify-between px-2 mb-3">
      <span
        className="text-[10px] tracking-[0.2em] uppercase text-zinc-500"
        style={{ fontFamily: FONT_B }}
      >
        Recent builds
      </span>
      <button
        type="button"
        onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
        className="text-[10px] tracking-[0.14em] uppercase text-zinc-400 hover:text-white transition-colors"
        style={{ fontFamily: FONT_B }}
      >
        View all
      </button>
    </div>
    <div className="flex gap-3 overflow-x-auto pb-2 px-2 snap-x snap-mandatory scrollbar-none">
      {PROJECTS.slice(0, 4).map((project) => (
        <a
          key={project.id}
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="snap-start shrink-0 w-[68vw] max-w-[280px] group"
        >
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-white/[0.08]">
            <img
              src={project.image}
              alt={project.title}
              width={560}
              height={350}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p
                className="text-[9px] tracking-[0.18em] uppercase text-zinc-400 mb-1"
                style={{ fontFamily: FONT_B }}
              >
                {project.category}
              </p>
              <p className="text-[18px] text-white leading-tight" style={{ fontFamily: FONT_H }}>
                {project.title}
              </p>
            </div>
          </div>
        </a>
      ))}
    </div>
  </motion.div>
);

const FeaturedPreview: React.FC<{
  rotX: ReturnType<typeof useSpring>;
  rotY: ReturnType<typeof useSpring>;
  yParallax: ReturnType<typeof useTransform>;
  onMove: (e: React.MouseEvent) => void;
  onLeave: () => void;
  mockRef: React.RefObject<HTMLDivElement | null>;
}> = ({ rotX, rotY, yParallax, onMove, onLeave, mockRef }) => (
  <motion.div
    ref={mockRef}
    style={{ y: yParallax, rotateX: rotX, rotateY: rotY, transformPerspective: 1600 }}
    initial={{ opacity: 0, y: 40, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 1, delay: 0.25, ease: EASE }}
    onMouseMove={onMove}
    onMouseLeave={onLeave}
    className="relative w-full max-w-[420px]"
  >
    <div
      className="absolute -inset-[1px] rounded-[1.35rem] z-0"
      style={{
        background:
          "linear-gradient(145deg, rgba(229,9,20,0.35) 0%, rgba(255,255,255,0.06) 42%, transparent 100%)",
      }}
    />

    <div
      className="relative rounded-[1.35rem] overflow-hidden z-10 border border-white/[0.08]"
      style={{
        background: "rgba(8,8,10,0.92)",
        boxShadow: "0 60px 100px -30px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <div className="h-10 flex items-center px-4 gap-2 border-b border-white/[0.06] bg-[#101014]/95">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E50914]/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/25" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/20" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-md px-3 py-0.5 border border-white/[0.06] bg-white/[0.03]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
          <span className="text-[10px] text-zinc-500" style={{ fontFamily: FONT_B }}>
            {HERO_FEATURED.url?.replace("https://", "")}
          </span>
        </div>
      </div>

      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={HERO_FEATURED.image}
          alt={HERO_FEATURED.title}
          width={840}
          height={1050}
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p
            className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2"
            style={{ fontFamily: FONT_B }}
          >
            {HERO_FEATURED.category}
          </p>
          <h3
            className="text-[1.65rem] text-white leading-[1.05] tracking-[-0.02em] mb-4"
            style={{ fontFamily: FONT_H }}
          >
            {HERO_FEATURED.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {HERO_FEATURED.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-2.5 py-1 rounded-full border border-white/10 text-zinc-300 tracking-[0.08em]"
                style={{ fontFamily: FONT_B }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>

    <LiveBuildBadge />
    <ShippedStat />
  </motion.div>
);

export const Hero: React.FC<{ onOpenContact?: () => void }> = ({ onOpenContact }) => {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const yMock = useTransform(scrollY, [0, 800], [0, reduced ? 0 : 60]);
  const yLeft = useTransform(scrollY, [0, 800], [0, reduced ? 0 : -30]);
  const opacityHero = useTransform(scrollY, [0, 500], [1, 0]);
  const scaleHero = useTransform(scrollY, [0, 500], [1, 0.96]);

  const mockRef = useRef<HTMLDivElement>(null);
  const rotX = useSpring(0, { stiffness: 90, damping: 18 });
  const rotY = useSpring(0, { stiffness: 90, damping: 18 });

  const onMockMove = (e: React.MouseEvent) => {
    if (reduced || !mockRef.current) return;
    const r = mockRef.current.getBoundingClientRect();
    rotX.set(-((e.clientY - r.top) / r.height - 0.5) * 8);
    rotY.set(((e.clientX - r.left) / r.width - 0.5) * 8);
  };
  const onMockLeave = () => {
    rotX.set(0);
    rotY.set(0);
  };

  const headlineDelay = 0.12;

  return (
    <section className="relative w-full flex flex-col overflow-hidden hero-mesh pt-24 pb-12 md:pb-16 lg:pb-0 lg:min-h-[100svh]">
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.04 }}
        className="relative z-10 container mx-auto px-6 md:px-12 py-3 flex items-center gap-4"
        style={{ fontFamily: FONT_B }}
      >
        <Minus className="w-3.5 h-3.5 text-[#E50914] stroke-[1.5] shrink-0" />
        <span className="text-[12px] tracking-[0.22em] text-zinc-300 uppercase font-medium">
          Digital Design Studio
        </span>
        <div className="flex-1" />
        <span
          className="hidden md:inline text-[11px] tracking-[0.18em] text-zinc-600 uppercase"
          style={{ fontFamily: FONT_B }}
        >
          Colombo · Global
        </span>
      </motion.div>

      <motion.div
        style={{ y: yLeft, opacity: opacityHero, scale: scaleHero }}
        className="relative z-10 flex-1 flex flex-col container mx-auto px-6 md:px-12 py-6 min-h-0"
      >
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start flex-1">
          <div className="w-full lg:w-[52%] flex flex-col justify-start">
            <h1
              aria-label="Websites for brands that refuse to blend in"
              className="text-[2.65rem] sm:text-[4rem] lg:text-[5.1rem] xl:text-[5.4rem] leading-[1.04] tracking-normal text-white mb-5 lg:mb-6"
              style={{ fontFamily: FONT_H }}
            >
              <AnimatedLine delay={headlineDelay}>
                <span style={{ fontWeight: 400 }}>Websites for</span>
              </AnimatedLine>
              <AnimatedLine delay={headlineDelay + 0.1}>
                <span className="italic text-zinc-500/80" style={{ fontWeight: 400 }}>
                  brands that
                </span>
              </AnimatedLine>
              <AnimatedLine delay={headlineDelay + 0.2} className="flex flex-wrap items-baseline gap-x-[0.22em]">
                <RefuseWord delay={headlineDelay + 0.28} />
                <span style={{ fontWeight: 400 }}>to blend in</span>
              </AnimatedLine>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.75, delay: headlineDelay + 0.55, ease: EASE }}
              className="text-[15px] w-full max-w-[min(380px,calc(100vw-3rem))] break-words leading-[1.8] mb-7 text-[#c8c8c8]"
              style={{ fontFamily: FONT_B }}
            >
              We craft immersive digital products — strategic at the core, cinematic on the
              surface. Built to convert, load fast, and own every screen.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: headlineDelay + 0.68, ease: EASE }}
              className="flex flex-col sm:flex-row gap-3 items-start mb-2"
            >
              <div>
                <PrimaryButton onClick={onOpenContact} />
                <p className="text-[12px] text-zinc-500 mt-2 ml-1" style={{ fontFamily: FONT_B }}>
                  Reply within 24 hrs
                </p>
              </div>
              <div>
                <SecondaryButton
                  onClick={() => {
                    document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
                  }}
                />
                <p className="text-[12px] text-zinc-500 mt-2 ml-1" style={{ fontFamily: FONT_B }}>
                  {PROJECTS.length} live builds
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: headlineDelay + 0.82, ease: EASE }}
              className="flex items-center gap-5 pt-5 border-t border-white/[0.06] max-w-md"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-55" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span
                  className="text-[12px] text-emerald-400/85 font-medium"
                  style={{ fontFamily: FONT_B }}
                >
                  Available now
                </span>
              </div>
              <div className="h-3 w-px bg-white/10" />
              <span className="text-[12px] text-zinc-500" style={{ fontFamily: FONT_B }}>
                2–3 project slots open
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: headlineDelay + 0.95, ease: EASE }}
              className="grid grid-cols-3 gap-3 w-full max-w-md mt-8 pt-6 border-t border-white/[0.07]"
              style={{ fontFamily: FONT_B }}
            >
              {[
                ["∞", "Revisions"],
                ["100%", "Custom Built"],
                ["Weekly", "Portal Updates"],
              ].map(([num, label]) => (
                <div key={label} className="flex flex-col gap-0.5 items-center text-center">
                  <span className="text-[26px] font-bold text-white tracking-tight">{num}</span>
                  <span className="text-[11px] text-zinc-400 tracking-[0.12em] uppercase">
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>

            <MobileProjectStrip />
          </div>

          <div className="hidden lg:flex w-full lg:w-[48%] relative justify-end items-center pt-4">
            <FeaturedPreview
              mockRef={mockRef}
              rotX={rotX}
              rotY={rotY}
              yParallax={yMock}
              onMove={onMockMove}
              onLeave={onMockLeave}
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.9 }}
        className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2.5 z-30"
      >
        <span
          className="text-[9px] tracking-[0.5em] text-zinc-600 uppercase"
          style={{ fontFamily: FONT_B }}
        >
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

      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.3, delay: 0.08, ease: EASE }}
        className="absolute bottom-0 left-0 right-0 h-px origin-left z-10"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.05) 70%, transparent)",
        }}
      />
    </section>
  );
};
