/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  DIDME_LOG_TOKEN: string;
  DIDME_LOG_URL: string;
  WAITLIST_LOG_TOKEN: string;
  WAITLIST_LOG_URL: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

type RequestWithCf = Request & {
  cf?: {
    city?: string;
    continent?: string;
    country?: string;
    timezone?: string;
  };
};

function jsonResponse(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function countryName(countryCode: string): string {
  if (!countryCode) return "";
  try {
    return new Intl.DisplayNames(["ru"], { type: "region" }).of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}

function cleanText(value: unknown, maxLength: number, multiline = false): string {
  if (typeof value !== "string" && typeof value !== "number") return "";

  const text = String(value)
    .replace(multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g, multiline ? "" : " ")
    .trim()
    .slice(0, maxLength);

  return text;
}

function sheetSafe(text: string): string {
  // Keep values inert when the upstream stores them directly in Google Sheets.
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function cleanUrl(value: unknown, maxLength: number): string {
  const text = String(value ?? "").trim().slice(0, maxLength);
  if (!text) return "";

  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function hasTrueConsent(value: unknown): boolean {
  return value === true;
}

async function handleWaitlist(request: Request, env: Env | undefined): Promise<Response> {
  if (!env?.WAITLIST_LOG_URL || !env.WAITLIST_LOG_TOKEN) {
    return jsonResponse('{"ok":false,"error":"not_configured"}', 503);
  }

  if (request.method === "GET") {
    const upstreamUrl = new URL(env.WAITLIST_LOG_URL);
    upstreamUrl.searchParams.set("token", env.WAITLIST_LOG_TOKEN);

    try {
      const upstream = await fetch(upstreamUrl, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        redirect: "follow",
      });
      const body = (await upstream.text()).split(env.WAITLIST_LOG_TOKEN).join("[redacted]");
      return jsonResponse(body, upstream.ok ? 200 : 502);
    } catch {
      return jsonResponse('{"ok":false,"error":"upstream_unavailable"}', 502);
    }
  }

  if (request.method !== "POST") {
    return jsonResponse('{"ok":false,"error":"method_not_allowed"}', 405);
  }

  const pageUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  if ((origin && origin !== pageUrl.origin) || fetchSite === "cross-site") {
    return jsonResponse('{"ok":false,"error":"forbidden_origin"}', 403);
  }

  let client: Record<string, unknown>;
  try {
    client = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse('{"ok":false,"error":"bad_json"}', 400);
  }

  const company = sheetSafe(cleanText(client.company, 160));
  const industry = sheetSafe(cleanText(client.industry, 100));
  const email = cleanText(client.email, 254).toLowerCase();
  const consentAvailability = hasTrueConsent(client.consentAvailability);
  const consentContact = hasTrueConsent(client.consentContact);

  if (!company) return jsonResponse('{"ok":false,"error":"missing_company"}', 400);
  if (!industry) return jsonResponse('{"ok":false,"error":"missing_industry"}', 400);
  if (!email) return jsonResponse('{"ok":false,"error":"missing_email"}', 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse('{"ok":false,"error":"invalid_email"}', 400);
  }
  if (!consentAvailability || !consentContact) {
    return jsonResponse('{"ok":false,"error":"consent_required"}', 400);
  }

  const rawPromoUrl = String(client.promoUrl ?? "").trim();
  const promoUrl = cleanUrl(rawPromoUrl, 1000);
  if (rawPromoUrl && !promoUrl) {
    return jsonResponse('{"ok":false,"error":"invalid_promo_url"}', 400);
  }

  const cf = (request as RequestWithCf).cf || {};
  const payload = {
    token: env.WAITLIST_LOG_TOKEN,
    company,
    industry,
    email: sheetSafe(email),
    phone: sheetSafe(cleanText(client.phone, 50)),
    comments: sheetSafe(cleanText(client.comments, 2000, true)),
    offer: sheetSafe(cleanText(client.offer, 1000, true)),
    useful: sheetSafe(cleanText(client.useful, 1000, true)),
    promoUrl,
    consentAvailability,
    consentContact,
    country: countryName(cf.country || ""),
    countryCode: cf.country || "",
    city: cf.city || "",
    continent: cf.continent || "",
    edgeTimezone: cf.timezone || "",
    siteHost: pageUrl.host,
    referrer: cleanUrl(client.referrer, 500),
    pageUrl: cleanUrl(client.pageUrl, 500),
    userAgent: sheetSafe(cleanText(request.headers.get("User-Agent"), 500)),
  };

  try {
    const upstream = await fetch(env.WAITLIST_LOG_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });
    const body = (await upstream.text()).split(env.WAITLIST_LOG_TOKEN).join("[redacted]");
    return jsonResponse(body, upstream.ok ? 200 : 502);
  } catch {
    return jsonResponse('{"ok":false,"error":"upstream_unavailable"}', 502);
  }
}

async function handleDidmeCounter(request: Request, env: Env): Promise<Response> {
  if (!env.DIDME_LOG_URL || !env.DIDME_LOG_TOKEN) {
    return jsonResponse('{"ok":false,"error":"not_configured"}', 503);
  }

  if (request.method === "GET") {
    const upstreamUrl = new URL(env.DIDME_LOG_URL);
    upstreamUrl.searchParams.set("token", env.DIDME_LOG_TOKEN);
    const upstream = await fetch(upstreamUrl, { redirect: "follow" });
    return jsonResponse(await upstream.text(), upstream.ok ? 200 : 502);
  }

  if (request.method !== "POST") {
    return jsonResponse('{"ok":false,"error":"method_not_allowed"}', 405);
  }

  const pageUrl = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== pageUrl.origin) {
    return jsonResponse('{"ok":false,"error":"forbidden_origin"}', 403);
  }

  let client: Record<string, unknown>;
  try {
    client = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse('{"ok":false,"error":"bad_json"}', 400);
  }

  const clientId = String(client.clientId || "").slice(0, 100);
  if (!clientId) return jsonResponse('{"ok":false,"error":"missing_client_id"}', 400);

  const cf = (request as RequestWithCf).cf || {};
  const payload = {
    token: env.DIDME_LOG_TOKEN,
    clientId,
    country: countryName(cf.country || ""),
    countryCode: cf.country || "",
    city: cf.city || "",
    continent: cf.continent || "",
    edgeTimezone: cf.timezone || "",
    browser: String(client.browser || "").slice(0, 100),
    os: String(client.os || "").slice(0, 100),
    device: String(client.device || "").slice(0, 50),
    language: String(client.language || "").slice(0, 50),
    screen: String(client.screen || "").slice(0, 50),
    referrer: String(client.referrer || "").slice(0, 500),
    pageUrl: String(client.pageUrl || "").slice(0, 500),
    siteHost: pageUrl.host,
    userAgent: (request.headers.get("User-Agent") || "").slice(0, 500),
  };

  const upstream = await fetch(env.DIDME_LOG_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    redirect: "follow",
  });
  return jsonResponse(await upstream.text(), upstream.ok ? 200 : 502);
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/didme-counter") {
      return handleDidmeCounter(request, env);
    }

    if (url.pathname === "/api/waitlist") {
      return handleWaitlist(request, env);
    }

    if (url.pathname === "/didme" || url.pathname === "/didme/") {
      return env.ASSETS.fetch(new Request(new URL("/didme-prompt", request.url)));
    }

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    return handler.fetch(request, env, ctx);
  },
};

export default worker;
