import fs from "node:fs/promises";
import path from "node:path";

const seoConfig = JSON.parse(await fs.readFile(path.resolve("seo-routes.json"), "utf8"));
const distDir = path.resolve("dist");

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const readRouteHtml = async (route) => {
  if (route.path === "/") return fs.readFile(path.join(distDir, "index.html"), "utf8");
  if (route.path.endsWith(".html")) return fs.readFile(path.join(distDir, route.path), "utf8");
  return fs.readFile(path.join(distDir, route.path.replace(/^\//, ""), "index.html"), "utf8");
};

const getTag = (html, pattern) => {
  const match = html.match(pattern);
  return match?.[1] ?? "";
};

const getVisibleText = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

for (const [key, route] of Object.entries(seoConfig.routes)) {
  const html = await readRouteHtml(route);
  const canonical = `${seoConfig.site.url}${route.path}`;
  const title = getTag(html, /<title>(.*?)<\/title>/is).trim();
  const description = getTag(html, /<meta\s+name="description"\s+content="([^"]*)"\s*\/?>/i);
  const canonicalTag = getTag(html, /<link\s+rel="canonical"\s+href="([^"]*)"\s*\/?>/i);
  const ogUrl = getTag(html, /<meta\s+property="og:url"\s+content="([^"]*)"\s*\/?>/i);
  const jsonLd = getTag(
    html,
    /<script\s+id="structured-data"\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i
  );
  const visibleText = getVisibleText(html);

  assert(title === route.title, `${key}: title mismatch`);
  assert(description === route.description, `${key}: description mismatch`);
  assert(canonicalTag === canonical, `${key}: canonical mismatch`);
  assert(ogUrl === canonical, `${key}: og:url mismatch`);
  assert(jsonLd, `${key}: missing structured data`);
  assert(visibleText.length >= 1200, `${key}: static HTML body is too thin (${visibleText.length} chars)`);
  if (!route.path.endsWith(".html")) {
    assert(html.includes("data-static-content"), `${key}: missing crawlable static content block`);
  }
  JSON.parse(jsonLd);
}

const sitemap = await fs.readFile(path.resolve("public/sitemap.xml"), "utf8");
for (const route of Object.values(seoConfig.routes)) {
  const loc = `${seoConfig.site.url}${route.path}`;
  assert(sitemap.includes(loc), `sitemap missing ${route.path}`);
  const urlBlock = sitemap.match(new RegExp(`<url>\\s*<loc>${loc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}</loc>[\\s\\S]*?</url>`))?.[0] ?? "";
  assert(urlBlock, `sitemap block missing for ${route.path}`);
  assert(urlBlock.includes(`<lastmod>${route.lastmod}</lastmod>`), `sitemap lastmod mismatch for ${route.path}`);
  assert(urlBlock.includes(`<changefreq>${route.changefreq}</changefreq>`), `sitemap changefreq mismatch for ${route.path}`);
  assert(urlBlock.includes(`<priority>${route.priority}</priority>`), `sitemap priority mismatch for ${route.path}`);
}

const robots = await fs.readFile(path.resolve("public/robots.txt"), "utf8");
assert(robots.includes("Sitemap: https://www.ardenostudio.online/sitemap.xml"), "robots missing sitemap");
assert(robots.includes("User-agent: GPTBot"), "robots missing AI crawler allowlist");

const vercel = JSON.parse(await fs.readFile(path.resolve("vercel.json"), "utf8"));
const rewrites = vercel.rewrites ?? [];
for (const route of Object.values(seoConfig.routes)) {
  if (route.path === "/" || route.path.endsWith(".html")) continue;
  assert(
    rewrites.some((rewrite) => rewrite.source === route.path && rewrite.destination === `${route.path}/index.html`),
    `vercel rewrite missing for ${route.path}`
  );
}

const llms = await fs.readFile(path.resolve("public/llms.txt"), "utf8");
assert(llms.startsWith("# Ardeno Studio"), "llms.txt missing title");
assert(llms.includes("https://www.ardenostudio.online/case-studies/humble-beginnings"), "llms.txt missing case-study route");

console.log("SEO checks passed.");
