import { ARDENO_AI_CONTEXT } from '../ardeno-ai-context';
import { ARDENO_AI_PROMPT } from '../ardeno-ai-prompt';
import {
  asString,
  checkRateLimit,
  getClientIp,
  isAllowedOrigin,
  isPlainObject,
  setApiHeaders,
  type ApiRequest,
  type ApiResponse,
} from '../server/request-security';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const MAX_BODY_SIZE = 12_000;
const MAX_MESSAGE_LENGTH = 1_200;
const MAX_HISTORY_MESSAGES = 10;

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

  const ip = getClientIp(req);
  const rate = await checkRateLimit({
    key: `chat:${ip}`,
    limit: 10,
    windowMs: 60_000,
  });

  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfter));
    return res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
  }

  const parsed = parseMessages(req.body);
  if (!parsed) {
    return res.status(400).json({ error: 'A valid message is required.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'AI service is not configured.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
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

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', {
        status: response.status,
        type: data?.error?.type,
        code: data?.error?.code,
      });
      return res.status(502).json({ error: 'AI service is temporarily unavailable.' });
    }

    const content = data?.choices?.[0]?.message?.content?.trim() || 'No response generated. Please try again.';
    return res.status(200).json({ content });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown';
    console.error('AI route failed:', { message });
    return res.status(500).json({ error: 'AI service is temporarily unavailable.' });
  } finally {
    clearTimeout(timeout);
  }
}
