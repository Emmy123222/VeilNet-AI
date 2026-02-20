import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export interface RiskFlag {
  type: 'fraud' | 'manipulation' | 'inconsistency' | 'compliance' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  confidence: number
}

export interface DocumentAnalysis {
  summary: string
  riskScore: number
  insights: string[]
  categories: string[]
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  riskFlags: RiskFlag[]
  confidenceScore: number
  highlightedSections?: string[]
  confidenceExplanation: string
}

export async function analyzeDocument(text: string): Promise<DocumentAnalysis> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const prompt = `Analyze the following document for comprehensive risk assessment. Provide:

1. A brief summary (2-3 sentences)
2. A risk score from 0-100 (0 = no risk, 100 = high risk)
3. 3-5 key insights about the document
4. Categories that apply (legal, financial, medical, technical, etc.)
5. Risk level classification (Low: 0-25, Medium: 26-60, High: 61-85, Critical: 86-100)
6. Specific risk flags with types (fraud, manipulation, inconsistency, compliance, security)
7. Confidence score (0-100) for the analysis accuracy
8. Highlighted concerning sections (if any)
9. Explanation of confidence level

Document:
${text.substring(0, 3000)}

Respond in JSON format:
{
  "summary": "...",
  "riskScore": 0-100,
  "insights": ["...", "..."],
  "categories": ["...", "..."],
  "riskLevel": "Low|Medium|High|Critical",
  "riskFlags": [
    {
      "type": "fraud|manipulation|inconsistency|compliance|security",
      "severity": "low|medium|high|critical",
      "description": "...",
      "location": "...",
      "confidence": 0-100
    }
  ],
  "confidenceScore": 0-100,
  "highlightedSections": ["...", "..."],
  "confidenceExplanation": "..."
}`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an advanced document risk analysis AI. Analyze documents thoroughly and provide detailed risk assessments with specific flags, confidence scores, and explanations. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 1500,
    response_format: { type: 'json_object' }
  })

  const result = completion.choices[0]?.message?.content
  if (!result) {
    throw new Error('No response from AI')
  }

  const analysis = JSON.parse(result) as DocumentAnalysis

  // Validate and normalize
  const riskScore = Math.min(100, Math.max(0, analysis.riskScore || 50))
  const riskLevel = riskScore <= 25 ? 'Low' : riskScore <= 60 ? 'Medium' : riskScore <= 85 ? 'High' : 'Critical'

  return {
    summary: analysis.summary || 'Analysis completed',
    riskScore,
    insights: Array.isArray(analysis.insights) ? analysis.insights.slice(0, 5) : [],
    categories: Array.isArray(analysis.categories) ? analysis.categories.slice(0, 3) : [],
    riskLevel,
    riskFlags: Array.isArray(analysis.riskFlags) ? analysis.riskFlags.slice(0, 10) : [],
    confidenceScore: Math.min(100, Math.max(0, analysis.confidenceScore || 85)),
    highlightedSections: Array.isArray(analysis.highlightedSections) ? analysis.highlightedSections.slice(0, 5) : [],
    confidenceExplanation: analysis.confidenceExplanation || 'Analysis based on document content and patterns'
  }
}

export async function analyzeFile(content: string, analysisType: string): Promise<DocumentAnalysis> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const prompts: Record<string, string> = {
    'document-risk': 'Analyze this document for legal and financial risks. Identify concerning clauses, obligations, and potential issues. Focus on fraud indicators, compliance violations, and security risks.',
    'medical-summary': 'Summarize this medical document. Extract key findings, diagnoses, and recommendations. Check for inconsistencies in medical data and compliance with HIPAA standards.',
    'resume-analysis': 'Analyze this resume. Evaluate skills, experience, and qualifications. Look for inconsistencies, exaggerations, or potential fraud indicators.',
    'financial-fraud': 'Analyze this financial document for fraud indicators. Look for suspicious patterns, anomalies, manipulation signs, and compliance violations.',
    'content-moderation': 'Analyze this content for policy violations. Check for inappropriate language, harmful content, misinformation, and manipulation attempts.',
    'default': 'Analyze this document comprehensively for risks, inconsistencies, and potential issues.'
  }

  const prompt = `${prompts[analysisType] || prompts['default']}

Document:
${content.substring(0, 3000)}

Provide comprehensive analysis in JSON format:
{
  "summary": "...",
  "riskScore": 0-100,
  "insights": ["...", "..."],
  "categories": ["...", "..."],
  "riskLevel": "Low|Medium|High|Critical",
  "riskFlags": [
    {
      "type": "fraud|manipulation|inconsistency|compliance|security",
      "severity": "low|medium|high|critical",
      "description": "...",
      "location": "...",
      "confidence": 0-100
    }
  ],
  "confidenceScore": 0-100,
  "highlightedSections": ["...", "..."],
  "confidenceExplanation": "..."
}`

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: 'You are an advanced document analysis AI specializing in risk assessment. Analyze documents thoroughly and provide detailed risk assessments with specific flags, confidence scores, and explanations. Always respond with valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.2,
    max_tokens: 1500,
    response_format: { type: 'json_object' }
  })

  const result = completion.choices[0]?.message?.content
  if (!result) {
    throw new Error('No response from AI')
  }

  const analysis = JSON.parse(result) as DocumentAnalysis

  // Validate and normalize
  const riskScore = Math.min(100, Math.max(0, analysis.riskScore || 50))
  const riskLevel = riskScore <= 25 ? 'Low' : riskScore <= 60 ? 'Medium' : riskScore <= 85 ? 'High' : 'Critical'

  return {
    summary: analysis.summary || 'Analysis completed',
    riskScore,
    insights: Array.isArray(analysis.insights) ? analysis.insights.slice(0, 5) : [],
    categories: Array.isArray(analysis.categories) ? analysis.categories.slice(0, 3) : [],
    riskLevel,
    riskFlags: Array.isArray(analysis.riskFlags) ? analysis.riskFlags.slice(0, 10) : [],
    confidenceScore: Math.min(100, Math.max(0, analysis.confidenceScore || 85)),
    highlightedSections: Array.isArray(analysis.highlightedSections) ? analysis.highlightedSections.slice(0, 5) : [],
    confidenceExplanation: analysis.confidenceExplanation || 'Analysis based on document content and patterns'
  }
}
