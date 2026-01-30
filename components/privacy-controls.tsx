'use client';

import React from "react"

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Eye, EyeOff, Shield, Lock } from 'lucide-react';

interface PrivacyControl {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
  critical: boolean;
}

export function PrivacyControls() {
  const [controls, setControls] = useState<PrivacyControl[]>([
    {
      id: 'auto-delete',
      label: 'Auto-Delete Raw Data',
      description: 'Automatically delete uploaded data after analysis',
      enabled: true,
      icon: <Trash2 className="w-4 h-4" />,
      critical: true,
    },
    {
      id: 'client-encryption',
      label: 'Client-Side Encryption',
      description: 'Encrypt data before transmission to servers',
      enabled: true,
      icon: <Lock className="w-4 h-4" />,
      critical: true,
    },
    {
      id: 'zk-proofs',
      label: 'Zero-Knowledge Proofs',
      description: 'Require cryptographic proofs for all analyses',
      enabled: true,
      icon: <Shield className="w-4 h-4" />,
      critical: true,
    },
    {
      id: 'anonymous',
      label: 'Anonymous Mode',
      description: 'Do not associate analyses with wallet address',
      enabled: false,
      icon: <EyeOff className="w-4 h-4" />,
      critical: false,
    },
    {
      id: 'data-retention',
      label: 'Minimal Data Retention',
      description: 'Keep only proof hashes, discard all raw data',
      enabled: true,
      icon: <Eye className="w-4 h-4" />,
      critical: true,
    },
  ]);

  const handleToggle = (id: string) => {
    setControls((prev) =>
      prev.map((control) =>
        control.id === id ? { ...control, enabled: !control.enabled } : control
      )
    );
  };

  const criticalControls = controls.filter((c) => c.critical);
  const allCriticalEnabled = criticalControls.every((c) => c.enabled);

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="p-4 border-green-500/30 bg-green-500/5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-green-400">Privacy Protection Active</p>
            <p className="text-xs text-muted-foreground mt-1">
              All critical privacy controls are enabled
            </p>
          </div>
          {allCriticalEnabled && (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Secure
            </Badge>
          )}
        </div>
      </Card>

      {/* Controls List */}
      <div className="space-y-2">
        {controls.map((control) => (
          <Card
            key={control.id}
            className={`p-4 ${
              control.critical ? 'border-accent/30' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="text-accent mt-0.5">{control.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm">
                      {control.label}
                    </p>
                    {control.critical && (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                        Critical
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {control.description}
                  </p>
                </div>
              </div>
              <Switch
                checked={control.enabled}
                onCheckedChange={() => handleToggle(control.id)}
                disabled={control.critical && control.enabled}
                className="ml-4"
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Warning */}
      {!allCriticalEnabled && (
        <Card className="p-4 border-red-500/30 bg-red-500/5">
          <p className="text-sm text-red-400 font-medium">
            Warning: Critical privacy controls are disabled
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Disabling critical controls may expose your data to privacy risks
          </p>
        </Card>
      )}

      {/* Privacy Policy */}
      <Card className="p-4 bg-secondary/30">
        <p className="text-xs text-muted-foreground leading-relaxed">
          VeilNet's privacy architecture ensures that raw data never persists
          on our servers. Cryptographic proofs serve as permanent records of
          your analyses without exposing sensitive information.
        </p>
        <Button
          variant="link"
          size="sm"
          className="text-accent mt-2 h-auto p-0"
        >
          View Privacy Policy →
        </Button>
      </Card>
    </div>
  );
}
