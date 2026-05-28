import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "var(--font-display)";
const FONT_B = "var(--font-body)";

const MARKS = [
  {
    title: "Primary mark",
    label: "Red gloss",
    src: "/brand/ardeno-gloss-mark-red-dark.png",
  },
  {
    title: "Contrast mark",
    label: "Chrome gloss",
    src: "/brand/ardeno-gloss-mark-chrome.png",
  },
];

export const BrandIdentity: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const lockupY = useTransform(scrollYProgress, [0, 1], [36, -28]);
  const markY = useTransform(scrollYProgress, [0, 1], [18, -18]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: "#080809" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-0 h-px w-[min(72rem,80vw)] -translate-x-1/2"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)" }}
        />
        <div
          className="absolute right-[-12rem] top-1/4 h-[28rem] w-[28rem] rounded-full blur-[120px]"
          style={{ background: "rgba(229,9,20,0.08)" }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-5 md:px-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 28 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="h-px w-5 bg-[#E50914]" />
                <span className="text-[12px] uppercase tracking-[0.24em] text-zinc-500" style={{ fontFamily: FONT_B }}>
                  Persistent Identity
                </span>
              </div>

              <h2
                className="max-w-xl text-white"
                style={{
                  fontFamily: FONT_H,
                  fontSize: "clamp(2.6rem,5vw,5.2rem)",
                  lineHeight: 0.94,
                  fontWeight: 400,
                }}
              >
                A mark built to stay in memory.
              </h2>

              <p className="mt-5 max-w-md text-[14px] leading-[1.8] text-zinc-500" style={{ fontFamily: FONT_B }}>
                We can use the glossy Ardeno renders as a premium identity moment across the homepage, loader, and future product portals.
              </p>

              <div className="mt-8 grid max-w-md grid-cols-3 border-y border-white/[0.08] py-5">
                {[
                  ["01", "Logo system"],
                  ["02", "Dark-first"],
                  ["03", "Portal ready"],
                ].map(([num, label]) => (
                  <div key={label}>
                    <p className="text-[11px] text-[#E50914]" style={{ fontFamily: FONT_B }}>{num}</p>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-zinc-500" style={{ fontFamily: FONT_B }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-4 md:space-y-5">
            <motion.div
              style={{ y: reduced ? 0 : lockupY }}
              initial={reduced ? false : { opacity: 0, scale: 0.98 }}
              whileInView={reduced ? {} : { opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.85, ease: EASE }}
              className="relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#030304]"
            >
              <div
                className="absolute inset-0 opacity-50"
                style={{ background: "radial-gradient(circle at 50% 46%, rgba(229,9,20,0.14), transparent 54%)" }}
              />
              <div className="relative flex aspect-[1.32] items-center justify-center p-8 md:p-12">
                <img
                  src="/brand/ardeno-gloss-lockup.png"
                  alt="Ardeno Studio glossy identity lockup"
                  width={1066}
                  height={1060}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full max-w-[560px]"
                />
              </div>
            </motion.div>

            <motion.div
              style={{ y: reduced ? 0 : markY }}
              className="grid gap-4 sm:grid-cols-2"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={reduced ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.75, ease: EASE, delay: 0.08 }}
            >
              {MARKS.map((mark) => (
                <div
                  key={mark.title}
                  className="group relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#030304]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.045] via-transparent to-[#E50914]/[0.08] opacity-80" />
                  <div className="relative flex aspect-[1.18] items-center justify-center p-5">
                    <img
                      src={mark.src}
                      alt={`Ardeno Studio ${mark.label} logo render`}
                      width={784}
                      height={658}
                      loading="lazy"
                      decoding="async"
                      className="h-auto w-full max-w-[280px] transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="relative flex items-end justify-between border-t border-white/[0.07] px-5 py-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#E50914]" style={{ fontFamily: FONT_B }}>
                        {mark.label}
                      </p>
                      <h3 className="mt-1 text-[15px] text-white" style={{ fontFamily: FONT_H }}>
                        {mark.title}
                      </h3>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-[#E50914] shadow-[0_0_18px_rgba(229,9,20,0.8)]" />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandIdentity;
