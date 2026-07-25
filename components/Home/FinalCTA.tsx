import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Minus } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "var(--font-display)";
const FONT_B = "var(--font-body)";

export const FinalCTA: React.FC<{ onOpenContact?: () => void }> = ({ onOpenContact }) => (
  <section className="relative overflow-hidden bg-[#080809] py-20 md:py-28">
    <div className="absolute inset-x-0 top-0 h-px bg-white/[0.06]" />
    <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[70vw] -translate-x-1/2 rounded-full bg-[#E50914]/[0.045] blur-[120px]" />

    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.78, ease: EASE }}
      className="relative z-10 container mx-auto px-6 md:px-12"
    >
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0c0c0e]/80 px-6 py-12 md:px-14 md:py-16 text-center shadow-[0_40px_80px_-24px_rgba(0,0,0,0.75)]">
        {/* Red edge-light / scene atmosphere */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#E50914]/55 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#E50914]/25 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-[#E50914]/[0.08] blur-[60px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E50914]/35 to-transparent"
        />

        <div className="relative">
          <div className="mb-7 flex items-center justify-center gap-3">
            <Minus aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#E50914] stroke-[1.5]" />
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

          <div className="mt-9 flex flex-col items-center justify-center gap-4">
            <button
              type="button"
              onClick={onOpenContact}
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#E50914] px-7 py-4 text-[12px] font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#ff1420]"
              style={{ fontFamily: FONT_B }}
            >
              Start a Project
              <ArrowUpRight aria-hidden size={15} />
            </button>
            <button
              type="button"
              onClick={onOpenContact}
              className="text-[13px] text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-300 hover:underline"
              style={{ fontFamily: FONT_B }}
            >
              Or request a free audit
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  </section>
);
