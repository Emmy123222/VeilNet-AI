'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, Lock, Eye, Zap, FileText, Image, Brain, CheckCircle } from 'lucide-react'
import { useWallet, WalletMultiButton } from '@/lib/aleo-wallet-provider'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const { connected, connecting, publicKey } = useWallet()
  const router = useRouter()

  const handleGetStarted = () => {
    if (connected) {
      router.push('/upload')
    } else {
      // The WalletMultiButton will handle connection
      // Just scroll to the wallet button or show a message
      const walletButton = document.querySelector('.wallet-adapter-button')
      if (walletButton) {
        walletButton.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
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

      {/* How It Works */}
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
              onClick={handleGetStarted}
              disabled={connecting}
              className="text-lg px-8 py-6"
            >
              {connecting ? 'Connecting...' : connected ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              View Demo
            </Button>
          </div>

          {/* Connect Wallet Section */}
          {!connected && (
            <Card className="mb-12 text-center">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Connect Your Leo Wallet
                </CardTitle>
                <CardDescription>
                  Connect your Leo Wallet to start using VeilNet AI for private analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WalletMultiButton />
                <p className="text-sm text-muted-foreground mt-4">
                  Don't have Leo Wallet? <a href="https://app.leo.app/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Install it here</a>
                </p>
              </CardContent>
            </Card>
          )}

          {/* How it Works */}
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
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Use Cases</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            VeilNet enables private AI analysis across sensitive domains
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              title: 'Document Analysis',
              description: 'Analyze contracts, medical records, and legal documents while maintaining confidentiality',
              examples: ['Contract risk assessment', 'Medical report summarization', 'Legal document review']
            },
            {
              icon: Image,
              title: 'Media Verification',
              description: 'Detect deepfakes and verify media authenticity without exposing content',
              examples: ['Deepfake detection', 'Image authenticity', 'Content moderation']
            },
            {
              icon: Shield,
              title: 'Financial Screening',
              description: 'Perform fraud detection and risk scoring on sensitive financial data',
              examples: ['Fraud detection', 'Credit scoring', 'Transaction analysis']
            },
            {
              icon: Eye,
              title: 'Resume Screening',
              description: 'AI-powered resume analysis while protecting candidate privacy',
              examples: ['Skills assessment', 'Experience validation', 'Bias-free screening']
            },
            {
              icon: Lock,
              title: 'Healthcare AI',
              description: 'Medical AI analysis with HIPAA-compliant privacy guarantees',
              examples: ['Diagnostic assistance', 'Treatment recommendations', 'Research insights']
            },
            {
              icon: Zap,
              title: 'Enterprise Analytics',
              description: 'Business intelligence on confidential data with audit trails',
              examples: ['Market analysis', 'Competitive intelligence', 'Strategic insights']
            }
          ].map((useCase, index) => (
            <Card key={index} className="border-border/40 hover:border-primary/40 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <useCase.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{useCase.title}</CardTitle>
                <CardDescription>{useCase.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {useCase.examples.map((example, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center">
                      <CheckCircle className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      {example}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 bg-muted/20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Privacy-First Architecture</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built on Aleo's zero-knowledge blockchain for maximum privacy and verifiability
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            {
              title: 'End-to-End Encryption',
              description: 'Data is encrypted on your device and never stored in plaintext'
            },
            {
              title: 'Zero-Knowledge Proofs',
              description: 'Cryptographic verification without revealing sensitive information'
            },
            {
              title: 'Decentralized Storage',
              description: 'No central authority controls your data or AI results'
            },
            {
              title: 'Audit Trail',
              description: 'Every AI inference is recorded and verifiable on-chain'
            },
            {
              title: 'Selective Disclosure',
              description: 'Choose exactly what information to share and with whom'
            },
            {
              title: 'Enterprise Ready',
              description: 'Compliance-ready infrastructure for regulated industries'
            }
          ].map((feature, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <CheckCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience Private AI?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Connect your Aleo wallet and start running AI models on your sensitive data with complete privacy.
          </p>
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            disabled={connecting}
            className="text-lg px-8 py-6"
          >
            {connecting ? 'Connecting...' : connected ? 'Go to Dashboard' : 'Get Started Now'}
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 VeilNet AI. Built on Aleo blockchain for maximum privacy.</p>
        </div>
      </footer>
    </div>
  )
}