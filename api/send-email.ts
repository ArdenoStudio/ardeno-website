import {
  asString,
  checkRateLimit,
  escapeHtml,
  getClientIp,
  isAllowedOrigin,
  isPlainObject,
  optionalString,
  sanitizeSubject,
  setApiHeaders,
  verifyTurnstile,
  type ApiRequest,
  type ApiResponse,
} from '../server/request-security.js';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_BODY_SIZE = 16_000;

type LeadPayload = {
  name: string;
  email: string;
  company: string;
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
  const budget = optionalString(body.budget, 80);
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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setApiHeaders(res);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: 'Request origin is not allowed.' });
  }

  if (!isPlainObject(req.body) || JSON.stringify(req.body).length > MAX_BODY_SIZE) {
    return res.status(400).json({ error: 'Invalid request body.' });
  }

  if (asString(req.body.website, 200)) {
    return res.status(200).json({ success: true });
  }

  const lead = parseLead(req.body);
  if (!lead) {
    return res.status(400).json({ error: 'Please check your details and try again.' });
  }

  const ip = getClientIp(req);
  const minuteRate = await checkRateLimit({
    key: `lead:minute:${ip}`,
    limit: 3,
    windowMs: 60_000,
  });

  const hourRate = await checkRateLimit({
    key: `lead:hour:${ip}`,
    limit: 12,
    windowMs: 60 * 60_000,
  });

  if (!minuteRate.allowed || !hourRate.allowed) {
    res.setHeader('Retry-After', String(Math.max(minuteRate.retryAfter, hourRate.retryAfter)));
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const challenge = await verifyTurnstile(lead.turnstileToken, ip);
  if (!challenge.ok) {
    return res.status(400).json({ error: 'Please complete the verification and try again.' });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return res.status(500).json({ error: 'Contact service is not configured.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'Ardeno Studio <onboarding@resend.dev>',
        to: [process.env.ADMIN_EMAIL || 'ardenostudio@gmail.com'],
        subject: sanitizeSubject(`New Ardeno inquiry from ${lead.name}`),
        html: leadHtml(lead),
        reply_to: lead.email,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      console.error('Resend Error:', {
        status: response.status,
        name: data?.name,
        message: data?.message,
      });
      return res.status(502).json({ error: 'Could not send your enquiry right now.' });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('Lead route failed:', { message });
    return res.status(500).json({ error: 'Could not send your enquiry right now.' });
  }
}
