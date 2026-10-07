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
    image: "/images/octane.jpg",
    tags: ["Data Platform", "Public API", "Price Alerts"],
    description: "A live Sri Lanka fuel price platform with CPC price tracking, revision history, alerts, trip-cost tools, and developer API access.",
    status: "Ardeno platform",
    problem: "Fuel price updates affect drivers, businesses, and logistics teams quickly, but price history and cost planning are usually scattered across notices and posts.",
    solution: "Built a public price-intelligence interface around CPC prices, daily revisions, threshold alerts, trip-cost calculation, multilingual access, and API-ready data.",
    outcome: "A practical utility platform that turns fuel-price changes into something people can check, plan around, and build with.",
    role: "Product strategy, data UX, frontend build, API presentation",
    year: "2026",
    url: "https://octane-smoky.vercel.app/"
  },
  {
    id: "propertylk",
    title: "PropertyLK",
    category: "Property Intelligence",
    image: "/images/propertylk.jpg",
    tags: ["Market Data", "Listings", "AI Estimate"],
    description: "A Sri Lanka property market intelligence platform with district-level data, listing signals, trend views, and estimate workflows.",
    status: "Ardeno platform",
    problem: "Property buyers and teams need market context, but listing data is noisy, fragmented, and hard to compare across districts.",
    solution: "Created a data-led property dashboard with cleaned listing signals, market heatmaps, pipeline freshness, price trends, and estimate entry points.",
    outcome: "A clearer research surface for understanding Sri Lanka property movement before making listing, buying, or pricing decisions.",
    role: "Market UX, dashboard design, responsive frontend, AI flow direction",
    year: "2026",
    url: "https://propertylk-one.vercel.app/"
  },
  {
    id: "motormila-lk",
    title: "Motormila LK",
    category: "Vehicle Market Intelligence",
    image: "/images/motormila.jpg",
    tags: ["Valuation Tools", "Market Trends", "AI Copilot"],
    description: "A Sri Lankan vehicle market cockpit for tracking listings, price signals, district coverage, valuation workflows, and AI-assisted comparison.",
    status: "Ardeno platform",
    problem: "Vehicle shoppers and sellers need a better way to judge asking prices, compare live listings, and spot market gaps.",
    solution: "Designed a vehicle-intelligence console with market scans, valuation entry points, district coverage, source signals, and an AI copilot layer.",
    outcome: "A stronger decision surface for inspecting Sri Lanka's vehicle market beyond one-off classified listings.",
    role: "Product UX, data dashboard design, frontend build, AI assistant direction",
    year: "2026",
    url: "https://motormila.vercel.app/"
  },
  {
    id: "lankawa",
    title: "Lankawa",
    category: "Civic & National Intelligence",
    image: "/images/lankawa.jpg",
    tags: ["Civic Data", "District Atlas", "Live Provenance"],
    description: "Sri Lanka's national civic intelligence platform — unifying public data across the economy, all 25 districts, disaster telemetry, and public services with source provenance on every number.",
    status: "Ardeno platform",
    problem: "Public data across Sri Lanka — from CBSL exchange rates and fuel prices to flood gauges and census demographics — is fragmented across legacy portals, PDFs, and unstructured announcements with no clear freshness or source verification.",
    solution: "Architected a trilingual, API-first national civic intelligence console unifying real-time economic indicators, Census 2024 district profiles, disaster monitoring, and an open public API where every metric tracks explicit provenance and timestamps.",
    outcome: "A trusted daily morning briefing and open civic surface for Sri Lankans, researchers, and developers, delivering verifiable public data with zero guesswork.",
    role: "Platform architecture, civic UX, trilingual design system, public API engineering",
    year: "2026",
    url: "https://lankawa.vercel.app/"
  },
  {
    id: "koel",
    title: "Koel",
    category: "Financial Alert Platform",
    image: "/images/koel.jpg",
    tags: ["Telegram Bot", "Colombo Stock Exchange", "Price Alerts"],
    description: "Telegram-first Colombo Stock Exchange price & disclosure alert platform. Watch symbols, set rules in a minimal dashboard, and get instant push alerts without keeping a browser open.",
    status: "Ardeno platform",
    problem: "CSE traders and retail investors need immediate price-cross and disclosure notifications without keeping open browser tabs or heavy terminal setups.",
    solution: "Architected a dedicated poller engine with custom threshold rules and immediate Telegram bot push delivery alongside a lightweight dashboard.",
    outcome: "Sub-second CSE price and announcement alerts delivered reliably directly into Telegram chats.",
    role: "Platform strategy, Telegram bot architecture, data polling engine",
    year: "2026",
    url: "https://koel-cse.vercel.app/"
  },
  {
    id: "dinaya",
    title: "Dinaya",
    category: "Booking & Operations SaaS",
    image: "/images/dinaya.jpg",
    tags: ["Booking Engine", "SMB Operations", "SMS Alerts"],
    description: "Modern booking platform for Sri Lankan service businesses. Share one link on Instagram or WhatsApp, let clients pick a time and pay a deposit, and automate client appointments.",
    status: "Ardeno platform",
    problem: "Local service businesses face high client no-show rates and struggle with fragmented manual paper booking and messaging records.",
    solution: "Built an intuitive booking engine with automated SMS reminders, staff calendars, service catalogs, and localized LKR settlement tracking.",
    outcome: "Cut no-show rates dramatically while providing local clients with a modern, friction-free booking experience.",
    role: "Product design, booking architecture, client experience",
    year: "2026",
    url: "https://dinaya-lk.vercel.app/"
  },
  {
    id: "serendib-trading",
    title: "Serendib Trading",
    category: "Automotive & B2B Trading",
    image: "/images/serendib.jpg",
    tags: ["B2B Catalog", "Automotive Import", "Inquiry Engine"],
    description: "Premier automotive import and trading portal in Sri Lanka featuring high-end vehicle inventory, specifications, and direct procurement inquiry flows.",
    status: "Client project",
    problem: "Automotive importers require a credible, modern showcase to present high-value vehicle inventory and capture qualified buyer inquiries.",
    solution: "Engineered a high-performance web catalog with vehicle spec breakdowns, WhatsApp consultation triggers, and direct import consultation intake.",
    outcome: "Accelerated commercial inquiry conversion and elevated brand authority for Sri Lankan automotive procurement.",
    role: "Full-stack development, brand presentation, responsive UI",
    year: "2026",
    url: "https://serendibtrading.lk/"
  },
  {
    id: "wax-in-the-city",
    title: "Wax In The City SL",
    category: "Aesthetics & Wellness",
    image: "/images/waxinthecity.jpg",
    tags: ["Boutique Studio", "Service Menu", "Appointment Booking"],
    description: "Boutique aesthetic and waxing studio web experience in Sri Lanka delivering discreet luxury, comprehensive service menus, and frictionless appointment booking.",
    status: "Client project",
    problem: "High-end aesthetic studios need digital spaces that reflect intimate luxury and reassure clients while making treatment selection and booking effortless.",
    solution: "Crafted a tranquil, mobile-first studio portal featuring detailed hygiene assurances, curated service menus, and direct appointment scheduling.",
    outcome: "Substantial increase in mobile booking volume and enhanced premium brand positioning.",
    role: "UI/UX design, frontend development, booking integration",
    year: "2026",
    url: "https://waxinthecity.lk/"
  },
  {
    id: "ceylon-hygiene-solutions",
    title: "Ceylon Hygiene Solutions",
    category: "Commercial Hygiene & Janitorial",
    image: "/images/ceylonhygiene.jpg",
    tags: ["Commercial Services", "B2B Catalog", "Quotation Engine"],
    description: "Comprehensive commercial hygiene and corporate washroom solutions platform for Sri Lankan enterprises, hospitals, and hospitality venues.",
    status: "Client project",
    problem: "Commercial janitorial and hygiene providers need clear corporate communication to win institutional tenders and B2B corporate contracts.",
    solution: "Built an authoritative corporate website with detailed service capability matrices, equipment catalogs, and quotation request pipelines.",
    outcome: "Professionalized institutional lead capture and expanded visibility for facility managers across Sri Lanka.",
    role: "Brand strategy, web architecture, conversion optimization",
    year: "2026",
    url: "https://www.ceylonhygienesolutions.lk/"
  }
];

export const HERO_FEATURED = PROJECTS.find((project) => project.id === "serendib-trading") ?? PROJECTS[0];
