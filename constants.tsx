import React from 'react';
import { Service, Testimonial, NavItem } from './types';
import { Layout, Smartphone, TrendingUp, Zap } from 'lucide-react';
import { PROJECTS } from './data/projects';

export { PROJECTS };

export const NAV_ITEMS: NavItem[] = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

// Legacy/export-facing service blurbs. Source of truth for the home Services section is `components/Home/Services.tsx`.
/** Prefer Home/Services.tsx as the interactive source of truth for service detail modals. */
export const SERVICES: Service[] = [
  {
    id: 'web-design',
    title: 'Flagship Website',
    description:
      'A custom-coded website for brands that need to look credible, modern, and ready for real customers.',
    icon: <Layout className="w-8 h-8 text-accent" />,
  },
  {
    id: 'development',
    title: 'Redesign Sprint',
    description: 'A focused rebuild for sites that feel outdated, unclear, slow, or weaker than the actual business.',
    icon: <Zap className="w-8 h-8 text-accent" />,
  },
  {
    id: 'optimization',
    title: 'Booking Engine',
    description:
      'Practical web systems for restaurants, salons, service teams, clinics, events, and appointment-led businesses.',
    icon: <TrendingUp className="w-8 h-8 text-accent" />,
  },
  {
    id: 'mobile',
    title: 'AI Lead Concierge',
    description:
      'A secure AI helper for websites that need to answer questions, qualify leads, or guide visitors after hours.',
    icon: <Smartphone className="w-8 h-8 text-accent" />,
  },
];

/** Reserved for future quotes; currently empty — use TRUST_SIGNALS for non-testimonial trust copy. */
export const TESTIMONIALS: Testimonial[] = [];

/** Alias for the empty testimonials slot; keeps imports stable while the name better matches current use. */
export const TRUST_SIGNALS = TESTIMONIALS;
