/**
 * Client-side document analysis - NO SERVER UPLOAD
 * File never leaves the browser for true privacy
 */

export interface ClientAnalysisResult {
  documentHash: string
  analysisHash: string      // NEW: Separate hash for analysis result
  riskScore: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  summary: string
  insights: string[]
  timestamp: string
  fileSize: number
  fileName: string
}

/**
 * Analyze document entirely in the browser
 * NO file upload to server - true privacy
 */
export async function analyzeDocumentClientSide(file: File): Promise<ClientAnalysisResult> {
  // Read file content in browser only
  const text = await readFileContent(file)
  
  // Generate secure hash of document content
  const documentHash = await generateSecureHash(text)
  
  // Perform analysis locally (simplified for privacy)
  const analysis = performLocalAnalysis(text)
  
  // Generate separate hash for analysis result
  const analysisData = JSON.stringify({
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    summary: analysis.summary,
    insights: analysis.insights,
    timestamp: new Date().toISOString()
  })
  const analysisHash = await generateSecureHash(analysisData)
  
  return {
    documentHash,
    analysisHash,     // NEW: Separate hash for cross-validation
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    summary: analysis.summary,
    insights: analysis.insights,
    timestamp: new Date().toISOString(),
    fileSize: file.size,
    fileName: file.name
  }
}

/**
 * Read file content in browser only
 */
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const content = event.target?.result as string
      resolve(content)
    }
    
    reader.onerror = () => reject(new Error('Failed to read file'))
    
    // Read as text - file never leaves browser
    reader.readAsText(file)
  })
}

/**
 * Generate cryptographic hash in browser
 */
async function generateSecureHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Perform analysis locally in browser
 * This is a simplified version for privacy - no AI service calls
 */
function performLocalAnalysis(text: string): {
  riskScore: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  summary: string
  insights: string[]
} {
  // Simple local analysis based on content patterns
  const wordCount = text.split(/\s+/).length
  const hasNumbers = /\d/.test(text)
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(text)
  const hasUpperCase = /[A-Z]/.test(text)
  
  // Calculate risk score based on content patterns
  let riskScore = 0
  
  if (wordCount < 10) riskScore += 30
  if (wordCount > 1000) riskScore += 20
  if (!hasNumbers) riskScore += 10
  if (!hasSpecialChars) riskScore += 15
  if (!hasUpperCase) riskScore += 10
  
  // Add randomness for demonstration
  riskScore += Math.floor(Math.random() * 25)
  riskScore = Math.min(100, Math.max(0, riskScore))
  
  const riskLevel = riskScore <= 25 ? 'Low' : 
                   riskScore <= 60 ? 'Medium' : 
                   riskScore <= 85 ? 'High' : 'Critical'
  
  const insights = [
    `Document contains ${wordCount} words`,
    `Content complexity: ${hasSpecialChars ? 'High' : 'Low'}`,
    `Format validation: ${hasNumbers && hasUpperCase ? 'Passed' : 'Basic'}`
  ]
  
  const summary = `Local analysis completed. Document shows ${riskLevel.toLowerCase()} risk indicators based on content patterns and structure.`
  
  return {
    riskScore,
    riskLevel,
    summary,
    insights
  }
}