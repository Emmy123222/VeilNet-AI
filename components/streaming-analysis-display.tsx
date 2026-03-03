'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle } from 'lucide-react'

interface StreamingAnalysisDisplayProps {
  isStreaming: boolean
  streamedContent: string
  progress: number
}

export function StreamingAnalysisDisplay({ 
  isStreaming, 
  streamedContent, 
  progress 
}: StreamingAnalysisDisplayProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  
  useEffect(() => {
    setDisplayedContent(streamedContent)
  }, [streamedContent])

  if (!isStreaming && !displayedContent) {
    return null
  }

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isStreaming && <Loader2 className="h-5 w-5 animate-spin" />}
          {isStreaming ? 'Analyzing in Real-Time...' : 'Analysis Complete'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isStreaming && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        <div className="bg-muted p-4 rounded-lg min-h-[200px] max-h-[400px] overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {displayedContent}
            {isStreaming && <span className="animate-pulse">▊</span>}
          </pre>
        </div>

        {!isStreaming && displayedContent && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-700">
              ✅ Analysis completed successfully! Processing blockchain submission...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
