import "server-only";

/**
 * OmniManager as mbaya's message provider: e-mails and WhatsApp messages go
 * out through its public API (v1), authenticated with a tenant API key
 * confined to the CPE's shop. mbaya itself holds no mail or WhatsApp account.
 *
 *   OMNI_API_URL   e.g. https://console.omni-manager.com
 *   OMNI_API_KEY   omk_live_… (permissions: messages.send, contacts.write)
 *   OMNI_SHOP      the shop's id or name
 */

export class OmniError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

const TIMEOUT_MS = 10_000;

function config() {
  const url = process.env.OMNI_API_URL?.replace(/\/+$/, "");
  const key = process.env.OMNI_API_KEY;
  const shop = process.env.OMNI_SHOP;
  if (!url || !key || !shop) throw new OmniError(503, "NOT_CONFIGURED", "OMNI_API_URL, OMNI_API_KEY or OMNI_SHOP is not set");
  return { url, key, shop: encodeURIComponent(shop) };
}

export function omniConfigured(): boolean {
  return Boolean(process.env.OMNI_API_URL && process.env.OMNI_API_KEY && process.env.OMNI_SHOP);
}

async function call<T>(path: string, body: unknown): Promise<T> {
  const { url, key } = config();
  let response: Response;
  try {
    response = await fetch(`${url}/api/v1${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    throw new OmniError(502, "UNREACHABLE", `OmniManager unreachable: ${(error as Error).message}`);
  }
  const payload = (await response.json().catch(() => null)) as
    | { success?: boolean; data?: T; error?: { code?: string; message?: string } }
    | (T & { error?: undefined })
    | null;
  if (!response.ok) {
    const error = payload && "error" in payload ? payload.error : undefined;
    throw new OmniError(response.status, error?.code ?? "HTTP_ERROR", error?.message ?? `HTTP ${response.status}`);
  }
  return ((payload && "data" in payload && payload.data) || payload) as T;
}

type Queued = { id: string; status: string };

export async function sendEmail(to: string, subject: string, text: string, idempotencyKey: string) {
  const { shop } = config();
  return call<Queued>(`/shops/${shop}/messages`, { channel: "email", to, subject, text, idempotencyKey });
}

/**
 * The person typed their number and asked for the code, so the number is
 * declared as a consented contact first (for one hour). Without it the
 * platform's anti-ban policy refuses a first message to an unknown number
 * (403 RECIPIENT_NOT_KNOWN) when the shop has no WhatsApp of its own.
 */
export async function sendWhatsApp(to: string, text: string, idempotencyKey: string) {
  const { shop } = config();
  await call(`/shops/${shop}/contacts/consented`, {
    contacts: [{ phone: to, note: "mbaya: code de vérification demandé", expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() }],
  });
  return call<Queued>(`/shops/${shop}/messages`, { channel: "whatsapp", to, text, idempotencyKey });
}
