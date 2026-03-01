import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_HEADING = "'Instrument Serif', Georgia, serif";
const FONT_BODY = "'Sora', sans-serif";

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  tags: string[];
  description?: string;
  url?: string;
  year?: string;
}

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Cinnamon Oak Cafe",
    category: "Cafe & Dining",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80",
    tags: ["Branding", "Menu Design", "UI/UX"],
    description: "A warm, tactile digital presence for a specialty café where every pixel reflects the aroma of hand-poured coffee. Rich earthy tones, a curated menu experience, and a reservation flow as smooth as the espresso.",
    year: "2025",
    url: "#",
  },
  {
    id: "2",
    title: "Lanka Fitness",
    category: "Health & Wellness",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    tags: ["Web App", "Membership Portal", "Branding"],
    description: "A high-energy digital platform for Sri Lanka's premier gym brand. Class scheduling, membership management, and transformation stories packaged into an interface built to motivate from the first click.",
    year: "2025",
    url: "#",
  },
  {
    id: "3",
    title: "Lanka Motion",
    category: "Sports & Expo",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    tags: ["Event Site", "Ticketing", "Animation"],
    description: "A kinetic event platform for Sri Lanka's largest sports expo. Dynamic athlete profiles, live schedule tracking, and a ticketing experience designed to match the adrenaline of the event floor.",
    year: "2025",
    url: "#",
  },
  {
    id: "4",
    title: "Luxe Lanka",
    category: "Luxury & Salon",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    tags: ["Booking System", "E-Commerce", "Branding"],
    description: "An indulgent digital salon experience built for Sri Lanka's most discerning clientele. Silky transitions, premium service showcases, and an appointment booking system as refined as the treatments themselves.",
    year: "2025",
    url: "#",
  },
  {
    id: "5",
    title: "Urban Kitchen",
    category: "Restaurant & Food",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    tags: ["Online Ordering", "Menu Design", "UI/UX"],
    description: "A bold, appetite-driven web presence for a contemporary urban restaurant. Full digital menu, table reservations, and an online ordering flow that turns browsers into regulars before they walk through the door.",
    year: "2025",
    url: "#",
  },
];

// ─── Magnetic button hook ─────────────────────────────────────────────────────
function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 20 });
  const sy = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  return { ref, sx, sy, handleMouse, reset };
}

// ─── Modal ────────────────────────────────────────────────────────────────────
const ProjectModal = ({ project, onClose }: { project: Project; onClose: () => void }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center"
    >
      <motion.div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.97 }}
        transition={{ duration: 0.55, ease: EXPO }}
        className="relative z-10 w-full max-w-2xl mx-4 mb-4 sm:mb-0 rounded-3xl overflow-hidden"
        style={{ background: "#0c0c0e", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Image */}
        <div className="relative overflow-hidden" style={{ height: 300 }}>
          <motion.img
            src={project.image} alt={project.title}
            width={800} height={300}
            loading="lazy" decoding="async"
            className="w-full h-full object-cover"
            style={{ opacity: 0.55 }}
            initial={{ scale: 1.08 }} animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: EXPO }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.15) 100%)" }} />

          {/* Close */}
          <motion.button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-zinc-300"
            style={{ background: "rgba(12,12,14,0.65)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
            whileHover={{ scale: 1.12, borderColor: "rgba(229,9,20,0.5)" }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.button>

          {/* Year badge */}
          <div className="absolute top-4 left-4">
            <span
              className="text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full text-zinc-400"
              style={{ fontFamily: "'Sora', sans-serif", background: "rgba(12,12,14,0.65)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
            >
              {project.year}
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-8 pb-6">
            <p className="text-[10px] text-zinc-400 tracking-[0.3em] uppercase mb-2" style={{ fontFamily: "'Sora', sans-serif", textShadow: "0 1px 8px rgba(0,0,0,1)" }}>
              {project.category}
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EXPO, delay: 0.12 }}
              className="text-white leading-none tracking-[-0.025em]"
              style={{ fontSize: "clamp(1.9rem,4vw,3rem)", fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, textShadow: "0 2px 20px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,1)" }}
            >
              {project.title}
            </motion.h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-7">
          <motion.div
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease: EXPO, delay: 0.18 }}
            className="h-px mb-6 origin-left"
            style={{ background: "linear-gradient(90deg, #E50914 0%, rgba(229,9,20,0.08) 70%, transparent 100%)" }}
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EXPO, delay: 0.22 }}
            className="text-zinc-400 leading-[1.75] mb-6 text-sm"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {project.description}
          </motion.p>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-zinc-300 px-3 py-1.5 rounded-full tracking-[0.1em]"
                  style={{ fontFamily: "'Sora', sans-serif", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <motion.a
                href={project.url ?? "#"} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-white text-[11px] tracking-[0.14em] uppercase"
                style={{ fontFamily: "'Sora', sans-serif", background: "#E50914", boxShadow: "0 0 28px rgba(229,9,20,0.28)" }}
                whileHover={{ scale: 1.03, boxShadow: "0 0 36px rgba(229,9,20,0.42)" }}
                whileTap={{ scale: 0.97 }}
              >
                <span>Visit Site</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 11L11 1M11 1H4M11 1v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.a>
              <button
                onClick={onClose}
                className="text-[11px] text-zinc-500 tracking-[0.18em] uppercase hover:text-zinc-300 transition-colors duration-200"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Arrow button with magnetic effect ───────────────────────────────────────
const ArrowBtn = ({ isHovered, onClick }: { isHovered: boolean; onClick: () => void }) => {
  const { ref, sx, sy, handleMouse, reset } = useMagnetic(0.4);
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
      style={{ x: sx, y: sy, border: "1px solid rgba(255,255,255,0.18)" }}
      animate={isHovered
        ? { borderColor: "rgba(229,9,20,0.55)", color: "#E50914", scale: 1.15 }
        : { borderColor: "rgba(255,255,255,0.18)", color: "rgb(113,113,122)", scale: 1 }
      }
      transition={{ duration: 0.22 }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 13L13 1M13 1H5M13 1v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </motion.button>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const FeaturedWork: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const hoveredProject = PROJECTS.find((p) => p.id === hoveredId);
  const selectedProject = PROJECTS.find((p) => p.id === selectedId);

  return (
    <section id="work" className="relative py-24 overflow-hidden" style={{ background: "#080809" }}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{
          position: "absolute", top: "30%", left: "20%",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(229,9,20,0.04) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
        }} />
      </div>

      {/* ── Header ── */}
      <div className="container mx-auto px-6 md:px-12 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: EXPO }}
          className="flex items-end justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 20, height: 1, background: "#E50914" }} />
              <span className="text-[11px] tracking-[0.3em] text-zinc-500 uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>
                Selected Work
              </span>
            </div>
            <h2
              className="leading-[0.92] tracking-[-0.025em] text-white"
              style={{ fontSize: "clamp(2.6rem,5.5vw,5rem)", fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}
            >
              Featured
              <br />
              <em className="not-italic text-zinc-500" style={{ fontWeight: 300 }}>Projects</em>
            </h2>
          </div>

          {/* Counter */}
          <div className="hidden md:flex flex-col items-end gap-1 select-none">
            <span className="text-[10px] text-zinc-600 tracking-[0.25em] uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>Total</span>
            <span
              className="text-[3.5rem] leading-none font-light"
              style={{ color: "rgba(255,255,255,0.06)", fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              {String(PROJECTS.length).padStart(2, "0")}
            </span>
          </div>
        </motion.div>
      </div>

      <div className="w-full" style={{ height: 1, background: "rgba(255,255,255,0.055)" }} />

      {/* ── Rows + Preview ── */}
      <div className="relative flex">
        {/* Project rows */}
        <div className="w-full lg:w-[65%]" onMouseLeave={() => setHoveredId(null)}>
          {PROJECTS.map((project, index) => {
            const isHovered = hoveredId === project.id;
            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.72, delay: index * 0.07, ease: EXPO }}
                onHoverStart={() => setHoveredId(project.id)}
                className="group relative cursor-pointer"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}
              >
                {/* Red sweep line */}
                <motion.div
                  className="absolute bottom-0 left-0 h-px origin-left pointer-events-none"
                  style={{ width: "100%", background: "#E50914", zIndex: 2 }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.48, ease: EXPO }}
                />

                <div
                  className="px-5 md:px-12 py-6 md:py-9"
                  onClick={() => setSelectedId(project.id)}
                >
                  {/* Mobile: thumbnail banner + content row */}
                  <div className="flex items-center gap-4 lg:gap-12">

                    {/* Index — hidden on mobile, shown md+ */}
                    <motion.span
                      className="hidden lg:block text-[11px] shrink-0 w-7 tabular-nums"
                      style={{ fontFamily: "'Sora', sans-serif", color: "rgb(82,82,91)" }}
                      animate={{ color: isHovered ? "#E50914" : "rgb(82,82,91)" }}
                      transition={{ duration: 0.2 }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </motion.span>

                    {/* Mobile thumbnail — wider, 16:9-ish, rounded */}
                    <div className="lg:hidden w-[72px] h-[56px] rounded-xl overflow-hidden shrink-0"
                      style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
                      <img src={project.image} alt={project.title} width={72} height={56} loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Title + Category + mobile index */}
                    <div className="flex-1 min-w-0">
                      {/* Mobile index inline */}
                      <span className="lg:hidden text-[10px] text-zinc-600 tracking-[0.2em] tabular-nums" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <motion.h3
                        className="leading-[1.05] tracking-[-0.025em]"
                        style={{
                          fontSize: "clamp(1.25rem,3vw,2.85rem)",
                          fontFamily: "'Instrument Serif', Georgia, serif",
                          fontWeight: 400,
                          color: "rgba(255,255,255,0.92)",
                          wordBreak: "break-word",
                        }}
                        animate={{ color: isHovered ? "#fff" : "rgba(255,255,255,0.92)" }}
                        transition={{ duration: 0.2 }}
                      >
                        {project.title}
                      </motion.h3>
                      <p className="text-[10px] text-zinc-500 mt-1 tracking-[0.18em] uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {project.category}
                      </p>
                    </div>

                    {/* Tags — desktop only */}
                    <div className="hidden lg:flex items-center gap-2 shrink-0">
                      {project.tags.slice(0, 2).map((tag) => (
                        <motion.span
                          key={tag}
                          className="text-[10px] px-3 py-1.5 rounded-full tracking-[0.1em]"
                          style={{ fontFamily: "'Sora', sans-serif", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(161,161,170,1)" }}
                          animate={isHovered
                            ? { borderColor: "rgba(229,9,20,0.35)", color: "rgba(244,244,245,1)" }
                            : { borderColor: "rgba(255,255,255,0.12)", color: "rgba(161,161,170,1)" }
                          }
                          transition={{ duration: 0.22 }}
                        >
                          {tag}
                        </motion.span>
                      ))}
                      {project.tags.length > 2 && (
                        <motion.span
                          className="text-[10px] px-2.5 py-1.5 rounded-full tracking-[0.1em]"
                          style={{ fontFamily: "'Sora', sans-serif", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(82,82,91,1)" }}
                          animate={isHovered ? { color: "rgba(161,161,170,1)" } : { color: "rgba(82,82,91,1)" }}
                          transition={{ duration: 0.2 }}
                        >
                          +{project.tags.length - 2}
                        </motion.span>
                      )}
                    </div>

                    {/* Arrow — smaller on mobile */}
                    <ArrowBtn isHovered={isHovered} onClick={() => setSelectedId(project.id)} />
                  </div>

                  {/* Mobile tags — shown below the row */}
                  {project.tags.length > 0 && (
                    <div className="flex lg:hidden items-center gap-1.5 mt-3 ml-[88px] flex-wrap">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-2.5 py-1 rounded-full tracking-[0.1em] text-zinc-500"
                          style={{ fontFamily: "'Sora', sans-serif", border: "1px solid rgba(255,255,255,0.08)" }}
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 2 && (
                        <span className="text-[9px] px-2 py-1 rounded-full text-zinc-600" style={{ fontFamily: "'Sora', sans-serif", border: "1px solid rgba(255,255,255,0.06)" }}>
                          +{project.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Preview panel */}
        <div className="hidden lg:block w-[35%] relative">
          <div className="sticky top-28 px-8 pr-12">
            <div
              className="relative overflow-hidden"
              style={{ aspectRatio: "3/4", borderRadius: 24, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {/* Empty state */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                <div style={{ width: 32, height: 32, border: "1px solid rgba(255,255,255,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 11L11 1M11 1H4M11 1v7" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-[10px] text-zinc-700 tracking-[0.25em] uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>
                  Hover a project
                </span>
              </div>

              <AnimatePresence mode="wait">
                {hoveredProject && (
                  <motion.div
                    key={hoveredProject.id}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.42, ease: EXPO }}
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setSelectedId(hoveredProject.id)}
                  >
                    <img src={hoveredProject.image} alt={hoveredProject.title} width={600} height={600} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,8,9,0.85) 0%, rgba(8,8,9,0.15) 55%, transparent 100%)" }} />

                    {/* Center CTA */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.18, duration: 0.3 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-white text-[10px] tracking-[0.18em] uppercase"
                        style={{ fontFamily: "'Sora', sans-serif", background: "rgba(229,9,20,0.88)", backdropFilter: "blur(12px)", boxShadow: "0 4px 24px rgba(229,9,20,0.3)" }}
                      >
                        <span>Open Project</span>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1 9L9 1M9 1H3M9 1v6" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </motion.div>

                    {/* Bottom info */}
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-[9px] text-zinc-400 tracking-[0.28em] uppercase mb-1.5" style={{ fontFamily: "'Sora', sans-serif" }}>
                        {hoveredProject.category}
                      </p>
                      <h4 className="text-[1.2rem] text-white leading-tight tracking-[-0.02em]" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}>
                        {hoveredProject.title}
                      </h4>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-2 justify-center mt-5">
              {PROJECTS.map((p) => (
                <motion.div
                  key={p.id}
                  animate={{
                    width: hoveredId === p.id ? 20 : 6,
                    background: hoveredId === p.id ? "#E50914" : "rgba(255,255,255,0.15)",
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ height: 4, borderRadius: 2 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer row ── */}
      <div className="container mx-auto px-5 md:px-12 mt-10 md:mt-12">
        <div className="w-full mb-6" style={{ height: 1, background: "rgba(255,255,255,0.055)" }} />
        <div className="flex items-center justify-between">
          <motion.a
            href="#"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25, ease: EXPO }}
            className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors duration-300"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            <span className="text-[11px] tracking-[0.22em] uppercase">View All Projects</span>
            <motion.span
              className="w-7 h-7 md:w-8 md:h-8 rounded-full border flex items-center justify-center"
              style={{ borderColor: "rgba(255,255,255,0.18)" }}
              whileHover={{ borderColor: "rgba(229,9,20,0.5)", scale: 1.12 }}
              transition={{ duration: 0.2 }}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M1 11L11 1M11 1H4M11 1v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          </motion.a>
          <span className="text-[10px] text-zinc-700 tracking-[0.18em] uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>
            {new Date().getFullYear()} — Ardeno
          </span>
        </div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <ProjectModal project={selectedProject} onClose={() => setSelectedId(null)} />
        )}
      </AnimatePresence>
    </section>
  );
};