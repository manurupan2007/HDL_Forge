/**
 * Abuse protection for the unauthenticated compute endpoints.
 *
 * Production uses Upstash Redis (sliding window, per-IP, shared across all
 * serverless instances). When the Upstash credentials are not configured the
 * routes fall back to a per-instance in-memory window so local development
 * keeps working — degraded but not broken.
 */
import type { NextRequest } from "next/server";

type Limiter = { limit: (key: string) => Promise<{ success: boolean }> };

const LIMITS = {
  sim: { requests: 10, windowMs: 60_000, retryAfter: "60" }, // 10 sims/min
  grade: { requests: 20, windowMs: 3_600_000, retryAfter: "3600" }, // 20 grades/hour
  "delete-account": { requests: 3, windowMs: 3_600_000, retryAfter: "3600" },
} as const;

export type LimitName = keyof typeof LIMITS;

let cachedRedisLimiter: Limiter | null | undefined;
const memoryBuckets = new Map<string, number[]>();

/** In-memory sliding window — correct within one instance (dev fallback). */
function memoryLimiter(name: string, requests: number, windowMs: number): Limiter {
  return {
    async limit(key: string) {
      const id = `${name}:${key}`;
      const now = Date.now();
      const hits = (memoryBuckets.get(id) ?? []).filter((t) => now - t < windowMs);
      if (hits.length >= requests) {
        memoryBuckets.set(id, hits);
        return { success: false };
      }
      hits.push(now);
      memoryBuckets.set(id, hits);
      return { success: true };
    },
  };
}

/**
 * Returns a limiter backed by Upstash when UPSTASH_REDIS_REST_URL/TOKEN are
 * set, otherwise the per-instance memory fallback. `null` means Upstash is
 * configured but failed to initialize — treated as "fail open" so a Redis
 * outage can never take the API down.
 */
async function getLimiter(name: LimitName): Promise<Limiter | null> {
  if (cachedRedisLimiter !== undefined) return cachedRedisLimiter;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cachedRedisLimiter = memoryLimiter(name, LIMITS[name].requests, LIMITS[name].windowMs);
    return cachedRedisLimiter;
  }
  try {
    const [{ Redis }, { Ratelimit: RL }] = await Promise.all([
      import("@upstash/redis"),
      import("@upstash/ratelimit"),
    ]);
    const redis = new Redis({ url, token });
    cachedRedisLimiter = new RL({
      redis,
      limiter: RL.slidingWindow(LIMITS[name].requests, `${LIMITS[name].windowMs / 1000} s`),
      prefix: `hdlforge:${name}`,
    });
    return cachedRedisLimiter;
  } catch (err) {
    console.error("[ratelimit] Upstash init failed — failing open", err);
    cachedRedisLimiter = null;
    return cachedRedisLimiter;
  }
}

export function clientIp(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Enforce the per-IP budget. Returns a 429 Response when exceeded, else null.
 * Fail-open on limiter errors: availability beats perfect throttling.
 */
export async function enforceRateLimit(
  request: NextRequest,
  name: LimitName,
): Promise<Response | null> {
  try {
    const limiter = await getLimiter(name);
    if (!limiter) return null;
    const { success } = await limiter.limit(clientIp(request));
    if (success) return null;
    return Response.json(
      { error: "rate limit exceeded — slow down and retry shortly" },
      { status: 429, headers: { "Retry-After": LIMITS[name].retryAfter } },
    );
  } catch (err) {
    console.error("[ratelimit] check failed — failing open", err);
    return null;
  }
}

/**
 * Reject cross-origin POSTs: a browser will always send Origin on POST, so
 * any Origin that does not match the host serving this request is off-site
 * (CSRF or embedded abuse). Non-browser clients (curl) omit Origin and are
 * still bounded by the rate limit above.
 */
export function assertSameOrigin(request: NextRequest): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null; // non-browser client — still rate limited
  if (origin === "null") {
    return Response.json(
      { error: "cross-origin requests are not allowed" },
      { status: 403 },
    );
  }
  try {
    const originHost = new URL(origin).host;
    const host =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    if (host && originHost === host) return null;
    const configured = process.env.NEXT_PUBLIC_SITE_URL;
    if (configured && originHost === new URL(configured).host) return null;
  } catch {
    /* malformed origin — fall through to rejection */
  }
  return Response.json(
    { error: "cross-origin requests are not allowed" },
    { status: 403 },
  );
}
