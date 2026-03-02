/**
 * Utility functions for wallet operations
 */

export interface WalletBalance {
  totalCredits: number
  availableCredits: number
  hasRecords: boolean
  recordCount: number
}

/**
 * Check wallet balance and available credits
 */
export async function checkWalletBalance(
  requestRecords?: (program: string) => Promise<any[]>
): Promise<WalletBalance> {
  if (!requestRecords) {
    // Return neutral state instead of "no credits"
    return {
      totalCredits: -1, // -1 indicates unknown
      availableCredits: -1,
      hasRecords: false,
      recordCount: 0
    }
  }

  try {
    const records = await requestRecords('credits.aleo')
    
    if (!records || records.length === 0) {
      // Return neutral state - user might have public balance
      return {
        totalCredits: -1, // -1 indicates unknown (not necessarily 0)
        availableCredits: -1,
        hasRecords: false,
        recordCount: 0
      }
    }

    let totalCredits = 0
    let availableCredits = 0
    
    for (const record of records) {
      if (record.microcredits) {
        const credits = parseInt(record.microcredits) / 1_000_000 // Convert to credits
        totalCredits += credits
        
        if (!record.spent) {
          availableCredits += credits
        }
      }
    }

    return {
      totalCredits,
      availableCredits,
      hasRecords: true,
      recordCount: records.length
    }
  } catch (error) {
    console.error('Failed to check wallet balance:', error)
    // Return neutral state on error
    return {
      totalCredits: -1, // -1 indicates unknown
      availableCredits: -1,
      hasRecords: false,
      recordCount: 0
    }
  }
}

/**
 * Format credits for display
 */
export function formatCredits(microcredits: number): string {
  const credits = microcredits / 1_000_000
  if (credits >= 1) {
    return `${credits.toFixed(2)} credits`
  } else {
    return `${microcredits.toLocaleString()} microcredits`
  }
}

/**
 * Check if wallet has sufficient credits for a transaction
 */
export function hasSufficientCredits(availableCredits: number, requiredCredits: number = 1): boolean {
  return availableCredits >= requiredCredits
}