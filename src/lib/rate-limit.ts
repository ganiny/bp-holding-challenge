import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Limiter = {
  limit(key: string): Promise<{ success: boolean; remaining: number; reset: number }>;
};

const noopLimiter: Limiter = {
  async limit() {
    return { success: true, remaining: Number.MAX_SAFE_INTEGER, reset: 0 };
  },
};

let redis: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    redis = null;
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

const cache = new Map<string, Limiter>();

/**
 * Sliding-window rate limiter, keyed by `prefix:identifier`.
 * Falls back to a no-op limiter when Upstash env vars are missing,
 * so dev environments without Redis credentials still work.
 */
export function getLimiter(opts: {
  prefix: string;
  limit: number;
  windowSeconds: number;
}): Limiter {
  const cacheKey = `${opts.prefix}:${opts.limit}:${opts.windowSeconds}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const r = getRedis();
  if (!r) {
    cache.set(cacheKey, noopLimiter);
    return noopLimiter;
  }

  const limiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(opts.limit, `${opts.windowSeconds} s`),
    prefix: `bp:${opts.prefix}`,
    analytics: false,
  });
  cache.set(cacheKey, limiter);
  return limiter;
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
