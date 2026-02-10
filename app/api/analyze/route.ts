import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { analyzeDocument } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not found in environment')
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI service not configured. Please set GROQ_API_KEY in .env.local and restart the dev server. Get free API key from: https://console.groq.com/keys' 
        },
        { status: 500 }
      )
    }

    console.log('✅ Groq API key found, length:', process.env.GROQ_API_KEY.length)

    const { documentText } = await request.json()

    if (!documentText || typeof documentText !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid document text' },
        { status: 400 }
      )
    }

    if (documentText.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Document text too short' },
        { status: 400 }
      )
    }

    // Generate document hash
    const documentHash = createHash('sha256')
      .update(documentText)
      .digest('hex')

    // Use real AI to analyze document (Groq - FREE!)
    const aiAnalysis = await analyzeDocument(documentText)

    // Calculate word and character counts
    const wordCount = documentText.trim().split(/\s+/).length
    const charCount = documentText.length

    const analysis = {
      documentHash: '0x' + documentHash,
      riskScore: aiAnalysis.riskScore,
      summary: aiAnalysis.summary,
      insights: aiAnalysis.insights,
      categories: aiAnalysis.categories,
      timestamp: Math.floor(Date.now() / 1000),
      wordCount,
      charCount
    }

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error: any) {
    console.error('❌ Analysis error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Check if API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY is not set in environment variables')
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI service not configured. GROQ_API_KEY environment variable is missing. Get free key from: https://console.groq.com/keys' 
        },
        { status: 500 }
      )
    }
    
    // Provide helpful error messages
    if (error.message?.includes('GROQ_API_KEY') || error.message?.includes('API key')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Groq API key. Please check your .env.local file and restart the dev server.' 
        },
        { status: 500 }
      )
    }

    if (error.message?.includes('rate limit')) {
      return NextResponse.json(
        { success: false, error: 'Groq rate limit exceeded. Please try again in a moment.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: `Analysis failed: ${error.message || 'Unknown error'}. Check server logs for details.` 
      },
      { status: 500 }
    )
  }
}
