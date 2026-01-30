'use client'

import React from 'react'
import { WalletProvider } from '@demox-labs/aleo-wallet-adapter-react'
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo'
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui'
import { WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base'
import type { Adapter } from '@demox-labs/aleo-wallet-adapter-base'

// Import styles
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css'

interface AleoWalletProviderProps {
  children: React.ReactNode
}

export default function AleoWalletProvider({ children }: AleoWalletProviderProps) {
  // Create wallets array with proper typing and error handling
  const wallets = React.useMemo((): Adapter[] => {
    try {
      console.log('🔄 Creating Leo Wallet Adapter...')
      
      const leoWallet = new LeoWalletAdapter({
        appName: 'VeilNet AI',
      })
      
      console.log('✅ Leo Wallet Adapter created successfully')
      return [leoWallet]
    } catch (error) {
      console.error('❌ Error creating wallet adapters:', error)
      // Return empty array instead of placeholder to avoid type issues
      return []
    }
  }, [])

  // Enhanced error handler with better error messages
  const handleError = React.useCallback((error: any) => {
    console.group('🚨 Wallet Provider Error')
    
    const errorDetails = {
      message: error?.message || 'No error message provided',
      name: error?.name || 'UnknownError',
      stack: error?.stack,
      error: error?.toString(),
      code: error?.code,
    }
    
    console.error('Error Details:', errorDetails)
    
    // Enhanced error handling with more specific messages
    let userFriendlyMessage = 'Failed to connect to wallet. '
    
    if (error?.message?.includes('NETWORK_NOT_GRANTED')) {
      userFriendlyMessage += 'Please grant network access in your Leo Wallet settings.'
      console.log('💡 Solution: Grant network access in Leo Wallet')
    } else if (error?.message?.includes('unknown error')) {
      userFriendlyMessage += 'Please ensure Leo Wallet is installed and on Testnet Beta network.'
      console.log('💡 Solution: Install Leo Wallet and switch to Testnet Beta')
    } else if (error?.message?.includes('User rejected')) {
      userFriendlyMessage = 'Connection was rejected. Please try again and approve the connection.'
      console.log('💡 Solution: User needs to approve the connection')
    } else {
      userFriendlyMessage += 'Please try again or install Leo Wallet if not already installed.'
      console.log('💡 Solution: Check Leo Wallet installation and try again')
    }
    
    console.log('📢 User-friendly error:', userFriendlyMessage)
    console.groupEnd()
    
    // Don't re-throw the error to prevent app crashes
  }, [])

  console.log('🎯 Rendering WalletProvider with', wallets.length, 'wallets')

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