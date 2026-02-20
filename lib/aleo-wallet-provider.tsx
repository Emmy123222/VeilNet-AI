'use client'

import React from 'react'
import { WalletProvider } from '@demox-labs/aleo-wallet-adapter-react'
import { LeoWalletAdapter } from '@demox-labs/aleo-wallet-adapter-leo'
import { WalletModalProvider } from '@demox-labs/aleo-wallet-adapter-reactui'
import { DecryptPermission, WalletAdapterNetwork } from '@demox-labs/aleo-wallet-adapter-base'
import type { Adapter } from '@demox-labs/aleo-wallet-adapter-base'

// Import styles (ensure this is loaded once)
import '@demox-labs/aleo-wallet-adapter-reactui/styles.css'

interface AleoWalletProviderProps {
  children: React.ReactNode
}

export default function AleoWalletProvider({ children }: AleoWalletProviderProps) {
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
      return [] // Fallback to prevent provider crash
    }
  }, [])

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

    let userFriendlyMessage = 'Failed to connect or perform wallet action. '

    if (error?.message?.includes('NETWORK_NOT_GRANTED')) {
      userFriendlyMessage += 'Please grant network access in your Leo Wallet settings.'
      console.log('💡 Solution: Grant network access in Leo Wallet')
    } else if (error?.message?.includes('unknown error') || !error?.message) {
      // Strengthened check for generic unknown errors
      userFriendlyMessage +=
        'Please ensure Leo Wallet is installed, updated, and switched to **Testnet Beta**. ' +
        'Also check your balance and permissions.'
      console.log('💡 Solution: Install/update Leo Wallet and switch to Testnet Beta')
    } else if (error?.message?.includes('User rejected')) {
      userFriendlyMessage = 'Connection or action was rejected. Please approve in the wallet.'
      console.log('💡 Solution: Approve the request in Leo Wallet')
    } else {
      userFriendlyMessage += 'Please try again, restart your browser, or reinstall the wallet extension.'
      console.log('💡 Solution: Retry or reinstall Leo Wallet')
    }

    console.log('📢 User-friendly error:', userFriendlyMessage)
    console.groupEnd()

    // Optional: Show UI notification here (e.g., toast.error(userFriendlyMessage))
    // import toast from 'react-hot-toast'; toast.error(userFriendlyMessage);

    // Still don't re-throw to avoid crashes
  }, [])

  console.log('🎯 Rendering WalletProvider with', wallets.length, 'wallets')

  return (
    <WalletProvider
      wallets={wallets}
      network={WalletAdapterNetwork.TestnetBeta} // Correct and current for testnet
      autoConnect={true} // Enable auto-connect for persistence
      onError={handleError}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </WalletProvider>
  )
}

// Re-exports (unchanged)
export { useWallet } from '@demox-labs/aleo-wallet-adapter-react'
export { WalletMultiButton, WalletDisconnectButton } from '@demox-labs/aleo-wallet-adapter-reactui'