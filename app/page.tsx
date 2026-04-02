'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Image, Brain, Shield, CheckCircle, BarChart3 } from 'lucide-react'
import { WalletMultiButton } from '@provablehq/aleo-wallet-adaptor-react-ui'
import { useRouter } from 'next/navigation'
import { useWalletPersistence } from '@/hooks/use-wallet-persistence'
import { LandingHero } from '@/components/landing-hero'
import { LandingFeatures } from '@/components/landing-features'
import { WalletConnectCard } from '@/components/wallet-connect-card'
import Link from 'next/link'

export default function HomePage() {
  const { 
    connected, 
    connecting, 
    publicKey, 
    storedWalletName 
  } = useWalletPersistence()

  const router = useRouter()

  const handleGetStarted = () => {
    if (connected) {
      router.push('/upload')
    } else {
      // Scroll to wallet connect section
      const walletSection = document.getElementById('wallet-connect-section')
      if (walletSection) {
        walletSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        // Fallback: scroll to WalletMultiButton
        const walletButton = document.querySelector('.wallet-adapter-button')
        walletButton?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const useCases = [
    {
      icon: FileText,
      title: 'Document Risk Analysis',
      description: 'Analyze contracts and legal documents for potential risks without exposing content',
      link: '/upload'
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
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/95">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold">VeilNet AI</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/upload" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Upload & Analyze
            </Link>
            <Link href="/verify-proof" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Verify Proof
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {connected && publicKey ? (
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className="font-mono text-xs bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {`${publicKey.slice(0, 8)}...${publicKey.slice(-8)}`}
                </Badge>
                <Link href="/upload">
                  <Button size="sm">
                    Upload & Analyze
                  </Button>
                </Link>
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

      {/* Quick Actions for Connected Users */}
      {connected && (
        <section className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Welcome Back to VeilNet AI
              </CardTitle>
              <CardDescription>
                Your Shield Wallet is connected. Ready to analyze documents privately?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/upload">
                  <Button className="w-full h-20 flex-col" variant="outline">
                    <FileText className="h-6 w-6 mb-2" />
                    Upload & Analyze
                  </Button>
                </Link>
                <Link href="/batch-analyze">
                  <Button className="w-full h-20 flex-col" variant="outline">
                    <FileText className="h-6 w-6 mb-2" />
                    Batch Analysis
                  </Button>
                </Link>
                <Link href="/analytics">
                  <Button className="w-full h-20 flex-col" variant="outline">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Analytics
                  </Button>
                </Link>
                <Link href="/verify-proof">
                  <Button className="w-full h-20 flex-col" variant="outline">
                    <Shield className="h-6 w-6 mb-2" />
                    Verify Proof
                  </Button>
                </Link>
              </div>
              <div className="mt-4">
                <Link href="/dashboard">
                  <Button className="w-full h-16 flex-col" variant="outline">
                    <Shield className="h-6 w-6 mb-2" />
                    View Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Wallet Connect Section */}
      {!connected && (
        <div id="wallet-connect-section" className="container mx-auto px-4 max-w-4xl">
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
            VeilNet AI enables private AI inference across multiple domains with blockchain verification
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <Card 
              key={index} 
              className="hover:border-primary/50 transition-all duration-200 cursor-pointer hover:shadow-lg"
              onClick={() => router.push(useCase.link)}
            >
              <CardHeader>
                <useCase.icon className="h-10 w-10 text-primary mb-4" />
                <CardTitle>{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{useCase.description}</CardDescription>
                <Button variant="outline" size="sm" className="w-full">
                  Try Now →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Trusted by Users Worldwide</h2>
          <p className="text-muted-foreground">
            Join the growing community using VeilNet for private AI analysis
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Documents Analyzed</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">5K+</div>
              <div className="text-sm text-muted-foreground">Proofs Generated</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="text-3xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Privacy Protected</div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-3xl mx-auto bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
            <CardDescription className="text-lg">
              Connect your Shield Wallet and start analyzing with full privacy on Aleo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6">
              {connected ? 'Launch App' : 'Connect Shield Wallet & Start'}
            </Button>
            <p className="text-xs text-muted-foreground mt-4">
              No registration required • Zero-knowledge proofs • Powered by Shield Wallet
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold">VeilNet AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Private AI inference with zero-knowledge proofs on the Aleo blockchain.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <Link href="/upload" className="block hover:text-foreground transition-colors">Upload & Analyze</Link>
                <Link href="/batch-analyze" className="block hover:text-foreground transition-colors">Batch Analysis</Link>
                <Link href="/analytics" className="block hover:text-foreground transition-colors">Analytics</Link>
                <Link href="/verify-proof" className="block hover:text-foreground transition-colors">Verify Proof</Link>
                <Link href="/dashboard" className="block hover:text-foreground transition-colors">Dashboard</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Use Cases</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Document Analysis</div>
                <div>Deepfake Detection</div>
                <div>Medical AI</div>
                <div>Financial Fraud</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Technology</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>Aleo Blockchain</div>
                <div>Shield Wallet</div>
                <div>Zero-Knowledge Proofs</div>
                <div>Private AI Inference</div>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 VeilNet AI. Built with Shield Wallet on Aleo for maximum privacy.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}