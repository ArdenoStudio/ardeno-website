import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowLeft } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "'Instrument Serif', Georgia, serif";
const FONT_B = "'Sora', sans-serif";

interface CaseStudy {
  id: string;
  title: string;
  client: string;
  year: string;
  summary: string;
  href: string;
  thumbnailClass?: string;
  bgImage?: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'humble-beginnings',
    title: 'Humble Beginnings',
    client: 'Ardeno Studio',
    year: '2026',
    summary: "How two people built Sri Lanka's premium web studio from zero in two months.",
    href: '/case-studies/humble-beginnings',
    thumbnailClass: 'bg-zinc-900', // text-based placeholder bg
    bgImage: '/case-studies/humble/ardeno-logo.svg',
  },
];

export const CaseStudiesIndex: React.FC = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    window.history.pushState({}, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };

  return (
    <motion.section
      key="case-studies-index"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative pt-32 md:pt-48 pb-32 overflow-hidden min-h-screen z-10"
    >

      {/* Floating Back Button */}
      <a
        href="/"
        onClick={(e) => handleNavClick(e, '/')}
        className="fixed top-8 left-6 md:top-12 md:left-12 z-[100] flex items-center gap-3 text-zinc-400 hover:text-white transition-all duration-300 group"
      >
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:bg-zinc-800 group-hover:scale-105 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium tracking-wide opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" style={{ fontFamily: FONT_B }}>
          Back to Main
        </span>
      </a>

      <div className="container mx-auto px-6 md:px-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-16 md:mb-24 flex flex-col items-center text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] shrink-0" />
            <span
              className="text-[12px] tracking-[0.2em] uppercase"
              style={{ fontFamily: FONT_B, color: '#a0a0a0', fontWeight: 500 }}
            >
              Our Work
            </span>
          </div>

          <h1
            className="text-white leading-[0.95] tracking-[-0.02em]"
            style={{
              fontFamily: FONT_H,
              fontSize: 'clamp(3rem, 7vw, 6rem)',
              fontWeight: 400,
            }}
          >
            Case <em style={{ fontStyle: 'italic', color: '#8c8c96', fontWeight: 400 }}>Studies.</em>
          </h1>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {CASE_STUDIES.map((study, idx) => (
            <motion.a
              key={study.id}
              href={study.href}
              onClick={(e) => handleNavClick(e, study.href)}
              className="group block relative"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 + idx * 0.1 }}
            >
              {/* Thumbnail Area - Glassmorphism & Glow */}
              <div
                className={`w-full aspect-[4/3] rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative ${study.thumbnailClass || ''} transition-all duration-700 ease-out`}
                style={{
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 0 0 0 rgba(229,9,20,0)',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 40px -10px rgba(229,9,20,0.5)';
                  e.currentTarget.style.border = '1px solid rgba(229,9,20,0.4)';
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.01)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 0 0 0 rgba(229,9,20,0)';
                  e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <div className="absolute inset-0 bg-[#E50914]/0 group-hover:bg-[#E50914]/10 transition-colors duration-700 z-10 pointer-events-none mix-blend-screen" />

                {/* Cinematic Background Logo */}
                {study.bgImage && (
                  <div className="absolute -top-[15%] -right-[15%] w-[130%] h-[130%] opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 group-hover:-translate-x-2 pointer-events-none">
                    <img src={study.bgImage} alt="" className="w-full h-full object-contain filter brightness-0 invert" />
                  </div>
                )}

                {/* Bottom to Top Fade */}
                <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent pointer-events-none z-10" />

                {/* Ambient backdrop glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-[radial-gradient(circle_at_center,rgba(229,9,20,0.15)_0%,transparent_70%)] pointer-events-none" />

                <h3
                  className="font-bold group-hover:scale-[1.03] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] text-center px-8 text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-700 group-hover:from-white group-hover:to-zinc-400 z-20 relative"
                  style={{ fontFamily: FONT_H, fontSize: 'clamp(2rem, 4.5vw, 4rem)', lineHeight: 1, letterSpacing: '-0.02em' }}
                >
                  {study.title.toUpperCase()}
                </h3>

                {/* Hover Reveal Button */}
                <div
                  className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-white overflow-hidden flex items-center justify-center opacity-0 translate-y-8 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 shadow-[0_10px_30px_rgba(229,9,20,0.3)] hover:scale-110 group/btn"
                >
                  <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-[150%] group-hover/btn:-translate-y-[150%]">
                    <ArrowUpRight className="w-6 h-6 text-black" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] -translate-x-[150%] translate-y-[150%] group-hover/btn:translate-x-0 group-hover/btn:translate-y-0">
                    <ArrowUpRight className="w-6 h-6 text-black" />
                  </div>
                </div>
              </div>

              {/* Meta details */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <h3
                    className="text-white text-xl md:text-2xl"
                    style={{ fontFamily: FONT_B, fontWeight: 500 }}
                  >
                    {study.title}
                  </h3>
                  <span
                    className="text-[12px] tracking-widest text-zinc-500"
                    style={{ fontFamily: FONT_B }}
                  >
                    {study.year}
                  </span>
                </div>

                <p
                  className="text-[14px] text-zinc-400 mt-1"
                  style={{ fontFamily: FONT_B, lineHeight: 1.6 }}
                >
                  {study.summary}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <span
                    className="text-[11px] tracking-widest uppercase text-[#E50914] border border-[#E50914]/20 bg-[#E50914]/5 px-3 py-1.5 rounded-full"
                    style={{ fontFamily: FONT_B }}
                  >
                    {study.client}
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </motion.section>
  );
};
