'use client';

import React from "react"

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, ServerOff, Zap, Shield, CheckCircle } from 'lucide-react';

interface PrivacyFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: 'active' | 'verified' | 'pending';
}

export function PrivacyCard() {
  const features: PrivacyFeature[] = [
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'End-to-End Encryption',
      description: 'Your data is encrypted on your device before transmission',
      status: 'active',
    },
    {
      icon: <Eye className="w-5 h-5" />,
      title: 'Zero-Knowledge Inference',
      description: 'AI models never see your raw data, only encrypted inputs',
      status: 'active',
    },
    {
      icon: <ServerOff className="w-5 h-5" />,
      title: 'No Data Storage',
      description: 'Raw data is automatically discarded after analysis',
      status: 'verified',
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Cryptographic Proofs',
      description: 'Every result is verified with zero-knowledge proofs',
      status: 'verified',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Blockchain Verification',
      description: 'Results are verifiable on the Aleo blockchain',
      status: 'pending',
    },
  ];

  const getStatusColor = (
    status: 'active' | 'verified' | 'pending'
  ): string => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'verified':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="p-6 border-accent/50">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Privacy Guarantees
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Your data is protected by multiple layers of privacy technology
            </p>
          </div>
          <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
        </div>

        <div className="space-y-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div className="text-accent mt-1 flex-shrink-0">
                {feature.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground text-sm">
                    {feature.title}
                  </p>
                  <Badge className={`text-xs ${getStatusColor(feature.status)}`}>
                    {feature.status === 'active' && 'Active'}
                    {feature.status === 'verified' && 'Verified'}
                    {feature.status === 'pending' && 'Pending'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Privacy Policy Info */}
      <Card className="p-4 border-dashed border-border">
        <p className="text-xs text-muted-foreground">
          VeilNet employs military-grade encryption and zero-knowledge proofs to
          ensure your sensitive data remains private throughout the analysis
          process. No personal information is logged or stored permanently.
        </p>
      </Card>
    </div>
  );
}
