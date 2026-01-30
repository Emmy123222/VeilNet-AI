'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  CheckCircle2,
  Loader,
  Copy,
  ExternalLink,
  Shield,
} from 'lucide-react';

interface ProofVerification {
  proofHash: string;
  isVerifying: boolean;
  isValid: boolean | null;
  blockHeight?: number;
  timestamp?: string;
  error?: string;
}

export function AleoProofVerifier() {
  const [proofHash, setProofHash] = useState('');
  const [verification, setVerification] = useState<ProofVerification>({
    proofHash: '',
    isVerifying: false,
    isValid: null,
  });
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    if (!proofHash.trim()) {
      alert('Please enter a proof hash');
      return;
    }

    setVerification({
      proofHash,
      isVerifying: true,
      isValid: null,
    });

    try {
      const response = await fetch(
        `/api/proofs/verify?hash=${encodeURIComponent(proofHash)}`
      );

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json();

      setVerification({
        proofHash,
        isVerifying: false,
        isValid: data.isValid,
        blockHeight: data.blockHeight,
        timestamp: data.timestamp,
      });
    } catch (error) {
      setVerification({
        proofHash,
        isVerifying: false,
        isValid: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      });
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Input Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Verify Aleo Proof
        </h3>
        <div className="flex gap-2">
          <Input
            placeholder="Enter proof hash (e.g., 0x...)"
            value={proofHash}
            onChange={(e) => setProofHash(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleVerify();
              }
            }}
            disabled={verification.isVerifying}
            className="bg-secondary"
          />
          <Button
            onClick={handleVerify}
            disabled={verification.isVerifying}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {verification.isVerifying ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Verifying
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </div>
      </Card>

      {/* Result Section */}
      {verification.proofHash && (
        <Card
          className={`p-6 ${
            verification.isValid
              ? 'border-green-500/30 bg-green-500/5'
              : verification.isValid === false
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-border'
          }`}
        >
          <div className="flex items-start gap-3 mb-4">
            {verification.isVerifying && (
              <Loader className="w-6 h-6 text-yellow-500 mt-0.5 animate-spin" />
            )}
            {verification.isValid === true && (
              <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5" />
            )}
            {verification.isValid === false && (
              <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
            )}

            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">
                {verification.isVerifying && 'Verifying Proof...'}
                {verification.isValid === true && 'Proof Verified'}
                {verification.isValid === false && 'Verification Failed'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {verification.isVerifying && 'Checking proof on Aleo blockchain'}
                {verification.isValid === true &&
                  'This proof is valid and recorded on the Aleo blockchain'}
                {verification.isValid === false &&
                  verification.error &&
                  verification.error}
              </p>
            </div>

            {verification.isValid !== null && !verification.isVerifying && (
              <Badge
                className={
                  verification.isValid
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }
              >
                {verification.isValid ? 'Valid' : 'Invalid'}
              </Badge>
            )}
          </div>

          {!verification.isVerifying && verification.isValid !== null && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Proof Hash</p>
                <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg">
                  <code className="text-xs text-accent font-mono flex-1 truncate">
                    {verification.proofHash}
                  </code>
                  <button
                    onClick={() => handleCopy(verification.proofHash)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {verification.blockHeight && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Block Height
                  </p>
                  <p className="text-sm font-mono text-foreground">
                    {verification.blockHeight}
                  </p>
                </div>
              )}

              {verification.timestamp && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Verified At
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(verification.timestamp).toLocaleString()}
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 bg-transparent"
              >
                <ExternalLink className="w-4 h-4" />
                View on Aleo Explorer
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Info Card */}
      <Card className="p-4 bg-secondary/30">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Aleo Blockchain Verification
            </p>
            <p className="text-xs text-muted-foreground">
              All ZK proofs are recorded on the Aleo blockchain for
              cryptographic verification and permanent audit trails.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
