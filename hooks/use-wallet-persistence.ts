'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWallet } from '@provablehq/aleo-wallet-adaptor-react'

export function useWalletPersistence() {
  const { 
    connected, 
    connecting, 
    address: publicKey,   // ← Changed: 'address' instead of 'publicKey'
    wallet 
  } = useWallet()

  // Local state to make persistence more reliable across re-renders
  const [storedAddress, setStoredAddress] = useState<string | null>(null)
  const [storedWalletName, setStoredWalletName] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (connected && publicKey) {
      const walletAddress = publicKey
      localStorage.setItem('veilnet_wallet_connected', 'true')
      localStorage.setItem('veilnet_wallet_address', walletAddress)
      localStorage.setItem('veilnet_wallet_name', wallet?.adapter?.name || 'Shield Wallet')

      setStoredAddress(walletAddress)
      setStoredWalletName(wallet?.adapter?.name || 'Shield Wallet')

      console.log('💾 Wallet persistence saved:', { 
        connected, 
        address: walletAddress,
        walletName: wallet?.adapter?.name 
      })
    } 
    else if (!connecting) {
      // Only clear storage when truly disconnected (not during connecting state)
      localStorage.removeItem('veilnet_wallet_connected')
      localStorage.removeItem('veilnet_wallet_address')
      localStorage.removeItem('veilnet_wallet_name')

      setStoredAddress(null)
      setStoredWalletName(null)

      console.log('🗑️ Wallet persistence cleared')
    }
  }, [connected, connecting, publicKey, wallet])

  // Check if wallet was previously connected
  const wasConnected = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('veilnet_wallet_connected') === 'true'
  }, [])

  // Get stored wallet address
  const getStoredAddress = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('veilnet_wallet_address')
  }, [])

  // Get stored wallet name
  const getStoredWalletName = useCallback((): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('veilnet_wallet_name')
  }, [])

  return {
    connected,
    connecting,
    publicKey,           // Still returning as publicKey for backward compatibility with your components
    wallet,
    wasConnected: wasConnected(),
    storedAddress: storedAddress || getStoredAddress(),
    storedWalletName: storedWalletName || getStoredWalletName(),
  }
}