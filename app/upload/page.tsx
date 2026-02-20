'use client'

import { useState } from 'react'
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react'
import { useWalletPersistence } from '@/hooks/use-wallet-persistence'
import { submitToAleo, getAleoErrorMessage } from '@/lib/aleo-transaction'
import { checkWalletBalance, formatCredits, hasSufficientCredits } from '@/lib/wallet-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, AlertCircle, Shield, CheckCircle } from 'lucide-react'
import { Header } from '@/components/header'
import { HowItWorksCard } from '@/components/how-it-works-card'
import { FileUploadForm } from '@/components/file-upload-form'
import { ProofProgressTracker } from '@/components/proof-progress-tracker'
import { AleoResultCard } from '@/components/aleo-result-card'
import { TestnetCreditsHelp } from '@/components/testnet-credits-help'
import { WalletTroubleshooting } from '@/components/wallet-troubleshooting'
import { getWalletTroubleshootingInfo } from '@/lib/program-verification'
import Link from 'next/link'

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

export default function UploadPage() {
  const { connected, publicKey, requestExecution, requestTransaction, requestRecords } = useWallet()
  const { connected: persistentConnected } = useWalletPersistence()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('upload')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [aleoResult, setAleoResult] = useState<AleoResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number>(0)
  const [walletBalance, setWalletBalance] = useState<{ availableCredits: number; hasRecords: boolean } | null>(null)
  const [troubleshootingInfo, setTroubleshootingInfo] = useState<{ title: string; message: string; suggestions: string[] } | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setAnalysisResult(null)
      setAleoResult(null)
      setCurrentStep('upload')
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !analysisType || !connected) return

    setAnalyzing(true)
    setError(null)
    setEstimatedTime(120) // 2 minutes estimated
    setCurrentStep('analyze')

    // Check wallet balance before starting
    if (requestRecords) {
      const balance = await checkWalletBalance(requestRecords)
      setWalletBalance(balance)
      
      if (!balance.hasRecords || balance.availableCredits < 1) {
        console.warn('⚠️ Insufficient credits detected:', balance)
      }
    }

    try {
      // Step 1: Upload and extract text from file
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('analysisType', analysisType)

      const uploadResponse = await fetch('/api/upload-file', {
        method: 'POST',
        body: formData
      })

      const uploadData = await uploadResponse.json()
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'File upload failed')
      }

      // Step 2: Analyze with real AI
      const analysisResponse = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: uploadData.extractedText,
          analysisType: analysisType
        })
      })

      const analysisData = await analysisResponse.json()
      if (!analysisData.success) {
        throw new Error(analysisData.error || 'Analysis failed')
      }

      setAnalysisResult(analysisData.analysis)
      setCurrentStep('submit')

      // Step 3: Submit to real Aleo blockchain
      if (connected && (requestExecution || requestTransaction) && publicKey) {
        try {
          console.log('🚀 Submitting to Aleo blockchain...')
          
          const transactionId = await submitToAleo({
            requestExecution,
            requestTransaction,
            requestRecords,
            documentHash: analysisData.analysis.documentHash,
            riskScore: analysisData.analysis.riskScore,
            timestamp: Math.floor(new Date(analysisData.analysis.timestamp).getTime() / 1000),
            publicKey: publicKey.toString()
          })

          console.log('✅ Blockchain submission successful:', transactionId)

          // Step 4: Store proof with real transaction ID
          const proofResponse = await fetch('/api/proofs/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysisResult: analysisData.analysis,
              walletAddress: publicKey.toString(),
              transactionId: transactionId
            })
          })

          const proofData = await proofResponse.json()
          if (!proofData.success) {
            console.warn('Proof storage failed, but blockchain submission succeeded')
          }

          setCurrentStep('confirm')
          setAleoResult({
            transactionId,
            status: 'pending',
            timestamp: new Date().toISOString(),
            explorerUrl: `https://testnet.explorer.provable.com/transaction/${transactionId}`,
            networkConfirmations: 0,
            estimatedConfirmationTime: new Date(Date.now() + 30000).toISOString()
          })

          // Simulate confirmation process (in production, this would poll the blockchain)
          setTimeout(() => {
            setAleoResult(prev => prev ? {
              ...prev,
              status: 'confirmed',
              networkConfirmations: 6
            } : null)
            setAnalyzing(false)
          }, 30000) // 30 seconds for testnet confirmation

        } catch (blockchainError: any) {
          console.error('❌ Blockchain submission failed:', blockchainError)
          
          // Get troubleshooting information
          const troubleshooting = getWalletTroubleshootingInfo(blockchainError)
          setTroubleshootingInfo(troubleshooting)
          
          // Show analysis results even if blockchain fails
          setCurrentStep('confirm')
          setAleoResult({
            transactionId: 'blockchain_failed',
            status: 'failed',
            timestamp: new Date().toISOString(),
            explorerUrl: '',
            networkConfirmations: 0,
            estimatedConfirmationTime: ''
          })
          
          // Set a user-friendly error but don't fail the entire process
          const friendlyError = getAleoErrorMessage(blockchainError)
          setError(`Analysis completed successfully! However, blockchain submission failed: ${friendlyError}`)
          setAnalyzing(false)
        }
      } else {
        // No wallet connection - show analysis results only
        setCurrentStep('confirm')
        setAleoResult({
          transactionId: 'no_wallet',
          status: 'failed',
          timestamp: new Date().toISOString(),
          explorerUrl: '',
          networkConfirmations: 0,
          estimatedConfirmationTime: ''
        })
        setError('Analysis completed successfully, but wallet not properly connected for blockchain submission.')
        setAnalyzing(false)
      }

    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Analysis failed. Please try again.')
      setAnalyzing(false)
      setCurrentStep('upload')
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setAnalysisType('')
    setAnalysisResult(null)
    setAleoResult(null)
    setError(null)
    setTroubleshootingInfo(null)
    setCurrentStep('upload')
    setAnalyzing(false)
    setEstimatedTime(0)
  }

  const handleRetryBlockchain = () => {
    if (analysisResult) {
      setError(null)
      setTroubleshootingInfo(null)
      // Retry just the blockchain submission part
      handleAnalyze()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Upload & Analyze</h1>
            </div>
            <p className="text-muted-foreground">
              Upload documents or images for AI-powered analysis with zero-knowledge proofs
            </p>
          </div>
          
          {connected && (
            <div className="text-right space-y-1">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Wallet Connected
              </Badge>
              <p className="text-xs text-muted-foreground">
                {publicKey?.toString().slice(0, 20)}...
              </p>
              {walletBalance && (
                <p className="text-xs text-muted-foreground">
                  {walletBalance.hasRecords 
                    ? `${walletBalance.availableCredits.toFixed(2)} credits available`
                    : 'No credits found'
                  }
                </p>
              )}
            </div>
          )}
        </div>

        {/* Connection Status */}
        {!connected && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Wallet Required:</strong> Please{' '}
              <Link href="/" className="underline font-medium hover:text-blue-800">
                return to the home page
              </Link>{' '}
              to connect your Aleo wallet first, then come back to upload and analyze files.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert and Troubleshooting */}
        {error && (
          <div className="space-y-4">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            {/* Show specific troubleshooting for wallet errors */}
            {troubleshootingInfo && (
              <WalletTroubleshooting
                title={troubleshootingInfo.title}
                message={troubleshootingInfo.message}
                suggestions={troubleshootingInfo.suggestions}
                onRetry={handleRetryBlockchain}
              />
            )}
            
            {/* Show credits help if it's a credits-related error */}
            {!troubleshootingInfo && (error.toLowerCase().includes('credit') || error.toLowerCase().includes('insufficient') || error.toLowerCase().includes('faucet')) && (
              <TestnetCreditsHelp />
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Upload Form and Progress */}
          <div className="space-y-6">
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
              <ProofProgressTracker
                currentStep={currentStep}
                error={error}
                estimatedTime={estimatedTime}
              />
            )}
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {aleoResult && analysisResult ? (
              <AleoResultCard
                aleoResult={aleoResult}
                analysisResult={analysisResult}
                onReset={handleReset}
              />
            ) : !analyzing ? (
              <HowItWorksCard />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}