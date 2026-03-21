import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NAV_ITEMS } from "../../constants";

const LOGO_SRC = "/ardeno-logo.svg";

interface NavbarProps {
  onOpenModal: () => void;
}

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

export const Navbar: React.FC<NavbarProps> = ({ onOpenModal }) => {
  const reduced = useReducedMotion() ?? false;

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("#");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [docsHov, setDocsHov] = useState(false);
  const [portalHov, setPortalHov] = useState(false);
  const [talkHov, setTalkHov] = useState(false);
  const isScrolledRef = useRef(false);
  const activeHrefRef = useRef<string>("#");
  const clickLockUntilRef = useRef<number>(0);
  const sectionTopsRef = useRef<{ href: string; top: number }[]>([]);
  const lastActiveCalcRef = useRef(0);

  const setScrolledState = (next: boolean) => {
    isScrolledRef.current = next;
    setIsScrolled((prev) => (prev === next ? prev : next));
  };

  const setActiveNav = (next: string) => {
    activeHrefRef.current = next;
    setActiveHref((prev) => (prev === next ? prev : next));
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.classList.add('nav-open');
    } else {
      document.body.classList.remove('nav-open');
    }
  }, [mobileOpen]);

  const TOP_NAV_HEIGHT = 80;
  const SCROLLED_NAV_HEIGHT = 72;
  const CURRENT_NAV_HEIGHT = isScrolled ? SCROLLED_NAV_HEIGHT : TOP_NAV_HEIGHT;

  const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];
  const navSpring = reduced
    ? { duration: 0.2 }
    : { type: "spring" as const, stiffness: 220, damping: 30, mass: 0.78, restDelta: 0.001 };

  useEffect(() => {
    const hrefs = NAV_ITEMS.map((it) => it.href).filter((h) => h.startsWith("#") && h !== "#");
    let rafId = 0;
    let ticking = false;
    let refreshTimeout: number | undefined;
    let refreshAttempts = 0;
    const ACTIVE_CALC_INTERVAL = 72;

    const scheduleRefresh = () => {
      if (refreshAttempts >= 8) return;
      refreshAttempts += 1;
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
      refreshTimeout = window.setTimeout(() => {
        refreshTargets();
        onScroll();
      }, 500);
    };

    const refreshTargets = () => {
      sectionTopsRef.current = hrefs
        .map((href) => {
          const el = document.getElementById(href.replace("#", ""));
          if (!el) return null;
          return {
            href,
            top: el.getBoundingClientRect().top + window.scrollY,
          };
        })
        .filter(Boolean) as { href: string; top: number }[];

      if (sectionTopsRef.current.length < hrefs.length) {
        scheduleRefresh();
      }
    };

    const resolveActive = (scrollTop: number) => {
      const targets = sectionTopsRef.current;
      if (!targets.length) return;

      if (scrollTop < TOP_NAV_HEIGHT) {
        setActiveNav("#");
        return;
      }

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      // Use a tolerant threshold so tall viewports / late layout shifts still
      // mark the last section as active near the end of the page.
      // Higher tolerance (120px) for mobile browser bars and late layout shifts
      const nearBottom = scrollTop >= maxScroll - 120;

      if (nearBottom) {
        // Explicitly set to the last item (Contact) when at the floor of the page
        const lastItem = targets[targets.length - 1];
        if (lastItem) {
          setActiveNav(lastItem.href);
          return;
        }
      }

      const navHeight = isScrolledRef.current ? SCROLLED_NAV_HEIGHT : TOP_NAV_HEIGHT;
      const threshold = scrollTop + navHeight + 24;
      let best = "#";

      for (let i = 0; i < targets.length; i += 1) {
        if (targets[i].top <= threshold) best = targets[i].href;
      }

      setActiveNav(best);
    };

    const update = () => {
      ticking = false;
      const scrollTop = window.scrollY;
      setScrolledState(scrollTop > 24);

      if (Date.now() < clickLockUntilRef.current) return;
      if (performance.now() - lastActiveCalcRef.current >= ACTIVE_CALC_INTERVAL) {
        // Footer/#contact is lazy-loaded; keep re-checking until all anchors exist.
        if (sectionTopsRef.current.length < hrefs.length) {
          refreshTargets();
        }
        lastActiveCalcRef.current = performance.now();
        resolveActive(scrollTop);
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      rafId = requestAnimationFrame(update);
    };

    const onResize = () => {
      refreshTargets();
      lastActiveCalcRef.current = 0;
      onScroll();
      if (window.innerWidth >= 768) setMobileOpen(false);
    };

    const onLoad = () => {
      refreshTargets();
      lastActiveCalcRef.current = 0;
      onScroll();
    };

    refreshTargets();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("load", onLoad, { once: true });
    const t1 = window.setTimeout(onLoad, 800);
    const t2 = window.setTimeout(onLoad, 2400);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onLoad);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      if (refreshTimeout) window.clearTimeout(refreshTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [SCROLLED_NAV_HEIGHT, TOP_NAV_HEIGHT]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    href: string
  ) => {
    e.preventDefault();
    setMobileOpen(false);

    if (href.startsWith("/") && !href.startsWith("/#")) {
      window.history.pushState({}, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.scrollTo(0, 0);
      return;
    }

    if (href === "#contact") {
      clickLockUntilRef.current = Date.now() + 900;
      setActiveNav(href);
      const el = document.getElementById("contact");
      if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - CURRENT_NAV_HEIGHT - 8,
          behavior: "smooth",
        });
      }
      return;
    }

    clickLockUntilRef.current = Date.now() + 900;
    setActiveNav(href);

    if (href === "#") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const el = document.getElementById(href.replace("#", ""));
    if (!el) return;

    window.scrollTo({
      top: el.getBoundingClientRect().top + window.scrollY - CURRENT_NAV_HEIGHT - 8,
      behavior: "smooth",
    });
  };

  const underlayId = useMemo(() => "nav-pill", []);

  return (
    <>
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        className="fixed top-0 left-0 right-0 z-[60]"
      >
        <motion.div
          animate={{
            paddingTop: isScrolled ? 16 : 0,
            paddingLeft: isScrolled ? 16 : 0,
            paddingRight: isScrolled ? 16 : 0,
          }}
          transition={navSpring}
          className="w-full"
          style={{ willChange: "padding", transform: "translate3d(0,0,0)" }}
        >
          <motion.div
            className="relative mx-auto flex items-center justify-between"
            animate={{
              height: isScrolled ? SCROLLED_NAV_HEIGHT : TOP_NAV_HEIGHT,
              maxWidth: isScrolled ? 1280 : 1600,
              borderRadius: isScrolled ? 28 : 0,
            }}
            transition={navSpring}
            style={{
              background: isScrolled
                ? "linear-gradient(180deg, rgba(10,10,11,0.88), rgba(10,10,11,0.74))"
                : "linear-gradient(180deg, rgba(8,8,9,0), rgba(8,8,9,0))",
              border: isScrolled
                ? "1px solid rgba(255,255,255,0.08)"
                : "1px solid rgba(255,255,255,0)",
              boxShadow: isScrolled
                ? "0 10px 40px rgba(0,0,0,0.32)"
                : "0 0 0 rgba(0,0,0,0)",
              backdropFilter: "blur(18px) saturate(140%)",
              WebkitBackdropFilter: "blur(18px) saturate(140%)",
              transition:
                "background 420ms cubic-bezier(0.16,1,0.3,1), border-color 420ms cubic-bezier(0.16,1,0.3,1), box-shadow 420ms cubic-bezier(0.16,1,0.3,1)",
              willChange: "height, maxWidth, borderRadius",
              transform: "translate3d(0,0,0)",
            }}
          >
            <motion.div
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              animate={{ opacity: isScrolled ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              }}
            />

            <motion.div
              className="pointer-events-none absolute inset-0"
              animate={{ opacity: isScrolled ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              style={{
                borderRadius: 28,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.035)",
              }}
            />

            <div
              className="w-full flex items-center justify-between px-6 md:px-12"
              style={{ height: "100%" }}
            >
              <a
                href="#"
                onClick={(e) => handleNavClick(e, "#")}
                className="flex items-center gap-3 select-none group"
              >
                <motion.img
                  src={LOGO_SRC}
                  alt="Ardeno Studio"
                  width={44}
                  height={44}
                  draggable={false}
                  className="w-auto"
                  fetchPriority="high"
                  decoding="sync"
                  animate={
                    reduced
                      ? { opacity: 1, height: 44 }
                      : isScrolled
                        ? {
                          opacity: 0.96,
                          height: 40,
                          filter: "drop-shadow(0 0 12px rgba(229,9,20,0.16))",
                        }
                        : {
                          opacity: 1,
                          height: 48,
                          filter: "drop-shadow(0 0 0px rgba(0,0,0,0))",
                        }
                  }
                  transition={navSpring}
                  style={{ willChange: "height, opacity, filter", transform: "translateZ(0)" }}
                />

                <span className="hidden sm:block w-px h-6 bg-white/15 mx-1" />

                <div
                  className="hidden sm:flex flex-col leading-[0.9] uppercase text-white"
                  style={{ fontFamily: "'Bricolage Grotesque', sans-serif" }}
                >
                  <span
                    className="text-[10px]"
                    style={{
                      letterSpacing: "0.14em",
                      fontVariationSettings: '"wdth" 75, "wght" 400',
                    }}
                  >
                    ARDENO
                  </span>
                  <span
                    className="text-[13px]"
                    style={{
                      letterSpacing: "0.1em",
                      fontVariationSettings: '"wdth" 75, "wght" 900',
                      marginTop: "1px",
                    }}
                  >
                    STUDIO
                  </span>
                </div>
              </a>

              <div className="hidden md:flex items-center gap-4 lg:gap-6">
                <div
                  className="flex items-center gap-1 rounded-full px-2 py-1.5"
                  style={{
                    background: isScrolled ? "rgba(255,255,255,0.035)" : "transparent",
                    border: isScrolled
                      ? "1px solid rgba(255,255,255,0.06)"
                      : "1px solid transparent",
                    boxShadow: isScrolled ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
                    transition: "all 0.4s ease",
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
                              style={{
                                background:
                                  "linear-gradient(180deg, rgba(229,9,20,0.12), rgba(229,9,20,0.08))",
                                border: "1px solid rgba(229,9,20,0.24)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                              }}
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

                <motion.a
                  href="/docs"
                  onMouseEnter={() => setDocsHov(true)}
                  onMouseLeave={() => setDocsHov(false)}
                  onClick={(e) => {
                    e.preventDefault();
                    window.history.pushState({}, "", "/docs");
                    window.dispatchEvent(new PopStateEvent("popstate"));
                  }}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: isScrolled ? "rgba(255,255,255,0.025)" : "transparent",
                    boxShadow: isScrolled ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 36,
                    textDecoration: "none",
                  }}
                  animate={{
                    borderColor: docsHov ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.10)",
                    y: docsHov ? -1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 999,
                      scaleX: 0,
                      originX: 0,
                    }}
                    animate={{ scaleX: docsHov ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <span
                    style={{
                      position: "relative",
                      zIndex: 1,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      color: "#fff",
                    }}
                  >
                    DOCS
                  </span>
                  <motion.span
                    style={{ position: "relative", zIndex: 1, display: "flex", lineHeight: 1 }}
                    animate={{ x: docsHov ? 2 : 0, y: docsHov ? -2 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowUpRight size={13} color="#fff" />
                  </motion.span>
                </motion.a>

                <motion.button
                  onMouseEnter={() => setPortalHov(true)}
                  onMouseLeave={() => setPortalHov(false)}
                  onClick={() => {
                    window.open("https://ardeno-portal.vercel.app", "_blank");
                  }}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.10)",
                    background: isScrolled ? "rgba(255,255,255,0.025)" : "transparent",
                    boxShadow: isScrolled ? "inset 0 1px 0 rgba(255,255,255,0.04)" : "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 36,
                  }}
                  animate={{
                    borderColor: portalHov ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.10)",
                    y: portalHov ? -1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.span
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: 999,
                      scaleX: 0,
                      originX: 0,
                    }}
                    animate={{ scaleX: portalHov ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  />
                  <span
                    style={{
                      position: "relative",
                      zIndex: 1,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      color: "#fff",
                    }}
                  >
                    PORTAL
                  </span>
                  <motion.span
                    style={{ position: "relative", zIndex: 1, display: "flex", lineHeight: 1 }}
                    animate={{ x: portalHov ? 2 : 0, y: portalHov ? -2 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowUpRight size={13} color="#fff" />
                  </motion.span>
                </motion.button>

                <motion.button
                  onMouseEnter={() => setTalkHov(true)}
                  onMouseLeave={() => setTalkHov(false)}
                  onClick={onOpenModal}
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,70,70,0.45)",
                    background: "linear-gradient(180deg, #ff2a2a 0%, #E50914 100%)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    height: 36,
                  }}
                  animate={{
                    boxShadow: talkHov
                      ? "0 0 0 4px rgba(229,9,20,0.14), 0 10px 30px rgba(229,9,20,0.35)"
                      : "0 6px 18px rgba(229,9,20,0.22)",
                    y: talkHov ? -1 : 0,
                  }}
                  transition={{ duration: 0.35 }}
                >
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
                  <span
                    style={{
                      position: "relative",
                      zIndex: 1,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      color: talkHov ? "#E50914" : "#fff",
                      transition: "color 0.3s ease",
                      lineHeight: 1,
                    }}
                  >
                    LET&apos;S TALK
                  </span>
                  <motion.span
                    style={{ position: "relative", zIndex: 1, display: "flex", lineHeight: 1 }}
                    animate={{
                      x: talkHov ? 2 : 0,
                      y: talkHov ? -2 : 0,
                      color: talkHov ? "#E50914" : "#fff",
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <ArrowUpRight size={13} />
                  </motion.span>
                </motion.button>
              </div>

              <button
                className="md:hidden flex flex-col gap-[5px] p-2 relative z-[70]"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                onClick={() => setMobileOpen((v) => !v)}
                type="button"
              >
                <motion.span
                  animate={
                    mobileOpen ? { rotate: 45, y: 7, width: 24 } : { rotate: 0, y: 0, width: 24 }
                  }
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
                  animate={
                    mobileOpen ? { rotate: -45, y: -7, width: 24 } : { rotate: 0, y: 0, width: 24 }
                  }
                  transition={{ duration: 0.28, ease }}
                  className="block h-px bg-white origin-center"
                  style={{ width: 24 }}
                />
              </button>
            </div>
          </motion.div>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[55] md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ background: "rgba(4,4,5,0.7)", backdropFilter: "blur(6px)" }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[65] md:hidden w-[75vw] max-w-[320px] flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease }}
              style={{
                background: "#080809",
                borderLeft: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "-40px 0 80px rgba(0,0,0,0.6)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(229,9,20,0.5))" }}
              />

              <div className="flex items-center justify-between px-6 pt-6 pb-8">
                <span
                  className="text-[9px] tracking-[0.25em] uppercase text-zinc-600"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Menu
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full border border-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/20 transition-all"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M1 1l10 10M11 1L1 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
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
                        <div
                          className="w-1 h-1 rounded-full bg-[#E50914] shrink-0"
                          style={{ boxShadow: "0 0 6px rgba(229,9,20,0.6)" }}
                        />
                      )}
                      <span
                        className="text-[11px] font-semibold tracking-[0.2em] uppercase"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: isActive ? "#ffffff" : "rgba(255,255,255,0.78)",
                        }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="ml-auto text-[9px]"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          color: isActive ? "rgba(229,9,20,0.6)" : "rgba(255,255,255,0.35)",
                        }}
                      >
                        0{idx + 1}
                      </span>
                    </motion.a>
                  );
                })}

                <motion.a
                  href="/docs"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileOpen(false);
                    setTimeout(() => {
                      window.history.pushState({}, "", "/docs");
                      window.dispatchEvent(new PopStateEvent("popstate"));
                    }, 350);
                  }}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.32,
                    delay: 0.06 + NAV_ITEMS.length * 0.055,
                    ease,
                  }}
                  className="relative flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    className="text-[11px] font-semibold tracking-[0.2em] uppercase"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      color: "rgba(255,255,255,0.78)",
                    }}
                  >
                    DOCS
                  </span>
                  <ArrowUpRight
                    size={13}
                    style={{ marginLeft: "auto", opacity: 0.35, color: "#fff" }}
                  />
                </motion.a>
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.28, ease }}
                className="px-6 pb-10 pt-6"
              >
                <div className="h-px bg-white/[0.05] mb-6" />
                <a
                  href="https://ardeno-portal.vercel.app"
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
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenModal();
                  }}
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
