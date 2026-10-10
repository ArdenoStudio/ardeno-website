/**
 * POST /api/chat — Cloudflare Pages Function.
 *
 * Worker-port of the Vercel-style api/chat.ts handler: same validation,
 * rate limits, and Groq-backed Ardeno AI completion.
 * Missing GROQ_API_KEY returns an honest 503 (never fake success) — the
 * widget surfaces its "Connection issue" state in that case.
 */
import { ARDENO_AI_CONTEXT } from '../../ardeno-ai-context.js';
import { ARDENO_AI_PROMPT } from '../../ardeno-ai-prompt.js';
import {
  asString,
  checkRateLimit,
  getClientIp,
  isAllowedOrigin,
  isPlainObject,
  json,
  type PagesFunctionContext,
} from '../_lib/security';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const MAX_BODY_SIZE = 12_000;
const MAX_MESSAGE_LENGTH = 1_200;
const MAX_HISTORY_MESSAGES = 10;
const GROQ_TIMEOUT_MS = 12_000;

const parseMessages = (body: Record<string, unknown>) => {
  const message = asString(body.message, MAX_MESSAGE_LENGTH);
  if (!message) return null;

  const history = Array.isArray(body.history) ? body.history : [];
  const safeHistory: ChatMessage[] = [];

  for (const entry of history.slice(-MAX_HISTORY_MESSAGES)) {
    if (!isPlainObject(entry)) continue;
    if (entry.role !== 'user' && entry.role !== 'assistant') continue;

    const content = asString(entry.content, MAX_MESSAGE_LENGTH);
    if (!content) continue;
    safeHistory.push({ role: entry.role, content });
  }

  return { message, history: safeHistory };
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

  const ip = getClientIp(request);
  const rate = await checkRateLimit(env, {
    key: `chat:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    return json({ error: 'Too many requests. Please try again shortly.' }, 429, {
      'Retry-After': String(rate.retryAfter),
    });
  }

  const parsed = parseMessages(body);
  if (!parsed) {
    return json({ error: 'A valid message is required.' }, 400);
  }

  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    // Honest failure: the widget surfaces its "Connection issue" state.
    return json(
      { error: 'AI service is not configured.', code: 'AI_NOT_CONFIGURED' },
      503
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.45,
        max_tokens: 700,
        top_p: 0.95,
        messages: [
          { role: 'system', content: `${ARDENO_AI_PROMPT}\n\n${ARDENO_AI_CONTEXT}` },
          ...parsed.history,
          { role: 'user', content: parsed.message },
        ],
      }),
    });

    const data = (await response.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: { type?: string; code?: string };
    } | null;

    if (!response.ok) {
      console.error('Groq API error:', {
        status: response.status,
        type: data?.error?.type,
        code: data?.error?.code,
      });
      return json({ error: 'AI service is temporarily unavailable.' }, 502);
    }

    const content =
      data?.choices?.[0]?.message?.content?.trim() || 'No response generated. Please try again.';
    return json({ content });
  } catch (error) {
    console.error('AI route failed:', {
      message: error instanceof Error ? error.message : 'unknown',
    });
    return json({ error: 'AI service is temporarily unavailable.' }, 500);
  } finally {
    clearTimeout(timeout);
  }
}

export function onRequestGet() {
  return json({ error: 'Method not allowed' }, 405);
}
