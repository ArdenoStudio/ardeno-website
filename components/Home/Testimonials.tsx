import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, MessageCircle, Minus, Rocket, ShieldCheck } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "var(--font-display)";
const FONT_B = "var(--font-body)";

const trustSignals = [
  {
    title: "Direct founder access",
    body: "You speak with the people shaping the work, not a chain of account handoffs.",
    icon: MessageCircle,
  },
  {
    title: "Security-ready launch",
    body: "Forms, API keys, headers, rate limits, and privacy basics are treated as launch requirements.",
    icon: ShieldCheck,
  },
  {
    title: "Colombo based, global delivery",
    body: "Built from Sri Lanka with the polish expected from modern international product teams.",
    icon: MapPin,
  },
  {
    title: "Post-launch support",
    body: "We stay close after launch so copy, bugs, analytics, and small improvements do not get ignored.",
    icon: Rocket,
  },
];

const founders = [
  {
    name: "Suven Seoras",
    role: "Co-founder / Product and engineering",
    href: "/founders.html#suven-seoras",
  },
  {
    name: "Ovindu Karunaratne",
    role: "Co-founder / Design and client direction",
    href: "/founders.html#ovindu-karunaratne",
  },
];

export const Testimonials: React.FC = () => (
  <section className="relative overflow-hidden bg-[#080809] py-24 md:py-32">
    <div className="pointer-events-none absolute inset-0 opacity-[0.025]" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundSize: "128px",
    }} />
    <div className="pointer-events-none absolute bottom-[-18%] left-[-8%] h-[440px] w-[440px] rounded-full bg-[#E50914]/[0.04] blur-[120px]" />

    <div className="relative z-10 container mx-auto px-6 md:px-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.78, ease: EASE }}
        className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-12 lg:gap-16"
      >
        <div>
          <div className="mb-8 flex items-center gap-3">
            <Minus className="h-3.5 w-3.5 shrink-0 text-[#E50914] stroke-[1.5]" />
            <span
              className="text-[13px] font-medium uppercase tracking-[0.22em] text-zinc-400"
              style={{ fontFamily: FONT_B }}
            >
              Trust Signals
            </span>
          </div>

          <h2
            className="max-w-xl leading-[1.05] tracking-normal text-white"
            style={{
              fontFamily: FONT_H,
              fontSize: "clamp(2.35rem, 5vw, 4.6rem)",
              fontWeight: 400,
            }}
          >
            Built by founders, not passed through layers.
          </h2>

          <p
            className="mt-6 max-w-lg text-[15px] leading-[1.85] text-zinc-400"
            style={{ fontFamily: FONT_B }}
          >
            We are not filling this section with fake client quotes. Until there are
            public testimonials to show, we earn trust through live builds, clear process,
            direct founder access, and launch checks that protect your site.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {founders.map((founder) => (
              <a
                key={founder.name}
                href={founder.href}
                className="group rounded-2xl border border-white/[0.075] bg-white/[0.025] p-5 transition-colors hover:border-[#E50914]/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[18px] leading-tight text-white" style={{ fontFamily: FONT_H }}>
                      {founder.name}
                    </p>
                    <p className="mt-2 text-[12px] leading-[1.6] text-zinc-500" style={{ fontFamily: FONT_B }}>
                      {founder.role}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-[#E50914]" />
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trustSignals.map(({ title, body, icon: Icon }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: EASE, delay: index * 0.06 }}
              className="rounded-2xl border border-white/[0.075] bg-[#0d0d10]/80 p-6"
            >
              <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-xl border border-[#E50914]/20 bg-[#E50914]/[0.07] text-[#E50914]">
                <Icon size={19} strokeWidth={1.7} />
              </div>
              <h3 className="text-[1.25rem] leading-tight text-white" style={{ fontFamily: FONT_H }}>
                {title}
              </h3>
              <p className="mt-3 text-[13px] leading-[1.75] text-zinc-500" style={{ fontFamily: FONT_B }}>
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);
