// ---------------------------------------------------------------------------
// Petpooja HTTP Client
// ---------------------------------------------------------------------------
// All outbound calls to Petpooja route through petpoojaPost().
// - 5xx responses are retried with exponential backoff (max 3 attempts).
// - Full request and response are logged for every call.
// - Auth credentials are read from env vars and injected by getPetpoojaAuth().
// ---------------------------------------------------------------------------

import type { PetpoojaErrorPayload } from './types';

// Sandbox and production share the same URL structure; environment is
// determined solely by the credentials in .env.local.
const BASE_URL =
  process.env.PETPOOJA_API_BASE ??
  'https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1';

// ---------------------------------------------------------------------------
// Error class
// ---------------------------------------------------------------------------

export class PetpoojaError extends Error {
  readonly httpStatus: number;
  readonly body: unknown;

  constructor(httpStatus: number, body: unknown) {
    // Surface Petpooja's own error message when available
    const msg =
      typeof body === 'object' && body !== null && 'message' in body
        ? String((body as Record<string, unknown>).message)
        : `Petpooja API error (HTTP ${httpStatus})`;
    super(msg);
    this.name = 'PetpoojaError';
    this.httpStatus = httpStatus;
    this.body = body;
  }

  toPayload(): PetpoojaErrorPayload {
    return { httpStatus: this.httpStatus, body: this.body };
  }
}

// ---------------------------------------------------------------------------
// HTTP client
// ---------------------------------------------------------------------------

/**
 * POST to a Petpooja endpoint with exponential-backoff retry on 5xx.
 *
 * @param path    API path, e.g. "/save_order"
 * @param payload Request body (JSON-serialised automatically)
 * @param attempt Internal recursion counter — do not pass from call sites
 */
export async function petpoojaPost<T>(
  path: string,
  payload: unknown,
  attempt = 1,
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const label = `[petpooja] POST ${path} attempt=${attempt}`;

  console.log(`${label} →`, JSON.stringify(payload));

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log(`${label} ← status=${res.status} body=${text}`);

  // Retry 5xx responses with exponential backoff: 1 s → 2 s → give up
  if (res.status >= 500 && attempt < 3) {
    const delayMs = 1000 * Math.pow(2, attempt - 1); // 1000 ms, then 2000 ms
    console.warn(`${label} 5xx received — retrying in ${delayMs}ms`);
    await new Promise((r) => setTimeout(r, delayMs));
    return petpoojaPost<T>(path, payload, attempt + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    // Petpooja occasionally returns plain text on error responses
    parsed = text;
  }

  if (!res.ok) {
    throw new PetpoojaError(res.status, parsed);
  }

  return parsed as T;
}

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

/**
 * Reads Petpooja credentials from environment variables.
 * Throws a descriptive error if any are missing so misconfiguration is
 * caught at call time rather than silently sending empty strings.
 */
export function getPetpoojaAuth() {
  const app_key = process.env.PETPOOJA_APP_KEY;
  const app_secret = process.env.PETPOOJA_APP_SECRET;
  const access_token = process.env.PETPOOJA_ACCESS_TOKEN;

  if (!app_key || !app_secret || !access_token) {
    throw new Error(
      'Missing Petpooja credentials. ' +
        'Ensure PETPOOJA_APP_KEY, PETPOOJA_APP_SECRET, and PETPOOJA_ACCESS_TOKEN are set in .env.local',
    );
  }

  return { app_key, app_secret, access_token };
}
