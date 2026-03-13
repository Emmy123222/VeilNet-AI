import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      )
    }

    const ALEO_API_BASE = 'https://api.provable.com/v2/testnet'
    const PROGRAM_ID = process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID || 'veilnet_ai_v7.aleo'
    
    console.log(`🔍 Debug: Testing wallet ${walletAddress}`)
    console.log(`🔍 Debug: Looking for program ${PROGRAM_ID}`)
    
    // Test the Aleo API
    const apiUrl = `${ALEO_API_BASE}/address/${walletAddress}/transactions?limit=50`
    console.log(`🔍 Debug: API URL ${apiUrl}`)
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    })

    console.log(`🔍 Debug: Response status ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({
        success: false,
        error: `API Error: ${response.status}`,
        details: errorText,
        apiUrl,
        programId: PROGRAM_ID
      })
    }

    const data = await response.json()
    const transactions = data.transactions || data || []
    
    // Find our program transactions
    const ourTransactions = transactions.filter((tx: any) => 
      tx.program === PROGRAM_ID || tx.program?.includes('veilnet_ai')
    )
    
    return NextResponse.json({
      success: true,
      debug: {
        walletAddress,
        programId: PROGRAM_ID,
        apiUrl,
        totalTransactions: transactions.length,
        ourTransactions: ourTransactions.length,
        sampleTransactions: transactions.slice(0, 3).map((tx: any) => ({
          id: tx.id || tx.transaction_id,
          program: tx.program,
          function: tx.function,
          status: tx.status,
          timestamp: tx.timestamp
        })),
        ourTransactionsSample: ourTransactions.slice(0, 3)
      }
    })

  } catch (error: any) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}