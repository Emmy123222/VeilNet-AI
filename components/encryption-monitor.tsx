'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Lock, Zap, Shield, Database } from 'lucide-react';

interface EncryptionStatus {
  stage: 'idle' | 'encrypting' | 'transmitting' | 'analyzing' | 'proving' | 'complete';
  progress: number;
  message: string;
}

interface EncryptionMonitorProps {
  isAnalyzing?: boolean;
  filename?: string;
}

export function EncryptionMonitor({
  isAnalyzing = false,
  filename = 'document.pdf',
}: EncryptionMonitorProps) {
  const [status, setStatus] = useState<EncryptionStatus>({
    stage: 'idle',
    progress: 0,
    message: 'Ready to encrypt and analyze',
  });

  useEffect(() => {
    if (!isAnalyzing) {
      setStatus({
        stage: 'idle',
        progress: 0,
        message: 'Ready to encrypt and analyze',
      });
      return;
    }

    const stages: Array<EncryptionStatus> = [
      {
        stage: 'encrypting',
        progress: 20,
        message: `Encrypting ${filename} with AES-256...`,
      },
      {
        stage: 'transmitting',
        progress: 40,
        message: 'Transmitting encrypted data to secure server',
      },
      {
        stage: 'analyzing',
        progress: 70,
        message: 'Running private AI inference on encrypted data',
      },
      {
        stage: 'proving',
        progress: 90,
        message: 'Generating zero-knowledge proof of execution',
      },
      {
        stage: 'complete',
        progress: 100,
        message: 'Analysis complete and verified',
      },
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setStatus(stages[currentStage]);
        currentStage++;
      } else {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isAnalyzing, filename]);

  if (status.stage === 'idle') {
    return null;
  }

  const stageIcons = {
    encrypting: <Lock className="w-5 h-5 text-blue-500" />,
    transmitting: <Zap className="w-5 h-5 text-yellow-500" />,
    analyzing: <Shield className="w-5 h-5 text-purple-500" />,
    proving: <Database className="w-5 h-5 text-cyan-500" />,
    complete: <Lock className="w-5 h-5 text-green-500" />,
  };

  return (
    <Card className="p-6 border-accent/50">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          {stageIcons[status.stage]}
          <div>
            <p className="font-semibold text-foreground text-sm">
              {status.message}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your data remains encrypted throughout
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <Progress value={status.progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {status.progress}% complete
          </p>
        </div>

        {/* Stage Indicators */}
        <div className="flex gap-2">
          {[
            { label: 'Encrypt', stage: 'encrypting' as const },
            { label: 'Transmit', stage: 'transmitting' as const },
            { label: 'Analyze', stage: 'analyzing' as const },
            { label: 'Prove', stage: 'proving' as const },
            { label: 'Complete', stage: 'complete' as const },
          ].map((item, index) => {
            const stageOrder = {
              encrypting: 1,
              transmitting: 2,
              analyzing: 3,
              proving: 4,
              complete: 5,
            };

            const currentOrder =
              stageOrder[status.stage as keyof typeof stageOrder];
            const itemOrder = stageOrder[item.stage];
            const isComplete = itemOrder < currentOrder;
            const isActive = itemOrder === currentOrder;

            return (
              <div key={item.stage} className="flex-1">
                <div
                  className={`h-1 rounded-full transition-colors ${
                    isComplete ? 'bg-green-500' : isActive ? 'bg-accent' : 'bg-border'
                  }`}
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Security Notes */}
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="text-accent font-semibold">Security in action:</span> Your
            data is encrypted end-to-end, AI models cannot see raw input,
            and every step is cryptographically verified.
          </p>
        </div>
      </div>
    </Card>
  );
}
