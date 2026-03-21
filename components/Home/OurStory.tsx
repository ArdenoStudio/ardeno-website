import React from 'react';
import { motion } from 'framer-motion';
import { Minus } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "'Instrument Serif', Georgia, serif";
const FONT_B = "'Sora', sans-serif";
const RED = '#E50914';

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
  return (
    <section id="about" className="relative w-full overflow-hidden bg-[#080809] py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      <div
        className="pointer-events-none absolute top-[-10%] right-[-10%] w-[48vw] h-[48vw] rounded-full z-0"
        style={{
          background: 'radial-gradient(circle, rgba(229,9,20,0.05) 0%, transparent 65%)',
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_520px] gap-12 lg:gap-16 items-start">
          <FadeUp delay={0.04}>
            <h2
              className="leading-[1.05] tracking-[-0.025em] text-white"
              style={{
                fontFamily: FONT_H,
                fontSize: 'clamp(2.2rem, 5vw, 4.4rem)',
                fontWeight: 700,
                maxWidth: '14ch',
              }}
            >
              Born from a frustration
              <br />
              <em className="not-italic" style={{ color: '#8c8c96', fontWeight: 300 }}>
                with average.
              </em>
            </h2>
          </FadeUp>

          <FadeUp delay={0.12}>
            <div className="md:pt-2">
              <div className="w-6 h-px bg-[#E50914] mb-5" style={{ opacity: 0.65 }} />
              <div className="space-y-6">
                <p
                  className="leading-[1.85]"
                  style={{ fontFamily: FONT_B, fontSize: '15px', fontWeight: 400, color: '#bdbdc5' }}
                >
                  Ardeno was founded on a simple belief: most websites look the same because
                  most agencies play it safe. We build for businesses that want more identity,
                  more presence, and more results.
                </p>
                <p
                  className="leading-[1.85]"
                  style={{ fontFamily: FONT_B, fontSize: '15px', fontWeight: 400, color: '#bdbdc5' }}
                >
                  Every project is treated like the only one. No templates, no shortcuts, and
                  no &quot;that&apos;ll do.&quot; We obsess over details because details are what people remember.
                </p>
                <p
                  className="leading-[1.85]"
                  style={{ fontFamily: FONT_B, fontSize: '15px', fontWeight: 400, color: '#bdbdc5' }}
                >
                  Based in Colombo and working globally, we&apos;ve helped brands across hospitality,
                  retail, aviation, and professional services build digital presences that reflect
                  their ambition.
                </p>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
};
