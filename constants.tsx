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
    title: 'Premium Web Design',
    description:
      "Bespoke UI/UX design that captures your brand essence. We don't use templates; we build digital masterpieces.",
    icon: <Layout className="w-8 h-8 text-accent" />,
  },
  {
    id: 'development',
    title: 'Creative Development',
    description: "Ardeno Studio - High Performance Digital Presence",
    icon: <Zap className="w-8 h-8 text-accent" />,
  },
  {
    id: 'optimization',
    title: 'Conversion Strategy',
    description:
      'Beautiful websites that sell. We use data-driven layouts to turn visitors into high-value clients.',
    icon: <TrendingUp className="w-8 h-8 text-accent" />,
  },
  {
    id: 'mobile',
    title: 'Mobile First',
    description:
      'Seamless experiences across all devices. Your site will look stunning on a 4K monitor and an iPhone.',
    icon: <Smartphone className="w-8 h-8 text-accent" />,
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Sarah Perera',
    role: 'Marketing Director',
    company: 'Odel Luxury',
    quote:
      "Ardeno Studio didn't just build a website; they elevated our entire brand perception. The attention to detail is world-class.",
    avatar: 'https://picsum.photos/100/100?random=10',
  },
  {
    id: 't2',
    name: 'David Fernando',
    role: 'Founder',
    company: 'Ceylon Coffee House',
    quote:
      'Since launching the new site, our online reservations have doubled. The design exudes the premium feel we were missing.',
    avatar: 'https://picsum.photos/100/100?random=11',
  },
];
