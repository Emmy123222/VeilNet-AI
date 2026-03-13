/**
 * Local transaction storage for tracking user's proof submissions
 * This provides a fallback when blockchain API is not available
 */

export interface StoredTransaction {
  id: string
  transactionId: string
  documentHash: string
  analysisHash: string
  riskScore: number
  riskLevel: string
  timestamp: string
  walletAddress: string
  status: 'pending' | 'confirmed' | 'failed'
  blockHeight?: number
}

const STORAGE_KEY = 'veilnet_transactions'

/**
 * Store a transaction locally
 */
export function storeTransaction(transaction: StoredTransaction): void {
  try {
    const stored = getStoredTransactions()
    stored.push(transaction)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  } catch (error) {
    console.error('Failed to store transaction:', error)
  }
}

/**
 * Get all stored transactions
 */
export function getStoredTransactions(): StoredTransaction[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to get stored transactions:', error)
    return []
  }
}

/**
 * Get transactions for a specific wallet
 */
export function getWalletTransactions(walletAddress: string): StoredTransaction[] {
  const allTransactions = getStoredTransactions()
  return allTransactions.filter(tx => tx.walletAddress === walletAddress)
}

/**
 * Update transaction status
 */
export function updateTransactionStatus(transactionId: string, status: 'pending' | 'confirmed' | 'failed', blockHeight?: number): void {
  try {
    const stored = getStoredTransactions()
    const index = stored.findIndex(tx => tx.transactionId === transactionId)
    if (index !== -1) {
      stored[index].status = status
      if (blockHeight) {
        stored[index].blockHeight = blockHeight
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    }
  } catch (error) {
    console.error('Failed to update transaction status:', error)
  }
}

/**
 * Clear all stored transactions (for testing)
 */
export function clearStoredTransactions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear stored transactions:', error)
  }
}

/**
 * Get wallet statistics from stored transactions
 */
export function getWalletStats(walletAddress: string) {
  const transactions = getWalletTransactions(walletAddress)
  
  if (transactions.length === 0) {
    return {
      totalProofs: 0,
      confirmedProofs: 0,
      averageRiskScore: 0,
      lastActivity: null
    }
  }

  const confirmedProofs = transactions.filter(tx => tx.status === 'confirmed').length
  const totalRiskScore = transactions.reduce((sum, tx) => sum + tx.riskScore, 0)
  const averageRiskScore = Math.round(totalRiskScore / transactions.length)
  const lastActivity = transactions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0]?.timestamp

  return {
    totalProofs: transactions.length,
    confirmedProofs,
    averageRiskScore,
    lastActivity
  }
}