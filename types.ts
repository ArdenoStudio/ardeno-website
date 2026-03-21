import React from 'react';

export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  tags: string[];
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
}

export interface NavItem {
  label: string;
  href: string;
}