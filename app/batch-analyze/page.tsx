'use client'

import { useState } from 'react'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
import { Header } from '@/components/header'
import { BatchUploadForm } from '@/components/batch-upload-form'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function BatchAnalyzePage() {
  const { connected, address: publicKey } = useWallet()
  const [error, setError] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              <h1 className="text-3xl font-bold">Batch Analysis</h1>
            </div>
            <p className="text-muted-foreground">
              🚀 Analyze multiple documents at once with cryptographic proofs for each.
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
              to connect your Shield Wallet first.
            </AlertDescription>
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Batch Upload Form */}
        <BatchUploadForm />
      </div>
    </div>
  )
}
