'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, CheckCircle } from 'lucide-react'

interface AleoResult {
  transactionId: string
  status: string
  blockHeight?: number
}

interface AnalysisResult {
  documentHash: string
  riskScore: number
}

interface AleoResultCardProps {
  aleoResult: AleoResult
  analysisResult: AnalysisResult | null
  onReset: () => void
}

export function AleoResultCard({ aleoResult, analysisResult, onReset }: AleoResultCardProps) {
  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-primary" />
          ✅ Verified on Aleo Blockchain
        </CardTitle>
        <CardDescription>
          Your analysis has been cryptographically verified and stored on Aleo Testnet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-primary/10 border-primary/20">
          <CheckCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-primary">
            <strong>Proof Generated Successfully!</strong> Your document analysis is now permanently recorded on the Aleo blockchain with zero-knowledge privacy.
          </AlertDescription>
        </Alert>

        <div>
          <h3 className="font-semibold mb-2 flex items-center">
            <span className="text-primary mr-2">🔗</span>
            Transaction ID
          </h3>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-xs break-all font-mono">{aleoResult.transactionId}</code>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This transaction ID can be verified on the Aleo blockchain explorer
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h3 className="font-semibold mb-2 text-sm">Network</h3>
            <Badge variant="default" className="bg-primary">Aleo Testnet</Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-sm">Status</h3>
            <Badge variant="default" className="bg-green-600">{aleoResult.status}</Badge>
          </div>
          {aleoResult.blockHeight && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">Block Height</h3>
              <span className="font-mono text-sm">{aleoResult.blockHeight.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <h3 className="font-semibold mb-3">Proof Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Program:</span>
              <code className="font-mono">veilnet_ai.aleo</code>
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
              <span className="text-muted-foreground">Status:</span>
              <span className="text-green-600 font-semibold">✅ Deployed & Live</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Document Hash:</span>
              <code className="font-mono text-xs">{analysisResult?.documentHash.slice(0, 20)}...</code>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Score:</span>
              <span className="font-semibold">{analysisResult?.riskScore}/100</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              window.open(`https://explorer.aleo.org/transaction/${aleoResult.transactionId}`, '_blank')
            }}
          >
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
