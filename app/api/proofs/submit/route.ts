import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { analysisResult, walletAddress } = await request.json()

    if (!analysisResult || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate proof hash from analysis result
    const proofData = JSON.stringify({
      documentHash: analysisResult.documentHash,
      riskScore: analysisResult.riskScore,
      timestamp: analysisResult.timestamp,
      walletAddress
    })

    const proofHash = '0x' + createHash('sha256')
      .update(proofData)
      .digest('hex')

    // In production, this would submit to Aleo blockchain
    // For now, we generate a deterministic transaction ID
    const transactionId = '0x' + createHash('sha256')
      .update(proofHash + Date.now().toString())
      .digest('hex')

    return NextResponse.json({
      success: true,
      proofHash,
      transactionId,
      blockHeight: Math.floor(Date.now() / 1000), // Use timestamp as block height
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Proof submission error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Proof submission failed' },
      { status: 500 }
    )
  }
}
