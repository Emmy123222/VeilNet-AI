import { NextRequest, NextResponse } from 'next/server'
import { analyzeWithOllama, checkOllamaStatus } from '@/lib/ollama-service'
import { createHash } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { text, analysisType, ollamaConfig } = await request.json()

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'Text content is required' },
        { status: 400 }
      )
    }

    // Check if Ollama is available
    const isAvailable = await checkOllamaStatus(ollamaConfig)
    if (!isAvailable) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ollama is not running. Please start Ollama on your local machine (http://localhost:11434)' 
        },
        { status: 503 }
      )
    }

    // Generate document hash
    const documentHash = createHash('sha256').update(text).digest('hex')

    // Analyze with local Ollama
    const analysis = await analyzeWithOllama(text, analysisType, ollamaConfig)

    // Generate analysis hash
    const analysisHash = createHash('sha256')
      .update(JSON.stringify({
        documentHash,
        riskScore: analysis.riskScore,
        timestamp: analysis.timestamp
      }))
      .digest('hex')

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        documentHash,
        analysisHash,
        provider: 'ollama-local',
        privacyLevel: 'maximum' // Data never left the device
      }
    })

  } catch (error: any) {
    console.error('Ollama analysis error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Local AI analysis failed' },
      { status: 500 }
    )
  }
}
