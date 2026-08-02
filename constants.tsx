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

export const SERVICES: Service[] = [
  {
    id: 'web-design',
    title: 'Premium Business Website',
    description:
      'A custom-coded website for brands that need to look credible, modern, and ready for real customers.',
    icon: <Layout className="w-8 h-8 text-accent" />,
  },
  {
    id: 'development',
    title: 'Website Redesign Sprint',
    description: 'A focused rebuild for sites that feel outdated, unclear, slow, or weaker than the actual business.',
    icon: <Zap className="w-8 h-8 text-accent" />,
  },
  {
    id: 'optimization',
    title: 'Booking / Order System',
    description:
      'Practical web systems for restaurants, salons, service teams, clinics, events, and appointment-led businesses.',
    icon: <TrendingUp className="w-8 h-8 text-accent" />,
  },
  {
    id: 'mobile',
    title: 'AI Lead Assistant',
    description:
      'A secure AI helper for websites that need to answer questions, qualify leads, or guide visitors after hours.',
    icon: <Smartphone className="w-8 h-8 text-accent" />,
  },
];

export const TESTIMONIALS: Testimonial[] = [];
