'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WalletMultiButton } from '@/lib/aleo-wallet-provider'

export function WalletConnectCard() {
  return (
    <Card className="mb-12 text-center">
      <CardHeader>
        <CardTitle className="flex items-center justify-center">
          <img src="/veilnet-logo.png" alt="VeilNet AI" className="h-5 w-5 mr-2 object-contain" />
          Connect Your Leo Wallet
        </CardTitle>
        <CardDescription>
          Connect your Leo Wallet to start using VeilNet AI for private analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WalletMultiButton />
        <p className="text-sm text-muted-foreground mt-4">
          Don't have Leo Wallet?{' '}
          <a 
            href="https://app.leo.app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            Install it here
          </a>
        </p>
      </CardContent>
    </Card>
  )
}
