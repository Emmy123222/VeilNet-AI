import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { analyzeFile } from '@/lib/ai-service'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const analysisType = formData.get('analysisType') as string

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!analysisType) {
      return NextResponse.json(
        { success: false, error: 'No analysis type provided' },
        { status: 400 }
      )
    }

    // Read file content
    const fileBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(fileBuffer)
    const fileContent = buffer.toString('utf-8')

    // Generate file hash
    const fileHash = createHash('sha256')
      .update(buffer)
      .digest('hex')

    // Use real AI to analyze file
    const aiAnalysis = await analyzeFile(fileContent, analysisType)

    const analysis = {
      id: `analysis_${Date.now()}`,
      fileHash: '0x' + fileHash,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      analysisType,
      riskScore: aiAnalysis.riskScore,
      summary: aiAnalysis.summary,
      insights: aiAnalysis.insights,
      categories: aiAnalysis.categories,
      timestamp: Math.floor(Date.now() / 1000)
    }

    return NextResponse.json({
      success: true,
      analysis
    })

  } catch (error: any) {
    console.error('Upload analysis error:', error)
    
    if (error.message?.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { success: false, error: 'AI service not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    )
  }
}
