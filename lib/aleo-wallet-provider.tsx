'use client'

import React from 'react'
import { WalletProvider } from '@demox-labs/aleo-wallet-adapter-react'
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo'

declare global {
  interface Window {
    leoWallet?: any; // You can replace 'any' with a more specific type if available
  }
}
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui'
import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base'

// Import styles
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css'

interface AleoWalletProviderProps {
  children: React.ReactNode
}

export default function AleoWalletProvider({ children }: AleoWalletProviderProps) {
  // Create wallets array with error handling
  const wallets = React.useMemo(() => {
    try {
      console.log('Creating Leo Wallet Adapter...')
      const leoWallet = new LeoWalletAdapter({
        appName: 'VeilNet AI',
      })
      console.log('Leo Wallet Adapter created successfully')
      return [leoWallet]
    } catch (error) {
      console.error('Error creating wallet adapters:', error)
      return []
    }
  }, [])

  // Enhanced error handler with better error messages
  const handleError = React.useCallback((error: any) => {
    const errorDetails = {
      message: error?.message || 'No error message provided',
      name: error?.name || 'UnknownError',
      stack: error?.stack,
      error: error?.toString()
    }
    
    console.error('Wallet Provider Error Details:', errorDetails)
    
    // Enhanced error handling with more specific messages
    const errorMessage = (() => {
      if (error?.message?.includes('NETWORK_NOT_GRANTED')) {
        return 'Please grant network access in your Leo Wallet settings';
      } else if (error?.message?.includes('unknown error') || !window.leoWallet) {
        return 'Please ensure the Leo Wallet extension is installed and enabled';
      } else if (error?.message?.includes('User rejected')) {
        return 'Connection was rejected. Please try again and approve the connection in your wallet';
      } else if (error?.message?.includes('network')) {
        return 'Network error. Please check your connection and try again';
      }
      return 'Failed to connect to wallet. Please try again or contact support if the issue persists';
    })();
    
    console.log('User-friendly error:', errorMessage);
    
    // Optionally show this to the user via a toast or alert
    if (typeof window !== 'undefined') {
      // You can replace this with your preferred notification system
      alert(`Wallet Error: ${errorMessage}`);
    }
  }, [])

  console.log('Rendering WalletProvider with', wallets.length, 'wallets')

  return (
    <WalletProvider
      wallets={wallets}
      network={WalletAdapterNetwork.TestnetBeta}
      autoConnect={false}
      onError={handleError}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  )
}

// Re-export the official hook and components
export { useWallet } from '@demox-labs/aleo-wallet-adapter-react'
export { WalletMultiButton, WalletDisconnectButton } from '@demox-labs/aleo-wallet-adapter-reactui'