'use client'

import { useWalletPersistence } from '@/hooks/use-wallet-persistence'
import { Badge } from '@/components/ui/badge'
import { Shield, Loader2, AlertCircle } from 'lucide-react'

export function WalletStatusIndicator() {
  const { connected, connecting, publicKey, storedAddress } = useWalletPersistence()

  if (connecting) {
    return (
      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Connecting...
      </Badge>
    )
  }

  if (connected && publicKey) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <Shield className="h-3 w-3 mr-1" />
        Connected: {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
      </Badge>
    )
  }

  if (storedAddress && !connected) {
    return (
      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <AlertCircle className="h-3 w-3 mr-1" />
        Reconnecting...
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
      <Shield className="h-3 w-3 mr-1" />
      Not Connected
    </Badge>
  )
}