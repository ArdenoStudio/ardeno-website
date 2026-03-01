import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NAV_ITEMS } from "../../constants";

const LOGO_SRC = "/ardent-logo.svg";

interface NavbarProps {
  onOpenModal: () => void;
}

// ─── RollText ─────────────────────────────────────────────────────────────────
const RollText: React.FC<{ text: string; reduced: boolean }> = ({ text, reduced }) => (
  <span className="relative inline-flex">
    {Array.from(text).map((ch, idx) => {
      if (ch === " ") return <span key={`sp-${idx}`} className="w-[0.3em]" />;
      const delay = reduced ? 0 : idx * 28;
      return (
        <span
          key={`${ch}-${idx}`}
          className="relative inline-block overflow-hidden"
          style={{ height: "1.1em", lineHeight: 1 }}
        >
          <span
            className="block will-change-transform transition-transform duration-[420ms] ease-[cubic-bezier(0.16,1,0.3,1)] [transform:translateY(0%)] group-hover:[transform:translateY(-50%)]"
            style={{ transitionDelay: `${delay}ms` }}
          >
            <span className="block leading-none py-[0.05em]">{ch}</span>
            <span className="block leading-none py-[0.05em]">{ch}</span>
          </span>
        </span>
      );
    })}
  </span>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
export const Navbar: React.FC<NavbarProps> = ({ onOpenModal }) => {
  const reduced = useReducedMotion() ?? false;
  const { scrollY } = useScroll();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("#");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalHov, setPortalHov] = useState(false);
  const [talkHov, setTalkHov] = useState(false);
  const clickLockUntilRef = useRef<number>(0);

  const NAV_HEIGHT = 80;
  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const bg = useTransform(scrollY, [0, 60], ["rgba(8,8,9,0)", "rgba(8,8,9,0.82)"]);
  const blur = useTransform(scrollY, [0, 60], ["blur(0px)", "blur(18px)"]);
  const borderOpacity = useTransform(scrollY, [0, 60], [0, 1]);

  useEffect(() => {
    const hrefs = NAV_ITEMS.map((it) => it.href).filter((h) => h.startsWith("#") && h !== "#");

    const onScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);

      if (Date.now() < clickLockUntilRef.current) return;

      if (scrollTop < NAV_HEIGHT) {
        setActiveHref("#");
        return;
      }

      const targets = hrefs
        .map((href) => {
          const el = document.getElementById(href.replace("#", ""));
          return el ? { href, el } : null;
        })
        .filter(Boolean) as { href: string; el: HTMLElement }[];

      if (!targets.length) return;

      const nearBottom =
        window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 4;
      if (nearBottom) {
        setActiveHref(targets[targets.length - 1].href);
        return;
      }

      // Pick the last section whose top edge has crossed the navbar bottom
      let best = "#";
      for (const { href, el } of targets) {
        const top = el.getBoundingClientRect().top;
        if (top <= NAV_HEIGHT + 24) best = href;
      }
      setActiveHref(best);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    href: string
  ) => {
    e.preventDefault();
    setMobileOpen(false);

    // Contact → scroll to footer
    if (href === "#contact") {
      clickLockUntilRef.current = Date.now() + 900;
      setActiveHref(href);
      const el = document.getElementById("contact");
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT, behavior: "smooth" });
      return;
    }

    clickLockUntilRef.current = Date.now() + 900;
    setActiveHref(href);
    if (href === "#") { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    const el = document.getElementById(href.replace("#", ""));
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT, behavior: "smooth" });
  };

  const underlayId = useMemo(() => "nav-pill", []);

  return (
    <>
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        className="fixed top-0 left-0 right-0 z-[60]"
        style={{ backgroundColor: bg, backdropFilter: blur, WebkitBackdropFilter: blur }}
      >
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            opacity: borderOpacity,
            background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.2) 20%, rgba(255,255,255,0.07) 50%, rgba(229,9,20,0.2) 80%, transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />

        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between" style={{ height: NAV_HEIGHT }}>

          {/* ── Logo ── */}
          <a href="#" onClick={(e) => handleNavClick(e, "#")} className="flex items-center gap-3 select-none group">
            <motion.img
              src={LOGO_SRC}
              alt="Ardeno Studio"
              width={44}
              height={44}
              draggable={false}
              className="h-10 md:h-12 w-auto"
              fetchPriority="high"
              decoding="sync"
              animate={
                reduced ? { opacity: 1 }
                  : isScrolled ? { opacity: 0.95, filter: "drop-shadow(0 0 8px rgba(229,9,20,0.18))" }
                    : { opacity: 1, filter: "drop-shadow(0 0 0px rgba(0,0,0,0))" }
              }
              transition={{ duration: 0.4, ease }}
            />
          </a>

          {/* ── Desktop nav ── */}
          <div className="hidden md:flex items-center gap-10">
            <div
              className="flex items-center gap-1 rounded-full px-2 py-1.5"
              style={{
                background: isScrolled ? "rgba(255,255,255,0.03)" : "transparent",
                border: isScrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
                transition: "background 0.4s ease, border-color 0.4s ease",
              }}
            >
              {NAV_ITEMS.map((item, i) => {
                const isActive = activeHref === item.href;
                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease }}
                    className="relative"
                  >
                    <a
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className="group relative flex items-center px-4 py-1.5 rounded-full transition-colors duration-300"
                      style={{ textDecoration: "none" }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId={underlayId}
                          className="absolute inset-0 rounded-full"
                          style={{ background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.2)" }}
                          transition={{ duration: 0.38, ease }}
                        />
                      )}
                      <span
                        className="relative z-10 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-300"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: isActive ? "#ffffff" : "rgba(255,255,255,0.78)",
                        }}
                      >
                        <RollText text={item.label} reduced={reduced} />
                      </span>
                    </a>
                  </motion.div>
                );
              })}
            </div>

            {/* Client Portal */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.38, ease }}
            >
              <motion.button
                onMouseEnter={() => setPortalHov(true)}
                onMouseLeave={() => setPortalHov(false)}
                onClick={() => { window.location.href = '/client-portal/'; }}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  padding: "6px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.12)",
                  background: "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
                animate={{
                  borderColor: portalHov ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
                }}
                transition={{ duration: 0.3 }}
              >
                {/* Liquid fill on hover */}
                <motion.span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 999,
                    originY: 1,
                  }}
                  animate={{ scaleY: portalHov ? 1 : 0, opacity: portalHov ? 1 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Shimmer */}
                <motion.span
                  style={{
                    position: "absolute",
                    top: 0, left: "-20%",
                    width: "40%", height: "100%",
                    background: "linear-gradient(105deg, transparent, rgba(255,255,255,0.08), transparent)",
                    skewX: "-15deg",
                    pointerEvents: "none",
                  }}
                  animate={{ left: portalHov ? "120%" : "-20%" }}
                  transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                />
                <span style={{ position: "relative", zIndex: 1, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "#fff" }}>PORTAL</span>
                <motion.span
                  style={{ position: "relative", zIndex: 1 }}
                  animate={{ x: portalHov ? 2 : 0, y: portalHov ? -2 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowUpRight size={13} color="#fff" />
                </motion.span>
              </motion.button>
            </motion.div>

            {/* Let's Talk → opens modal */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.42, ease }}
            >
              <motion.button
                onMouseEnter={() => setTalkHov(true)}
                onMouseLeave={() => setTalkHov(false)}
                onClick={onOpenModal}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  padding: "6px 16px",
                  borderRadius: 999,
                  border: "1px solid rgba(229,9,20,0.6)",
                  background: "#E50914",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  whiteSpace: "nowrap",
                  height: 32,
                }}
                animate={{
                  boxShadow: talkHov
                    ? "0 0 0 4px rgba(229,9,20,0.15), 0 8px 24px rgba(229,9,20,0.4)"
                    : "0 4px 12px rgba(229,9,20,0.25)",
                }}
                transition={{ duration: 0.35 }}
              >
                {/* Dark sweep */}
                <motion.span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "#0a0a0a",
                    borderRadius: 999,
                    scaleX: 0,
                    originX: 0,
                  }}
                  animate={{ scaleX: talkHov ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                />
                {/* Label */}
                <span style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: talkHov ? "#E50914" : "#fff",
                  transition: "color 0.3s ease",
                  lineHeight: 1,
                }}>
                  LET&apos;S TALK
                </span>
                <motion.span
                  style={{ position: "relative", zIndex: 1, display: "flex", lineHeight: 1 }}
                  animate={{ x: talkHov ? 2 : 0, y: talkHov ? -2 : 0, color: talkHov ? "#E50914" : "#fff" }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowUpRight size={13} />
                </motion.span>
              </motion.button>
            </motion.div>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            className="md:hidden flex flex-col gap-[5px] p-2 relative z-[70]"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
            type="button"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 7, width: 24 } : { rotate: 0, y: 0, width: 24 }}
              transition={{ duration: 0.28, ease }}
              className="block h-px bg-white origin-center"
              style={{ width: 24 }}
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.2, ease }}
              className="block h-px bg-white/50 origin-center"
              style={{ width: 16 }}
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -7, width: 24 } : { rotate: 0, y: 0, width: 24 }}
              transition={{ duration: 0.28, ease }}
              className="block h-px bg-white origin-center"
              style={{ width: 24 }}
            />
          </button>
        </div>
      </motion.nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[55] md:hidden"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ background: "rgba(4,4,5,0.7)", backdropFilter: "blur(6px)" }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[65] md:hidden w-[75vw] max-w-[320px] flex flex-col"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease }}
              style={{ background: "#080809", borderLeft: "1px solid rgba(255,255,255,0.06)", boxShadow: "-40px 0 80px rgba(0,0,0,0.6)" }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.5))" }} />

              <div className="flex items-center justify-between px-6 pt-6 pb-8">
                <span className="text-[9px] tracking-[0.25em] uppercase text-zinc-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mx-6 h-px bg-white/[0.05] mb-6" />

              <nav className="flex flex-col px-4 gap-1 flex-1">
                {NAV_ITEMS.map((item, idx) => {
                  const isActive = activeHref === item.href;
                  return (
                    <motion.a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.32, delay: 0.06 + idx * 0.055, ease }}
                      className="relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
                      style={{
                        background: isActive ? "rgba(229,9,20,0.07)" : "transparent",
                        border: `1px solid ${isActive ? "rgba(229,9,20,0.18)" : "transparent"}`,
                      }}
                    >
                      {isActive && (
                        <div className="w-1 h-1 rounded-full bg-[#E50914] shrink-0" style={{ boxShadow: "0 0 6px rgba(229,9,20,0.6)" }} />
                      )}
                      <span
                        className="text-[11px] font-semibold tracking-[0.2em] uppercase"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: isActive ? "#ffffff" : "rgba(255,255,255,0.78)" }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="ml-auto text-[9px]"
                        style={{ fontFamily: "'DM Sans', sans-serif", color: isActive ? "rgba(229,9,20,0.6)" : "rgba(255,255,255,0.35)" }}
                      >
                        0{idx + 1}
                      </span>
                    </motion.a>
                  );
                })}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.28, ease }}
                className="px-6 pb-10 pt-6"
              >
                <div className="h-px bg-white/[0.05] mb-6" />
                <a
                  href="/client-portal/"
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3 mb-3"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: "#fff",
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  PORTAL <ArrowUpRight size={13} />
                </a>
                <motion.button
                  onClick={() => { setMobileOpen(false); onOpenModal(); }}
                  className="w-full flex items-center justify-center gap-2 rounded-full py-3"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#fff",
                    background: "#E50914",
                    border: "1px solid rgba(229,9,20,0.6)",
                    boxShadow: "0 4px 12px rgba(229,9,20,0.25)",
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  LET&apos;S TALK <ArrowUpRight size={13} />
                </motion.button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
