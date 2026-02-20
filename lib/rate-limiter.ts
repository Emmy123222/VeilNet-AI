import { NextRequest } from 'next/server'

interface RateLimitEntry {
  count: number
  resetTime: number
}

// In-memory rate limiting (in production, use Redis or similar)
const rateLimitMap = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
  error?: string
}

export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): RateLimitResult => {
    // Get client identifier (IP address or user agent as fallback)
    const clientId = getClientId(request)
    const now = Date.now()
    
    // Clean up expired entries
    cleanupExpiredEntries(now)
    
    // Get or create rate limit entry
    let entry = rateLimitMap.get(clientId)
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 1,
        resetTime: now + config.windowMs
      }
      rateLimitMap.set(clientId, entry)
      
      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        resetTime: entry.resetTime
      }
    }
    
    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: entry.resetTime,
        error: `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`
      }
    }
    
    // Increment counter
    entry.count++
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    }
  }
}

function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (for production with reverse proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  // Fallback to user agent or connection info
  return request.headers.get('user-agent') || 'unknown'
}

function cleanupExpiredEntries(now: number) {
  // Clean up expired entries to prevent memory leaks
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // API endpoints
  analyze: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 requests per minute
  upload: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 uploads per minute
  verify: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 verifications per minute
  submit: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 submissions per minute
  
  // Stricter limits for expensive operations
  aiAnalysis: { windowMs: 5 * 60 * 1000, maxRequests: 20 }, // 20 AI analyses per 5 minutes
  fileUpload: { windowMs: 10 * 60 * 1000, maxRequests: 10 }, // 10 file uploads per 10 minutes
  
  // General API
  general: { windowMs: 60 * 1000, maxRequests: 100 } // 100 requests per minute
}

export function createRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    'Retry-After': result.success ? '0' : Math.ceil((result.resetTime - Date.now()) / 1000).toString()
  }
}