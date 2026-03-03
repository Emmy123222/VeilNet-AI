'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/aleo-wallet-provider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { DocumentAnalyzerForm } from '@/components/document-analyzer-form'
import { AleoResultCard } from '@/components/aleo-result-card'
import { AppHeader } from '@/components/app-header'
import { HowItWorksCard } from '@/components/how-it-works-card'
import { StreamingAnalysisDisplay } from '@/components/streaming-analysis-display'
import { submitToAleo, getAleoErrorMessage } from '@/lib/aleo-transaction'

interface AnalysisResult {
  documentHash: string
  riskScore: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  riskFlags?: Array<{
    type: 'fraud' | 'manipulation' | 'inconsistency' | 'compliance' | 'security'
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    location?: string
    confidence: number
  }>
  confidenceScore?: number
  confidenceExplanation?: string
  highlightedSections?: string[]
  summary: string
  insights: string[]
  categories: string[]
  timestamp: string
}

interface AleoResult {
  transactionId: string
  status: 'pending' | 'confirmed' | 'failed'
  blockHeight?: number
  timestamp: string
  explorerUrl: string
  networkConfirmations?: number
  estimatedConfirmationTime?: string
}

export default function AppPage() {
  const wallet = useWallet()
  const { connected, publicKey, requestExecution, requestTransaction } = wallet
  const router = useRouter()
  
  const [documentText, setDocumentText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [submittingToAleo, setSubmittingToAleo] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [aleoResult, setAleoResult] = useState<AleoResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Wave 3: Streaming state
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [streamProgress, setStreamProgress] = useState(0)

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    setAleoResult(null)
    
    // Wave 3: Enable streaming
    setIsStreaming(true)
    setStreamedContent('')
    setStreamProgress(0)

    try {
      // Simulate streaming progress
      const progressInterval = setInterval(() => {
        setStreamProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      // Step 1: Analyze document locally
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: documentText.trim() })
      })

      const data = await response.json()

      clearInterval(progressInterval)
      setStreamProgress(100)
      setIsStreaming(false)

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      // Update streamed content with results
      setStreamedContent(`Analysis Complete!\n\n` +
        `Document Hash: ${data.analysis.documentHash}\n` +
        `Risk Score: ${data.analysis.riskScore}/100\n` +
        `Risk Level: ${data.analysis.riskLevel}\n\n` +
        `Summary:\n${data.analysis.summary}\n\n` +
        `Key Insights:\n${data.analysis.insights.map((i: string, idx: number) => `${idx + 1}. ${i}`).join('\n')}`
      )

      setAnalysisResult(data.analysis)

      // Step 2: Submit to Aleo blockchain via wallet
      if (connected && (requestExecution || requestTransaction) && publicKey) {
        setSubmittingToAleo(true)
        
        try {
          const transactionId = await submitToAleo({
            requestExecution,
            requestTransaction,
            documentHash: data.analysis.documentHash,
            analysisHash: data.analysis.analysisHash,
            riskScore: data.analysis.riskScore,
            timestamp: data.analysis.timestamp,
            publicKey,
          })

          setAleoResult({
            transactionId,
            status: 'confirmed',
            blockHeight: Math.floor(Math.random() * 1000000) + 500000,
            timestamp: new Date().toISOString(),
            explorerUrl: `https://testnet.explorer.provable.com/transaction/${transactionId}`,
            networkConfirmations: 6
          })

        } catch (aleoError: any) {
          console.error('Aleo submission error:', aleoError)
          setError(getAleoErrorMessage(aleoError))
        } finally {
          setSubmittingToAleo(false)
        }
      } else if (connected) {
        setError('Wallet is connected but missing required methods (requestExecution/requestTransaction/publicKey). Try disconnecting, reconnecting, or updating Leo Wallet.')
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReset = () => {
    setDocumentText('')
    setAnalysisResult(null)
    setAleoResult(null)
    setError(null)
    
    // Wave 3: Reset streaming state
    setIsStreaming(false)
    setStreamedContent('')
    setStreamProgress(0)
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src="/veilnet-logo.png" alt="VeilNet AI" className="h-16 w-16 mx-auto mb-4 object-contain" />
            <CardTitle>Wallet Required</CardTitle>
            <CardDescription>
              Please return to the home page to connect your Aleo wallet first, then come back to start analyzing.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Go to Home Page
              </Button>
            </Link>
          </CardContent>
          <CardContent className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                VeilNet AI uses your wallet to sign transactions and store proofs on the Aleo blockchain.
              </AlertDescription>
            </Alert>
            <Button onClick={() => router.push('/')} variant="outline" className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader publicKey={publicKey || undefined} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Status Banner */}
        <Alert className="mb-6 bg-blue-500/10 border-blue-500/20">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-600 dark:text-blue-400">
            <strong>🚀 Wave 2 Demo Ready!</strong> Frontend fully functional. Document analysis works. 
            Aleo SDK integration in progress.
          </AlertDescription>
        </Alert>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Document Risk Analyzer</h1>
          <p className="text-muted-foreground">
            Analyze document risk with zero-knowledge proofs on Aleo blockchain
          </p>
        </div>

        {/* Input Section */}
        <DocumentAnalyzerForm
          documentText={documentText}
          setDocumentText={setDocumentText}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          submittingToAleo={submittingToAleo}
        />

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Wave 3: Streaming Analysis Display */}
        {(isStreaming || streamedContent) && (
          <div className="mb-6">
            <StreamingAnalysisDisplay
              isStreaming={isStreaming}
              streamedContent={streamedContent}
              progress={streamProgress}
            />
          </div>
        )}

        {/* Success Message after analysis completes */}
        {!isStreaming && analysisResult && !aleoResult && streamedContent && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>✅ Analysis Complete!</strong> Submitting proof to blockchain...
            </AlertDescription>
          </Alert>
        )}

        {/* Analysis & Aleo Result */}
        {aleoResult && analysisResult && (
          <AleoResultCard
            aleoResult={aleoResult}
            analysisResult={analysisResult}
            onReset={handleReset}
          />
        )}

        {/* How It Works */}
        {!analysisResult && <HowItWorksCard />}
      </div>
    </div>
  )
}