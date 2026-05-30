export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  tags: string[];
  description?: string;
  status?: string;
  problem?: string;
  solution?: string;
  outcome?: string;
  role?: string;
  url?: string;
  year?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "octane",
    title: "Octane",
    category: "Fuel Price Intelligence",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=900&auto=format&fit=crop&q=72",
    tags: ["Data Platform", "Public API", "Price Alerts"],
    description:
      "A live Sri Lanka fuel price platform with CPC price tracking, revision history, alerts, trip-cost tools, and developer API access.",
    status: "Ardeno platform",
    problem: "Fuel price updates affect drivers, businesses, and logistics teams quickly, but price history and cost planning are usually scattered across notices and posts.",
    solution: "Built a public price-intelligence interface around CPC prices, daily revisions, threshold alerts, trip-cost calculation, multilingual access, and API-ready data.",
    outcome: "A practical utility platform that turns fuel-price changes into something people can check, plan around, and build with.",
    role: "Product strategy, data UX, frontend build, API presentation",
    year: "2026",
    url: "https://octane-smoky.vercel.app/",
  },
  {
    id: "propertylk",
    title: "PropertyLK",
    category: "Property Intelligence",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=720&auto=format&fit=crop&q=72",
    tags: ["Market Data", "Listings", "AI Estimate"],
    description:
      "A Sri Lanka property market intelligence platform with district-level data, listing signals, trend views, and estimate workflows.",
    status: "Ardeno platform",
    problem: "Property buyers and teams need market context, but listing data is noisy, fragmented, and hard to compare across districts.",
    solution: "Created a data-led property dashboard with cleaned listing signals, market heatmaps, pipeline freshness, price trends, and estimate entry points.",
    outcome: "A clearer research surface for understanding Sri Lanka property movement before making listing, buying, or pricing decisions.",
    role: "Market UX, dashboard design, responsive frontend, AI flow direction",
    year: "2026",
    url: "https://propertylk-one.vercel.app/",
  },
  {
    id: "autolens-lk",
    title: "AutoLens LK",
    category: "Vehicle Market Intelligence",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=720&auto=format&fit=crop&q=72",
    tags: ["Valuation Tools", "Market Trends", "AI Copilot"],
    description:
      "A Sri Lankan vehicle market cockpit for tracking listings, price signals, district coverage, valuation workflows, and AI-assisted comparison.",
    status: "Ardeno platform",
    problem: "Vehicle shoppers and sellers need a better way to judge asking prices, compare live listings, and spot market gaps.",
    solution: "Designed a vehicle-intelligence console with market scans, valuation entry points, district coverage, source signals, and an AI copilot layer.",
    outcome: "A stronger decision surface for inspecting Sri Lanka's vehicle market beyond one-off classified listings.",
    role: "Product UX, data dashboard design, frontend build, AI assistant direction",
    year: "2026",
    url: "https://vehicle-platform-one.vercel.app/",
  },
  {
    id: "1",
    title: "Cinnamon Oak Cafe",
    category: "Cafe & Dining",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=720&auto=format&fit=crop&q=72",
    tags: ["Branding", "Menu Design", "UI/UX"],
    description:
      "A warm, tactile digital presence for a specialty café where every pixel reflects the aroma of hand-poured coffee.",
    status: "Studio concept",
    problem: "Local cafes often rely on social feeds and static menu PDFs that make the brand feel smaller than the in-store experience.",
    solution: "Built a warm landing experience with menu-first content, strong photography direction, and clear booking/contact paths.",
    outcome: "A reusable hospitality concept that shows how a cafe can feel premium without hiding the menu or next action.",
    role: "Brand direction, UI design, responsive frontend",
    year: "2025",
    url: "https://ardeno-cinnamon-cafe.vercel.app",
  },
  {
    id: "2",
    title: "Lanka Fitness",
    category: "Health & Wellness",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=720&auto=format&fit=crop&q=72",
    tags: ["Web App", "Membership Portal", "Branding"],
    description:
      "A high-energy digital platform for Sri Lanka's premier gym brand with class scheduling and membership management.",
    status: "Studio concept",
    problem: "Fitness brands need to sell energy fast, but many sites bury schedules, membership options, and trainer credibility.",
    solution: "Designed a high-contrast fitness surface with program discovery, membership framing, and mobile-first class browsing.",
    outcome: "A polished wellness concept for gyms that want leads, signups, and brand confidence in one flow.",
    role: "UX strategy, interface design, frontend build",
    year: "2025",
    url: "https://ardeno-lanka-fitness.vercel.app",
  },
  {
    id: "3",
    title: "Lanka Motion",
    category: "Sports & Expo",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=720&auto=format&fit=crop&q=72",
    tags: ["Event Site", "Ticketing", "Animation"],
    description:
      "Sri Lanka's premier health, wellness, and performance movement — athletes, experts, and community under one roof.",
    status: "Studio concept",
    problem: "Event pages often look generic and fail to make the scale, schedule, and registration path obvious.",
    solution: "Created a movement-led event concept with bold section pacing, sponsor-ready blocks, and clear ticketing intent.",
    outcome: "A demo build for sports and expo teams that need a launch page with urgency and credibility.",
    role: "Event UX, motion direction, responsive frontend",
    year: "2025",
    url: "https://ardeno-lanka-motion.vercel.app",
  },
  {
    id: "4",
    title: "Luxe Lanka",
    category: "Luxury & Salon",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=720&auto=format&fit=crop&q=72",
    tags: ["Booking System", "E-Commerce", "Branding"],
    description:
      "An indulgent digital salon experience with silky transitions and a refined appointment booking flow.",
    status: "Studio concept",
    problem: "Salon sites can look beautiful while still making services, pricing, and booking feel unclear on mobile.",
    solution: "Built a luxury service flow with refined treatment discovery, polished visual rhythm, and booking-led CTAs.",
    outcome: "A premium beauty concept showing how brand feel and appointment conversion can work together.",
    role: "Luxury UI direction, booking UX, frontend build",
    year: "2025",
    url: "https://ardeno-luxe-lanka.vercel.app",
  },
  {
    id: "5",
    title: "Urban Kitchen",
    category: "Restaurant & Food",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=720&auto=format&fit=crop&q=72",
    tags: ["Online Ordering", "Menu Design", "UI/UX"],
    description:
      "A bold, appetite-driven web presence with digital menu, reservations, and online ordering.",
    status: "Studio concept",
    problem: "Restaurant visitors want food, location, and ordering options quickly, especially from a phone.",
    solution: "Created a direct restaurant experience with strong menu hierarchy, appetite-driven imagery, and order/reserve paths.",
    outcome: "A food brand concept built to reduce friction from first impression to table or checkout.",
    role: "Menu UX, visual design, responsive frontend",
    year: "2025",
    url: "https://ardeno-urban-kitchen.vercel.app",
  },
  {
    id: "6",
    title: "Global Jet Concierge",
    category: "Private Aviation & Concierge",
    image: "https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=900&auto=format&fit=crop&q=72",
    tags: ["Framer Motion", "Premium UI", "Aviation"],
    description:
      "A cinematic digital experience for ultra-high-net-worth individuals with fluid layout transitions.",
    status: "Live concept build",
    problem: "High-ticket concierge offers need immediate trust, premium pacing, and low-friction lead capture.",
    solution: "Designed a cinematic aviation experience with restrained motion, concierge positioning, and clear enquiry paths.",
    outcome: "A flagship concept that demonstrates Ardeno's premium interface, motion, and conversion direction.",
    role: "Creative direction, motion system, frontend build",
    year: "2025",
    url: "https://global-jet-concierge.vercel.app/",
  },
];

export const HERO_FEATURED =
  PROJECTS.find((project) => project.id === "6") ?? PROJECTS[0];
