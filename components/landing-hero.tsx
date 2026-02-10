'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LandingHeroProps {
  connected: boolean
  connecting: boolean
  onGetStarted: () => void
}

export function LandingHero({ connected, connecting, onGetStarted }: LandingHeroProps) {
  return (
    <section className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto">
        <Badge variant="outline" className="mb-6">
          Powered by Aleo Zero-Knowledge Proofs
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
          Private AI Inference
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Run AI models on sensitive data without exposing raw inputs. 
          VeilNet combines AI inference with end-to-end encryption and zero-knowledge proofs.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button 
            size="lg" 
            onClick={onGetStarted}
            disabled={connecting}
            className="text-lg px-8 py-6"
          >
            {connecting ? 'Connecting...' : connected ? 'Launch App' : 'Get Started'}
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 py-6">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
