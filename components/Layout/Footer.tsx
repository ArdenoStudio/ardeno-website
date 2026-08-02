import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, ArrowUpRight, Facebook } from 'lucide-react';

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];
const FONT_H = "'Instrument Serif', Georgia, serif";
const FONT_B = "'Sora', sans-serif";
const FONT_BRAND = "'Bricolage Grotesque', sans-serif";

interface FooterProps {
  onOpenContact?: () => void;
}

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
  caption?: string;
  whatsApp?: boolean;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

const XIcon = () => (
  <svg className="h-[13px] w-[13px]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 3.239H4.293l13.314 17.411z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const suvenWhatsApp = 'https://wa.me/94758504424';
const ovinduWhatsApp = 'https://wa.me/94762485456';

const footerColumns: FooterColumn[] = [
  {
    title: 'Explore',
    links: [
      { label: 'Work', href: '#work' },
      { label: 'Services', href: '#services' },
      { label: 'Booking systems', href: '/services/booking-systems' },
      { label: 'Business websites', href: '/services/business-websites' },
      { label: 'Website redesign', href: '/services/website-redesign' },
      { label: 'AI assistants', href: '/services/ai-lead-assistants' },
      { label: 'Process', href: '#process' },
      { label: 'About', href: '#about' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'Case studies', href: '/case-studies' },
      { label: 'Founders', href: '/founders.html' },
      { label: 'Brand', href: '/brand' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs', href: '/docs' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Portal', href: 'https://ardeno-portal.vercel.app', external: true },
    ],
  },
  {
    title: 'Contact',
    links: [
      { label: 'ardenostudio@gmail.com', href: 'mailto:ardenostudio@gmail.com', external: true },
      { label: '+94 75 850 4424', href: suvenWhatsApp, external: true, caption: 'Suven Seoras', whatsApp: true },
      { label: '+94 76 248 5456', href: ovinduWhatsApp, external: true, caption: 'Ovindu Karunaratne', whatsApp: true },
      { label: 'Colombo, Sri Lanka', href: '#contact' },
    ],
  },
];

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/ardenostudio/' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/ardentstudiolk' },
  { icon: Facebook, label: 'Facebook', href: 'https://web.facebook.com/people/Ardeno-Studio/61578087120189/' },
  { icon: WhatsAppIcon, label: 'WhatsApp', href: suvenWhatsApp },
  { icon: XIcon, label: 'X', href: 'https://x.com/ArdenoStudio' },
];

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string, external?: boolean) => {
    if (external || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    e.preventDefault();
    if (href === '#') return;

    const isHomePath = window.location.pathname === '/' || window.location.pathname === '';
    const scrollToHash = (attempt = 0) => {
      const el = document.getElementById(href.replace('#', ''));
      if (el) {
        const navOffset = window.scrollY > 24 ? 72 : 80;
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - navOffset - 8,
          behavior: 'smooth',
        });
        return;
      }
      if (attempt < 10) window.setTimeout(() => scrollToHash(attempt + 1), 120);
    };

    if (href.startsWith('#') && !isHomePath) {
      window.history.pushState({}, '', `/${href}`);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.setTimeout(() => scrollToHash(), 80);
      return;
    }

    if (href.endsWith('.html')) {
      window.location.assign(href);
      return;
    }

    if (href.startsWith('/')) {
      window.history.pushState({}, '', href);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo(0, 0);
      return;
    }

    scrollToHash();
  };

  return (
    <footer id="contact" className="relative overflow-hidden bg-[#080809] px-3 pb-3 pt-8 md:px-6 md:pb-6 md:pt-12">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mx-auto max-w-[1680px] overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#030304] px-5 py-12 shadow-[0_-24px_90px_rgba(0,0,0,0.42)] sm:px-8 md:rounded-[42px] md:px-14 md:py-16 lg:px-20"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '128px',
          }}
        />
        <div
          className="pointer-events-none absolute right-[-16rem] top-[-18rem] h-[34rem] w-[34rem] rounded-full blur-[130px]"
          style={{ background: 'rgba(229,9,20,0.12)' }}
        />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(260px,0.9fr)_minmax(0,1.45fr)] lg:gap-16">
          <div className="max-w-sm">
            <a
              href="/"
              onClick={(e) => handleNavClick(e, '/')}
              className="group inline-flex items-center gap-3"
              aria-label="Go to Ardeno Studio home"
            >
              <img src="/ardeno-logo.svg" alt="" width={48} height={48} className="h-12 w-auto" loading="lazy" />
              <span className="flex flex-col uppercase text-white" style={{ fontFamily: FONT_BRAND }}>
                <span className="text-[12px] leading-none tracking-[0.16em]">Ardeno</span>
                <span className="mt-1 text-[15px] font-black leading-none tracking-[0.12em]">Studio</span>
              </span>
            </a>

            <p className="mt-6 text-[14px] leading-7 text-zinc-400" style={{ fontFamily: FONT_B }}>
              Premium websites, booking systems, and AI-assisted digital experiences for businesses that need to look sharp and work properly.
            </p>

            <motion.button
              type="button"
              onClick={() => onOpenContact?.()}
              className="mt-8 inline-flex items-center gap-2 rounded-[14px] bg-white px-6 py-4 text-[13px] font-semibold text-[#080809] transition-colors duration-200 hover:bg-zinc-200"
              style={{ fontFamily: FONT_B }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Start a project
              <ArrowUpRight className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <p
                  className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-600"
                  style={{ fontFamily: FONT_B }}
                >
                  {column.title}
                </p>
                <ul className={column.title === 'Contact' ? 'mt-6 space-y-5' : 'mt-6 space-y-4'}>
                  {column.links.map((link) => (
                    <li key={`${column.title}-${link.label}`}>
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        onClick={(e) => handleNavClick(e, link.href, link.external)}
                        className="group inline-flex items-center gap-1.5 text-[14px] leading-none text-zinc-400 transition-colors duration-200 hover:text-white"
                        style={{ fontFamily: FONT_B }}
                      >
                        {link.label}
                        {link.whatsApp && (
                          <span className="text-zinc-500 transition-colors duration-200 group-hover:text-white/80">
                            <WhatsAppIcon />
                          </span>
                        )}
                        {link.external && !link.whatsApp && column.title !== 'Contact' && (
                          <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity duration-200 group-hover:opacity-70" />
                        )}
                      </a>
                      {link.caption && (
                        <p
                          className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500"
                          style={{ fontFamily: FONT_B }}
                        >
                          {link.caption}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-16 flex flex-col gap-5 border-t border-white/[0.07] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-[12px] text-zinc-600" style={{ fontFamily: FONT_B }}>
            © {new Date().getFullYear()} Ardeno Studio. Built in Sri Lanka.
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            {socialLinks.map(({ icon: Icon, label, href }) => (
              <motion.a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-[11px] border border-white/[0.09] bg-white/[0.035] text-zinc-500 transition-colors duration-200 hover:text-white"
                whileHover={{ y: -2, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.07)' }}
                whileTap={{ scale: 0.97 }}
              >
                <Icon className="h-3.5 w-3.5" />
              </motion.a>
            ))}
          </div>
        </div>

        <div
          aria-hidden="true"
          className="relative z-0 mt-10 flex select-none items-center justify-center gap-[clamp(0.9rem,2.4vw,2rem)] overflow-hidden border-t border-white/[0.05] pt-8 text-white/[0.055] md:mt-12 md:pt-10"
        >
          <img
            src="/ardeno-logo.svg"
            alt=""
            width={190}
            height={190}
            className="h-[clamp(4.5rem,10vw,9.5rem)] w-auto opacity-70 grayscale"
            loading="lazy"
          />
          <span
            className="whitespace-nowrap text-[clamp(4rem,12.8vw,13rem)] font-black uppercase leading-none tracking-[0.01em]"
            style={{ fontFamily: FONT_BRAND, fontVariationSettings: '"wdth" 82, "wght" 900' }}
          >
            Ardeno
          </span>
        </div>
      </motion.div>
    </footer>
  );
};
