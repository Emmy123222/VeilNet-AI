import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import AleoWalletProvider from '@/lib/aleo-wallet-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'VeilNet AI - Private AI Inference',
  description: 'Decentralized privacy infrastructure for AI models using Aleo zero-knowledge proofs',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        type: 'image/png',
      },
      {
        url: '/veilnet-logo.png',
        type: 'image/png',
        sizes: '32x32',
      },
    ],
    apple: '/veilnet-logo.png',
    shortcut: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Bitcount+Prop+Single:wght@100..900&family=Bitcount+Single:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-bitcount antialiased">
        <AleoWalletProvider>
          {children}
        </AleoWalletProvider>
        <Analytics />
      </body>
    </html>
  )
}
