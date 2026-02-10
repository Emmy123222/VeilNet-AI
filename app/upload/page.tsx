'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle, Shield } from 'lucide-react'
import { useWallet, WalletMultiButton } from '@/lib/aleo-wallet-provider'
import { AppHeader } from '@/components/app-header'
import { HowItWorksCard } from '@/components/how-it-works-card'
import { FileUploadForm } from '@/components/file-upload-form'
import { UploadResultCard } from '@/components/upload-result-card'

interface AnalysisResult {
  id: string
  type: string
  summary: string
  score: number
  insights: string[]
  proofHash: string
  timestamp: string
}

export default function UploadPage() {
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setResult(null)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !analysisType || !connected) return

    setAnalyzing(true)
    setProgress(0)
    setError(null)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('analysisType', analysisType)

      // Update progress
      setProgress(20)

      // Call real AI API
      const response = await fetch('/api/upload-analyze', {
        method: 'POST',
        body: formData
      })

      setProgress(60)

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed')
      }

      setProgress(100)

      // Use real AI results
      const result: AnalysisResult = {
        id: data.analysis.id,
        type: analysisType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        summary: data.analysis.summary,
        score: data.analysis.riskScore,
        insights: data.analysis.insights,
        proofHash: data.analysis.fileHash,
        timestamp: new Date(data.analysis.timestamp * 1000).toISOString()
      }

      setResult(result)
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setAnalysisType('')
    setResult(null)
    setProgress(0)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader publicKey={publicKey || undefined} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Upload & Analyze</h1>
          <p className="text-muted-foreground">
            Upload documents or images for AI-powered analysis with zero-knowledge proofs
          </p>
        </div>

        {!connected && (
          <Alert className="mb-6">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Please connect your Aleo wallet to start analyzing files
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <FileUploadForm
              selectedFile={selectedFile}
              analysisType={analysisType}
              onFileSelect={handleFileSelect}
              onAnalysisTypeChange={setAnalysisType}
              onAnalyze={handleAnalyze}
              analyzing={analyzing}
              connected={connected}
            />

            {analyzing && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Processing...</CardTitle>
                  <CardDescription>
                    Analyzing your file with AI and generating zero-knowledge proof
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    {progress}% complete
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            {result && (
              <UploadResultCard
                result={result}
                onViewDetails={() => router.push(`/results?id=${result.id}`)}
                onAnalyzeAnother={handleReset}
              />
            )}

            {!result && !analyzing && <HowItWorksCard />}
          </div>
        </div>
      </div>
    </div>
  )
}
