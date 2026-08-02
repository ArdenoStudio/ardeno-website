import seoConfig from "./seo-routes.json";

export type SeoRouteKey = keyof typeof seoConfig.routes;

type SeoRoute = (typeof seoConfig.routes)[SeoRouteKey];

const SITE = seoConfig.site;
const ABSOLUTE_URL_RE = /^https?:\/\//i;

export const SEO_ROUTES = seoConfig.routes;
export const SEO_SITE = SITE;

export const absoluteUrl = (pathOrUrl: string): string => {
  if (ABSOLUTE_URL_RE.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE.url}${path}`;
};

export const getRouteSeo = (route: SeoRouteKey): SeoRoute => SEO_ROUTES[route] ?? SEO_ROUTES.home;

const setMeta = (selector: string, attrs: Record<string, string>) => {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }

  Object.entries(attrs).forEach(([key, value]) => tag?.setAttribute(key, value));
};

const setLink = (rel: string, href: string) => {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = rel;
    document.head.appendChild(tag);
  }
  tag.href = href;
};

export const buildStructuredData = (route: SeoRouteKey) => {
  const seo = getRouteSeo(route);
  const canonical = absoluteUrl(seo.path);
  const pageId = `${canonical.replace(/\/$/, "")}#webpage`;
  const breadcrumbItems = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${SITE.url}/`,
    },
  ];

  if (seo.path !== "/") {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 2,
      name: seo.title.split("|")[0].trim(),
      item: canonical,
    });
  }

  const pageType = route === "case-studies" ? "CollectionPage" : route === "faq" ? "FAQPage" : "WebPage";
  const pageName = seo.title.split("|")[0].trim();
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      alternateName: SITE.alternateName,
      url: `${SITE.url}/`,
      logo: {
        "@type": "ImageObject",
        url: SITE.logo,
      },
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
      "@id": `${canonical.replace(/\/$/, "")}#breadcrumb`,
      itemListElement: breadcrumbItems,
    },
    {
      "@type": pageType,
      "@id": pageId,
      url: canonical,
      name: seo.title,
      description: seo.description,
      isPartOf: { "@id": `${SITE.url}/#website` },
      about: { "@id": `${SITE.url}/#organization` },
      publisher: { "@id": `${SITE.url}/#organization` },
      breadcrumb: { "@id": `${canonical.replace(/\/$/, "")}#breadcrumb` },
      image: SITE.image,
      inLanguage: "en-LK",
    },
  ];

  if (route === "home") {
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
      areaServed: [
        { "@type": "Country", name: "Sri Lanka" },
        { "@type": "Place", name: "Global" },
      ],
      serviceType: seoConfig.services.map((service) => service.name),
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Ardeno Studio services",
        itemListElement: seoConfig.services.map((service, index) => ({
          "@type": "Offer",
          position: index + 1,
          itemOffered: {
            "@type": "Service",
            name: service.name,
            description: service.description,
            url: service.url,
            provider: { "@id": `${SITE.url}/#organization` },
            areaServed: "Sri Lanka",
          },
        })),
      },
    });
  }

  if (route === "faq") {
    const faqPage = graph.find((item) => item["@type"] === "FAQPage");
    if (faqPage) {
      faqPage.mainEntity = seoConfig.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      }));
    }
  }

  if (route === "case-studies") {
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

  if (seo.type === "service") {
    graph.push({
      "@type": "Service",
      "@id": `${canonical.replace(/\/$/, "")}#service`,
      name: pageName,
      description: seo.description,
      url: canonical,
      provider: { "@id": `${SITE.url}/#organization` },
      areaServed: [
        { "@type": "Country", name: "Sri Lanka" },
        { "@type": "Place", name: "Global" },
      ],
      serviceType: pageName,
      mainEntityOfPage: { "@id": pageId },
    });
  }

  if (seo.type === "article") {
    const datePublished =
      route === "cs-humble-beginnings"
        ? "2026-05-28"
        : ("datePublished" in seo && typeof seo.datePublished === "string" && seo.datePublished) ||
          seo.lastmod ||
          "2026-01-01";
    const dateModified = seo.lastmod || datePublished;
    graph.push({
      "@type": "Article",
      "@id": `${canonical}#article`,
      headline: pageName,
      description: seo.description,
      image: SITE.image,
      author: { "@id": `${SITE.url}/#organization` },
      publisher: { "@id": `${SITE.url}/#organization` },
      datePublished,
      dateModified,
      mainEntityOfPage: { "@id": pageId },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};

export const applySeoToDocument = (route: SeoRouteKey) => {
  const seo = getRouteSeo(route);
  const canonical = absoluteUrl(seo.path);
  const image = SITE.image;

  document.title = seo.title;
  setMeta('meta[name="description"]', { name: "description", content: seo.description });
  setMeta('meta[name="keywords"]', { name: "keywords", content: seo.keywords.join(", ") });
  setMeta('meta[name="robots"]', { name: "robots", content: "index, follow, max-image-preview:large" });
  setMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE.name });
  setMeta('meta[property="og:title"]', { property: "og:title", content: seo.title });
  setMeta('meta[property="og:description"]', { property: "og:description", content: seo.description });
  setMeta('meta[property="og:image"]', { property: "og:image", content: image });
  setMeta('meta[property="og:url"]', { property: "og:url", content: canonical });
  setMeta('meta[property="og:type"]', { property: "og:type", content: seo.type === "article" ? "article" : "website" });
  if (seo.type === "article") {
    const published =
      route === "cs-humble-beginnings"
        ? "2026-05-28"
        : ("datePublished" in seo && typeof seo.datePublished === "string" && seo.datePublished) ||
          seo.lastmod ||
          "2026-01-01";
    setMeta('meta[property="article:published_time"]', { property: "article:published_time", content: published });
    setMeta('meta[property="article:modified_time"]', {
      property: "article:modified_time",
      content: seo.lastmod || published,
    });
  }
  setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: seo.title });
  setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: seo.description });
  setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
  setLink("canonical", canonical);

  let jsonLd = document.getElementById("structured-data") as HTMLScriptElement | null;
  if (!jsonLd) {
    jsonLd = document.createElement("script");
    jsonLd.id = "structured-data";
    jsonLd.type = "application/ld+json";
    document.head.appendChild(jsonLd);
  }
  jsonLd.textContent = JSON.stringify(buildStructuredData(route));
};
