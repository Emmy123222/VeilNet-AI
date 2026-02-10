'use client'

import { useState } from 'react'
import { useWallet } from '@/lib/aleo-wallet-provider'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertCircle } from 'lucide-react'
import { DocumentAnalyzerForm } from '@/components/document-analyzer-form'
import { AnalysisResultCard } from '@/components/analysis-result-card'
import { AleoResultCard } from '@/components/aleo-result-card'
import { AppHeader } from '@/components/app-header'
import { HowItWorksCard } from '@/components/how-it-works-card'
import { submitToAleo, getAleoErrorMessage } from '@/lib/aleo-transaction'

interface AnalysisResult {
  documentHash: string
  riskScore: number
  summary: string
  timestamp: number
  wordCount: number
  charCount: number
}

interface AleoResult {
  transactionId: string
  status: string
  blockHeight?: number
}

export default function AppPage() {
  const wallet = useWallet()
  const { connected, publicKey, requestTransaction, requestRecords } = wallet
  const router = useRouter()
  
  const [documentText, setDocumentText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [submittingToAleo, setSubmittingToAleo] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [aleoResult, setAleoResult] = useState<AleoResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setAnalyzing(true)
    setError(null)
    setAnalysisResult(null)
    setAleoResult(null)

    try {
      // Step 1: Analyze document locally
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText: documentText.trim() })
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysisResult(data.analysis)

      // Step 2: Submit to Aleo blockchain via wallet
      if (connected && requestTransaction && publicKey) {
        setSubmittingToAleo(true)
        
        try {
          const transactionId = await submitToAleo({
            requestTransaction,
            requestRecords,
            documentHash: data.analysis.documentHash,
            riskScore: data.analysis.riskScore,
            timestamp: data.analysis.timestamp,
            publicKey,
          })

          setAleoResult({
            transactionId,
            status: 'submitted',
            blockHeight: Math.floor(Math.random() * 1000000) + 500000 // placeholder; replace with real polling later
          })

        } catch (aleoError: any) {
          console.error('Aleo submission error:', aleoError)
          setError(getAleoErrorMessage(aleoError))
        } finally {
          setSubmittingToAleo(false)
        }
      } else if (connected) {
        setError('Wallet is connected but missing required methods (requestTransaction/publicKey). Try disconnecting, reconnecting, or updating Leo Wallet.')
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
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src="/veilnet-logo.png" alt="VeilNet AI" className="h-16 w-16 mx-auto mb-4 object-contain" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your Aleo wallet to start analyzing documents with zero-knowledge proofs
            </CardDescription>
          </CardHeader>
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

        {/* Analysis Result */}
        {analysisResult && <AnalysisResultCard result={analysisResult} />}

        {/* Aleo Result */}
        {aleoResult && (
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