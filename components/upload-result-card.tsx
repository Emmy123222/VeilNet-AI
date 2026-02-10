'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle } from 'lucide-react'

interface AnalysisResult {
  id: string
  type: string
  summary: string
  score: number
  insights: string[]
  proofHash: string
  timestamp: string
}

interface UploadResultCardProps {
  result: AnalysisResult
  onViewDetails: () => void
  onAnalyzeAnother: () => void
}

export function UploadResultCard({ result, onViewDetails, onAnalyzeAnother }: UploadResultCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
          Analysis Complete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge variant="outline">{result.type}</Badge>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Score</h3>
          <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
            {result.score}/100
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Summary</h3>
          <p className="text-muted-foreground">{result.summary}</p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Key Insights</h3>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {result.insights.map((insight, i) => (
              <li key={i}>• {insight}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Proof Hash</h3>
          <div className="bg-muted p-3 rounded-lg">
            <code className="text-xs break-all">{result.proofHash}</code>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onViewDetails} className="flex-1">
            View Full Details
          </Button>
          <Button onClick={onAnalyzeAnother} variant="outline">
            Analyze Another
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
