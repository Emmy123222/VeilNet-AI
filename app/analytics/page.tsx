'use client'

import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { Header } from '@/components/header'
import { AnalyticsDashboard } from '@/components/analytics-dashboard'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Shield, BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const { connected, address: publicKey } = useWallet()

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-3xl font-bold flex items-center">
                <BarChart3 className="h-8 w-8 mr-3" />
                Analytics Dashboard
              </h1>
            </div>
            <p className="text-muted-foreground">
              📊 Comprehensive insights into your AI analysis history and trends
            </p>
          </div>
        </div>

        {/* Connection Status */}
        {!connected && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Shield Wallet Required:</strong> Please{' '}
              <Link href="/" className="underline font-medium hover:text-blue-800">
                go to the home page
              </Link>{' '}
              to connect your Shield Wallet to view your analytics.
            </AlertDescription>
          </Alert>
        )}

        {/* Analytics Dashboard */}
        {connected ? (
          <AnalyticsDashboard walletAddress={publicKey || ''} />
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Shield Wallet to view personalized analytics and insights
            </p>
            <Link href="/">
              <Button>
                Connect Wallet
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}