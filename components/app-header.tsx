'use client'

import { Badge } from '@/components/ui/badge'

interface AppHeaderProps {
  publicKey?: string
}

export function AppHeader({ publicKey }: AppHeaderProps) {
  return (
    <header className="border-b border-border/40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <img src="/veilnet-logo.png" alt="VeilNet AI" className="h-6 w-6 object-contain" />
          <span className="text-xl font-bold">VeilNet AI</span>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">
          {publicKey?.slice(0, 8)}...{publicKey?.slice(-8)}
        </Badge>
      </div>
    </header>
  )
}
