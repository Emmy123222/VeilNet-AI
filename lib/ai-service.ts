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

/**
 * Vision Analysis Interface for Image/Video Deepfake Detection
 */
export interface VisionAnalysis extends DocumentAnalysis {
  authenticityScore: number // 0-100, higher = more authentic
  manipulationIndicators: string[]
  deepfakeConfidence: number // 0-100, confidence that it's a deepfake
  technicalFindings: string[]
}

/**
 * Analyze image for deepfake detection and authenticity
 * Uses Groq's Llama 3.2 Vision model
 */
export async function analyzeImageForDeepfake(imageBase64: string): Promise<VisionAnalysis> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured')
  }

  const prompt = `Analyze this image for signs of manipulation, deepfake characteristics, and authenticity.

Look for:
1. Facial inconsistencies (if person present)
2. Lighting and shadow anomalies
3. Edge artifacts and blending issues
4. Unnatural textures or patterns
5. Metadata inconsistencies
6. AI generation artifacts
7. Photo manipulation signs

Provide detailed analysis in JSON format:
{
  "summary": "Brief overview of findings",
  "authenticityScore": 0-100 (100 = authentic, 0 = fake),
  "deepfakeConfidence": 0-100 (confidence it's a deepfake),
  "riskScore": 0-100 (risk of being manipulated),
  "riskLevel": "Low|Medium|High|Critical",
  "manipulationIndicators": ["indicator1", "indicator2"],
  "technicalFindings": ["finding1", "finding2"],
  "insights": ["insight1", "insight2"],
  "categories": ["deepfake", "manipulation", etc],
  "riskFlags": [
    {
      "type": "manipulation",
      "severity": "low|medium|high|critical",
      "description": "...",
      "confidence": 0-100
    }
  ],
  "confidenceScore": 0-100,
  "confidenceExplanation": "..."
}`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error('No response from vision AI')
    }

    const analysis = JSON.parse(result) as VisionAnalysis

    // Validate and normalize
    const authenticityScore = Math.min(100, Math.max(0, analysis.authenticityScore || 50))
    const deepfakeConfidence = Math.min(100, Math.max(0, analysis.deepfakeConfidence || 0))
    const riskScore = Math.min(100, Math.max(0, analysis.riskScore || deepfakeConfidence))
    const riskLevel = riskScore <= 25 ? 'Low' : riskScore <= 60 ? 'Medium' : riskScore <= 85 ? 'High' : 'Critical'

    return {
      summary: analysis.summary || 'Image analysis completed',
      authenticityScore,
      deepfakeConfidence,
      manipulationIndicators: Array.isArray(analysis.manipulationIndicators) ? analysis.manipulationIndicators : [],
      technicalFindings: Array.isArray(analysis.technicalFindings) ? analysis.technicalFindings : [],
      riskScore,
      insights: Array.isArray(analysis.insights) ? analysis.insights : [],
      categories: Array.isArray(analysis.categories) ? analysis.categories : ['image-analysis'],
      riskLevel,
      riskFlags: Array.isArray(analysis.riskFlags) ? analysis.riskFlags : [],
      confidenceScore: Math.min(100, Math.max(0, analysis.confidenceScore || 75)),
      highlightedSections: [],
      confidenceExplanation: analysis.confidenceExplanation || 'Analysis based on visual inspection and AI detection'
    }
  } catch (error: any) {
    console.error('Vision analysis error:', error)
    
    // Fallback analysis if vision model fails
    return {
      summary: 'Image uploaded successfully. Advanced deepfake detection requires vision model access.',
      authenticityScore: 50,
      deepfakeConfidence: 0,
      manipulationIndicators: ['Vision analysis unavailable'],
      technicalFindings: ['Please ensure Groq API has vision model access'],
      riskScore: 50,
      insights: ['Image received and processed', 'Vision analysis requires Llama 3.2 Vision model'],
      categories: ['image-analysis'],
      riskLevel: 'Medium',
      riskFlags: [],
      confidenceScore: 30,
      highlightedSections: [],
      confidenceExplanation: 'Limited analysis without vision model access'
    }
  }
}
