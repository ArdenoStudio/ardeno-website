type HeaderValue = string | string[] | undefined;

export type ApiRequest = {
  method?: string;
  headers: Record<string, HeaderValue>;
  body?: unknown;
  socket?: {
    remoteAddress?: string;
  };
};

export type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => {
    json: (body: unknown) => unknown;
  };
};

type RateWindow = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  key: string;
  limit: number;
  windowMs: number;
};

const rateStore = new Map<string, RateWindow>();

const defaultOrigins = [
  'https://www.ardenostudio.online',
  'https://ardenostudio.online',
  'https://ardeno-studio-website.vercel.app',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  'http://127.0.0.1:5173',
];

const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

export const setApiHeaders = (res: ApiResponse) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Origin');
};

export const getClientIp = (req: ApiRequest) => {
  const forwarded = req.headers['x-forwarded-for'];
  const firstForwarded = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  if (firstForwarded) return firstForwarded.split(',')[0].trim();

  const realIp = req.headers['x-real-ip'];
  if (Array.isArray(realIp)) return realIp[0] || 'unknown';
  return realIp || req.socket?.remoteAddress || 'unknown';
};

export const isAllowedOrigin = (req: ApiRequest) => {
  const origin = req.headers.origin;
  if (!origin) return true;
  return typeof origin === 'string' && allowedOrigins.has(origin);
};

const upstashCommand = async (command: string, key: string, ...args: Array<string | number>) => {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const response = await fetch(`${url}/${command}/${encodeURIComponent(key)}${args.length ? `/${args.join('/')}` : ''}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error(`Rate limit store failed with ${response.status}`);
  return response.json() as Promise<{ result?: unknown }>;
};

export const checkRateLimit = async ({ key, limit, windowMs }: RateLimitOptions) => {
  try {
    const increment = await upstashCommand('incr', key);
    if (increment) {
      const count = Number(increment.result || 0);
      if (count === 1) {
        await upstashCommand('expire', key, Math.ceil(windowMs / 1000));
      }
      return {
        allowed: count <= limit,
        retryAfter: count <= limit ? 0 : Math.max(1, Math.ceil(windowMs / 1000)),
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('Rate limit store unavailable:', { message });
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

export const asString = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) return null;
  return trimmed;
};

export const optionalString = (value: unknown, maxLength: number) => {
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

export const verifyTurnstile = async (token: string | undefined, remoteIp: string) => {
  const secret = process.env.TURNSTILE_SECRET_KEY;
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

  const data = await response.json().catch(() => ({}));
  return { ok: Boolean(data?.success), configured: true };
};
