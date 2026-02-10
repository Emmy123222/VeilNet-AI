'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Brain, CheckCircle, Shield, Eye, Zap } from 'lucide-react'

export function LandingFeatures() {
  return (
    <>
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card className="border-border/40">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>1. Upload Encrypted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Your files are encrypted client-side before upload. Raw data never leaves your device unprotected.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>2. AI Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AI models process encrypted data and generate insights without accessing raw content.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>3. Verified Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Results are cryptographically verified on Aleo blockchain with zero-knowledge proofs.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Zero-Knowledge Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Prove analysis results without revealing underlying data using Aleo's ZK technology.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Eye className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Selective Disclosure</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Share specific insights with third parties while keeping raw data private.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Fast & Efficient</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Optimized AI inference with minimal latency and maximum privacy guarantees.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
