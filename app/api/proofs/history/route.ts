import { NextRequest, NextResponse } from 'next/server'

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

    // For now, return empty array with instructions
    // The real data will come from local storage in the frontend
    const proofs: any[] = []
    
    // Calculate wallet stats (empty for now)
    const walletStats = {
      totalProofs: 0,
      confirmedProofs: 0,
      averageRiskScore: 0,
      lastActivity: null
    }

    return NextResponse.json({
      success: true,
      proofs,
      pagination: {
        total: proofs.length,
        limit,
        offset,
        hasMore: false
      },
      walletStats,
      message: 'Proof history is now tracked locally. Your transactions will appear here after you submit them to the blockchain.'
    })

  } catch (error: any) {
    console.error('Proof history error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch proof history' },
      { status: 500 }
    )
  }
}