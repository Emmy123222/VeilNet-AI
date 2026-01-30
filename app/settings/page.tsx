'use client';

import { Header } from '@/components/header';
import { PrivacyCard } from '@/components/privacy-card';
import { EncryptionMonitor } from '@/components/encryption-monitor';
import { PrivacyControls } from '@/components/privacy-controls';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, FileJson, Zap } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="text-accent hover:underline text-sm mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Privacy Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure your privacy preferences and encryption settings
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="privacy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="privacy" className="gap-2">
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Privacy</span>
            </TabsTrigger>
            <TabsTrigger value="controls" className="gap-2">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Controls</span>
            </TabsTrigger>
            <TabsTrigger value="encryption" className="gap-2">
              <FileJson className="w-4 h-4" />
              <span className="hidden sm:inline">Encryption</span>
            </TabsTrigger>
          </TabsList>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <PrivacyCard />

            {/* Additional Privacy Info */}
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                How VeilNet Protects Your Data
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">
                    1. Client-Side Encryption
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Before any data leaves your device, it is encrypted using
                    AES-256. Your encryption keys remain under your control.
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2">
                    2. Zero-Knowledge Inference
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    AI models process your encrypted data without ever
                    decrypting it. Results are generated from encrypted inputs
                    using specialized cryptographic techniques.
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2">
                    3. Ephemeral Data Processing
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Raw data is never stored on our servers. After analysis
                    completes, encrypted inputs are immediately discarded.
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2">
                    4. Cryptographic Proofs
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Every analysis generates a zero-knowledge proof that can
                    be verified without revealing any sensitive information.
                  </p>
                </div>

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2">
                    5. Blockchain Verification
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Proof hashes are recorded on the Aleo blockchain, creating
                    an immutable audit trail of your analyses.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls">
            <PrivacyControls />
          </TabsContent>

          {/* Encryption Tab */}
          <TabsContent value="encryption" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Encryption Details
                </h3>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Data Encryption
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        AES-256-GCM
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Industry-standard authenticated encryption
                      </p>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Key Derivation
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        PBKDF2 + Argon2
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Resistant to brute-force attacks
                      </p>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        ZK Proof System
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        Aleo (Varuna)
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Succinct non-interactive proofs
                      </p>
                    </div>

                    <div className="bg-secondary/30 p-4 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        Hash Function
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        SHA-3-256
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cryptographic integrity verification
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-semibold text-foreground mb-4">
                  Key Management
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Your encryption keys are derived from your wallet private
                  key and never transmitted to our servers.
                </p>
                <Button variant="outline" className="w-full bg-transparent">
                  Rotate Encryption Keys
                </Button>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-semibold text-foreground mb-4">
                  Data Retention
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Raw Data: <span className="text-accent font-medium">Deleted immediately</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Encrypted inputs are purged after analysis completion
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Proof Hashes: <span className="text-accent font-medium">Permanent</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ZK proof hashes are stored for audit and verification
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Metadata: <span className="text-accent font-medium">15 days</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Timestamps and result hashes retained for history
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()} •{' '}
            <a href="#" className="text-accent hover:underline">
              Privacy Policy
            </a>{' '}
            •{' '}
            <a href="#" className="text-accent hover:underline">
              Security Audit
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
