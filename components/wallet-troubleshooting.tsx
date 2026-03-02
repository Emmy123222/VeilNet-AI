'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ExternalLink, AlertTriangle, CheckCircle, RefreshCw, Wallet } from 'lucide-react'

interface WalletTroubleshootingProps {
  title: string
  message: string
  suggestions: string[]
  onRetry?: () => void
}

export function WalletTroubleshooting({ title, message, suggestions, onRetry }: WalletTroubleshootingProps) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-800">
          <AlertTriangle className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
        <CardDescription className="text-orange-700">
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium text-orange-800">Troubleshooting Steps:</h4>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-orange-700">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
            onClick={() => window.open('https://faucet.aleo.org/', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Get Testnet Credits
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
            onClick={() => window.open('https://testnet.explorer.provable.com/program/veilnet_ai_v3.aleo', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Program
          </Button>
          
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Try Again
            </Button>
          )}
        </div>

        <Alert className="border-blue-300 bg-blue-100">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Good news:</strong> Your AI analysis completed successfully! The blockchain submission is optional - 
            you can still view all your analysis results below. The blockchain proof just adds an extra layer of verification.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}