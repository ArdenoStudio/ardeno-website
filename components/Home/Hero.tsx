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

function useMagnetic(strength = 0.25) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLButtonElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 20, mass: 0.5 });
  const y = useSpring(0, { stiffness: 200, damping: 20, mass: 0.5 });
  const onMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
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
      type="button"
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
      className="relative overflow-hidden flex items-center gap-2.5 px-7 py-4 rounded-full text-[13px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080809]"
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
      type="button"
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
      className="relative overflow-hidden flex items-center gap-2 px-7 py-4 rounded-full text-[13px] font-medium border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080809]"
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
    className="relative w-full max-w-[460px]"
  >
    <a
      href={HERO_FEATURED.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block overflow-hidden rounded-[1.35rem] border border-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E50914] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080809]"
      style={{
        background: "rgba(8,8,10,0.92)",
        boxShadow: "0 60px 100px -30px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
      }}
      aria-label={`View ${HERO_FEATURED.title} build`}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={HERO_FEATURED.image}
          alt={HERO_FEATURED.title}
          width={840}
          height={1050}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080809] via-[#080809]/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-7">
          <p
            className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2"
            style={{ fontFamily: FONT_B }}
          >
            {HERO_FEATURED.category}
          </p>
          <h2
            className="text-[1.85rem] text-white leading-[1.05] tracking-[-0.02em]"
            style={{ fontFamily: FONT_H }}
          >
            {HERO_FEATURED.title}
          </h2>
        </div>
      </div>
    </a>
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
  const [scrolledPast, setScrolledPast] = useState(false);

  React.useEffect(() => {
    const unsub = scrollY.on("change", (v) => {
      if (v > 80) setScrolledPast(true);
    });
    return () => unsub();
  }, [scrollY]);

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

  return (
    <section className="relative w-full flex flex-col overflow-hidden hero-mesh pt-24 pb-12 md:pb-16 lg:pb-0 lg:min-h-[100svh]">
      <div className="noise-overlay absolute inset-0 z-[1]" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.04 }}
        className="relative z-10 container mx-auto px-6 md:px-12 py-3 flex items-center gap-4"
        style={{ fontFamily: FONT_B }}
      >
        <Minus className="w-3.5 h-3.5 text-[#E50914] stroke-[1.5] shrink-0" aria-hidden />
        <span className="text-[12px] tracking-[0.22em] text-zinc-300 uppercase font-medium">
          Ardeno Studio
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
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14 items-center flex-1">
          <div className="w-full lg:w-[52%] flex flex-col justify-center">
            <h1
              aria-label="Websites for brands that refuse to blend in"
              className="text-[2.5rem] sm:text-[4rem] lg:text-[5.1rem] xl:text-[5.5rem] leading-[1.04] tracking-normal text-white mb-6 lg:mb-7"
              style={{ fontFamily: FONT_H }}
            >
              <span style={{ fontWeight: 400 }}>Websites for</span>
              <br />
              <span className="italic text-zinc-500/80" style={{ fontWeight: 400 }}>
                brands that
              </span>
              <br />
              <span style={{ fontWeight: 400 }}>
                <span className="italic text-[#E50914]">refuse</span> to blend in
              </span>
            </h1>

            <p
              className="w-full max-w-[34ch] text-[15px] leading-[1.75] text-[#c8c8c8] mb-8 sm:max-w-[400px] sm:text-[16px]"
              style={{ fontFamily: FONT_B }}
            >
              Custom websites and digital systems for Sri Lankan businesses that need to look
              premium, earn trust fast, and turn attention into enquiries.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.55, ease: EASE }}
              className="flex flex-col sm:flex-row gap-3 items-start"
            >
              <PrimaryButton onClick={onOpenContact} />
              <SecondaryButton
                onClick={() => {
                  document.getElementById("work")?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
              className="mt-5 text-[12px] text-zinc-500"
              style={{ fontFamily: FONT_B }}
            >
              Reply within 24 hrs · {PROJECTS.length} selected builds
            </motion.p>
          </div>

          <div className="hidden lg:flex w-full lg:w-[48%] relative justify-end items-center pt-2">
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

      {!reduced && !scrolledPast && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.9 }}
          className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-2.5 z-30"
          aria-hidden
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
      )}

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
