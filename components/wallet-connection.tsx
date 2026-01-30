'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface WalletConnectionProps {
  onConnect?: (address: string) => void;
}

export function WalletConnection({ onConnect }: WalletConnectionProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    
    // Simulate wallet connection (replace with actual Aleo wallet SDK)
    setTimeout(() => {
      const mockAddress = '0x' + Math.random().toString(16).slice(2, 42);
      setAddress(mockAddress);
      setIsConnected(true);
      onConnect?.(mockAddress);
      setIsConnecting(false);
    }, 1000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAddress('');
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-foreground">{address.slice(0, 10)}...{address.slice(-8)}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="text-xs bg-transparent"
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
