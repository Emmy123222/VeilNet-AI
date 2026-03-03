'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, AlertTriangle, CheckCircle, Eye } from 'lucide-react'

interface AuthenticityScoreCardProps {
  authenticityScore: number
  deepfakeConfidence: number
  manipulationIndicators: string[]
  technicalFindings: string[]
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical'
}

export function AuthenticityScoreCard({
  authenticityScore,
  deepfakeConfidence,
  manipulationIndicators,
  technicalFindings,
  riskLevel
}: AuthenticityScoreCardProps) {
  
  const getAuthenticityColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getAuthenticityBg = (score: number) => {
    if (score >= 80) return 'bg-green-600'
    if (score >= 60) return 'bg-yellow-600'
    if (score >= 40) return 'bg-orange-600'
    return 'bg-red-600'
  }

  const getDeepfakeColor = (confidence: number) => {
    if (confidence >= 70) return 'text-red-600 bg-red-50 border-red-200'
    if (confidence >= 40) return 'text-orange-600 bg-orange-50 border-orange-200'
    if (confidence >= 20) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-green-600 bg-green-50 border-green-200'
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Vision Analysis Results
        </CardTitle>
        <CardDescription>
          AI-powered deepfake detection and authenticity verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Authenticity Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Authenticity Score</span>
            <span className={`text-2xl font-bold ${getAuthenticityColor(authenticityScore)}`}>
              {authenticityScore}/100
            </span>
          </div>
          <Progress 
            value={authenticityScore} 
            className="h-3"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {authenticityScore >= 80 ? '✅ Highly authentic' :
             authenticityScore >= 60 ? '⚠️ Moderately authentic' :
             authenticityScore >= 40 ? '⚠️ Questionable authenticity' :
             '❌ Low authenticity'}
          </p>
        </div>

        {/* Deepfake Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Deepfake Detection</span>
            <Badge variant="outline" className={getDeepfakeColor(deepfakeConfidence)}>
              {deepfakeConfidence}% confidence
            </Badge>
          </div>
          <Progress 
            value={deepfakeConfidence} 
            className="h-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {deepfakeConfidence >= 70 ? '🚨 High probability of manipulation' :
             deepfakeConfidence >= 40 ? '⚠️ Possible manipulation detected' :
             deepfakeConfidence >= 20 ? '✓ Minor concerns' :
             '✅ No significant manipulation detected'}
          </p>
        </div>

        {/* Risk Level Alert */}
        {(riskLevel === 'High' || riskLevel === 'Critical') && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>{riskLevel} Risk Detected:</strong> This image shows signs of manipulation or deepfake characteristics.
            </AlertDescription>
          </Alert>
        )}

        {riskLevel === 'Low' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Low Risk:</strong> Image appears authentic with no significant manipulation detected.
            </AlertDescription>
          </Alert>
        )}

        {/* Manipulation Indicators */}
        {manipulationIndicators.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Manipulation Indicators ({manipulationIndicators.length})
            </h4>
            <div className="space-y-2">
              {manipulationIndicators.slice(0, 5).map((indicator, index) => (
                <div key={index} className="p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-900">
                  {indicator}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Findings */}
        {technicalFindings.length > 0 && (
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Technical Findings
            </h4>
            <div className="space-y-1">
              {technicalFindings.slice(0, 5).map((finding, index) => (
                <div key={index} className="text-sm text-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{finding}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
