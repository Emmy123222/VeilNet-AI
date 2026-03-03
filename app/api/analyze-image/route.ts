import { NextRequest, NextResponse } from 'next/server'
import { analyzeImageForDeepfake } from '@/lib/ai-service'
import { createHash } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, analysisType } = await request.json()

    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: 'No image data provided' },
        { status: 400 }
      )
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '')

    // Generate image hash
    const imageHash = createHash('sha256')
      .update(base64Data)
      .digest('hex')

    console.log('🖼️  Analyzing image with vision AI...')
    console.log('   Image hash:', imageHash.slice(0, 16) + '...')
    console.log('   Analysis type:', analysisType || 'deepfake-detection')

    // Perform vision analysis
    const analysis = await analyzeImageForDeepfake(base64Data)

    // Add metadata
    const result = {
      ...analysis,
      documentHash: imageHash,
      analysisHash: createHash('sha256')
        .update(JSON.stringify(analysis))
        .digest('hex'),
      timestamp: Math.floor(Date.now() / 1000),
      analysisType: analysisType || 'deepfake-detection',
      processingTime: Date.now()
    }

    console.log('✅ Vision analysis complete')
    console.log('   Authenticity score:', analysis.authenticityScore)
    console.log('   Deepfake confidence:', analysis.deepfakeConfidence)
    console.log('   Risk level:', analysis.riskLevel)

    return NextResponse.json({
      success: true,
      analysis: result
    })

  } catch (error: any) {
    console.error('❌ Image analysis error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Image analysis failed. Please try again.' 
      },
      { status: 500 }
    )
  }
}
