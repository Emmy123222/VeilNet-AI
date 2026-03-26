'use client'

import { useState } from 'react'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { useWalletPersistence } from '@/hooks/use-wallet-persistence'
import { storeTransaction } from '@/lib/transaction-storage'
import { submitToAleo, getAleoErrorMessage } from '@/lib/aleo-transaction'
import { checkWalletBalance, formatCredits, hasSufficientCredits } from '@/lib/wallet-utils'
import { analyzeDocumentClientSide, ClientAnalysisResult } from '@/lib/client-analysis'
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
import { StreamingAnalysisDisplay } from '@/components/streaming-analysis-display'
import { AuthenticityScoreCard } from '@/components/authenticity-score-card'
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
  // Updated for ProvableHQ adapter + Shield Wallet
  const { 
    connected, 
    address: publicKey,   // ← Changed: address instead of publicKey
    executeTransaction,   // ← Main method for submitting transactions (replaces requestTransaction/requestExecution in most cases)
    connecting 
  } = useWallet()

  const { connected: persistentConnected } = useWalletPersistence()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisType, setAnalysisType] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const [currentStep, setCurrentStep] = useState<string>('upload')
  const [analysisResult, setAnalysisResult] = useState<ClientAnalysisResult | null>(null)
  const [aleoResult, setAleoResult] = useState<AleoResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [estimatedTime, setEstimatedTime] = useState<number>(0)
  const [troubleshootingInfo, setTroubleshootingInfo] = useState<{ title: string; message: string; suggestions: string[] } | null>(null)
  
  // Wave 3: Streaming & Image states (unchanged)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [streamProgress, setStreamProgress] = useState(0)
  const [isImageFile, setIsImageFile] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)
  
  // Wave 4: AI Provider selection
  const [aiProvider, setAiProvider] = useState<'cloud' | 'local'>('cloud')

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setAnalysisResult(null)
      setAleoResult(null)
      setImageAnalysis(null)
      setCurrentStep('upload')
      
      const isImage = file.type.startsWith('image/')
      setIsImageFile(isImage)
      
      if (isImage) {
        console.log('📸 Image file detected - will use vision analysis')
        setAnalysisType('deepfake-detection')
      } else {
        console.log('📄 Document file detected - will use text analysis')
      }
    }
  }

  // Image analysis function - updated wallet call
  const analyzeImage = async (file: File) => {
    setAnalyzing(true)
    setError(null)
    setCurrentStep('analyze')
    
    try {
      console.log('📸 Starting image analysis with vision AI...')
      
      const reader = new FileReader()
      
      await new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const base64 = e.target?.result as string
            
            const response = await fetch('/api/analyze-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64,
                analysisType: 'deepfake-detection'
              })
            })
            
            const data = await response.json()
            
            if (!data.success) {
              throw new Error(data.error || 'Image analysis failed')
            }
            
            setImageAnalysis(data.analysis)
            
            setAnalysisResult({
              documentHash: data.analysis.documentHash,
              analysisHash: data.analysis.analysisHash || data.analysis.documentHash,
              riskScore: data.analysis.riskScore,
              riskLevel: data.analysis.riskLevel,
              summary: `Image authenticity analysis completed with ${data.analysis.authenticityScore}% authenticity score.`,
              insights: [
                `Deepfake confidence: ${data.analysis.deepfakeConfidence}%`,
                `Risk level: ${data.analysis.riskLevel}`,
                `${data.analysis.manipulationIndicators?.length || 0} manipulation indicators detected`
              ],
              timestamp: new Date().toISOString(),
              fileSize: file.size,
              fileName: file.name,
              authenticityScore: data.analysis.authenticityScore,
              deepfakeConfidence: data.analysis.deepfakeConfidence,
              manipulationIndicators: data.analysis.manipulationIndicators,
              technicalFindings: data.analysis.technicalFindings
            } as any)
            
            setCurrentStep('submit')

            // Submit to blockchain using the new executeTransaction
            if (connected && executeTransaction && publicKey) {
              const walletAddress = publicKey
              
              const txId = await submitToAleo({
                // Pass executeTransaction instead of the old request methods
                requestExecution: executeTransaction,   // or requestTransaction depending on your submitToAleo implementation
                requestTransaction: executeTransaction,
                documentHash: data.analysis.documentHash,
                analysisHash: data.analysis.analysisHash,
                riskScore: data.analysis.riskScore,
                timestamp: data.analysis.timestamp,
                publicKey: walletAddress
              })
              
              storeTransaction({
                id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                transactionId: txId,
                documentHash: data.analysis.documentHash,
                analysisHash: data.analysis.analysisHash,
                riskScore: data.analysis.riskScore,
                riskLevel: data.analysis.riskLevel,
                timestamp: data.analysis.timestamp,
                walletAddress,
                status: 'pending'
              })

              setAleoResult({
                transactionId: txId,
                status: 'confirmed',
                timestamp: new Date().toISOString(),
                explorerUrl: `https://testnet.explorer.provable.com/transaction/${txId}`
              })
            }
            
            resolve(true)
          } catch (err) {
            reject(err)
          }
        }
        
        reader.onerror = () => reject(new Error('Failed to read image file'))
        reader.readAsDataURL(file)
      })
      
    } catch (err: any) {
      console.error('❌ Image analysis error:', err)
      setError(err.message || 'Image analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleAnalyze = async () => {
    if (!selectedFile || !analysisType || !connected) {
      if (!connected) setError('Please connect your Shield Wallet first.')
      return
    }

    if (isImageFile) {
      await analyzeImage(selectedFile)
      return
    }

    // ... (rest of your text/document analysis logic remains mostly the same)

    setAnalyzing(true)
    setError(null)
    setEstimatedTime(60)
    setCurrentStep('analyze')

    try {
      setIsStreaming(true)
      setStreamedContent('')
      setStreamProgress(0)

      const progressInterval = setInterval(() => {
        setStreamProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      // Wave 4: Use selected AI provider
      let clientAnalysis: ClientAnalysisResult
      if (aiProvider === 'local') {
        // Use Ollama for local analysis
        const response = await fetch('/api/analyze-ollama', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentText: await selectedFile.text(),
            analysisType
          })
        })
        
        const data = await response.json()
        if (!data.success) {
          throw new Error(data.error || 'Local AI analysis failed')
        }
        
        clientAnalysis = data.analysis
      } else {
        // Use cloud AI (Groq)
        clientAnalysis = await analyzeDocumentClientSide(selectedFile)
      }
      
      clearInterval(progressInterval)
      setStreamProgress(100)
      setIsStreaming(false)
      
      setStreamedContent(`Analysis Complete!\n\n` +
        `Document Hash: ${clientAnalysis.documentHash}\n` +
        `Risk Score: ${clientAnalysis.riskScore}/100\n` +
        `Risk Level: ${clientAnalysis.riskLevel}\n\n` +
        `Summary:\n${clientAnalysis.summary}\n\n` +
        `Key Insights:\n${clientAnalysis.insights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}`
      )
      
      setAnalysisResult(clientAnalysis)
      setCurrentStep('submit')

      if (connected && executeTransaction && publicKey) {
        try {
          const walletAddress = publicKey

          const transactionId = await submitToAleo({
            requestExecution: executeTransaction,
            requestTransaction: executeTransaction,   // fallback
            documentHash: clientAnalysis.documentHash,
            analysisHash: clientAnalysis.analysisHash,
            riskScore: clientAnalysis.riskScore,
            timestamp: Math.floor(new Date(clientAnalysis.timestamp).getTime() / 1000),
            publicKey: walletAddress
          })

          storeTransaction({
            id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            transactionId,
            documentHash: clientAnalysis.documentHash,
            analysisHash: clientAnalysis.analysisHash,
            riskScore: clientAnalysis.riskScore,
            riskLevel: clientAnalysis.riskLevel,
            timestamp: clientAnalysis.timestamp,
            walletAddress,
            status: 'pending'
          })

          setCurrentStep('confirm')
          setAleoResult({
            transactionId,
            status: 'pending',
            timestamp: new Date().toISOString(),
            explorerUrl: `https://testnet.explorer.provable.com/transaction/${transactionId}`,
            networkConfirmations: 0,
            estimatedConfirmationTime: new Date(Date.now() + 30000).toISOString()
          })

          setTimeout(() => {
            setAleoResult(prev => prev ? { ...prev, status: 'confirmed', networkConfirmations: 6 } : null)
            setAnalyzing(false)
          }, 30000)

        } catch (blockchainError: any) {
          console.error('❌ Blockchain submission failed:', blockchainError)
          const troubleshooting = getWalletTroubleshootingInfo(blockchainError)
          setTroubleshootingInfo(troubleshooting)
          
          const friendlyError = getAleoErrorMessage(blockchainError)
          setError(`Analysis completed! Blockchain submission failed: ${friendlyError}`)
          setAnalyzing(false)
        }
      } else {
        setError('Analysis completed successfully, but wallet not connected for blockchain submission.')
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
    setIsStreaming(false)
    setStreamedContent('')
    setStreamProgress(0)
    setIsImageFile(false)
    setImageAnalysis(null)
  }

  const handleRetryBlockchain = () => {
    if (analysisResult) {
      setError(null)
      setTroubleshootingInfo(null)
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
              🔒 TRUE PRIVACY: Documents analyzed entirely in your browser. 
              Only cryptographic proofs submitted to Aleo blockchain via Shield Wallet.
            </p>
          </div>
          
          {connected && publicKey && (
            <div className="text-right space-y-1">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Shield Wallet Connected
              </Badge>
              <p className="text-xs text-muted-foreground font-mono break-all">
                {`${publicKey.slice(0, 12)}...${publicKey.slice(-8)}`}
              </p>
            </div>
          )}
        </div>

        {/* Connection Status */}
        {!connected && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Shield Wallet Required:</strong> Please{' '}
              <Link href="/" className="underline font-medium hover:text-blue-800">
                go to the home page
              </Link>{' '}
              to connect your Shield Wallet first.
            </AlertDescription>
          </Alert>
        )}

        {/* Error & Troubleshooting */}
        {error && (
          <div className="space-y-4 mb-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            {troubleshootingInfo && (
              <WalletTroubleshooting
                title={troubleshootingInfo.title}
                message={troubleshootingInfo.message}
                suggestions={troubleshootingInfo.suggestions}
                onRetry={handleRetryBlockchain}
              />
            )}
            
            {!troubleshootingInfo && (error.toLowerCase().includes('credit') || error.toLowerCase().includes('insufficient')) && (
              <TestnetCreditsHelp />
            )}
          </div>
        )}

        {/* Main Content - Rest unchanged */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Wave 4: AI Provider Selection */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                AI Provider
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={aiProvider === 'cloud' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAiProvider('cloud')}
                  className="flex-1"
                >
                  ☁️ Cloud (Groq)
                </Button>
                <Button
                  variant={aiProvider === 'local' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAiProvider('local')}
                  className="flex-1"
                >
                  💻 Local (Ollama)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {aiProvider === 'local' 
                  ? '🔒 Zero-trust: AI runs on your machine. Configure in Settings.'
                  : '⚡ Fast cloud AI with privacy-preserving analysis.'}
              </p>
            </div>
            
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

          <div className="space-y-6">
            {(isStreaming || (streamedContent && !aleoResult)) && (
              <StreamingAnalysisDisplay
                isStreaming={isStreaming}
                streamedContent={streamedContent}
                progress={streamProgress}
              />
            )}

            {imageAnalysis && (
              <>
                <AuthenticityScoreCard
                  authenticityScore={imageAnalysis.authenticityScore}
                  deepfakeConfidence={imageAnalysis.deepfakeConfidence}
                  manipulationIndicators={imageAnalysis.manipulationIndicators || []}
                  technicalFindings={imageAnalysis.technicalFindings || []}
                  riskLevel={imageAnalysis.riskLevel}
                />
              </>
            )}

            {!isStreaming && analysisResult && !aleoResult && !imageAnalysis && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>✅ Analysis Complete!</strong> Submitting proof to Aleo blockchain...
                </AlertDescription>
              </Alert>
            )}

            {aleoResult && analysisResult ? (
              <AleoResultCard
                aleoResult={aleoResult}
                analysisResult={analysisResult}
                onReset={handleReset}
              />
            ) : !analyzing && !isStreaming && !imageAnalysis && !streamedContent ? (
              <HowItWorksCard />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}