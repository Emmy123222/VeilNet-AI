'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Copy, CheckCircle, Clock } from 'lucide-react';

interface Proof {
  id: string;
  hash: string;
  timestamp: string;
  status: 'verified' | 'pending';
  analysisType: string;
  resultHash: string;
  blockchainTxn?: string;
}

interface ProofExplorerProps {
  proofs?: Proof[];
}

export function ProofExplorer({ proofs = [] }: ProofExplorerProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (proofs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-muted-foreground">
          <p className="font-medium mb-2">No proofs yet</p>
          <p className="text-sm">
            Upload and analyze images to generate ZK proofs
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {proofs.map((proof) => (
        <Card
          key={proof.id}
          className="overflow-hidden hover:bg-card/80 transition-colors"
        >
          <button
            onClick={() =>
              setExpandedId(expandedId === proof.id ? null : proof.id)
            }
            className="w-full text-left"
          >
            <div className="p-4 flex items-center justify-between">
              {/* Left Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {proof.status === 'verified' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0 animate-spin" />
                  )}
                  <p className="font-medium text-foreground text-sm">
                    {proof.analysisType}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {proof.status === 'verified' ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <code className="text-xs text-muted-foreground block truncate">
                  {proof.hash.slice(0, 32)}...{proof.hash.slice(-12)}
                </code>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(proof.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Expand Button */}
              <div className="flex-shrink-0 ml-4">
                {expandedId === proof.id ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          </button>

          {/* Expanded Details */}
          {expandedId === proof.id && (
            <div className="border-t border-border px-4 py-4 bg-secondary/30 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Proof Hash</p>
                <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg">
                  <code className="text-xs text-accent font-mono flex-1 break-all">
                    {proof.hash}
                  </code>
                  <button
                    onClick={() => handleCopy(proof.hash, proof.id)}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    {copiedId === proof.id ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Result Hash
                </p>
                <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-lg">
                  <code className="text-xs text-accent font-mono flex-1 break-all">
                    {proof.resultHash}
                  </code>
                  <button
                    onClick={() => handleCopy(proof.resultHash, proof.id)}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    {copiedId === proof.id ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {proof.blockchainTxn && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Blockchain Transaction
                  </p>
                  <a
                    href={`#`}
                    className="text-xs text-accent hover:underline"
                  >
                    {proof.blockchainTxn}
                  </a>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs flex-1 bg-transparent"
                >
                  View on Explorer
                </Button>
                <Button
                  size="sm"
                  className="text-xs flex-1 bg-accent hover:bg-accent/90"
                >
                  Verify Proof
                </Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
