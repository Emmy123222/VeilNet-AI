import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentHash, riskScore, timestamp, walletAddress, requestTransaction, publicKey } = body

    if (!documentHash || riskScore === undefined || !timestamp || !walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate risk score
    if (riskScore < 0 || riskScore > 100) {
      return NextResponse.json(
        { success: false, error: 'Risk score must be between 0 and 100' },
        { status: 400 }
      )
    }

    // This endpoint should be called from the frontend with wallet context
    // The actual blockchain submission happens in the frontend using the wallet adapter
    // This endpoint validates the data and returns success
    
    console.log('📤 Preparing blockchain submission:', {
      documentHash,
      riskScore,
      timestamp,
      walletAddress,
      network: process.env.NEXT_PUBLIC_ALEO_NETWORK || 'testnetbeta',
      program: process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID || 'veilnet_ai.aleo'
    })

    // Validate the document hash format
    if (!documentHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document hash format' },
        { status: 400 }
      )
    }

    // Return success - the actual blockchain call happens in the frontend
    return NextResponse.json({
      success: true,
      message: 'Data validated. Ready for blockchain submission.',
      network: process.env.NEXT_PUBLIC_ALEO_NETWORK || 'testnetbeta',
      program: process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID || 'veilnet_ai.aleo',
      explorerBase: 'https://testnet.explorer.provable.com'
    })

  } catch (error) {
    console.error('Error preparing Aleo submission:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to prepare blockchain submission' },
      { status: 500 }
    )
  }
}
