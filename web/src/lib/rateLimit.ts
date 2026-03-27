/**
 * In-memory sliding window rate limiter for API routes.
 * 
 * Usage:
 *   import { rateLimit, LIMITS } from '@/lib/rateLimit'
 *   const limiter = rateLimit(LIMITS.chatbot)
 *   // In handler: if (limiter.check(ip)) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface RateLimitConfig {
  windowMs: number   // Time window in milliseconds
  maxRequests: number // Max requests per window
}

interface RateLimitEntry {
  timestamps: number[]
}

export const LIMITS = {
  login:    { windowMs: 60_000, maxRequests: 5 },   // 5 req/min
  chatbot:  { windowMs: 60_000, maxRequests: 10 },  // 10 req/min
  admin:    { windowMs: 60_000, maxRequests: 30 },   // 30 req/min
  normal:   { windowMs: 60_000, maxRequests: 60 },   // 60 req/min
} as const

export function rateLimit(config: RateLimitConfig) {
  const store = new Map<string, RateLimitEntry>()

  // Cleanup stale entries every 5 minutes
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      entry.timestamps = entry.timestamps.filter(t => now - t < config.windowMs)
      if (entry.timestamps.length === 0) store.delete(key)
    }
  }, 300_000)

  return {
    /**
     * Check if the request exceeds the rate limit.
     * Returns true if rate-limited (should reject), false if allowed.
     */
    check(key: string): boolean {
      const now = Date.now()
      const entry = store.get(key) ?? { timestamps: [] }

      // Remove expired timestamps
      entry.timestamps = entry.timestamps.filter(t => now - t < config.windowMs)

      if (entry.timestamps.length >= config.maxRequests) {
        return true // Rate limited
      }

      entry.timestamps.push(now)
      store.set(key, entry)
      return false // Allowed
    },

    /** Get remaining requests for given key */
    remaining(key: string): number {
      const now = Date.now()
      const entry = store.get(key)
      if (!entry) return config.maxRequests
      const active = entry.timestamps.filter(t => now - t < config.windowMs)
      return Math.max(0, config.maxRequests - active.length)
    },
  }
}

/** Extract IP from request headers */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return req.headers.get('x-real-ip') ?? '127.0.0.1'
}
