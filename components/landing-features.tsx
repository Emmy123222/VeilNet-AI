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
            <CardTitle>1. Client-Side Only</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              🔒 Files are analyzed entirely in your browser. No uploads, no servers - TRUE privacy guaranteed.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>2. Local Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              🧠 Risk assessment performed locally using cryptographic hashing and content patterns.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>3. Private Proofs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              ✅ Only cryptographic hashes submitted to private blockchain records - no sensitive data exposed.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-primary mb-2" />
            <CardTitle>TRUE Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Files never leave your browser. All sensitive data stored in private blockchain records.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Eye className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Cryptographic Proofs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Verify analysis authenticity using only cryptographic hashes - no data exposure.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="h-8 w-8 text-primary mb-2" />
            <CardTitle>Real Verification</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Multi-layer on-chain validation with timestamp, hash, and risk score verification.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
