/**
 * Wallet history utilities for fetching real blockchain data
 */

export interface WalletProof {
  id: string
  proofHash: string
  transactionId: string
  documentHash: string
  riskScore: number
  riskLevel: string
  status: string
  timestamp: string
  blockHeight: number
  explorerUrl: string
  documentType: string
}

export interface WalletStats {
  totalProofs: number
  confirmedProofs: number
  averageRiskScore: number
  lastActivity: string | null
}

/**
 * Fetch real proof history from the user's wallet
 */
export async function fetchWalletProofHistory(
  walletAddress: string,
  limit: number = 10,
  offset: number = 0
): Promise<{
  proofs: WalletProof[]
  stats: WalletStats
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}> {
  const response = await fetch(
    `/api/proofs/history?wallet=${walletAddress}&limit=${limit}&offset=${offset}`
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch proof history')
  }
  
  const data = await response.json()
  
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch proof history')
  }
  
  return {
    proofs: data.proofs,
    stats: data.walletStats,
    pagination: data.pagination
  }
}

/**
 * Check if a wallet has any blockchain activity
 */
export async function hasWalletActivity(walletAddress: string): Promise<boolean> {
  try {
    const { stats } = await fetchWalletProofHistory(walletAddress, 1, 0)
    return stats.totalProofs > 0
  } catch {
    return false
  }
}

/**
 * Get the latest proof for a wallet
 */
export async function getLatestProof(walletAddress: string): Promise<WalletProof | null> {
  try {
    const { proofs } = await fetchWalletProofHistory(walletAddress, 1, 0)
    return proofs[0] || null
  } catch {
    return null
  }
}