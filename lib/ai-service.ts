import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export interface DocumentAnalysis {
  summary: string
  riskScore: number
  insights: string[]
  categories: string[]
}

export async function analyzeDocument(text: string): Promise<DocumentAnalysis> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const prompt = `Analyze the following document for risk assessment. Provide:
1. A brief summary (2-3 sentences)
2. A risk score from 0-100 (0 = no risk, 100 = high risk)
3. 3-5 key insights about the document
4. Categories that apply (legal, financial, medical, technical, etc.)

Document:
${text.substring(0, 3000)}

Respond in JSON format:
{
  "summary": "...",
  "riskScore": 0-100,
  "insights": ["...", "..."],
  "categories": ["...", "..."]
}`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a document risk analysis AI. Analyze documents and provide risk scores, summaries, and insights in JSON format. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  })

  const result = completion.choices[0]?.message?.content
  if (!result) {
    throw new Error('No response from AI')
  }

  const analysis = JSON.parse(result) as DocumentAnalysis
  
  // Validate and normalize
  return {
    summary: analysis.summary || 'Analysis completed',
    riskScore: Math.min(100, Math.max(0, analysis.riskScore || 50)),
    insights: Array.isArray(analysis.insights) ? analysis.insights.slice(0, 5) : [],
    categories: Array.isArray(analysis.categories) ? analysis.categories.slice(0, 3) : []
  }
}

export async function analyzeFile(content: string, analysisType: string): Promise<DocumentAnalysis> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const prompts: Record<string, string> = {
    'document-risk': 'Analyze this document for legal and financial risks. Identify concerning clauses, obligations, and potential issues.',
    'medical-summary': 'Summarize this medical document. Extract key findings, diagnoses, and recommendations.',
    'resume-analysis': 'Analyze this resume. Evaluate skills, experience, and qualifications.',
    'financial-fraud': 'Analyze this financial document for fraud indicators. Look for suspicious patterns and anomalies.',
    'content-moderation': 'Analyze this content for policy violations. Check for inappropriate language or harmful content.',
    'default': 'Analyze this document and provide insights.'
  }

  const prompt = `${prompts[analysisType] || prompts['default']}\n\nDocument:\n${content.substring(0, 3000)}\n\nRespond in JSON format:\n{\n  "summary": "...",\n  "riskScore": 0-100,\n  "insights": ["...", "..."],\n  "categories": ["...", "..."]\n}`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are a document analysis AI. Analyze documents and provide risk scores, summaries, and insights in JSON format. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  })

  const result = completion.choices[0]?.message?.content
  if (!result) {
    throw new Error('No response from AI')
  }

  const analysis = JSON.parse(result) as DocumentAnalysis
  
  return {
    summary: analysis.summary || 'Analysis completed',
    riskScore: Math.min(100, Math.max(0, analysis.riskScore || 50)),
    insights: Array.isArray(analysis.insights) ? analysis.insights.slice(0, 5) : [],
    categories: Array.isArray(analysis.categories) ? analysis.categories.slice(0, 3) : []
  }
}
