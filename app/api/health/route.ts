import { NextResponse } from 'next/server'

export async function GET() {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY
  const keyLength = process.env.OPENAI_API_KEY?.length || 0
  
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hasOpenAIKey,
      keyLength: hasOpenAIKey ? keyLength : 0,
      keyPrefix: hasOpenAIKey ? process.env.OPENAI_API_KEY?.substring(0, 10) + '...' : 'not set',
      nodeEnv: process.env.NODE_ENV
    },
    services: {
      openai: hasOpenAIKey ? 'configured' : 'missing',
      aleo: {
        network: process.env.NEXT_PUBLIC_ALEO_NETWORK || 'not set',
        programId: process.env.NEXT_PUBLIC_ALEO_PROGRAM_ID || 'not set'
      }
    }
  })
}
