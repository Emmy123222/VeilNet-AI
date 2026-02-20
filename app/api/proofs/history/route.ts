import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      )
    }

    // In production, this would query a database
    // For demo, generate deterministic history based on wallet address
    const walletSeed = createHash('sha256').update(walletAddress).digest('hex')
    const historyCount = Math.min(50, parseInt(walletSeed.slice(0, 2), 16) % 20 + 5)
    
    const proofs = []
    for (let i = offset; i < Math.min(offset + limit, historyCount); i++) {
      const proofSeed = createHash('sha256').update(walletAddress + i.toString()).digest('hex')
      const timestamp = new Date(Date.now() - (i * 86400000 + parseInt(proofSeed.slice(0, 8), 16) % 86400000))
      
      const proofHash = '0x' + proofSeed
      const transactionId = 'at1' + createHash('sha256').update(proofHash + i.toString()).digest('hex').slice(0, 60)
      
      const riskScore = parseInt(proofSeed.slice(8, 10), 16) % 100
      const status = ['confirmed', 'confirmed', 'confirmed', 'pending', 'failed'][i % 5]
      
      proofs.push({
        id: i + 1,
        proofHash,
        transactionId,
        documentHash: '0x' + createHash('sha256').update(`doc_${i}`).digest('hex'),
        riskScore,
        status,
        timestamp: timestamp.toISOString(),
        blockHeight: Math.floor(timestamp.getTime() / 1000),
        explorerUrl: `https://testnet.explorer.provable.com/transaction/${transactionId}`,
        documentType: ['PDF', 'Text', 'Image', 'DOCX'][i % 4],
        riskLevel: riskScore < 30 ? 'Low' : riskScore < 70 ? 'Medium' : 'High'
      })
    }

    return NextResponse.json({
      success: true,
      proofs,
      pagination: {
        total: historyCount,
        limit,
        offset,
        hasMore: offset + limit < historyCount
      },
      walletStats: {
        totalProofs: historyCount,
        confirmedProofs: proofs.filter(p => p.status === 'confirmed').length,
        averageRiskScore: Math.round(proofs.reduce((sum, p) => sum + p.riskScore, 0) / proofs.length),
        lastActivity: proofs[0]?.timestamp
      }
    })

  } catch (error: any) {
    console.error('Proof history error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch proof history' },
      { status: 500 }
    )
  }
}