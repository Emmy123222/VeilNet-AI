'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { useWalletPersistence } from '@/hooks/use-wallet-persistence'
import { ProofHistoryDashboard } from '@/components/proof-history-dashboard'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Shield } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  // Use the ProvableHQ hook instead of the old Demox one
  const { connected, address: publicKey, connecting } = useWallet()
  
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  // Keep your persistence hook if you still need it for extra logic
  const { connected: persistedConnected } = useWalletPersistence()

  useEffect(() => {
    if (connected && publicKey) {
      // In Provable adapter, address is usually a string (or PublicKey object)
      setWalletAddress(publicKey)
    } else {
      setWalletAddress(null)
    }
  }, [connected, publicKey])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <Shield className="h-8 w-8 mr-3 text-primary" />
                  Proof Dashboard
                </h1>
                <p className="text-muted-foreground mt-1">
                  View and manage your document verification proofs
                </p>
              </div>
            </div>

            {/* Optional: Show current wallet address when connected */}
            {connected && walletAddress && (
              <div className="text-sm text-muted-foreground font-mono break-all max-w-xs text-right">
                {walletAddress.slice(0, 12)}...{walletAddress.slice(-8)}
              </div>
            )}
          </div>

          {/* Wallet Connection Status */}
          {!connected && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                  Wallet Required
                </h3>
                <p className="text-blue-700 mb-4">
                  Please return to the home page to connect your **Shield Wallet** first, 
                  then come back to view your dashboard.
                </p>
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Go to Home Page & Connect Wallet
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Show loading state while connecting */}
          {connecting && (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">Connecting to Shield Wallet...</p>
              </CardContent>
            </Card>
          )}

          {/* Dashboard Content - Only show when actually connected */}
          {connected && walletAddress && (
            <ProofHistoryDashboard walletAddress={walletAddress} />
          )}
        </div>
      </main>
    </div>
  )
}