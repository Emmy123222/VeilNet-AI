'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Image, Brain } from 'lucide-react'
import { useWallet, WalletMultiButton } from '@/lib/aleo-wallet-provider'
import { useRouter } from 'next/navigation'
import { LandingHero } from '@/components/landing-hero'
import { LandingFeatures } from '@/components/landing-features'
import { WalletConnectCard } from '@/components/wallet-connect-card'

export default function HomePage() {
  const { connected, connecting, publicKey } = useWallet()
  const router = useRouter()

  const handleGetStarted = () => {
    if (connected) {
      router.push('/app')
    } else {
      const walletButton = document.querySelector('.wallet-adapter-button')
      if (walletButton) {
        walletButton.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const useCases = [
    {
      icon: FileText,
      title: 'Document Risk Analysis',
      description: 'Analyze contracts and legal documents for potential risks without exposing content',
      link: '/app'
    },
    {
      icon: Image,
      title: 'Deepfake Detection',
      description: 'Verify authenticity of images and videos while maintaining privacy',
      link: '/upload'
    },
    {
      icon: Brain,
      title: 'Medical AI Analysis',
      description: 'Process medical records with AI while preserving patient confidentiality',
      link: '/upload'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/veilnet-logo.png" alt="VeilNet AI" className="h-8 w-8 object-contain" />
            <span className="text-2xl font-bold">VeilNet AI</span>
          </div>
          <div className="flex items-center space-x-4">
            {connected ? (
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
                </Badge>
                <Button onClick={() => router.push('/upload')} size="sm">
                  Dashboard
                </Button>
              </div>
            ) : (
              <WalletMultiButton />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <LandingHero 
        connected={connected} 
        connecting={connecting} 
        onGetStarted={handleGetStarted} 
      />

      {/* Wallet Connect */}
      {!connected && (
        <div className="container mx-auto px-4 max-w-4xl">
          <WalletConnectCard />
        </div>
      )}

      {/* Features */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <LandingFeatures />
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Use Cases</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            VeilNet AI enables private AI inference across multiple domains
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => router.push(useCase.link)}>
              <CardHeader>
                <useCase.icon className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{useCase.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Connect your wallet and start analyzing with privacy-preserving AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
              {connected ? 'Launch App' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 VeilNet AI. Built on Aleo blockchain.</p>
        </div>
      </footer>
    </div>
  )
}
