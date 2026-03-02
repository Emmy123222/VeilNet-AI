'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Shield, CheckCircle, Copy, ExternalLink, Clock, AlertTriangle, Info } from 'lucide-react'
import { useState } from 'react'

interface RiskFlag {
  type: 'fraud' | 'manipulation' | 'inconsistency' | 'compliance' | 'security'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  confidence: number
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

interface AnalysisResult {
  documentHash: string
  riskScore: number
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
  riskFlags?: RiskFlag[]
  confidenceScore?: number
  confidenceExplanation?: string
  highlightedSections?: string[]
}

interface AleoResultCardProps {
  aleoResult: AleoResult
  analysisResult: AnalysisResult | null
  onReset: () => void
}

export function AleoResultCard({ aleoResult, analysisResult, onReset }: AleoResultCardProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          {aleoResult.status === 'confirmed' ? '✅ Verified on Aleo Blockchain' : 
           aleoResult.status === 'pending' ? '⏳ Verification Pending' : 
           '❌ Verification Failed'}
        </CardTitle>
        <CardDescription>
          {aleoResult.status === 'confirmed' 
            ? 'Your analysis has been cryptographically verified and stored on Aleo Testnet'
            : aleoResult.status === 'pending'
            ? 'Your proof is being processed on the Aleo network'
            : 'There was an issue with the blockchain verification'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        <Alert className={`${aleoResult.status === 'confirmed' ? 'bg-primary/10 border-primary/20' : 
                          aleoResult.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 
                          'bg-red-50 border-red-200'}`}>
          {aleoResult.status === 'confirmed' ? <CheckCircle className="h-4 w-4 text-primary" /> :
           aleoResult.status === 'pending' ? <Clock className="h-4 w-4 text-yellow-600" /> :
           <AlertTriangle className="h-4 w-4 text-red-600" />}
          <AlertDescription className={aleoResult.status === 'confirmed' ? 'text-primary' : 
                                     aleoResult.status === 'pending' ? 'text-yellow-700' : 'text-red-700'}>
            <strong>
              {aleoResult.status === 'confirmed' ? 'Proof Generated Successfully!' :
               aleoResult.status === 'pending' ? 'Verification in Progress' :
               'Verification Failed'}
            </strong>{' '}
            {aleoResult.status === 'confirmed' 
              ? 'Your document analysis is now permanently recorded on the Aleo blockchain with zero-knowledge privacy.'
              : aleoResult.status === 'pending'
              ? `Estimated confirmation time: ${new Date(aleoResult.estimatedConfirmationTime || '').toLocaleTimeString()}`
              : 'Please try submitting your proof again.'
            }
          </AlertDescription>
        </Alert>

        {/* Transaction Details */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center">
            <span className="text-primary mr-2">🔗</span>
            Transaction Details
          </h3>
          
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Transaction ID</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(aleoResult.transactionId, 'tx')}
                  className="h-6 px-2"
                >
                  {copied === 'tx' ? 'Copied!' : <Copy className="h-3 w-3" />}
                </Button>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <code className="text-xs break-all font-mono">{aleoResult.transactionId}</code>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <h4 className="font-medium mb-1 text-sm">Network</h4>
                <Badge variant="default" className="bg-primary">Aleo Testnet</Badge>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-sm">Status</h4>
                <Badge variant="default" className={getStatusColor(aleoResult.status)}>
                  {aleoResult.status}
                </Badge>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-sm">Confirmations</h4>
                <span className="font-mono text-sm">{aleoResult.networkConfirmations || 0}/6</span>
              </div>
              {aleoResult.blockHeight && (
                <div>
                  <h4 className="font-medium mb-1 text-sm">Block Height</h4>
                  <span className="font-mono text-sm">{aleoResult.blockHeight.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risk Analysis Results */}
        {analysisResult && (
          <>
            <Separator />
            <div>
              <h3 className="font-semibold mb-3 flex items-center">
                <span className="text-primary mr-2">🛡️</span>
                Risk Analysis Results
              </h3>
              
              <div className="space-y-4">
                {/* Risk Score */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Risk Score</span>
                      <Badge className={getRiskLevelColor(analysisResult.riskLevel)}>
                        {analysisResult.riskLevel}
                      </Badge>
                    </div>
                    <Progress value={analysisResult.riskScore} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0 (Safe)</span>
                      <span className="font-medium">{analysisResult.riskScore}/100</span>
                      <span>100 (High Risk)</span>
                    </div>
                  </div>
                  
                  {analysisResult.confidenceScore && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Confidence</span>
                        <span className="text-sm font-mono">{analysisResult.confidenceScore}%</span>
                      </div>
                      <Progress value={analysisResult.confidenceScore} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {analysisResult.confidenceExplanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Risk Flags */}
                {analysisResult.riskFlags && analysisResult.riskFlags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Risk Flags ({analysisResult.riskFlags.length})
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.riskFlags.slice(0, 3).map((flag, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(flag.severity)}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{flag.type}</span>
                            <Badge variant="outline" className="text-xs">
                              {flag.severity} • {flag.confidence}%
                            </Badge>
                          </div>
                          <p className="text-sm">{flag.description}</p>
                          {flag.location && (
                            <p className="text-xs mt-1 opacity-75">Location: {flag.location}</p>
                          )}
                        </div>
                      ))}
                      {analysisResult.riskFlags.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{analysisResult.riskFlags.length - 3} more flags detected
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Highlighted Sections */}
                {analysisResult.highlightedSections && analysisResult.highlightedSections.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      Highlighted Sections
                    </h4>
                    <div className="space-y-2">
                      {analysisResult.highlightedSections.slice(0, 2).map((section, index) => (
                        <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm">{section}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Proof Details */}
        <Separator />
        <div>
          <h3 className="font-semibold mb-3">Blockchain Proof Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Program:</span>
              <code className="font-mono">veilnet_ai_v3.aleo</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Function:</span>
              <code className="font-mono">submit_analysis</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-semibold">Aleo Testnet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timestamp:</span>
              <span className="font-mono text-xs">{new Date(aleoResult.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Document Hash:</span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-xs">{analysisResult?.documentHash.slice(0, 20)}...</code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(analysisResult?.documentHash || '', 'hash')}
                  className="h-5 px-1"
                >
                  {copied === 'hash' ? '✓' : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open(aleoResult.explorerUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Explorer
          </Button>
          <Button variant="outline" onClick={onReset}>
            Analyze Another
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}