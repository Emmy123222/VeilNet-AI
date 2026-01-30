'use client';

import { Shield, Settings } from 'lucide-react';
import Link from 'next/link';
import { WalletConnection } from './wallet-connection';

interface HeaderProps {
  onWalletConnect?: (address: string) => void;
}

export function Header({ onWalletConnect }: HeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">VeilNet</h1>
              <p className="text-xs text-muted-foreground">Private AI Inference</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
              title="Privacy Settings"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <WalletConnection onConnect={onWalletConnect} />
          </div>
        </div>
      </div>
    </header>
  );
}
