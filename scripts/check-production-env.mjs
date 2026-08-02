import fs from 'node:fs';
import path from 'node:path';

const envFile = process.argv[2] || '.vercel/.env.production.local';
const requiredOrigins = ['https://www.ardenostudio.online', 'https://ardenostudio.online'];

const parseEnvFile = (filePath) => {
  if (!fs.existsSync(filePath)) return {};

  const values = {};
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line;
    const separator = normalized.indexOf('=');
    if (separator <= 0) continue;

    const key = normalized.slice(0, separator).trim();
    let value = normalized.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
};

const fileValues = parseEnvFile(path.resolve(envFile));
const env = { ...process.env, ...fileValues };

const missing = [];
const invalid = [];

const requireValue = (name) => {
  if (!env[name] || !String(env[name]).trim()) missing.push(name);
};

const requireEmail = (name) => {
  requireValue(name);
  if (env[name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env[name])) {
    invalid.push(`${name} must be a valid email address`);
  }
};

const requireHttpsUrl = (name) => {
  requireValue(name);
  if (!env[name]) return;

  try {
    const url = new URL(env[name]);
    if (url.protocol !== 'https:') invalid.push(`${name} must use https`);
  } catch {
    invalid.push(`${name} must be a valid URL`);
  }
};

requireValue('GROQ_API_KEY');
requireValue('RESEND_API_KEY');
requireValue('RESEND_FROM');
requireEmail('ADMIN_EMAIL');
requireValue('ALLOWED_ORIGINS');
requireValue('TURNSTILE_SECRET_KEY');
requireValue('VITE_TURNSTILE_SITE_KEY');
requireHttpsUrl('UPSTASH_REDIS_REST_URL');
requireValue('UPSTASH_REDIS_REST_TOKEN');

if (env.RESEND_FROM && /onboarding@resend\.dev/i.test(env.RESEND_FROM)) {
  invalid.push('RESEND_FROM must not use the Resend onboarding sender in production');
}

if (env.ALLOWED_ORIGINS) {
  const origins = env.ALLOWED_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
  if (origins.some((origin) => origin === '*')) invalid.push('ALLOWED_ORIGINS must not contain a wildcard');

  for (const origin of requiredOrigins) {
    if (!origins.includes(origin)) invalid.push(`ALLOWED_ORIGINS must include ${origin}`);
  }
}

if (missing.length || invalid.length) {
  console.error('Production environment check failed.');
  if (missing.length) {
    console.error(`Missing variables: ${missing.join(', ')}`);
  }
  for (const issue of invalid) {
    console.error(`Invalid variable: ${issue}`);
  }
  process.exit(1);
}

console.log('Production environment check passed.');
