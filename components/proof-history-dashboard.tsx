'use client'

import { useState, useEffect } from 'react'
import { fetchWalletProofHistory } from '@/lib/wallet-history'
import { getWalletTransactions, getWalletStats } from '@/lib/transaction-storage'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  History, 
  ExternalLink, 
  Download, 
  Filter, 
  Search,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProofRecord {
  id: string
  proofHash: string
  transactionId: string
  documentHash: string
  riskScore: number
  riskLevel: string
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: string
  blockHeight: number
  explorerUrl: string
  documentType: string
}

interface WalletStats {
  totalProofs: number
  confirmedProofs: number
  averageRiskScore: number
  lastActivity: string | null
}

interface ProofHistoryDashboardProps {
  walletAddress: string | null
}

export function ProofHistoryDashboard({ walletAddress }: ProofHistoryDashboardProps) {
  const [proofs, setProofs] = useState<ProofRecord[]>([])
  const [stats, setStats] = useState<WalletStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (walletAddress) {
      fetchProofHistory()
    }
  }, [walletAddress, page])

  // Auto-refresh every 30 seconds to check for status updates
  useEffect(() => {
    if (walletAddress && proofs.length > 0) {
      const interval = setInterval(() => {
        fetchProofHistory()
      }, 30000)
      return () => clearInterval(interval)
    }
  }, [walletAddress, proofs.length])

  const fetchProofHistory = async () => {
    if (!walletAddress) return
    
    setLoading(true)
    setError(null)
    try {
      // Get transactions from local storage
      const localTransactions = getWalletTransactions(walletAddress)
      const localStats = getWalletStats(walletAddress)
      
      // Convert to the expected format
      const proofs = localTransactions.map(tx => ({
        id: tx.id,
        proofHash: tx.analysisHash,
        transactionId: tx.transactionId,
        documentHash: tx.documentHash,
        riskScore: tx.riskScore,
        riskLevel: tx.riskLevel,
        status: tx.status,
        timestamp: tx.timestamp,
        blockHeight: tx.blockHeight || 0,
        explorerUrl: `https://testnet.explorer.provable.com/transaction/${tx.transactionId}`,
        documentType: 'Document'
      }))
      
      setProofs(proofs)
      setStats(localStats)
      
      console.log(`✅ Loaded ${proofs.length} proofs from local storage`)
    } catch (error) {
      console.error('Failed to fetch proof history:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch proof history')
    } finally {
      setLoading(false)
    }
  }

  const downloadProofReceipt = async (proof: ProofRecord) => {
    const receipt = {
      proofId: proof.id,
      transactionId: proof.transactionId,
      proofHash: proof.proofHash,
      documentHash: proof.documentHash,
      riskScore: proof.riskScore,
      riskLevel: proof.riskLevel,
      status: proof.status,
      timestamp: proof.timestamp,
      blockHeight: proof.blockHeight,
      network: 'Aleo Testnet',
      program: 'veilnet_ai_v7.aleo',
      walletAddress,
      explorerUrl: proof.explorerUrl
    }

    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `veilnet-proof-${proof.id}-receipt.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-600'
      case 'pending': return 'bg-yellow-600'
      case 'failed': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-600'
      case 'Medium': return 'bg-yellow-600'
      case 'High': return 'bg-orange-600'
      case 'Critical': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  const filteredProofs = proofs.filter(proof => {
    const matchesFilter = filter === 'all' || proof.status === filter
    const matchesSearch = searchTerm === '' || 
      proof.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proof.documentType.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (!walletAddress) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground">
              Connect your Aleo wallet to view your proof history and analytics
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Proofs</p>
                  <p className="text-2xl font-bold">{stats.totalProofs}</p>
                </div>
                <History className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmedProofs}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Risk Score</p>
                  <p className="text-2xl font-bold">{stats.averageRiskScore}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round((stats.confirmedProofs / stats.totalProofs) * 100)}%
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <History className="h-5 w-5 mr-2" />
                Proof History
              </CardTitle>
              <CardDescription>
                Real-time data from Aleo blockchain for wallet: {walletAddress?.slice(0, 20)}...
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProofHistory}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search by transaction ID or document type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-red-700">Error Loading Proofs</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchProofHistory} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : filteredProofs.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Proofs Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filter !== 'all' 
                  ? 'No proofs match your current filters'
                  : 'No blockchain proofs found for this wallet address'
                }
              </p>
              {!searchTerm && filter === 'all' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-sm mb-2">
                    <strong>To create your first proof:</strong>
                  </p>
                  <ol className="text-blue-700 text-sm text-left space-y-1">
                    <li>1. Go to the Upload page</li>
                    <li>2. Analyze a document or image</li>
                    <li>3. Submit the result to blockchain</li>
                    <li>4. Return here to see your proof history</li>
                  </ol>
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-blue-700 text-xs">
                      <strong>Note:</strong> Transaction IDs may initially show as UUIDs while processing. 
                      Real Aleo transaction IDs (starting with "at1") appear after blockchain confirmation.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProofs.map((proof) => (
                <Card key={proof.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(proof.status)}
                          <span className="font-mono text-sm">
                            {proof.transactionId.startsWith('at1') 
                              ? `#${proof.transactionId.slice(0, 12)}...`
                              : `#${proof.transactionId}`
                            }
                          </span>
                          <Badge className={getStatusColor(proof.status)}>
                            {proof.status}
                          </Badge>
                          <Badge className={getRiskLevelColor(proof.riskLevel)}>
                            {proof.riskLevel} Risk
                          </Badge>
                          <Badge variant="outline">{proof.documentType}</Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Transaction ID</p>
                            <code className="text-xs font-mono break-all">
                              {proof.transactionId.startsWith('at1') 
                                ? `${proof.transactionId.slice(0, 40)}...`
                                : proof.transactionId
                              }
                            </code>
                            {!proof.transactionId.startsWith('at1') && (
                              <p className="text-xs text-orange-600 mt-1">
                                ⏳ Processing - Real transaction ID pending
                              </p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Timestamp</p>
                            <p className="text-sm">{new Date(proof.timestamp).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">Risk Score</span>
                              <span className="text-xs font-mono">{proof.riskScore}/100</span>
                            </div>
                            <Progress value={proof.riskScore} className="h-1" />
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Block Height</p>
                            <p className="text-sm font-mono">{proof.blockHeight.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (proof.transactionId.startsWith('at1')) {
                              window.open(proof.explorerUrl, '_blank')
                            } else {
                              window.open(`https://testnet.explorer.provable.com/program/veilnet_ai_v7.aleo/transactions`, '_blank')
                            }
                          }}
                          title={proof.transactionId.startsWith('at1') 
                            ? "View transaction on explorer" 
                            : "View program transactions (real ID pending)"
                          }
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadProofReceipt(proof)}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}