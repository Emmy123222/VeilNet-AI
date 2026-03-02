'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function HowItWorksCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How It Works</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">1.</span>
            <span>🔒 Your document is analyzed entirely in your browser - never uploaded to any server</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">2.</span>
            <span>🧠 Risk analysis performed locally using content patterns and cryptographic hashing</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">3.</span>
            <span>🛡️ Only cryptographic hashes and risk scores are submitted to the private blockchain</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">4.</span>
            <span>✅ A private proof is generated on Aleo - all sensitive data remains hidden from public view</span>
          </li>
        </ol>
      </CardContent>
    </Card>
  )
}
