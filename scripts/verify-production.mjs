const baseUrl = process.argv[2] || 'https://www.ardenostudio.online';
const origin = baseUrl.replace(/\/$/, '');

const failures = [];

const requireHeader = (headers, name) => {
  const value = headers.get(name);
  if (!value) failures.push(`Missing header: ${name}`);
  return value || '';
};

const getText = async (path) => {
  const response = await fetch(`${origin}${path}`, {
    headers: {
      'User-Agent': 'ArdenoProductionVerifier/1.0',
    },
  });
  const text = await response.text();
  return { response, text };
};

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const home = await getText('/');
assert(home.response.status === 200, `Home returned ${home.response.status}`);

const csp = requireHeader(home.response.headers, 'content-security-policy');
requireHeader(home.response.headers, 'x-content-type-options');
requireHeader(home.response.headers, 'x-frame-options');
requireHeader(home.response.headers, 'referrer-policy');
requireHeader(home.response.headers, 'permissions-policy');

assert(csp.includes("default-src 'self'"), 'CSP default-src self is missing');
assert(csp.includes("frame-ancestors 'none'"), 'CSP frame-ancestors none is missing');
assert(csp.includes('challenges.cloudflare.com'), 'CSP Turnstile allowance is missing');
assert(!home.text.includes('googletagmanager.com/gtag/js'), 'Google tag script is loaded in static HTML before consent');

const robots = await getText('/robots.txt');
assert(robots.response.status === 200, `robots.txt returned ${robots.response.status}`);
assert((robots.response.headers.get('content-type') || '').includes('text/plain'), 'robots.txt is not text/plain');
assert(robots.text.startsWith('User-agent: *'), 'robots.txt does not start with User-agent');
assert(!robots.text.includes('<!DOCTYPE html>'), 'robots.txt is returning SPA HTML');

const sitemap = await getText('/sitemap.xml');
assert(sitemap.response.status === 200, `sitemap.xml returned ${sitemap.response.status}`);
assert((sitemap.response.headers.get('content-type') || '').includes('xml'), 'sitemap.xml is not XML');
assert(sitemap.text.includes('<urlset'), 'sitemap.xml is missing urlset');
assert(sitemap.text.includes('https://www.ardenostudio.online/'), 'sitemap.xml is missing homepage URL');
assert(!sitemap.text.includes('<!DOCTYPE html>'), 'sitemap.xml is returning SPA HTML');

const llms = await getText('/llms.txt');
assert(llms.response.status === 200, `llms.txt returned ${llms.response.status}`);
assert((llms.response.headers.get('content-type') || '').includes('text/plain'), 'llms.txt is not text/plain');
assert(llms.text.startsWith('# Ardeno Studio'), 'llms.txt does not describe Ardeno Studio');
assert(!llms.text.includes('<!DOCTYPE html>'), 'llms.txt is returning SPA HTML');

const blockedOrigin = 'https://example.invalid';
for (const path of ['/api/chat', '/api/send-email']) {
  const response = await fetch(`${origin}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: blockedOrigin,
    },
    body: JSON.stringify({ message: 'test' }),
  });

  assert(response.status === 403, `${path} did not reject a disallowed Origin with 403`);
}

if (failures.length) {
  console.error('Production verification failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Production verification passed for ${origin}`);
