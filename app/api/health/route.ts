import { NextResponse } from 'next/server'

export async function GET() {
  const hasGroqKey = !!process.env.GROQ_API_KEY
  const keyLength = process.env.GROQ_API_KEY?.length || 0
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hasGroqKey,
      keyLength: hasGroqKey ? keyLength : 0,
      keyPrefix: hasGroqKey ? process.env.GROQ_API_KEY?.substring(0, 10) + '...' : 'not set',
      nodeEnv: process.env.NODE_ENV
    },
    services: {
      groq: hasGroqKey ? 'configured' : 'missing',
      aleo: {
        network: process.env.NEXT_PUBLIC_ALEO_NETWORK || 'not set',
        programId: process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID || 'not set'
      }
    }
  })
}
