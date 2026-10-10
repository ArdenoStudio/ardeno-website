/**
 * POST /api/send-email — Cloudflare Pages Function.
 *
 * Worker-port of the Vercel-style api/send-email.ts handler: same validation,
 * honeypot, Turnstile verification, rate limits, and Resend delivery.
 * Missing RESEND_API_KEY returns an honest 503 (never fake success) — the
 * client shows its error state + mailto fallback in that case.
 */
import {
  asString,
  checkRateLimit,
  escapeHtml,
  getClientIp,
  isAllowedOrigin,
  isPlainObject,
  json,
  optionalString,
  sanitizeSubject,
  verifyTurnstile,
  type PagesFunctionContext,
} from '../_lib/security';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BODY_SIZE = 16_000;

type LeadPayload = {
  name: string;
  email: string;
  company: string;
  phone: string;
  budget: string;
  message: string;
  pagePath: string;
  pageUrl: string;
  referrer: string;
  submittedAt: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  turnstileToken?: string;
};

const parseLead = (body: Record<string, unknown>): LeadPayload | null => {
  const name = asString(body.name, 80);
  const email = asString(body.email, 254);
  const message = asString(body.message, 4_000);
  const company = optionalString(body.company, 120);
  const phone = optionalString(body.phone, 80);
  const budget = optionalString(body.budget, 100);
  const pagePath = optionalString(body.page_path, 200);
  const pageUrl = optionalString(body.page_url, 500);
  const referrer = optionalString(body.referrer, 500);
  const submittedAt = optionalString(body.submitted_at, 80);
  const utmSource = optionalString(body.utm_source, 120);
  const utmMedium = optionalString(body.utm_medium, 120);
  const utmCampaign = optionalString(body.utm_campaign, 160);
  const turnstileToken = optionalString(body.turnstileToken, 2_000);

  if (!name || !email || !message || !emailPattern.test(email)) return null;
  if (
    company === null ||
    phone === null ||
    budget === null ||
    pagePath === null ||
    pageUrl === null ||
    referrer === null ||
    submittedAt === null ||
    utmSource === null ||
    utmMedium === null ||
    utmCampaign === null ||
    turnstileToken === null
  ) {
    return null;
  }

  return {
    name,
    email,
    company,
    phone,
    budget,
    message,
    pagePath,
    pageUrl,
    referrer,
    submittedAt,
    utmSource,
    utmMedium,
    utmCampaign,
    turnstileToken: turnstileToken || undefined,
  };
};

const leadHtml = (lead: LeadPayload) => {
  const lines = escapeHtml(lead.message).replace(/\n/g, '<br/>');
  const metaRows = [
    ['Company', lead.company || 'Not provided'],
    ['Phone / WhatsApp', lead.phone || 'Not specified'],
    ['Budget', lead.budget || 'Not specified'],
    ['Page', lead.pagePath || 'Unknown'],
    ['Page URL', lead.pageUrl || 'Unknown'],
    ['Referrer', lead.referrer || 'direct'],
    ['UTM Source', lead.utmSource || 'direct'],
    ['UTM Medium', lead.utmMedium || 'none'],
    ['UTM Campaign', lead.utmCampaign || 'none'],
    ['Submitted At', lead.submittedAt || new Date().toISOString()],
  ];

  const meta = metaRows
    .map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`)
    .join('');

  return `
    <div style="font-family: sans-serif; padding: 20px; color: #111;">
      <h2>New Ardeno Website Enquiry</h2>
      <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
      ${meta}
      <p><strong>Message:</strong></p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
        ${lines}
      </div>
    </div>
  `;
};

export async function onRequestPost(context: PagesFunctionContext) {
  const { request, env } = context;

  if (!isAllowedOrigin(request, env)) {
    return json({ error: 'Request origin is not allowed.' }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  if (!isPlainObject(body) || JSON.stringify(body).length > MAX_BODY_SIZE) {
    return json({ error: 'Invalid request body.' }, 400);
  }

  // Honeypot: bots fill the hidden `website` field. Swallow silently.
  if (asString(body.website, 200)) {
    return json({ success: true });
  }

  const lead = parseLead(body);
  if (!lead) {
    return json({ error: 'Please check your details and try again.' }, 400);
  }

  const ip = getClientIp(request);
  const minuteRate = await checkRateLimit(env, {
    key: `lead:minute:${ip}`,
    limit: 3,
    windowMs: 60_000,
  });

  const hourRate = await checkRateLimit(env, {
    key: `lead:hour:${ip}`,
    limit: 12,
    windowMs: 60 * 60_000,
  });

  if (!minuteRate.allowed || !hourRate.allowed) {
    return json({ error: 'Too many requests. Please try again later.' }, 429, {
      'Retry-After': String(Math.max(minuteRate.retryAfter, hourRate.retryAfter)),
    });
  }

  const challenge = await verifyTurnstile(lead.turnstileToken, ip, env);
  if (!challenge.ok) {
    return json({ error: 'Please complete the verification and try again.' }, 400);
  }

  const resendKey = env.RESEND_API_KEY;
  if (!resendKey) {
    // Honest failure: the client surfaces its error state + mailto fallback.
    return json(
      { error: 'Contact service is not configured.', code: 'EMAIL_NOT_CONFIGURED' },
      503
    );
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || 'Ardeno Studio <onboarding@resend.dev>',
        to: [env.ADMIN_EMAIL || 'hello@ardenostudio.com'],
        subject: sanitizeSubject(`New Ardeno inquiry from ${lead.name}`),
        html: leadHtml(lead),
        reply_to: lead.email,
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      name?: string;
      message?: string;
    } | null;

    if (response.ok) {
      return json({ success: true });
    }

    console.error('Resend Error:', {
      status: response.status,
      name: data?.name,
      message: data?.message,
    });
    return json({ error: 'Could not send your enquiry right now.' }, 502);
  } catch (error) {
    console.error('Lead route failed:', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return json({ error: 'Could not send your enquiry right now.' }, 500);
  }
}

export function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
