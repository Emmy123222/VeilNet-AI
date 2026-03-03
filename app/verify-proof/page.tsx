'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft,
  Shield,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Search,
  Loader2
} from 'lucide-react'
import { useWallet } from '@/lib/aleo-wallet-provider'

const PROGRAM_ID = 'veilnet_ai_v6.aleo'
const ALEO_API_BASE = 'https://api.provable.com/v2/testnet'

interface ProofVerification {
  status: 'verified' | 'not_found' | 'rejected'
  transactionId: string
  blockHeight: number
  timestamp: string
  functionName: string
  programId: string
  inputs: string[]
  rejectionReason?: string
}

/**
 * Looks up a transaction by its Aleo transaction ID (at1...)
 * and checks if it is an accepted submit_analysis call to our program.
 */
async function verifyByTransactionId(txId: string): Promise<ProofVerification> {
  // Step 1: Find which block contains this transaction
  const blockHashRes = await fetch(`${ALEO_API_BASE}/find/blockHash/${txId}`, {
    headers: { Accept: 'application/json' },
  })

  if (!blockHashRes.ok) {
    return {
      status: 'not_found',
      transactionId: txId,
      blockHeight: 0,
      timestamp: '',
      functionName: '',
      programId: '',
      inputs: [],
    }
  }

  const blockHash: string = await blockHashRes.json()

  // Step 2: Get the block height from the block hash
  const heightRes = await fetch(`${ALEO_API_BASE}/height/${blockHash}`, {
    headers: { Accept: 'application/json' },
  })

  const blockHeight: number = heightRes.ok ? await heightRes.json() : 0

  // Step 3: Get all transactions in that block and find ours
  const blockTxRes = await fetch(`${ALEO_API_BASE}/block/${blockHeight}/transactions`, {
    headers: { Accept: 'application/json' },
  })

  if (!blockTxRes.ok) {
    return {
      status: 'not_found',
      transactionId: txId,
      blockHeight,
      timestamp: '',
      functionName: '',
      programId: '',
      inputs: [],
    }
  }

  const transactions = await blockTxRes.json()
  if (!Array.isArray(transactions)) {
    return {
      status: 'not_found',
      transactionId: txId,
      blockHeight,
      timestamp: '',
      functionName: '',
      programId: '',
      inputs: [],
    }
  }

  // Step 4: Find our specific transaction
  for (const confirmedTx of transactions) {
    const tx = confirmedTx?.transaction
    if (!tx || tx.id !== txId) continue

    // Found the transaction — check if it was accepted
    if (confirmedTx.status === 'rejected') {
      return {
        status: 'rejected',
        transactionId: txId,
        blockHeight,
        timestamp: '',
        functionName: 'submit_analysis',
        programId: PROGRAM_ID,
        inputs: [],
        rejectionReason: 'Transaction was rejected on-chain. The proof was not recorded.',
      }
    }

    // Check it's an execute to our program
    const transitions = tx?.execution?.transitions
    if (!Array.isArray(transitions)) continue

    for (const transition of transitions) {
      if (
        transition.program === PROGRAM_ID &&
        transition.function === 'submit_analysis'
      ) {
        // Extract public inputs for display
        const inputs: string[] = []
        if (Array.isArray(transition.inputs)) {
          transition.inputs.forEach((inp: any, i: number) => {
            const labels = ['document_hash', 'analysis_hash', 'risk_score', 'timestamp', 'owner']
            inputs.push(`${labels[i] || `input_${i}`}: ${inp.value || inp}`)
          })
        }

        return {
          status: 'verified',
          transactionId: txId,
          blockHeight,
          timestamp: new Date().toISOString(),
          functionName: transition.function,
          programId: transition.program,
          inputs,
        }
      }
    }

    // Transaction found but not to our program
    return {
      status: 'not_found',
      transactionId: txId,
      blockHeight,
      timestamp: '',
      functionName: '',
      programId: '',
      inputs: [],
      rejectionReason: `Transaction found but it does not call ${PROGRAM_ID}::submit_analysis.`,
    }
  }

  return {
    status: 'not_found',
    transactionId: txId,
    blockHeight,
    timestamp: '',
    functionName: '',
    programId: '',
    inputs: [],
  }
}

function VerifyProofContent() {
  const { connected } = useWallet()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [txInput, setTxInput] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [verification, setVerification] = useState<ProofVerification | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const txFromUrl = searchParams.get('tx') || searchParams.get('hash')
    if (txFromUrl) {
      setTxInput(txFromUrl)
      handleVerify(txFromUrl)
    }
  }, [searchParams])

  const handleVerify = async (input?: string) => {
    const raw = (input || txInput).trim()
    if (!raw) return

    // Validate it looks like an Aleo transaction ID
    if (!raw.startsWith('at1') || raw.length < 60) {
      setError('Please enter a valid Aleo transaction ID. It should start with "at1" and be at least 60 characters long.')
      return
    }

    setVerifying(true)
    setError(null)
    setVerification(null)

    try {
      const result = await verifyByTransactionId(raw)
      setVerification(result)
    } catch (err: any) {
      setError(err.message || 'Failed to verify. Please check the transaction ID and try again.')
    } finally {
      setVerifying(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (timestamp: string) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <img src="/veilnet-logo.png" alt="VeilNet AI" className="h-6 w-6 object-contain" />
              <span className="text-xl font-bold">VeilNet AI</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Proof Verification</h1>
            <p className="text-muted-foreground">
              Verify that your document analysis was recorded on the Aleo blockchain by entering your transaction ID.
            </p>
          </div>

          {/* Verification Input */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="h-5 w-5 mr-2" />
                Enter Transaction ID
              </CardTitle>
              <CardDescription>
                Paste the <strong>Aleo transaction ID</strong> you received after submitting your analysis. 
                It starts with <code className="bg-muted px-1 rounded">at1</code> and is shown in your analysis results.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input
                    placeholder="at1n7lm8tw599dlhkcrc69u6uva2dqfjxsrpgwv2g43axkxh7hrju8srql8gw"
                    value={txInput}
                    onChange={(e) => setTxInput(e.target.value)}
                    className="font-mono text-sm"
                    disabled={verifying}
                  />
                  <Button
                    onClick={() => handleVerify()}
                    disabled={!txInput.trim() || verifying}
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Verify
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ℹ️ Your transaction ID is displayed after a successful document analysis submission.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Verification Results */}
          {verification && (
            <div className="space-y-6">

              {/* Status Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      {verification.status === 'verified' ? (
                        <CheckCircle className="h-6 w-6 mr-2 text-green-500" />
                      ) : (
                        <AlertCircle className="h-6 w-6 mr-2 text-red-500" />
                      )}
                      {verification.status === 'verified'
                        ? 'Proof Verified ✅'
                        : verification.status === 'rejected'
                        ? 'Transaction Rejected ❌'
                        : 'Proof Not Found'}
                    </CardTitle>
                    <Badge
                      variant={verification.status === 'verified' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {verification.status.toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>
                    {verification.status === 'verified'
                      ? 'This analysis was successfully recorded on the Aleo blockchain. The proof is valid and tamper-proof.'
                      : verification.status === 'rejected'
                      ? verification.rejectionReason
                      : 'No proof found for this transaction ID. It may still be processing — wait 1–2 minutes and try again.'}
                  </CardDescription>
                </CardHeader>
              </Card>

              {verification.status === 'verified' && (
                <>
                  {/* Proof Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Proof Details</CardTitle>
                      <CardDescription>
                        On-chain record of your document analysis.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Program</h4>
                          <p className="text-muted-foreground font-mono text-sm">{verification.programId}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Function</h4>
                          <p className="text-muted-foreground font-mono text-sm">{verification.functionName}</p>
                        </div>
                        {verification.blockHeight > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Block Height</h4>
                            <p className="text-muted-foreground font-mono">
                              {verification.blockHeight.toLocaleString()}
                            </p>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium mb-2">Network</h4>
                          <p className="text-muted-foreground">Aleo Testnet Beta</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transaction ID */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Transaction ID</CardTitle>
                      <CardDescription>
                        Your unique on-chain proof identifier.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-sm break-all pr-4">{verification.transactionId}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(verification.transactionId)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Public Inputs */}
                  {verification.inputs.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Public Inputs</CardTitle>
                        <CardDescription>
                          The hashed inputs recorded on-chain. No sensitive data is revealed.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {verification.inputs.map((input, index) => (
                            <div key={index} className="bg-muted p-3 rounded-lg">
                              <p className="font-mono text-sm break-all">{input}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `https://testnet.explorer.provable.com/transaction/${verification.transactionId}`,
                          '_blank'
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Aleo Explorer
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/results')}>
                      View All Results
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* How It Works */}
          <Card className="mt-12">
            <CardHeader>
              <CardTitle>How Proof Verification Works</CardTitle>
              <CardDescription>
                Understanding VeilNet's zero-knowledge proof system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Zero-Knowledge Proof</h3>
                  <p className="text-sm text-muted-foreground">
                    Proves computation was performed correctly without revealing input data.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Blockchain Verification</h3>
                  <p className="text-sm text-muted-foreground">
                    Proofs are stored on Aleo blockchain for immutable verification.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Public Auditability</h3>
                  <p className="text-sm text-muted-foreground">
                    Anyone can verify proofs independently without accessing private data.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function VerifyProofPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading proof verification...</p>
          </div>
        </div>
      }
    >
      <VerifyProofContent />
    </Suspense>
  )
}