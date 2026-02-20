'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Brain, 
  Shield, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface ProgressStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
  icon: React.ReactNode
}

interface ProofProgressTrackerProps {
  currentStep: string
  error?: string | null
  estimatedTime?: number
}

export function ProofProgressTracker({ currentStep, error, estimatedTime }: ProofProgressTrackerProps) {
  const [progress, setProgress] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(estimatedTime || 0)

  const steps: ProgressStep[] = [
    {
      id: 'upload',
      title: 'Document Upload',
      description: 'Processing and validating document',
      status: 'completed',
      icon: <FileText className="h-4 w-4" />
    },
    {
      id: 'analyze',
      title: 'AI Analysis',
      description: 'Analyzing content for risks and patterns',
      status: currentStep === 'analyze' ? 'active' : 
             ['submit', 'confirm'].includes(currentStep) ? 'completed' : 'pending',
      icon: <Brain className="h-4 w-4" />
    },
    {
      id: 'submit',
      title: 'Blockchain Submission',
      description: 'Submitting proof to Aleo network',
      status: currentStep === 'submit' ? 'active' : 
             currentStep === 'confirm' ? 'completed' : 'pending',
      icon: <Shield className="h-4 w-4" />
    },
    {
      id: 'confirm',
      title: 'Network Confirmation',
      description: 'Waiting for blockchain confirmation',
      status: currentStep === 'confirm' ? 'active' : 'pending',
      icon: <CheckCircle className="h-4 w-4" />
    }
  ]

  useEffect(() => {
    const stepIndex = steps.findIndex(step => step.id === currentStep)
    const newProgress = stepIndex >= 0 ? ((stepIndex + 1) / steps.length) * 100 : 0
    setProgress(newProgress)
  }, [currentStep])

  useEffect(() => {
    if (timeRemaining > 0 && currentStep !== 'confirm') {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [timeRemaining, currentStep])

  const getStepIcon = (step: ProgressStep) => {
    if (error && step.status === 'active') {
      return <AlertCircle className="h-4 w-4 text-red-600" />
    }
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'active':
        return <Loader2 className="h-4 w-4 text-primary animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
    }
  }

  const getStepColor = (step: ProgressStep) => {
    if (error && step.status === 'active') {
      return 'text-red-600'
    }
    
    switch (step.status) {
      case 'completed':
        return 'text-green-600'
      case 'active':
        return 'text-primary'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="border-primary/20">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Proof Generation Progress</h3>
              <p className="text-sm text-muted-foreground">
                {error ? 'An error occurred during processing' : 
                 currentStep === 'confirm' ? 'Finalizing your proof on the blockchain' :
                 'Processing your document analysis'}
              </p>
            </div>
            {timeRemaining > 0 && !error && (
              <Badge variant="outline" className="font-mono">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress 
              value={error ? 0 : progress} 
              className={`h-2 ${error ? 'bg-red-100' : ''}`}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Starting</span>
              <span className="font-medium">{Math.round(progress)}% Complete</span>
              <span>Verified</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Processing Error</span>
              </div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step Details */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon(step)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium ${getStepColor(step)}`}>
                      {step.title}
                    </h4>
                    {step.status === 'completed' && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Complete
                      </Badge>
                    )}
                    {step.status === 'active' && !error && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        Processing
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                  
                  {/* Active step details */}
                  {step.status === 'active' && !error && (
                    <div className="mt-2">
                      {step.id === 'analyze' && (
                        <div className="text-xs text-muted-foreground">
                          • Extracting text content<br/>
                          • Running risk assessment algorithms<br/>
                          • Generating confidence scores
                        </div>
                      )}
                      {step.id === 'submit' && (
                        <div className="text-xs text-muted-foreground">
                          • Creating cryptographic proof<br/>
                          • Submitting to Aleo network<br/>
                          • Generating transaction ID
                        </div>
                      )}
                      {step.id === 'confirm' && (
                        <div className="text-xs text-muted-foreground">
                          • Waiting for network validators<br/>
                          • Confirming block inclusion<br/>
                          • Finalizing proof record
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Step number */}
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                    ${step.status === 'completed' ? 'bg-green-100 text-green-700' :
                      step.status === 'active' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'}`}>
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Completion Message */}
          {currentStep === 'confirm' && !error && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Almost Complete!</span>
              </div>
              <p className="text-sm text-green-700">
                Your proof is being finalized on the Aleo blockchain. This typically takes 30-60 seconds.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}