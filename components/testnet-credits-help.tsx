'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ExternalLink, AlertCircle, CheckCircle, Clock } from 'lucide-react'

export function TestnetCreditsHelp() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          Need Testnet Credits?
        </CardTitle>
        <CardDescription className="text-blue-700">
          To submit proofs to the Aleo blockchain, you need testnet credits for transaction fees.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</div>
            <div>
              <p className="font-medium text-blue-800">Get Free Testnet Credits</p>
              <p className="text-sm text-blue-700">Visit the Aleo faucet to request free testnet credits</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => window.open('https://faucet.aleo.org/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Aleo Faucet
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</div>
            <div>
              <p className="font-medium text-blue-800">Wait for Credits & Request Multiple Times</p>
              <p className="text-sm text-blue-700">Credits usually arrive within 2-3 minutes. If the first request doesn't work, try requesting 2-3 more times with a few minutes between each request.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</div>
            <div>
              <p className="font-medium text-blue-800">Check Wallet Network</p>
              <p className="text-sm text-blue-700">Ensure your Leo Wallet is connected to <strong>Testnet Beta</strong> (not mainnet)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</div>
            <div>
              <p className="font-medium text-blue-800">Refresh & Try Again</p>
              <p className="text-sm text-blue-700">Once credits arrive, refresh the page and try your analysis again</p>
            </div>
          </div>
        </div>

        <Alert className="border-blue-300 bg-blue-100">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Good news:</strong> Your AI analysis will still work even without blockchain submission. 
            You'll get all the risk analysis results - the blockchain proof is just an additional verification layer.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}