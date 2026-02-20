'use client'

import { useEffect } from 'react'
import { useWallet } from '@demox-labs/aleo-wallet-adapter-react'

export function useWalletPersistence() {
  const { connected, connecting, publicKey, wallet } = useWallet()

  useEffect(() => {
    // Store wallet connection state in localStorage
    if (connected && publicKey) {
      localStorage.setItem('veilnet_wallet_connected', 'true')
      localStorage.setItem('veilnet_wallet_address', publicKey.toString())
      localStorage.setItem('veilnet_wallet_name', wallet?.adapter?.name || '')
    } else if (!connecting) {
      // Only clear if not currently connecting (to avoid clearing during connection process)
      localStorage.removeItem('veilnet_wallet_connected')
      localStorage.removeItem('veilnet_wallet_address')
      localStorage.removeItem('veilnet_wallet_name')
    }
  }, [connected, connecting, publicKey, wallet])

  // Check if wallet was previously connected
  const wasConnected = () => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('veilnet_wallet_connected') === 'true'
  }

  // Get stored wallet address
  const getStoredAddress = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('veilnet_wallet_address')
  }

  // Get stored wallet name
  const getStoredWalletName = () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('veilnet_wallet_name')
  }

  return {
    connected,
    connecting,
    publicKey,
    wallet,
    wasConnected: wasConnected(),
    storedAddress: getStoredAddress(),
    storedWalletName: getStoredWalletName()
  }
}