export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  tags: string[];
  description?: string;
  url?: string;
  year?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Cinnamon Oak Cafe",
    category: "Cafe & Dining",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80",
    tags: ["Branding", "Menu Design", "UI/UX"],
    description:
      "A warm, tactile digital presence for a specialty café where every pixel reflects the aroma of hand-poured coffee.",
    year: "2025",
    url: "https://ardeno-cinnamon-cafe.vercel.app",
  },
  {
    id: "2",
    title: "Lanka Fitness",
    category: "Health & Wellness",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
    tags: ["Web App", "Membership Portal", "Branding"],
    description:
      "A high-energy digital platform for Sri Lanka's premier gym brand with class scheduling and membership management.",
    year: "2025",
    url: "https://ardeno-lanka-fitness.vercel.app",
  },
  {
    id: "3",
    title: "Lanka Motion",
    category: "Sports & Expo",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80",
    tags: ["Event Site", "Ticketing", "Animation"],
    description:
      "Sri Lanka's premier health, wellness, and performance movement — athletes, experts, and community under one roof.",
    year: "2025",
    url: "https://ardeno-lanka-motion.vercel.app",
  },
  {
    id: "4",
    title: "Luxe Lanka",
    category: "Luxury & Salon",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80",
    tags: ["Booking System", "E-Commerce", "Branding"],
    description:
      "An indulgent digital salon experience with silky transitions and a refined appointment booking flow.",
    year: "2025",
    url: "https://ardeno-luxe-lanka.vercel.app",
  },
  {
    id: "5",
    title: "Urban Kitchen",
    category: "Restaurant & Food",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    tags: ["Online Ordering", "Menu Design", "UI/UX"],
    description:
      "A bold, appetite-driven web presence with digital menu, reservations, and online ordering.",
    year: "2025",
    url: "https://ardeno-urban-kitchen.vercel.app",
  },
  {
    id: "6",
    title: "Global Jet Concierge",
    category: "Private Aviation & Concierge",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=1200&q=80",
    tags: ["Framer Motion", "Premium UI", "Aviation"],
    description:
      "A cinematic digital experience for ultra-high-net-worth individuals with fluid layout transitions.",
    year: "2025",
    url: "https://global-jet-concierge.vercel.app/",
  },
];

export const HERO_FEATURED = PROJECTS[5];
