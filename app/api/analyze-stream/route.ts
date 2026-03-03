import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export const runtime = 'edge'

// Helper to generate hash using Web Crypto API (edge-compatible)
async function generateHash(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function POST(request: Request) {
  try {
    const { documentText, analysisType } = await request.json()

    if (!documentText || documentText.trim().length < 10) {
      return new Response(
        JSON.stringify({ error: 'Text content too short for analysis' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const sanitizedText = documentText.trim().slice(0, 50000)

    // Generate document hash using Web Crypto API
    const documentHash = await generateHash(sanitizedText)

    const prompts: Record<string, string> = {
      'document-risk': 'Analyze this document for legal and financial risks. Identify concerning clauses, obligations, and potential issues. Focus on fraud indicators, compliance violations, and security risks.',
      'medical-summary': 'Summarize this medical document. Extract key findings, diagnoses, and recommendations. Check for inconsistencies in medical data.',
      'financial-fraud': 'Analyze this financial document for fraud indicators. Look for suspicious patterns, anomalies, manipulation signs, and compliance violations.',
      'deepfake-detection': 'Analyze this content for signs of manipulation or deepfake characteristics. Look for inconsistencies, artifacts, and authenticity indicators.',
      'default': 'Analyze this document comprehensively for risks, inconsistencies, and potential issues.'
    }

    const systemPrompt = prompts[analysisType as string] || prompts.default

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `${systemPrompt}

Provide your analysis in this exact JSON format:
{
  "summary": "Brief overview of findings",
  "riskScore": <number 0-100>,
  "riskLevel": "<Low|Medium|High|Critical>",
  "insights": ["insight1", "insight2", "insight3"],
  "categories": ["category1", "category2"],
  "riskFlags": [
    {
      "type": "<fraud|manipulation|inconsistency|compliance|security>",
      "severity": "<low|medium|high|critical>",
      "description": "Description of the issue",
      "confidence": <number 0-100>
    }
  ],
  "confidenceScore": <number 0-100>,
  "confidenceExplanation": "Why this confidence level"
}`
        },
        {
          role: 'user',
          content: sanitizedText
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true
    })

    // Create a ReadableStream from the Groq stream
    const encoder = new TextEncoder()
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Document-Hash': documentHash,
        'X-Analysis-Type': analysisType || 'default',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error: any) {
    console.error('Streaming analysis error:', error)
    return new Response(
      JSON.stringify({ error: 'Analysis failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
