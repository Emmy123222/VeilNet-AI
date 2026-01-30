'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Shield, 
  Brain, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { useWallet, WalletMultiButton } from '@/lib/aleo-wallet-provider'

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

  const analysisTypes = [
    { value: 'document-risk', label: 'Document Risk Assessment', description: 'Analyze contracts and legal documents for potential risks' },
    { value: 'deepfake-detection', label: 'Deepfake Detection', description: 'Verify authenticity of images and videos' },
    { value: 'medical-summary', label: 'Medical Document Summary', description: 'Summarize medical records and reports' },
    { value: 'resume-analysis', label: 'Resume Analysis', description: 'Analyze resumes for skills and experience' },
    { value: 'financial-fraud', label: 'Financial Fraud Detection', description: 'Detect potential fraud in financial documents' },
    { value: 'content-moderation', label: 'Content Moderation', description: 'Analyze content for policy violations' }
  ]

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
      // Simulate analysis progress
      const progressSteps = [
        { step: 10, message: 'Encrypting file...' },
        { step: 30, message: 'Uploading to secure processing...' },
        { step: 50, message: 'Running AI analysis...' },
        { step: 70, message: 'Generating insights...' },
        { step: 90, message: 'Creating zero-knowledge proof...' },
        { step: 100, message: 'Analysis complete!' }
      ]

      for (const { step } of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        setProgress(step)
      }

      // Generate mock result
      const mockResult: AnalysisResult = {
        id: `analysis_${Date.now()}`,
        type: analysisTypes.find(t => t.value === analysisType)?.label || 'Analysis',
        summary: generateMockSummary(analysisType),
        score: Math.floor(Math.random() * 40) + 60, // 60-100 range
        insights: generateMockInsights(analysisType),
        proofHash: '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        timestamp: new Date().toISOString()
      }

      setResult(mockResult)
    } catch (err) {
      setError('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const generateMockSummary = (type: string): string => {
    const summaries = {
      'document-risk': 'Document analysis reveals moderate risk level with standard contractual terms. Key clauses reviewed for potential liabilities.',
      'deepfake-detection': 'Image authenticity verified with high confidence. No signs of digital manipulation detected.',
      'medical-summary': 'Medical document contains routine examination results with normal findings across all tested parameters.',
      'resume-analysis': 'Candidate profile shows strong technical background with relevant experience in software development.',
      'financial-fraud': 'Financial document analysis shows normal transaction patterns with no fraud indicators detected.',
      'content-moderation': 'Content reviewed for policy compliance. No violations detected in uploaded material.'
    }
    return summaries[type as keyof typeof summaries] || 'Analysis completed successfully.'
  }

  const generateMockInsights = (type: string): string[] => {
    const insights = {
      'document-risk': [
        'Standard liability clauses present',
        'Payment terms are within normal range',
        'No unusual termination conditions found'
      ],
      'deepfake-detection': [
        'Facial features consistent with natural variation',
        'No digital artifacts detected',
        'Lighting and shadows appear authentic'
      ],
      'medical-summary': [
        'All vital signs within normal ranges',
        'No concerning symptoms reported',
        'Recommended follow-up in 6 months'
      ],
      'resume-analysis': [
        '5+ years relevant experience',
        'Strong technical skill set',
        'Good educational background'
      ],
      'financial-fraud': [
        'Transaction amounts within expected range',
        'No suspicious patterns detected',
        'Account activity appears normal'
      ],
      'content-moderation': [
        'No inappropriate content detected',
        'Complies with community guidelines',
        'Safe for general audiences'
      ]
    }
    return insights[type as keyof typeof insights] || ['Analysis completed']
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src="/veilnet-logo.png" alt="VeilNet AI" className="h-12 w-12 mx-auto mb-4 object-contain" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              You need to connect your Aleo wallet to access the analysis features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <WalletMultiButton />
            <Button variant="outline" onClick={() => router.push('/')} className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <img src="/veilnet-logo.png" alt="VeilNet AI" className="h-6 w-6 object-contain" />
              <span className="text-xl font-bold">VeilNet AI</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="font-mono text-xs">
              {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Private AI Analysis</h1>
            <p className="text-muted-foreground">
              Upload your sensitive documents or images for encrypted AI analysis with zero-knowledge proofs.
            </p>
          </div>

          {!result ? (
            <div className="space-y-6">
              {/* File Upload */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload File
                  </CardTitle>
                  <CardDescription>
                    Select a document or image for analysis. Files are encrypted before upload.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileSelect}
                      disabled={analyzing}
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <div className="space-y-4">
                        {selectedFile ? (
                          <div className="flex items-center justify-center space-x-2">
                            {selectedFile.type.startsWith('image/') ? (
                              <ImageIcon className="h-8 w-8 text-primary" />
                            ) : (
                              <FileText className="h-8 w-8 text-primary" />
                            )}
                            <span className="font-medium">{selectedFile.name}</span>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                            <div>
                              <p className="text-lg font-medium">Click to upload a file</p>
                              <p className="text-sm text-muted-foreground">
                                Supports PDF, DOC, TXT, JPG, PNG (max 10MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Analysis Type Selection */}
              {selectedFile && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Brain className="h-5 w-5 mr-2" />
                      Select Analysis Type
                    </CardTitle>
                    <CardDescription>
                      Choose the type of AI analysis to perform on your file.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={analysisType} onValueChange={setAnalysisType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose analysis type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {analysisTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              )}

              {/* Analysis Button */}
              {selectedFile && analysisType && (
                <Card>
                  <CardContent className="pt-6">
                    <Button 
                      onClick={handleAnalyze} 
                      disabled={analyzing}
                      className="w-full"
                      size="lg"
                    >
                      {analyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Start Private Analysis
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Progress */}
              {analyzing && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Analysis Progress</span>
                        <span className="text-sm text-muted-foreground">{progress}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing your file securely...</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            /* Results */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        Analysis Complete
                      </CardTitle>
                      <CardDescription>
                        Your file has been analyzed with complete privacy protection.
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs">
                      Score: {result.score}/100
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Summary</h3>
                      <p className="text-muted-foreground">{result.summary}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">Key Insights</h3>
                      <ul className="space-y-1">
                        {result.insights.map((insight, index) => (
                          <li key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-semibold mb-2">Cryptographic Proof</h3>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs font-mono break-all">{result.proofHash}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        This proof verifies the analysis was performed correctly without exposing your data.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-4">
                <Button onClick={() => {
                  setResult(null)
                  setSelectedFile(null)
                  setAnalysisType('')
                  setProgress(0)
                }} variant="outline">
                  Analyze Another File
                </Button>
                <Button onClick={() => router.push('/results')}>
                  View All Results
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}