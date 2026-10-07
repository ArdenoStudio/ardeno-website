import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...values: ClassValue[]) => twMerge(clsx(values));
export const navigation = [
  { label: 'Work', id: 'work' },
  { label: 'Services', id: 'services' },
  { label: 'Studio', id: 'about' },
];
