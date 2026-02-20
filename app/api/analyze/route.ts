import { NextRequest, NextResponse } from 'next/server'
import { analyzeDocument, analyzeFile } from '@/lib/ai-service'
import { createHash } from 'crypto'
import { rateLimit, rateLimitConfigs, createRateLimitHeaders } from '@/lib/rate-limiter'

// Input sanitization
function sanitizeInput(text: string): string {
  if (typeof text !== 'string') {
    throw new Error('Invalid input: text must be a string')
  }
  
  // Remove potential script tags and other dangerous content
  const sanitized = text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
  
  // Limit length to prevent abuse
  const maxLength = 50000 // 50KB of text
  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength) + '\n[Content truncated for security]'
  }
  
  return sanitized.trim()
}

// Abuse detection
function detectAbuse(text: string, userAgent?: string): string | null {
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /(.)\1{100,}/, // Repeated characters (potential spam)
    /[^\x00-\x7F]{1000,}/, // Too many non-ASCII characters
    /(test|spam|abuse|attack){10,}/i, // Repeated test/spam words
  ]
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      return 'Suspicious content pattern detected'
    }
  }
  
  // Check for automated requests
  if (userAgent && /bot|crawler|spider|scraper/i.test(userAgent)) {
    return 'Automated requests not allowed'
  }
  
  return null
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = rateLimit(rateLimitConfigs.aiAnalysis)(request)
    const headers = createRateLimitHeaders(rateLimitResult)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { status: 429, headers }
      )
    }

    const { text, analysisType } = await request.json()

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text content is required' },
        { status: 400, headers }
      )
    }

    // Sanitize input
    let sanitizedText: string
    try {
      sanitizedText = sanitizeInput(text)
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400, headers }
      )
    }

    // Detect abuse
    const userAgent = request.headers.get('user-agent')
    const abuseDetection = detectAbuse(sanitizedText, userAgent || undefined)
    if (abuseDetection) {
      return NextResponse.json(
        { success: false, error: abuseDetection },
        { status: 400, headers }
      )
    }

    // Validate minimum content length
    if (sanitizedText.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Text content too short for analysis' },
        { status: 400, headers }
      )
    }

    // Generate document hash for integrity verification
    const documentHash = '0x' + createHash('sha256')
      .update(sanitizedText)
      .digest('hex')

    // Perform AI analysis
    const analysis = analysisType 
      ? await analyzeFile(sanitizedText, analysisType)
      : await analyzeDocument(sanitizedText)

    // Add metadata
    const result = {
      ...analysis,
      documentHash,
      timestamp: new Date().toISOString(),
      analysisType: analysisType || 'document-risk',
      textLength: sanitizedText.length,
      processingTime: Date.now() // Will be calculated on client side
    }

    return NextResponse.json({
      success: true,
      analysis: result
    }, { headers })

  } catch (error: any) {
    console.error('Analysis error:', error)
    
    // Don't expose internal errors to client
    const isAIError = error.message?.includes('API') || error.message?.includes('model')
    const errorMessage = isAIError 
      ? 'AI service temporarily unavailable. Please try again.'
      : 'Analysis failed. Please check your input and try again.'
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}