/**
 * Shared request-security helpers for Cloudflare Pages Functions.
 * Worker-port of server/request-security.ts (Node) — same semantics,
 * adapted to the Workers runtime: env bindings instead of process.env,
 * cf-connecting-ip instead of socket.remoteAddress.
 */

export interface PagesEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  ADMIN_EMAIL?: string;
  GROQ_API_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
  ALLOWED_ORIGINS?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  [key: string]: string | undefined;
}

export interface PagesFunctionContext {
  request: Request;
  env: PagesEnv;
}

const defaultOrigins = [
  'https://ardenostudio.com',
  'https://www.ardenostudio.com',
  'https://www.ardenostudio.online',
  'https://ardenostudio.online',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
];

const getAllowedOrigins = (env: PagesEnv) => {
  const configured = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  return new Set([...defaultOrigins, ...configured]);
};

export const isAllowedOrigin = (request: Request, env: PagesEnv) => {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  return getAllowedOrigins(env).has(origin);
};

export const getClientIp = (request: Request) => {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = request.headers.get('x-real-ip');
  return realIp || 'unknown';
};

type RateWindow = {
  count: number;
  resetAt: number;
};

// Per-isolate in-memory fallback. On Cloudflare this is best-effort (isolates
// don't share state); configure UPSTASH_* for a global rate-limit store.
const rateStore = new Map<string, RateWindow>();

const upstashCommand = async (
  env: PagesEnv,
  command: string,
  key: string,
  ...args: Array<string | number>
) => {
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(
    `${url}/${command}/${encodeURIComponent(key)}${args.length ? `/${args.join('/')}` : ''}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) throw new Error(`Rate limit store failed with ${response.status}`);
  return (await response.json()) as { result?: unknown };
};

export const checkRateLimit = async (
  env: PagesEnv,
  { key, limit, windowMs }: { key: string; limit: number; windowMs: number }
) => {
  try {
    const increment = await upstashCommand(env, 'incr', key);
    if (increment) {
      const count = Number(increment.result || 0);
      if (count === 1) {
        await upstashCommand(env, 'expire', key, Math.ceil(windowMs / 1000));
      }
      return {
        allowed: count <= limit,
        retryAfter: count <= limit ? 0 : Math.max(1, Math.ceil(windowMs / 1000)),
      };
    }
  } catch (error) {
    console.error('Rate limit store unavailable:', error instanceof Error ? error.message : 'unknown');
  }

  const now = Date.now();
  const current = rateStore.get(key);

  if (!current || current.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfter: 0 };
};

export const asString = (value: unknown, maxLength: number): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
};

export const optionalString = (value: unknown, maxLength: number): string | null => {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length > maxLength) return null;
  return trimmed;
};

export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

export const sanitizeSubject = (value: string) => {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 140);
};

export const verifyTurnstile = async (
  token: string | undefined,
  remoteIp: string,
  env: PagesEnv
) => {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, configured: false };
  if (!token) return { ok: false, configured: true };

  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (remoteIp !== 'unknown') form.append('remoteip', remoteIp);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });

  const data = (await response.json().catch(() => ({}))) as { success?: unknown };
  return { ok: Boolean(data?.success), configured: true };
};

/** JSON response with the API's standard hardening headers. Never fakes success. */
export const json = (
  body: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      Vary: 'Origin',
      ...extraHeaders,
    },
  });
