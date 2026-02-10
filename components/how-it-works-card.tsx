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
            <span>Your document text is hashed locally - the original text never leaves your browser</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">2.</span>
            <span>A risk analysis is performed based on content patterns</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">3.</span>
            <span>The document hash and risk score are submitted to the Aleo blockchain</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold text-primary mr-2">4.</span>
            <span>A zero-knowledge proof is generated, verifying the analysis without exposing your document</span>
          </li>
        </ol>
      </CardContent>
    </Card>
  )
}
