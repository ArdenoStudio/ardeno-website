import fs from "node:fs/promises";
import path from "node:path";

const DIST = path.resolve("dist");
const INDEX = path.join(DIST, "index.html");
const seoConfig = JSON.parse(await fs.readFile(path.resolve("seo-routes.json"), "utf8"));
const SITE = seoConfig.site;

const absoluteUrl = (pathOrUrl) => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const cleanPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE.url}${cleanPath}`;
};

const escapeAttr = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const tagPatterns = {
  description: /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
  keywords: /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
  robots: /<meta\s+name="robots"\s+content="[^"]*"\s*\/?>/i,
  canonical: /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
  ogSiteName: /<meta\s+property="og:site_name"\s+content="[^"]*"\s*\/?>/i,
  ogTitle: /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
  ogDescription: /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
  ogImage: /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
  ogUrl: /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
  ogType: /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
  twitterTitle: /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
  twitterDescription: /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
  twitterImage: /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
};

const upsert = (html, pattern, tag) => {
  if (pattern.test(html)) return html.replace(pattern, tag);
  return html.replace("</head>", `  ${tag}\n</head>`);
};

const buildStructuredData = (key, route) => {
  const canonical = absoluteUrl(route.path);
  const pageBase = canonical.replace(/\/$/, "");
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SITE.url}/`,
    },
  ];

  if (route.path !== "/") {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: route.title.split("|")[0].trim(),
      item: canonical,
    });
  }

  const graph = [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      alternateName: SITE.alternateName,
      url: `${SITE.url}/`,
      logo: { "@type": "ImageObject", url: SITE.logo },
      image: SITE.image,
      email: SITE.email,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Colombo",
        addressCountry: "LK",
      },
      sameAs: SITE.sameAs,
      founder: [
        { "@id": `${SITE.url}/founders.html#suven-seoras` },
        { "@id": `${SITE.url}/founders.html#ovindu-karunaratne` },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: SITE.name,
      alternateName: SITE.alternateName,
      url: `${SITE.url}/`,
      publisher: { "@id": `${SITE.url}/#organization` },
      inLanguage: "en-LK",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${pageBase}#breadcrumb`,
      itemListElement: breadcrumbItems,
    },
    {
      "@type": key === "case-studies" ? "CollectionPage" : key === "faq" ? "FAQPage" : "WebPage",
      "@id": `${pageBase}#webpage`,
      url: canonical,
      name: route.title,
      description: route.description,
      isPartOf: { "@id": `${SITE.url}/#website` },
      about: { "@id": `${SITE.url}/#organization` },
      publisher: { "@id": `${SITE.url}/#organization` },
      breadcrumb: { "@id": `${pageBase}#breadcrumb` },
      image: SITE.image,
      inLanguage: "en-LK",
    },
  ];

  if (key === "home") {
    graph.push({
      "@type": "ProfessionalService",
      "@id": `${SITE.url}/#service-business`,
      name: SITE.name,
      url: `${SITE.url}/`,
      image: SITE.image,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Colombo",
        addressCountry: "LK",
      },
      areaServed: [{ "@type": "Country", name: "Sri Lanka" }, { "@type": "Place", name: "Global" }],
      serviceType: seoConfig.services.map((service) => service.name),
    });
  }

  if (key === "faq") {
    graph.at(-1).mainEntity = seoConfig.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }));
  }

  if (key === "case-studies") {
    graph.push({
      "@type": "ItemList",
      "@id": `${canonical}#case-study-list`,
      name: "Ardeno Studio case studies",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Humble Beginnings",
          url: `${SITE.url}/case-studies/humble-beginnings`,
        },
      ],
    });
  }

  if (key === "cs-humble-beginnings") {
    graph.push({
      "@type": "Article",
      "@id": `${canonical}#article`,
      headline: "Humble Beginnings",
      description: route.description,
      image: SITE.image,
      author: { "@id": `${SITE.url}/#organization` },
      publisher: { "@id": `${SITE.url}/#organization` },
      datePublished: "2026-05-28",
      dateModified: "2026-05-28",
      mainEntityOfPage: { "@id": `${pageBase}#webpage` },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};

const applySeo = (html, key, route) => {
  const canonical = absoluteUrl(route.path);
  const escapedTitle = escapeAttr(route.title);
  const escapedDescription = escapeAttr(route.description);
  const type = route.type === "article" ? "article" : "website";
  const jsonLd = JSON.stringify(buildStructuredData(key, route));

  let next = html.replace(/<title>.*?<\/title>/is, `<title>${escapedTitle}</title>`);
  next = upsert(next, tagPatterns.description, `<meta name="description" content="${escapedDescription}" />`);
  next = upsert(next, tagPatterns.keywords, `<meta name="keywords" content="${escapeAttr(route.keywords.join(", "))}" />`);
  next = upsert(next, tagPatterns.robots, `<meta name="robots" content="index, follow, max-image-preview:large" />`);
  next = upsert(next, tagPatterns.canonical, `<link rel="canonical" href="${canonical}" />`);
  next = upsert(next, tagPatterns.ogSiteName, `<meta property="og:site_name" content="${escapeAttr(SITE.name)}" />`);
  next = upsert(next, tagPatterns.ogTitle, `<meta property="og:title" content="${escapedTitle}" />`);
  next = upsert(next, tagPatterns.ogDescription, `<meta property="og:description" content="${escapedDescription}" />`);
  next = upsert(next, tagPatterns.ogImage, `<meta property="og:image" content="${SITE.image}" />`);
  next = upsert(next, tagPatterns.ogUrl, `<meta property="og:url" content="${canonical}" />`);
  next = upsert(next, tagPatterns.ogType, `<meta property="og:type" content="${type}" />`);
  next = upsert(next, tagPatterns.twitterTitle, `<meta name="twitter:title" content="${escapedTitle}" />`);
  next = upsert(next, tagPatterns.twitterDescription, `<meta name="twitter:description" content="${escapedDescription}" />`);
  next = upsert(next, tagPatterns.twitterImage, `<meta name="twitter:image" content="${SITE.image}" />`);
  next = next.replace(
    /<script\s+id="structured-data"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="structured-data" type="application/ld+json">${jsonLd}</script>`
  );
  return next;
};

const html = await fs.readFile(INDEX, "utf8");

await fs.writeFile(INDEX, applySeo(html, "home", seoConfig.routes.home));

for (const [key, route] of Object.entries(seoConfig.routes)) {
  if (key === "home" || route.path.endsWith(".html")) continue;
  const routeDir = path.join(DIST, route.path.replace(/^\//, ""));
  await fs.mkdir(routeDir, { recursive: true });
  await fs.writeFile(path.join(routeDir, "index.html"), applySeo(html, key, route));
}

console.log("Generated static SEO route shells.");
