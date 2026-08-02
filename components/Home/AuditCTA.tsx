import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  FileText,
  Gauge,
  Minus,
  MousePointerClick,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "var(--font-display)";
const FONT_B = "var(--font-body)";

const auditChecks = [
  { label: "Design trust", icon: ShieldCheck },
  { label: "Mobile clarity", icon: Smartphone },
  { label: "Speed signals", icon: Gauge },
  { label: "SEO basics", icon: Search },
  { label: "Conversion path", icon: MousePointerClick },
  { label: "Content clarity", icon: FileText },
];

export const AuditCTA: React.FC<{ onOpenContact?: () => void }> = ({ onOpenContact }) => {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-[#0a0a0b] py-16 md:py-20">
      <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-white/[0.06]" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[-12%] top-[-35%] h-[420px] w-[420px] rounded-full bg-[#E50914]/[0.055] blur-[110px]"
        animate={reduced ? {} : { opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.75, ease: EASE }}
          className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center"
        >
          <div>
            <div className="flex items-center gap-3 mb-7">
              <Minus className="w-3.5 h-3.5 text-[#E50914] stroke-[1.5] shrink-0" />
              <span
                className="text-[12px] tracking-[0.22em] uppercase text-zinc-400"
                style={{ fontFamily: FONT_B, fontWeight: 600 }}
              >
                Free Website Audit
              </span>
            </div>

            <h2
              className="max-w-3xl text-white leading-[1.02] tracking-normal"
              style={{
                fontFamily: FONT_H,
                fontSize: "clamp(2.35rem, 5vw, 4.6rem)",
                fontWeight: 400,
              }}
            >
              Your website might be costing you leads.
            </h2>

            <p
              className="mt-6 max-w-xl text-[15px] leading-[1.85] text-zinc-400"
              style={{ fontFamily: FONT_B }}
            >
              Send us your current site. We will review the first impression, mobile flow,
              technical basics, and the exact moments where visitors may be dropping off.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onOpenContact}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#E50914] px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#ff1420]"
                style={{ fontFamily: FONT_B }}
              >
                Request Free Audit
                <ArrowUpRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById("work")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/[0.12] px-6 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
                style={{ fontFamily: FONT_B }}
              >
                View Work
                <ArrowUpRight size={15} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {auditChecks.map(({ label, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: EASE, delay: index * 0.05 }}
                className="flex min-h-[88px] items-center gap-4 rounded-2xl border border-white/[0.075] bg-white/[0.025] px-5 py-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#E50914]/20 bg-[#E50914]/[0.07] text-[#E50914]">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <span
                  className="text-[13px] font-medium uppercase tracking-[0.12em] text-zinc-300"
                  style={{ fontFamily: FONT_B }}
                >
                  {label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
