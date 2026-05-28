import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";
import { PROJECTS } from "../../data/projects";

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_HEADING = "var(--font-display)";
const FONT_BODY = "var(--font-body)";

type Project = (typeof PROJECTS)[number];
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
      className="fixed inset-0 z-[9000]"
      style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
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
        className="relative z-10 flex flex-col md:flex-row overflow-hidden shadow-2xl"
        style={{
          background: "#0c0c0e",
          border: "1px solid rgba(255,255,255,0.07)",
          width: "92vw",
          maxWidth: 1040,
          maxHeight: "min(90vh, 760px)",
          borderRadius: 24,
          marginTop: "auto",
          marginBottom: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left/Top: Image Section */}
        <div className="relative w-full md:w-[55%] shrink-0 overflow-hidden aspect-[16/10] md:aspect-auto md:min-h-full">
          <motion.img
            src={project.image} alt={project.title}
            width={1200} height={800}
            loading="lazy" decoding="async"
            className="w-full h-full object-cover"
            style={{ opacity: 1 }}
            initial={{ scale: 1.08 }} animate={{ scale: 1 }}
            transition={{ duration: 0.8, ease: EXPO }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 35%, transparent 60%)" }} />

          {/* Close - Mobile only (inside image) */}
          <motion.button
            onClick={onClose}
            aria-label="Close project details"
            className="md:hidden absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-zinc-300 z-20"
            style={{ background: "rgba(12,12,14,0.65)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)" }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </motion.button>

          {/* Year badge */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6">
            <span
              className="text-[10px] tracking-[0.25em] uppercase px-3 py-1.5 rounded-full text-zinc-100 font-medium"
              style={{ fontFamily: FONT_BODY, background: "rgba(12,12,14,0.75)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)" }}
            >
              {project.year}
            </span>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 md:px-10 md:pb-10">
            <p className="text-[11px] md:text-[12px] text-zinc-100 tracking-[0.22em] uppercase font-semibold mb-1.5 md:mb-3" style={{ fontFamily: FONT_BODY, textShadow: "0 2px 12px rgba(0,0,0,1), 0 0 1px rgba(0,0,0,1)" }}>
              {project.category}
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: EXPO, delay: 0.12 }}
              className="text-white leading-[1.1]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontFamily: FONT_HEADING, fontWeight: 400, textShadow: "0 2px 20px rgba(0,0,0,0.9)" }}
            >
              {project.title}
            </motion.h2>
          </div>
        </div>

        {/* Right/Bottom: Body Section */}
        <div className="relative flex-1 p-6 md:p-10 flex flex-col h-full min-w-0">
          <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
            {/* Close - Desktop only */}
            <button
              onClick={onClose}
              aria-label="Close project details"
              className="hidden md:flex absolute top-6 right-6 w-10 h-10 rounded-full items-center justify-center text-zinc-500 hover:text-white transition-all duration-300 hover:bg-zinc-800/50"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>

            <motion.div
              initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, ease: EXPO, delay: 0.18 }}
              className="h-px mb-8 md:mb-10 origin-left w-24"
              style={{ background: "#E50914" }}
            />

            <motion.div
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EXPO, delay: 0.22 }}
              className="space-y-6 md:space-y-8"
            >
              <div>
                <h4 className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase mb-3 font-semibold" style={{ fontFamily: FONT_BODY }}>Description</h4>
                <p className="text-zinc-400 leading-[1.8] text-sm md:text-[15px]" style={{ fontFamily: FONT_BODY }}>
                  {project.description}
                </p>
              </div>

              <div>
                <h4 className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase mb-3 font-semibold" style={{ fontFamily: FONT_BODY }}>Scope</h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-zinc-300 px-3 py-1.5 rounded-full tracking-[0.05em]"
                      style={{ fontFamily: FONT_BODY, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-8 md:mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
            <motion.a
              href={project.url ?? "#"} target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-3 rounded-full text-white text-[11px] tracking-[0.14em] uppercase font-medium bg-[#E50914]"
              style={{ boxShadow: "0 10px 30px rgba(229,9,20,0.2)" }}
              whileHover={{ scale: 1.02, background: "#ff1420", boxShadow: "0 12px 40px rgba(229,9,20,0.35)" }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Launch Project</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                <path d="M1 11L11 1M11 1H4M11 1v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.a>
            <button
              onClick={onClose}
              className="text-[11px] text-zinc-600 tracking-[0.2em] uppercase hover:text-zinc-400 transition-colors py-2 md:hidden"
              style={{ fontFamily: FONT_BODY }}
            >
              Dismiss
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── All Projects Modal (Grid) ─────────────────────────────────────────────
const AllProjectsModal = ({ onClose, onSelectProject, projects }: { onClose: () => void; onSelectProject: (id: string) => void; projects: Project[] }) => {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9500] flex flex-col bg-[#080809]"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#E50914]/[0.03] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#E50914]/[0.03] blur-[120px]" />
      </div>

      {/* Header */}
      <div className="container mx-auto px-6 md:px-12 py-8 flex items-center justify-between relative z-10">
        <h2 className="text-white text-3xl md:text-5xl font-serif">
          Our <em className="text-zinc-500 not-italic">Archive</em>
        </h2>
        <motion.button
          onClick={onClose}
          aria-label="Close project archive"
          className="w-12 h-12 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        <div className="container mx-auto px-6 md:px-12 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.05, ease: EXPO }}
                onClick={() => { onSelectProject(p.id); onClose(); }}
                className="group relative cursor-pointer aspect-[4/5] rounded-3xl overflow-hidden border border-white/5"
              >
                <img src={p.image} alt={p.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-zinc-400 mb-2 font-medium">{p.category}</p>
                  <h3 className="text-2xl text-white font-serif">{p.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Arrow button with magnetic effect ───────────────────────────────────────
const ArrowBtn = ({ isHovered, onClick, label }: { isHovered: boolean; onClick: () => void; label: string }) => {
  const { ref, sx, sy, handleMouse, reset } = useMagnetic(0.4);
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      aria-label={label}
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
  const [hoveredId, setHoveredId] = useState<string | null>(PROJECTS[0]?.id ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

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
              <span className="text-[13px] tracking-[0.22em] text-zinc-400 uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>
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
                      <span className="lg:hidden text-[11px] text-zinc-600 tracking-[0.2em] tabular-nums" style={{ fontFamily: "'Sora', sans-serif" }}>
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
                      <p className="text-[12px] text-zinc-400 mt-1 tracking-[0.14em] uppercase" style={{ fontFamily: "'Sora', sans-serif" }}>
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
                    <ArrowBtn isHovered={isHovered} onClick={() => setSelectedId(project.id)} label={`Open ${project.title} project details`} />
                  </div>

                  {/* Mobile tags — shown below the row */}
                  {project.tags.length > 0 && (
                    <div className="flex lg:hidden items-center gap-1.5 mt-3 ml-[88px] flex-wrap">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] px-2.5 py-1 rounded-full tracking-[0.1em] text-zinc-400"
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
              {!hoveredProject && (
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
              )}

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
                      <p className="text-[11px] text-zinc-400 tracking-[0.22em] uppercase mb-1.5" style={{ fontFamily: "'Sora', sans-serif" }}>
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
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25, ease: EXPO }}
            onClick={() => setShowAll(true)}
            aria-label="View all projects"
            className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors duration-300 bg-transparent border-none p-0"
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
          </motion.button>
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

      <AnimatePresence>
        {showAll && (
          <AllProjectsModal 
            projects={PROJECTS} 
            onClose={() => setShowAll(false)} 
            onSelectProject={(id) => setSelectedId(id)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};
