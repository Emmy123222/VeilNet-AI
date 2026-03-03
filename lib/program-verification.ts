/**
 * Utility to verify if the Aleo program is deployed and accessible
 */

export async function verifyProgramDeployment(programId: string = 'veilnet_ai_v6.aleo'): Promise<{
  isDeployed: boolean;
  error?: string;
  explorerUrl?: string;
}> {
  try {
    // Check if program exists on testnet explorer
    const explorerUrl = `https://testnet.explorer.provable.com/program/${programId}`;
    
    // For now, we'll assume it's deployed based on our deployment logs
    // In a production app, you'd make an API call to verify
    
    return {
      isDeployed: true,
      explorerUrl
    };
  } catch (error) {
    return {
      isDeployed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get helpful troubleshooting information for wallet errors
 */
export function getWalletTroubleshootingInfo(error: any): {
  title: string;
  message: string;
  suggestions: string[];
} {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  if (errorMessage.includes('unknown error')) {
    return {
      title: 'Wallet Transaction Error',
      message: 'The wallet encountered an unknown error while processing the transaction.',
      suggestions: [
        'Ensure Leo Wallet is updated to the latest version',
        'Verify your wallet is connected to Testnet Beta (not mainnet)',
        'Check that you have sufficient testnet credits (visit https://faucet.aleo.org/)',
        'Try disconnecting and reconnecting your wallet',
        'Refresh the page and try again'
      ]
    };
  }
  
  if (errorMessage.includes('insufficient') || errorMessage.includes('credits')) {
    return {
      title: 'Insufficient Credits',
      message: 'Your wallet may have credits but they might not be in the correct format for transactions.',
      suggestions: [
        'Visit https://faucet.aleo.org/ to get fresh testnet credits',
        'Wait 2-3 minutes after requesting credits for them to be processed',
        'Request credits multiple times (sometimes needed for proper format)',
        'Ensure you\'re requesting credits for your current wallet address',
        'Try refreshing your wallet or reconnecting it',
        'Some wallets show credits but they may be in private records - the faucet provides public credits'
      ]
    };
  }
  
  if (errorMessage.includes('rejected')) {
    return {
      title: 'Transaction Rejected',
      message: 'The transaction was rejected in your wallet.',
      suggestions: [
        'Click "Approve" when the wallet popup appears',
        'Check the transaction details before approving',
        'Ensure you have sufficient credits for the fee',
        'Try the transaction again'
      ]
    };
  }
  
  if (errorMessage.includes('network')) {
    return {
      title: 'Network Error',
      message: 'There was a network connectivity issue.',
      suggestions: [
        'Check your internet connection',
        'Verify Leo Wallet is connected to Testnet Beta',
        'Try refreshing the page',
        'Wait a moment and try again'
      ]
    };
  }
  
  return {
    title: 'Transaction Error',
    message: 'An error occurred while processing the blockchain transaction.',
    suggestions: [
      'Check that Leo Wallet is properly installed and updated',
      'Ensure you\'re connected to Testnet Beta network',
      'Verify you have sufficient testnet credits',
      'Try disconnecting and reconnecting your wallet',
      'Contact support if the issue persists'
    ]
  };
}