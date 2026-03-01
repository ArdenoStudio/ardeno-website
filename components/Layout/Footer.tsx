import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, ArrowUpRight, Minus } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "'Instrument Serif', Georgia, serif";
const FONT_B = "'Sora', sans-serif";

interface FooterProps {
  onOpenContact?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href === '#') return;
    const el = document.getElementById(href.replace('#', ''));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Work', href: '#work' },
    { label: 'Services', href: '#services' },
    { label: 'Process', href: '#process' },
  ];

  const socialLinks = [
    { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/ardenostudio/' },
    { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/ardentstudiolk' },
  ];

  const suvenWhatsApp = 'https://wa.me/94758504424';
  const ovinduWhatsApp = 'https://wa.me/94762485456';

  const WhatsAppIcon = () => (
    <svg className="w-3 h-3 opacity-35 group-hover:opacity-80 transition-opacity duration-200" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  return (
    <footer id="contact" className="relative bg-[#080809] overflow-hidden">
      {/* Grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      {/* Ambient glow — top right, different position from other sections */}
      <div
        className="pointer-events-none absolute top-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(229,9,20,0.045) 0%, transparent 65%)' }}
      />

      {/* Top border */}
      <div
        className="w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(229,9,20,0.18) 20%, rgba(255,255,255,0.06) 50%, rgba(229,9,20,0.18) 80%, transparent)',
        }}
      />

      {/* ── Main CTA block ── */}
      <div className="container mx-auto px-6 md:px-12 pt-20 md:pt-28 pb-20">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-0">

          {/* Left — headline + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="max-w-xl"
          >
            {/* Eyebrow — matches all other sections exactly */}
            <div className="flex items-center gap-3 mb-8">
              <Minus className="w-3.5 h-3.5 text-[#E50914] stroke-[1.5] shrink-0" />
              <span
                className="text-[11px] tracking-[0.28em] text-zinc-400 uppercase"
                style={{ fontFamily: FONT_B, fontWeight: 500 }}
              >
                Start a project
              </span>
            </div>

            {/* Heading — Instrument Serif, same pattern as other sections */}
            <h2
              className="leading-[0.95] tracking-[-0.025em] text-white mb-8"
              style={{
                fontFamily: FONT_H,
                fontSize: 'clamp(2.8rem, 6vw, 5.5rem)',
                fontWeight: 400,
              }}
            >
              Let's build
              <br />
              something
              <br />
              {/* "iconic." — faded, with red underline reveal. Consistent with Process heading */}
              <span className="relative inline-block">
                <em
                  style={{
                    fontStyle: 'italic',
                    color: 'rgba(255,255,255,0.2)',
                    fontWeight: 400,
                  }}
                >
                  iconic.
                </em>
                <motion.span
                  className="absolute left-0 bottom-1 h-[2px] rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #E50914, transparent)',
                    originX: 0,
                    width: '100%',
                  }}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.5 }}
                />
              </span>
            </h2>

            {/* Body copy — 13px Sora zinc-500, matches Services/Process */}
            <p
              className="text-[13px] text-zinc-500 mb-10 leading-[1.8] max-w-xs"
              style={{ fontFamily: FONT_B }}
            >
              Ready to transform your digital presence?
              We are currently accepting new projects.
            </p>

            {/* CTA — consistent with site arrow button language */}
            <div className="flex items-center gap-4">
              <motion.button
                onClick={() => onOpenContact?.()}
                className="flex items-center gap-2.5 px-6 py-3 rounded-full text-white text-[12px] tracking-[0.14em] uppercase whitespace-nowrap"
                style={{
                  fontFamily: FONT_B,
                  fontWeight: 600,
                  background: '#E50914',
                  boxShadow: '0 0 24px rgba(229,9,20,0.22)',
                }}
                whileHover={{ scale: 1.03, boxShadow: '0 0 36px rgba(229,9,20,0.42)', background: '#ff1420' }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                Start a project
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>

          {/* Right — Explore + Contact */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 lg:pt-2"
          >
            {/* Explore */}
            <div>
              {/* Column label — matches eyebrow style */}
              <p
                className="text-[10px] tracking-[0.28em] uppercase text-zinc-600 mb-6"
                style={{ fontFamily: FONT_B, fontWeight: 500 }}
              >
                Explore
              </p>
              <ul className="space-y-4">
                {navLinks.map(link => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      onClick={e => handleNavClick(e, link.href)}
                      className="group flex items-center gap-2 text-[14px] text-zinc-400 hover:text-white transition-colors duration-200"
                      style={{ fontFamily: FONT_B }}
                    >
                      <span className="block w-0 group-hover:w-3 h-px bg-[#E50914] transition-all duration-300 origin-left shrink-0" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p
                className="text-[10px] tracking-[0.28em] uppercase text-zinc-600 mb-6"
                style={{ fontFamily: FONT_B, fontWeight: 500 }}
              >
                Contact
              </p>
              <ul className="space-y-4">
                {/* Email */}
                <li>
                  <a
                    href="mailto:ardenostudio@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-zinc-400 hover:text-white transition-colors duration-200 block"
                    style={{ fontFamily: FONT_B }}
                  >
                    ardenostudio@gmail.com
                  </a>
                </li>

                {/* Suven */}
                <li>
                  <a
                    href={suvenWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-[13px] text-zinc-400 hover:text-white transition-colors duration-200"
                    style={{ fontFamily: FONT_B }}
                  >
                    +94 75 850 4424
                    <WhatsAppIcon />
                  </a>
                  <span
                    className="text-[10px] text-zinc-700 tracking-[0.15em] uppercase mt-0.5 block"
                    style={{ fontFamily: FONT_B }}
                  >
                    Suven Seoras
                  </span>
                </li>

                {/* Ovindu */}
                <li>
                  <a
                    href={ovinduWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2 text-[13px] text-zinc-400 hover:text-white transition-colors duration-200"
                    style={{ fontFamily: FONT_B }}
                  >
                    +94 76 248 5456
                    <WhatsAppIcon />
                  </a>
                  <span
                    className="text-[10px] text-zinc-700 tracking-[0.15em] uppercase mt-0.5 block"
                    style={{ fontFamily: FONT_B }}
                  >
                    Ovindu Karunaratne
                  </span>
                </li>

                {/* Location */}
                <li className="pt-1">
                  <span
                    className="text-[13px] text-zinc-600"
                    style={{ fontFamily: FONT_B }}
                  >
                    Colombo, Sri Lanka
                  </span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="w-full h-px" style={{ background: 'rgba(255,255,255,0.055)' }} />

      <div className="container mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span
          className="text-[10px] text-zinc-700 tracking-[0.2em] uppercase"
          style={{ fontFamily: FONT_B }}
        >
          © {new Date().getFullYear()} Ardeno Studio. All rights reserved.
        </span>

        <div className="flex items-center gap-2.5">
          {socialLinks.map(({ icon: Icon, label, href }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(255,255,255,0.4)',
              }}
              whileHover={{
                scale: 1.1,
                borderColor: 'rgba(229,9,20,0.45)',
                color: '#fff',
                background: 'rgba(229,9,20,0.08)',
              }}
              transition={{ duration: 0.2 }}
            >
              <Icon className="w-3.5 h-3.5" />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
};