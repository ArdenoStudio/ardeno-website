import React from 'react';
import { motion } from 'framer-motion';
import { Minus } from 'lucide-react';
import { PROJECTS } from '../../data/projects';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = 'var(--font-display)';
const FONT_B = 'var(--font-body)';

const FadeUp: React.FC<{ children: React.ReactNode; delay?: number; className?: string }> = ({
  children, delay = 0, className = '',
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.75, ease: EASE, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

export const OurStory: React.FC = () => {
  const showcase = PROJECTS.slice(0, 3);

  return (
    <section id="about" className="relative w-full overflow-hidden bg-[#0a0a0b] py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      <div className="relative z-10 container mx-auto px-6 md:px-12">
        <FadeUp>
          <div className="flex items-center gap-3 mb-10">
            <Minus className="w-3.5 h-3.5 text-[#E50914] stroke-[1.5] shrink-0" />
            <span
              className="text-[13px] tracking-[0.22em] uppercase"
              style={{ fontFamily: FONT_B, fontWeight: 500, color: '#a0a0a0' }}
            >
              Our Story
            </span>
            <div className="flex-1 h-px bg-white/[0.05] ml-1" />
          </div>
        </FadeUp>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-start">
          <div>
            <FadeUp delay={0.04}>
              <h2
                className="leading-[1.05] tracking-[-0.025em] text-white mb-8"
                style={{
                  fontFamily: FONT_H,
                  fontSize: 'clamp(2.2rem, 5vw, 4.4rem)',
                  fontWeight: 400,
                  maxWidth: '14ch',
                }}
              >
                Born from a frustration
                <br />
                <em className="not-italic text-zinc-500" style={{ fontWeight: 300 }}>
                  with average.
                </em>
              </h2>
            </FadeUp>

            <FadeUp delay={0.12}>
              <div className="max-w-xl">
                <div className="w-6 h-px bg-[#E50914] mb-5 opacity-65" />
                <div className="space-y-6">
                  <p className="leading-[1.85] text-[15px] text-[#bdbdc5]" style={{ fontFamily: FONT_B }}>
                    Ardeno was founded on a simple belief: most websites look the same because
                    most agencies play it safe. We build for businesses that want more identity,
                    more presence, and more results.
                  </p>
                  <p className="leading-[1.85] text-[15px] text-[#bdbdc5]" style={{ fontFamily: FONT_B }}>
                    Every project is treated like the only one. No templates, no shortcuts, and
                    no &quot;that&apos;ll do.&quot; We obsess over details because details are what people remember.
                  </p>
                  <p className="leading-[1.85] text-[15px] text-[#bdbdc5]" style={{ fontFamily: FONT_B }}>
                    Based in Colombo and working globally, we&apos;ve helped brands across hospitality,
                    retail, aviation, and professional services build digital presences that reflect
                    their ambition.
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.18} className="relative">
            <div className="grid grid-cols-12 gap-3 md:gap-4">
              <div className="col-span-7 row-span-2">
                <div className="relative aspect-[4/5] rounded-[1.25rem] overflow-hidden border border-white/[0.08]">
                  <img
                    src={showcase[0].image}
                    alt={showcase[0].title}
                    width={480}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-[10px] tracking-[0.18em] uppercase text-zinc-400 mb-1" style={{ fontFamily: FONT_B }}>
                      {showcase[0].category}
                    </p>
                    <p className="text-[1.25rem] text-white leading-tight" style={{ fontFamily: FONT_H }}>
                      {showcase[0].title}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-5">
                <div className="relative aspect-[4/5] rounded-[1rem] overflow-hidden border border-white/[0.08]">
                  <img
                    src={showcase[1].image}
                    alt={showcase[1].title}
                    width={320}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="col-span-5">
                <div className="relative aspect-[4/5] rounded-[1rem] overflow-hidden border border-white/[0.08]">
                  <img
                    src={showcase[2].image}
                    alt={showcase[2].title}
                    width={320}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div
              className="absolute -bottom-4 -right-2 md:-right-4 rounded-2xl border border-white/[0.08] bg-[#0c0c0e]/95 backdrop-blur-xl px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
            >
              <p className="text-[9px] tracking-[0.2em] uppercase text-zinc-500 mb-1" style={{ fontFamily: FONT_B }}>
                Industries
              </p>
              <p className="text-[13px] text-white" style={{ fontFamily: FONT_B }}>
                Hospitality · Fitness · Aviation · Luxury
              </p>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
};
