import React from 'react';
import { Project, Service, Testimonial, NavItem } from './types';
import { Layout, Smartphone, TrendingUp, Zap } from 'lucide-react';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Work', href: '#work' },
  { label: 'Services', href: '#services' },
  { label: 'Process', href: '#process' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Cinnamon Oak Cafe",
    category: "Cafe & Dining",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80",
    tags: ["Branding", "Menu Design", "UI/UX"],
  },
  {
    id: "2",
    title: "Lanka Fitness",
    category: "Health & Wellness",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    tags: ["Web App", "Membership Portal", "Branding"],
  },
  {
    id: "3",
    title: "Lanka Motion",
    category: "Sports & Expo",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    tags: ["Event Site", "Ticketing", "Animation"],
  },
  {
    id: "4",
    title: "Luxe Lanka",
    category: "Luxury & Salon",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    tags: ["Booking System", "E-Commerce", "Branding"],
  },
  {
    id: "5",
    title: "Urban Kitchen",
    category: "Restaurant & Food",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    tags: ["Online Ordering", "Menu Design", "UI/UX"],
  },
  {
    id: "6",
    title: "Global Jet Concierge",
    category: "Private Aviation & Concierge",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=80",
    tags: ["Framer Motion", "Premium UI", "Aviation"],
  },
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
