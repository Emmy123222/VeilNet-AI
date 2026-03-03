/**
 * Client-side document analysis - NO SERVER UPLOAD
 * File never leaves the browser for true privacy
 */

export interface ClientAnalysisResult {
  documentHash: string      // Clean 64-char hex, NO 0x prefix
  analysisHash: string      // Clean 64-char hex, NO 0x prefix
  riskScore: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  summary: string
  insights: string[]
  timestamp: string
  fileSize: number
  fileName: string
}

/**
 * Analyze document entirely in the browser.
 * NO file upload to server - true privacy.
 */
export async function analyzeDocumentClientSide(file: File): Promise<ClientAnalysisResult> {
  // Read file content in browser only
  const text = await readFileContent(file)

  // Generate secure hash of document content — NO 0x prefix
  const documentHash = await generateSecureHash(text)

  // Perform analysis locally
  const analysis = performLocalAnalysis(text)

  // Generate separate hash for analysis result — must be different from documentHash
  const analysisData = JSON.stringify({
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    summary: analysis.summary,
    insights: analysis.insights,
    timestamp: new Date().toISOString(),
    // Salt with fileName so analysisHash is always different from documentHash
    fileName: file.name,
    fileSize: file.size,
  })
  const analysisHash = await generateSecureHash(analysisData)

  // Safety check: hashes must never be equal (contract calls assert_neq)
  if (documentHash === analysisHash) {
    throw new Error('Hash collision detected — please try again.')
  }

  console.log('✅ Document hash (no 0x):', documentHash)
  console.log('✅ Analysis hash (no 0x):', analysisHash)

  return {
    documentHash,   // Always 64 hex chars, no 0x
    analysisHash,   // Always 64 hex chars, no 0x
    riskScore: analysis.riskScore,
    riskLevel: analysis.riskLevel,
    summary: analysis.summary,
    insights: analysis.insights,
    timestamp: new Date().toISOString(),
    fileSize: file.size,
    fileName: file.name,
  }
}

/**
 * Read file content in browser only.
 */
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => resolve(event.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Generate a clean SHA-256 hex hash in the browser.
 * ✅ Never adds 0x prefix — safe to pass directly to Aleo.
 */
async function generateSecureHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // Plain hex — no 0x prefix, always 64 characters
  const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  // Defensive strip just in case (should never happen with this impl)
  return hex.replace(/^0x/i, '')
}

/**
 * Perform analysis locally in browser.
 * No AI service calls — true privacy.
 */
function performLocalAnalysis(text: string): {
  riskScore: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  summary: string
  insights: string[]
} {
  const words = text.trim().split(/\s+/)
  const wordCount = words.length
  const charCount = text.length
  const hasNumbers = /\d/.test(text)
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(text)
  const hasUpperCase = /[A-Z]/.test(text)
  const hasUrls = /https?:\/\//.test(text)
  const hasEmails = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(text)

  // Calculate risk score based on content patterns
  let riskScore = 0

  if (wordCount < 10) riskScore += 30        // Very short — suspicious
  if (wordCount > 5000) riskScore += 15      // Very long — complex
  if (!hasNumbers) riskScore += 10           // No numbers — unusual for real docs
  if (!hasUpperCase) riskScore += 10         // No uppercase — possibly obfuscated
  if (hasUrls) riskScore += 10              // URLs present — potential phishing
  if (hasEmails) riskScore += 5             // Emails present

  // Entropy check — very repetitive content is suspicious
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size
  const repetitionRatio = uniqueWords / Math.max(wordCount, 1)
  if (repetitionRatio < 0.2) riskScore += 20  // Highly repetitive

  riskScore = Math.min(100, Math.max(0, riskScore))

  const riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' =
    riskScore <= 25 ? 'Low' :
    riskScore <= 60 ? 'Medium' :
    riskScore <= 85 ? 'High' : 'Critical'

  const insights = [
    `Document contains ${wordCount.toLocaleString()} words (${charCount.toLocaleString()} characters)`,
    `Unique word ratio: ${(repetitionRatio * 100).toFixed(1)}% — ${repetitionRatio > 0.5 ? 'good variety' : 'repetitive content detected'}`,
    `Content complexity: ${hasSpecialChars ? 'High' : 'Low'}`,
    `Format validation: ${hasNumbers && hasUpperCase ? 'Passed' : 'Needs review'}`,
    hasUrls ? '⚠️ URLs detected in document' : '✅ No URLs detected',
    hasEmails ? '⚠️ Email addresses detected' : '✅ No email addresses detected',
  ]

  const summary = `Privacy-preserving local analysis completed. Document shows ${riskLevel.toLowerCase()} risk indicators based on content patterns, structure, and complexity. No document content was uploaded to any server.`

  return { riskScore, riskLevel, summary, insights }
}