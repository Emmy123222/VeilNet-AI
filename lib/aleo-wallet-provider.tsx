'use client'

import React from 'react'
import { AleoWalletProvider as ProvableAleoWalletProvider } from '@provablehq/aleo-wallet-adaptor-react'
import { ShieldWalletAdapter } from '@provablehq/aleo-wallet-adaptor-shield'
import { WalletModalProvider } from '@provablehq/aleo-wallet-adaptor-react-ui'
import { Network } from '@provablehq/aleo-types'

// Import styles (note the correct path used in official examples)
import '@provablehq/aleo-wallet-adaptor-react-ui/dist/styles.css'

interface AleoWalletProviderProps {
  children: React.ReactNode
}

export default function AleoWalletProvider({ children }: AleoWalletProviderProps) {
  const wallets = React.useMemo(() => {
    try {
      console.log('🔄 Creating Shield Wallet Adapter...')

      const shieldWallet = new ShieldWalletAdapter({
        appName: 'VeilNet AI',        // Good to keep for branding
      })

      console.log('✅ Shield Wallet Adapter created successfully')
      return [shieldWallet]
    } catch (error) {
      console.error('❌ Error creating Shield Wallet Adapter:', error)
      return []
    }
  }, [])

  const handleError = React.useCallback((error: any) => {
    console.group('🚨 Aleo Wallet Error')

    const errorDetails = {
      message: error?.message || 'Unknown error',
      name: error?.name,
      code: error?.code,
    }

    console.error('Error Details:', errorDetails)

    let userMessage = 'Wallet action failed. '

    if (error?.message?.includes('NETWORK_NOT_GRANTED') || error?.message?.includes('network')) {
      userMessage += 'Please allow Testnet access in Shield Wallet settings.'
    } else if (error?.message?.includes('User rejected') || error?.message?.includes('rejected')) {
      userMessage = 'Request was rejected. Please approve it in Shield Wallet.'
    } else if (!error?.message || error?.message.includes('unknown')) {
      userMessage += 'Make sure Shield Wallet is installed, updated, and connected to **Testnet**. '
      userMessage += 'Download it from https://aleo.org/shield or https://www.shield.app/'
    } else {
      userMessage += 'Please try again or restart your browser/extension.'
    }

    console.log('💡 User message:', userMessage)
    console.groupEnd()

    // Optional: You can also show a toast/notification here
  }, [])

  console.log(`🎯 Rendering AleoWalletProvider with ${wallets.length} wallet(s)`)

  return (
    <ProvableAleoWalletProvider
      wallets={wallets}
      network={Network.TESTNET}           // ← Fixed: Use Network from @provablehq/aleo-types
      autoConnect={true}
      onError={handleError}
    >
      <WalletModalProvider>
        {children}
      </WalletModalProvider>
    </ProvableAleoWalletProvider>
  )
}

// Re-exports (clean and useful)
export { useWallet } from '@provablehq/aleo-wallet-adaptor-react'
export { 
  WalletMultiButton, 
  WalletDisconnectButton 
} from '@provablehq/aleo-wallet-adaptor-react-ui'