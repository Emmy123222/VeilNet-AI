'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'

interface AnalysisResult {
  documentHash: string
  riskScore: number
  summary: string
  timestamp: number
  wordCount: number
  charCount: number
}

interface AnalysisResultCardProps {
  result: AnalysisResult
}

export function AnalysisResultCard({ result }: AnalysisResultCardProps) {
  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500'
    if (score < 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getRiskLabel = (score: number) => {
    if (score < 30) return 'Low Risk'
    if (score < 70) return 'Medium Risk'
    return 'High Risk'
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          Analysis Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Risk Score</h3>
            <div className={`text-4xl font-bold ${getRiskColor(result.riskScore)}`}>
              {result.riskScore}/100
            </div>
            <Badge variant="outline" className="mt-2">
              {getRiskLabel(result.riskScore)}
            </Badge>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Document Stats</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div>Words: {result.wordCount}</div>
              <div>Characters: {result.charCount}</div>
              <div>Analyzed: {new Date(result.timestamp * 1000).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-muted-foreground">{result.summary}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Document Hash</h3>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-xs break-all">{result.documentHash}</code>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            This hash represents your document on the Aleo blockchain
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
