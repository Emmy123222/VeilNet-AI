// Aleo transaction submission logic for veilnet_ai_v3.aleo::submit_analysis

import {
  Transaction,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';

const DEFAULT_FEE_MICRO_CREDITS = 750_000; // 0.75 credits - safe for complex transitions with asserts + BHP256 + mappings

// Aleo field prime (for safe modulo in hash-to-field conversion)
const FIELD_PRIME = BigInt('8444461749428370424248824938781546531375899830566350301575494140362904909311');

/**
 * Converts a 256-bit hex string (e.g. SHA-256 digest) to a decimal string suitable for Aleo field.
 * Modulo FIELD_PRIME to fit field size.
 */
function hexToFieldDecimal(hex: string): string {
  const cleanHex = hex.replace(/^0x/i, '');

  // Validate hex
  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error(`Invalid hex string: ${hex}`);
  }

  if (cleanHex.length !== 64) {
    throw new Error(`Expected 64 hex characters (256-bit hash), got ${cleanHex.length}`);
  }

  let val = BigInt(`0x${cleanHex}`);
  val = val % FIELD_PRIME; // Ensure fits in field

  const result = val.toString();
  console.log(`🔢 Hex to field: ${hex.slice(0, 10)}... -> ${result.slice(0, 10)}... (${result.length} digits)`);

  return result;
}

/**
 * Submits analysis result to veilnet_ai_v3.aleo::submit_analysis on Testnet Beta.
 * Assumes Leo transition inputs are marked PUBLIC (recommended for hashes/scores).
 *
 * @param params - From useWallet() hook
 * @returns Transaction ID
 */
export async function submitToAleo({
  requestExecution,
  requestTransaction,
  documentHash,     // Hex string (0x-prefixed or not) of original document
  analysisHash,     // Hex string of AI analysis result (MUST be different!)
  riskScore,
  timestamp,
  publicKey,
}: {
  requestExecution?: (tx: Transaction) => Promise<string>;
  requestTransaction?: (tx: Transaction) => Promise<string>;
  documentHash: string;
  analysisHash: string;
  riskScore: number;
  timestamp: number;
  publicKey: string;
}): Promise<string> {
  const execute = requestExecution ?? requestTransaction;
  if (!execute || typeof execute !== 'function') {
    throw new Error('Wallet execute function unavailable. Ensure wallet is connected.');
  }

  if (!publicKey) {
    throw new Error('No public key. Connect your wallet first.');
  }

  console.log('📤 Submitting to veilnet_ai_v3.aleo::submit_analysis');
  console.log('   Caller:', publicKey);
  console.log('   Document hash:', documentHash);
  console.log('   Analysis hash:', analysisHash);
  console.log('   Risk score:', riskScore);
  console.log('   Timestamp:', timestamp);

  // Input validation
  if (riskScore < 0 || riskScore > 100 || !Number.isInteger(riskScore)) {
    throw new Error('Risk score must be integer 0–100.');
  }

  if (timestamp <= 0 || !Number.isInteger(timestamp)) {
    throw new Error('Timestamp must be positive integer (Unix seconds).');
  }

  // Convert hashes to Aleo field decimals
  const docHashField = hexToFieldDecimal(documentHash);
  const analysisHashField = hexToFieldDecimal(analysisHash);

  // Prepare inputs in exact order of Leo transition
  const inputs = [
    `${docHashField}field`,       // document_hash: field public
    `${analysisHashField}field`,  // analysis_hash: field public
    `${riskScore}u8`,             // risk_score: u8 public
    `${timestamp}u64`,            // timestamp: u64 public
    publicKey,                    // owner: address public (caller's address)
  ];

  console.log('📦 Inputs prepared:', inputs);

  try {
    console.log('💰 Fee: 0.75 credits (public balance) – wallet will deduct');

    const programId = 'veilnet_ai_v3.aleo';

    const tx = Transaction.createTransaction(
      publicKey,                            // payer/caller
      WalletAdapterNetwork.TestnetBeta,     // network
      programId,                            // program ID
      'submit_analysis',                    // transition name
      inputs,                               // string[] inputs
      DEFAULT_FEE_MICRO_CREDITS,            // fee
      false                                 // feePrivate: false → public credits (faucet-friendly)
    );

    console.log('✅ Tx object ready');
    console.log('   Network: Testnet Beta');
    console.log('   Program: veilnet_ai_v3.aleo');
    console.log('   Transition: submit_analysis');
    console.log('   Fee: 750000 microcredits (public)');

    console.log('🚀 Requesting execution...');
    const transactionId = await execute(tx);

    console.log('✅ Success!');
    console.log('   Tx ID:', transactionId);
    console.log('   Explorer: https://testnet.explorer.provable.com/transaction/' + transactionId);

    return transactionId;
  } catch (error: any) {
    console.error('❌ Submission failed:', error);

    let userMessage = 'Transaction failed. Check console for details.';

    const msg = (error?.message || '').toLowerCase();

    if (msg.includes('insufficient') || msg.includes('fee') || msg.includes('credits')) {
      userMessage = 'Insufficient credits. Request more at https://faucet.aleo.org/ (wait 5 min after claim). Try higher fee if persists.';
    } else if (msg.includes('rejected')) {
      userMessage = 'Rejected in wallet — approve the tx popup.';
    } else if (msg.includes('input') || msg.includes('parse') || msg.includes('type') || msg.includes('expected')) {
      userMessage = 'Input mismatch. Verify Leo program signature matches (public fields?). Check hashes are valid 64-char hex.';
    } else if (msg.includes('not found') || msg.includes('program') || msg.includes('sync')) {
      userMessage = 'Program not synced in wallet. Wait 10–15 min, refresh wallet, or reconnect. Confirm deployment on https://testnet.explorer.provable.com.';
    } else if (msg.includes('network')) {
      userMessage = 'Network mismatch — set wallet to Testnet Beta.';
    }

    throw new Error(userMessage);
  }
}

/**
 * User-friendly error message mapper
 */
export function getAleoErrorMessage(error: any): string {
  const msg = (error?.message || '').toLowerCase();

  if (msg.includes('insufficient') || msg.includes('fee') || msg.includes('credits') || msg.includes('balance')) {
    return '💰 Low credits. Get free Testnet credits: https://faucet.aleo.org/ (wait a few minutes).';
  }
  if (msg.includes('rejected')) {
    return 'Transaction rejected — please approve in your wallet.';
  }
  if (msg.includes('input') || msg.includes('invalid') || msg.includes('parse') || msg.includes('type')) {
    return 'Input error — check documentHash & analysisHash are valid 64-char hex, riskScore 0-100 integer.';
  }
  if (msg.includes('not found') || msg.includes('program') || msg.includes('veilnet_ai') || msg.includes('sync')) {
    return 'Wallet not synced with program. Wait 10-15 min, refresh, reconnect, or update wallet app.';
  }
  if (msg.includes('network')) {
    return 'Wallet on wrong network — switch to Testnet Beta.';
  }
  return `Error: ${error.message || 'Unknown'}. See console logs.`;
}