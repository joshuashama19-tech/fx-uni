import "server-only";

// A minimal, process-local sliding-window rate limiter for sensitive
// endpoints (login, signup, password-reset requests, checkout
// initialization).
//
// Honest limitation, documented rather than glossed over: this is an
// in-memory Map, so it only limits requests handled by the SAME running
// server process. On a multi-instance/serverless deployment (Vercel,
// most production Next.js hosts), each instance has its own counters, so
// this is a real but partial deterrent against casual abuse from one
// source hitting one warm instance — not a substitute for a distributed
// limiter. For production-grade rate limiting, put this behind your
// platform's edge/WAF rate limiting (e.g. Vercel's Firewall rules) or a
// shared store (e.g. Upstash Redis) — deliberately not added here to avoid
// introducing a new external dependency this sandbox could not install or
// verify.
const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

// Periodic cleanup so the Map doesn't grow unbounded over a long-lived
// process. Best-effort only.
//
// setInterval()'s return type is environment-dependent — Node's timer
// object (with `.unref()`) in a Node server runtime, a plain number in a
// browser/edge-like lib — and which one TypeScript infers here depends on
// exactly which @types packages are resolved, not just which runtime this
// actually executes in. Rather than assert a specific type (NodeJS.Timeout
// vs. number) that could be wrong in either direction, cast narrowly to
// "something that might have an optional unref method" and call it with
// optional chaining: if the real value is a Node timer, this calls
// `.unref()`; if it's a plain number, property access on it simply
// evaluates to `undefined` at runtime (primitives don't throw on property
// access) and the optional call is skipped. Correct either way.
const cleanupInterval = setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  },
  5 * 60 * 1000
);
(cleanupInterval as unknown as { unref?: () => void }).unref?.();
