/**
 * Ollama Local LLM Service
 * Zero-trust AI analysis - data never leaves user's device
 */

export interface OllamaConfig {
  baseUrl: string
  model: string
  timeout?: number
}

const DEFAULT_CONFIG: OllamaConfig = {
  baseUrl: 'http://localhost:11434',
  model: 'llama3.2',
  timeout: 60000
}

/**
 * Check if Ollama is running locally
 */
export async function checkOllamaStatus(config: Partial<OllamaConfig> = {}): Promise<boolean> {
  const { baseUrl } = { ...DEFAULT_CONFIG, ...config }
  
  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    })
    return response.ok
  } catch (error) {
    console.error('Ollama not available:', error)
    return false
  }
}

/**
 * Get list of available models in Ollama
 */
export async function getOllamaModels(config: Partial<OllamaConfig> = {}): Promise<string[]> {
  const { baseUrl } = { ...DEFAULT_CONFIG, ...config }
  
  try {
    const response = await fetch(`${baseUrl}/api/tags`)
    if (!response.ok) return []
    
    const data = await response.json()
    return data.models?.map((m: any) => m.name) || []
  } catch (error) {
    console.error('Failed to fetch Ollama models:', error)
    return []
  }
}

/**
 * Analyze document using local Ollama
 */
export async function analyzeWithOllama(
  text: string,
  analysisType: string = 'document-risk',
  config: Partial<OllamaConfig> = {}
): Promise<any> {
  const { baseUrl, model, timeout } = { ...DEFAULT_CONFIG, ...config }
  
  const systemPrompt = getSystemPrompt(analysisType)
  const userPrompt = `Analyze this document and provide a risk assessment:\n\n${text}`
  
  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: `${systemPrompt}\n\n${userPrompt}`,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9
        }
      }),
      signal: AbortSignal.timeout(timeout!)
    })
    
    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }
    
    const data = await response.json()
    return parseOllamaResponse(data.response, analysisType)
  } catch (error: any) {
    console.error('Ollama analysis failed:', error)
    throw new Error(`Local AI analysis failed: ${error.message}`)
  }
}

/**
 * Streaming analysis with Ollama
 */
export async function* streamAnalyzeWithOllama(
  text: string,
  analysisType: string = 'document-risk',
  config: Partial<OllamaConfig> = {}
): AsyncGenerator<string, void, unknown> {
  const { baseUrl, model } = { ...DEFAULT_CONFIG, ...config }
  
  const systemPrompt = getSystemPrompt(analysisType)
  const userPrompt = `Analyze this document and provide a risk assessment:\n\n${text}`
  
  const response = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: `${systemPrompt}\n\n${userPrompt}`,
      stream: true
    })
  })
  
  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`)
  }
  
  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')
  
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    const lines = chunk.split('\n').filter(line => line.trim())
    
    for (const line of lines) {
      try {
        const json = JSON.parse(line)
        if (json.response) {
          yield json.response
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  }
}

function getSystemPrompt(analysisType: string): string {
  const prompts: Record<string, string> = {
    'document-risk': 'You are a document risk assessment expert. Analyze documents for potential risks, fraud indicators, and authenticity issues. Provide a risk score from 0-100.',
    'deepfake-detection': 'You are a deepfake detection expert. Analyze content for signs of AI-generated or manipulated media. Provide an authenticity score.',
    'medical-summary': 'You are a medical document analyst. Summarize medical records while maintaining HIPAA compliance. Extract key medical terminology.',
    'financial-fraud': 'You are a financial fraud detection expert. Analyze financial documents for fraud patterns, anomalies, and suspicious activities.',
    'legal-contract': 'You are a legal contract analyst. Review contracts for risky clauses, unfair terms, and potential legal issues.'
  }
  
  return prompts[analysisType] || prompts['document-risk']
}

function parseOllamaResponse(response: string, analysisType: string): any {
  // Extract risk score from response
  const riskScoreMatch = response.match(/risk score:?\s*(\d+)/i)
  const riskScore = riskScoreMatch ? parseInt(riskScoreMatch[1]) : 50
  
  // Determine risk level
  let riskLevel = 'Low'
  if (riskScore >= 86) riskLevel = 'Critical'
  else if (riskScore >= 61) riskLevel = 'High'
  else if (riskScore >= 26) riskLevel = 'Medium'
  
  return {
    riskScore,
    riskLevel,
    summary: response.substring(0, 500),
    insights: extractInsights(response),
    provider: 'ollama-local',
    model: 'llama3.2',
    timestamp: new Date().toISOString()
  }
}

function extractInsights(text: string): string[] {
  const insights: string[] = []
  const lines = text.split('\n')
  
  for (const line of lines) {
    if (line.match(/^[-•*]\s+/) || line.match(/^\d+\.\s+/)) {
      insights.push(line.replace(/^[-•*]\s+/, '').replace(/^\d+\.\s+/, '').trim())
    }
  }
  
  return insights.slice(0, 5)
}
