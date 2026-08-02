import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Minus } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "var(--font-display)";
const FONT_B = "var(--font-body)";

const signals = ["Custom-coded", "Security-ready", "Launch support"];

export const FinalCTA: React.FC<{ onOpenContact?: () => void }> = ({ onOpenContact }) => (
  <section className="relative overflow-hidden bg-[#080809] py-20 md:py-28">
    <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
    <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[70vw] -translate-x-1/2 rounded-full bg-[#E50914]/[0.045] blur-[120px]" />

    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.78, ease: EASE }}
      className="relative z-10 container mx-auto px-6 md:px-12 text-center"
    >
      <div className="mb-7 flex items-center justify-center gap-3">
        <Minus className="h-3.5 w-3.5 shrink-0 text-[#E50914] stroke-[1.5]" />
        <span
          className="text-[12px] font-semibold uppercase tracking-[0.22em] text-zinc-400"
          style={{ fontFamily: FONT_B }}
        >
          Ready when you are
        </span>
      </div>

      <h2
        className="mx-auto max-w-4xl leading-[1.02] tracking-normal text-white"
        style={{
          fontFamily: FONT_H,
          fontSize: "clamp(2.45rem, 6vw, 5.4rem)",
          fontWeight: 400,
        }}
      >
        Make your website feel like the business you are building.
      </h2>

      <p
        className="mx-auto mt-6 max-w-xl text-[15px] leading-[1.85] text-zinc-400"
        style={{ fontFamily: FONT_B }}
      >
        We will help you choose the right scope, sharpen the offer, and ship a site
        that looks premium while staying practical to maintain.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
        {signals.map((signal) => (
          <span
            key={signal}
            className="rounded-full border border-white/[0.1] bg-white/[0.025] px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] text-zinc-400"
            style={{ fontFamily: FONT_B }}
          >
            {signal}
          </span>
        ))}
      </div>

      <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onOpenContact}
          className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#E50914] px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#ff1420]"
          style={{ fontFamily: FONT_B }}
        >
          Start a Project
          <ArrowUpRight size={15} />
        </button>
        <button
          type="button"
          onClick={onOpenContact}
          className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/[0.12] px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-zinc-300 transition-colors hover:border-white/25 hover:text-white"
          style={{ fontFamily: FONT_B }}
        >
          Request Free Audit
          <ArrowUpRight size={15} />
        </button>
      </div>
    </motion.div>
  </section>
);
