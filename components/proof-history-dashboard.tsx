'use client'

import { useState, useEffect } from 'react'
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
  AlertTriangle
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ProofRecord {
  id: number
  proofHash: string
  transactionId: string
  documentHash: string
  riskScore: number
  riskLevel: string
  status: string
  timestamp: string
  blockHeight: number
  explorerUrl: string
  documentType: string
}

interface WalletStats {
  totalProofs: number
  confirmedProofs: number
  averageRiskScore: number
  lastActivity: string
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

  useEffect(() => {
    if (walletAddress) {
      fetchProofHistory()
    }
  }, [walletAddress, page])

  const fetchProofHistory = async () => {
    if (!walletAddress) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/proofs/history?wallet=${walletAddress}&limit=10&offset=${page * 10}`)
      const data = await response.json()
      
      if (data.success) {
        setProofs(data.proofs)
        setStats(data.walletStats)
      }
    } catch (error) {
      console.error('Failed to fetch proof history:', error)
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
      program: 'veilnet_ai.aleo',
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
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            Proof History
          </CardTitle>
          <CardDescription>
            View and manage your document verification proofs
          </CardDescription>
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
          ) : filteredProofs.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Proofs Found</h3>
              <p className="text-muted-foreground">
                {searchTerm || filter !== 'all' 
                  ? 'No proofs match your current filters'
                  : 'Start by analyzing a document to create your first proof'
                }
              </p>
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
                          <span className="font-mono text-sm">#{proof.id}</span>
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
                              {proof.transactionId.slice(0, 40)}...
                            </code>
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
                          onClick={() => window.open(proof.explorerUrl, '_blank')}
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