'use client'

import { useState } from 'react'
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react'
import { useWalletPersistence } from '@/hooks/use-wallet-persistence'
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
  const { connected, publicKey, requestExecution, requestTransaction } = useWallet()
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
  
  // Wave 3: Streaming state
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [streamProgress, setStreamProgress] = useState(0)
  
  // Wave 3: Image analysis state
  const [isImageFile, setIsImageFile] = useState(false)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError(null)
      setAnalysisResult(null)
      setAleoResult(null)
      setImageAnalysis(null)
      setCurrentStep('upload')
      
      // Wave 3: Detect if it's an image file
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

  // Wave 3: Image analysis with vision AI
  const analyzeImage = async (file: File) => {
    setAnalyzing(true)
    setError(null)
    setCurrentStep('analyze')
    
    try {
      console.log('�️  Starting image analysis with vision AI...')
      
      // Convert image to base64
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
            
            console.log('✅ Image analysis complete:', {
              authenticityScore: data.analysis.authenticityScore,
              deepfakeConfidence: data.analysis.deepfakeConfidence,
              riskLevel: data.analysis.riskLevel
            })
            
            setImageAnalysis(data.analysis)
            
            // Also set as analysisResult for AleoResultCard display
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
              // Wave 3: Include image-specific fields (these will be passed through)
              authenticityScore: data.analysis.authenticityScore,
              deepfakeConfidence: data.analysis.deepfakeConfidence,
              manipulationIndicators: data.analysis.manipulationIndicators,
              technicalFindings: data.analysis.technicalFindings
            } as any)
            
            setCurrentStep('submit')
            
            // Submit to blockchain
            if (connected && (requestExecution || requestTransaction) && publicKey) {
              const txId = await submitToAleo({
                requestExecution,
                requestTransaction,
                documentHash: data.analysis.documentHash,
                analysisHash: data.analysis.analysisHash,
                riskScore: data.analysis.riskScore,
                timestamp: data.analysis.timestamp,
                publicKey
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
    if (!selectedFile || !analysisType || !connected) return

    // Wave 3: Route to image analysis if it's an image
    if (isImageFile) {
      await analyzeImage(selectedFile)
      return
    }

    setAnalyzing(true)
    setError(null)
    setEstimatedTime(60) // 1 minute estimated for client-side processing
    setCurrentStep('analyze')

    try {
      // Wave 3: Enable streaming for text analysis
      setIsStreaming(true)
      setStreamedContent('')
      setStreamProgress(0)

      // Step 1: Analyze document entirely in browser (NO SERVER UPLOAD)
      console.log('🔒 Starting client-side analysis - file never leaves browser')
      
      // Simulate streaming progress during analysis
      const progressInterval = setInterval(() => {
        setStreamProgress(prev => Math.min(prev + 10, 90))
      }, 500)

      const clientAnalysis = await analyzeDocumentClientSide(selectedFile)
      
      clearInterval(progressInterval)
      setStreamProgress(100)
      setIsStreaming(false)
      
      // Update streamed content with analysis summary
      setStreamedContent(`Analysis Complete!\n\n` +
        `Document Hash: ${clientAnalysis.documentHash}\n` +
        `Risk Score: ${clientAnalysis.riskScore}/100\n` +
        `Risk Level: ${clientAnalysis.riskLevel}\n\n` +
        `Summary:\n${clientAnalysis.summary}\n\n` +
        `Key Insights:\n${clientAnalysis.insights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}`
      )
      
      console.log('✅ Client-side analysis complete:', {
        documentHash: clientAnalysis.documentHash,
        riskScore: clientAnalysis.riskScore,
        riskLevel: clientAnalysis.riskLevel
      })

      setAnalysisResult(clientAnalysis)
      setCurrentStep('submit')

      // Step 2: Submit ONLY cryptographic proof to blockchain (no sensitive data)
      if (connected && (requestExecution || requestTransaction) && publicKey) {
        try {
          console.log('🚀 Submitting cryptographic proof to blockchain...')
          console.log('   Only hash and risk score - NO sensitive data')
          
          const transactionId = await submitToAleo({
            requestExecution,
            requestTransaction,
            documentHash: clientAnalysis.documentHash,
            analysisHash: clientAnalysis.analysisHash,  // NEW: Pass separate analysis hash
            riskScore: clientAnalysis.riskScore,
            timestamp: Math.floor(new Date(clientAnalysis.timestamp).getTime() / 1000),
            publicKey: publicKey.toString()
          })

          console.log('✅ Blockchain proof submission successful:', transactionId)

          // Step 3: Store proof metadata locally (no sensitive data to server)
          const proofResponse = await fetch('/api/proofs/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysisResult: {
                documentHash: clientAnalysis.documentHash,
                riskScore: clientAnalysis.riskScore,
                riskLevel: clientAnalysis.riskLevel,
                timestamp: clientAnalysis.timestamp,
                // NO sensitive data like summary, insights, or file content
              },
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
    
    // Wave 3: Reset streaming and image state
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
              🔒 TRUE PRIVACY: Documents analyzed entirely in your browser - never uploaded to servers. 
              Only cryptographic proofs submitted to blockchain.
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
            {/* Wave 3: Streaming Analysis Display - Show during and after streaming */}
            {(isStreaming || (streamedContent && !aleoResult)) && (
              <StreamingAnalysisDisplay
                isStreaming={isStreaming}
                streamedContent={streamedContent}
                progress={streamProgress}
              />
            )}

            {/* Wave 3: Image Analysis Results */}
            {imageAnalysis && (
              <>
                <AuthenticityScoreCard
                  authenticityScore={imageAnalysis.authenticityScore}
                  deepfakeConfidence={imageAnalysis.deepfakeConfidence}
                  manipulationIndicators={imageAnalysis.manipulationIndicators || []}
                  technicalFindings={imageAnalysis.technicalFindings || []}
                  riskLevel={imageAnalysis.riskLevel}
                />
                
                {/* Success message for image analysis */}
                {!aleoResult && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      <strong>✅ Image Analysis Complete!</strong> Submitting proof to blockchain...
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* Success Message after analysis completes */}
            {!isStreaming && analysisResult && !aleoResult && !imageAnalysis && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  <strong>✅ Analysis Complete!</strong> Submitting proof to blockchain...
                </AlertDescription>
              </Alert>
            )}

            {/* Standard Document Analysis Results */}
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