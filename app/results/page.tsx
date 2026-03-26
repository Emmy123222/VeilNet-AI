'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ModelReputationCard } from '@/components/model-reputation-card'
import { ProofSharingCard } from '@/components/proof-sharing-card'
import { 
  ArrowLeft,
  Search,
  Filter,
  FileText,
  Image as ImageIcon,
  Shield,
  Calendar,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react'
import { useWallet, WalletMultiButton } from '@/lib/aleo-wallet-provider'

interface AnalysisResult {
  id: string
  type: string
  fileName: string
  summary: string
  score: number
  proofHash: string
  timestamp: string
  status: 'completed' | 'processing' | 'failed'
}

export default function ResultsPage() {
  const { connected, address: publicKey } = useWallet()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch real results from API when wallet is connected
  const fetchResults = async () => {
    if (!connected || !publicKey) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/proofs/history?wallet=${publicKey}`)
      const data = await response.json()
      
      if (data.success && data.proofs) {
        // Transform proof data to match AnalysisResult interface
        const transformedResults: AnalysisResult[] = data.proofs.map((proof: any) => ({
          id: proof.id.toString(),
          type: proof.documentType || 'Document Analysis',
          fileName: proof.fileName || 'Unknown File',
          summary: proof.summary || 'Analysis completed successfully',
          score: proof.riskScore || 0,
          proofHash: proof.proofHash,
          timestamp: proof.timestamp,
          status: proof.status === 'confirmed' ? 'completed' : proof.status
        }))
        setResults(transformedResults)
      }
    } catch (error) {
      console.error('Failed to fetch results:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch results when component mounts and wallet is connected
  React.useEffect(() => {
    fetchResults()
  }, [connected, publicKey])

  const filteredResults = results.filter(result => {
    const matchesSearch = result.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.type.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || result.type.toLowerCase().includes(filterType.toLowerCase())
    return matchesSearch && matchesFilter
  })

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.match(/\.(jpg|jpeg|png|gif)$/i)) {
      return <ImageIcon className="h-4 w-4" />
    }
    return <FileText className="h-4 w-4" />
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <img src="/veilnet-logo.png" alt="VeilNet AI" className="h-12 w-12 mx-auto mb-4 object-contain" />
            <CardTitle>Wallet Required</CardTitle>
            <CardDescription>
              Please return to the home page to connect your Aleo wallet first, then come back to view your results.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90">
                Go to Home Page
              </Button>
            </Link>
          </CardContent>
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
            <Button onClick={() => router.push('/upload')} size="sm">
              New Analysis
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Analysis Results</h1>
            <p className="text-muted-foreground">
              View and manage your private AI analysis history with cryptographic proofs.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Analyses</p>
                    <p className="text-2xl font-bold">{results.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="text-2xl font-bold">
                      {results.length > 0 
                        ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length)
                        : 0
                      }
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">This Month</p>
                    <p className="text-2xl font-bold">
                      {results.filter(r => {
                        const resultDate = new Date(r.timestamp)
                        const now = new Date()
                        return resultDate.getMonth() === now.getMonth() && 
                               resultDate.getFullYear() === now.getFullYear()
                      }).length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Proofs Generated</p>
                    <p className="text-2xl font-bold">{results.length}</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by filename or analysis type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger>
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="document">Document Analysis</SelectItem>
                      <SelectItem value="deepfake">Deepfake Detection</SelectItem>
                      <SelectItem value="resume">Resume Analysis</SelectItem>
                      <SelectItem value="medical">Medical Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results List */}
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your analysis results...</p>
                </CardContent>
              </Card>
            ) : filteredResults.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Start by uploading a file for analysis.'
                    }
                  </p>
                  <Button onClick={() => router.push('/upload')}>
                    Start New Analysis
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredResults.map((result) => (
                <Card key={result.id} className="hover:bg-card/80 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getFileIcon(result.fileName)}
                          <h3 className="font-semibold">{result.fileName}</h3>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{result.summary}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(result.timestamp)}
                          </span>
                          <span className="flex items-center">
                            <Shield className="h-4 w-4 mr-1" />
                            Proof: {result.proofHash.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                            {result.score}
                          </div>
                          <div className="text-xs text-muted-foreground">Score</div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResult(result)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Detailed View Modal */}
          {selectedResult && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {getFileIcon(selectedResult.fileName)}
                        <span className="ml-2">{selectedResult.fileName}</span>
                      </CardTitle>
                      <CardDescription>{selectedResult.type}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedResult(null)}>
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Analysis Summary</h3>
                    <p className="text-muted-foreground">{selectedResult.summary}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-1">Confidence Score</h4>
                      <div className={`text-3xl font-bold ${getScoreColor(selectedResult.score)}`}>
                        {selectedResult.score}/100
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Analysis Date</h4>
                      <p className="text-muted-foreground">{formatDate(selectedResult.timestamp)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Cryptographic Proof</h3>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-xs font-mono break-all">{selectedResult.proofHash}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      This zero-knowledge proof verifies the analysis was performed correctly without exposing your data.
                    </p>
                  </div>
                  
                  {/* Wave 4: Model Reputation */}
                  <ModelReputationCard
                    modelName="Llama 3.3 70B"
                    modelProvider="Groq"
                  />
                  
                  {/* Wave 4: Proof Sharing */}
                  <ProofSharingCard
                    proofId={selectedResult.id}
                    transactionId={selectedResult.proofHash}
                  />
                  
                  <div className="flex space-x-2">
                    <Button onClick={() => router.push(`/verify-proof?hash=${selectedResult.proofHash}`)}>
                      Verify Proof
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}