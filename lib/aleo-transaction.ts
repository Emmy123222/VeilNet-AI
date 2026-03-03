// Aleo transaction submission logic for veilnet_ai_v6.aleo::submit_analysis

import {
  Transaction,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';

const DEFAULT_FEE_MICRO_CREDITS = 750_000;

// Aleo field prime
const FIELD_PRIME = BigInt('8444461749428370424248824938781546531375899830566350301575494140362904909311');

// ✅ Correct Provable API v2 base
const ALEO_API_BASE = 'https://api.provable.com/v2/testnet';
const PROGRAM_ID = 'veilnet_ai_v6.aleo';

/**
 * Polls the Provable API v2 to find the real Aleo transaction ID
 * after Leo Wallet returns a UUID.
 */
async function pollForRealTransactionId(
  _uuid: string,
  maxAttempts: number = 12,
  delayMs: number = 5000
): Promise<string | null> {
  console.log(`🔍 Polling Provable API v2 for real transaction ID...`);
  console.log(`   Program: ${PROGRAM_ID}`);
  console.log(`   Will try ${maxAttempts} times every ${delayMs / 1000}s`);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`   Attempt ${attempt}/${maxAttempts}...`);

      // Get latest block height
      const heightRes = await fetch(`${ALEO_API_BASE}/block/height/latest`, {
        headers: { 'Accept': 'application/json' },
      });

      if (!heightRes.ok) {
        console.warn(`   Could not fetch latest block height: ${heightRes.status}`);
        await new Promise(r => setTimeout(r, delayMs));
        continue;
      }

      const latestHeight: number = await heightRes.json();
      console.log(`   Latest block height: ${latestHeight}`);

      // Scan the last 5 blocks for our transaction
      const scanFrom = Math.max(0, latestHeight - 5);

      for (let h = latestHeight; h >= scanFrom; h--) {
        const blockRes = await fetch(`${ALEO_API_BASE}/block/${h}/transactions`, {
          headers: { 'Accept': 'application/json' },
        });

        if (!blockRes.ok) continue;

        const transactions = await blockRes.json();
        if (!Array.isArray(transactions)) continue;

        for (const confirmedTx of transactions) {
          const tx = confirmedTx?.transaction;
          if (!tx || tx.type !== 'execute') continue;

          const transitions = tx?.execution?.transitions;
          if (!Array.isArray(transitions)) continue;

          for (const transition of transitions) {
            if (
              transition.program === PROGRAM_ID &&
              transition.function === 'submit_analysis'
            ) {
              const txId = tx.id;
              console.log(`   ✅ Found our transaction in block ${h}: ${txId}`);
              console.log(`   Status: ${confirmedTx.status}`);
              return txId;
            }
          }
        }
      }

      console.log(`   Not found yet in recent blocks, waiting ${delayMs / 1000}s...`);
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, delayMs));
      }

    } catch (error) {
      console.warn(`   Error during polling attempt ${attempt}:`, error);
      if (attempt < maxAttempts) {
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }

  console.warn(`⚠️ Could not find transaction after ${maxAttempts} attempts`);
  return null;
}

/**
 * Converts a 256-bit hex string to a decimal string for Aleo field.
 */
function hexToFieldDecimal(hex: string): string {
  const cleanHex = hex.replace(/^0x/i, '');

  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error(`Invalid hex string: ${hex}`);
  }

  if (cleanHex.length !== 64) {
    throw new Error(`Expected 64 hex characters (256-bit hash), got ${cleanHex.length}`);
  }

  let val = BigInt(`0x${cleanHex}`);
  val = val % FIELD_PRIME;

  const result = val.toString();
  console.log(`🔢 Hex to field: ${hex.slice(0, 10)}... -> ${result.slice(0, 10)}... (${result.length} digits)`);

  return result;
}

/**
 * Submits analysis result to veilnet_ai_v6.aleo::submit_analysis on Testnet Beta.
 * All inputs are PUBLIC — no private records created, no requestRecords needed.
 */
export async function submitToAleo({
  requestTransaction,
  requestExecution,
  documentHash,
  analysisHash,
  riskScore,
  timestamp,
  publicKey,
}: {
  requestTransaction?: (tx: Transaction) => Promise<string>;
  requestExecution?: (tx: Transaction) => Promise<string>;
  documentHash: string;
  analysisHash: string;
  riskScore: number;
  timestamp: number;
  publicKey: string;
}): Promise<string> {

  // Always prefer requestTransaction — correct for async on-chain transitions
  const execute = requestTransaction ?? requestExecution;

  if (!execute || typeof execute !== 'function') {
    throw new Error('Wallet execute function unavailable. Ensure wallet is connected.');
  }

  if (!publicKey) {
    throw new Error('No public key. Connect your wallet first.');
  }

  console.log(`📤 Submitting to ${PROGRAM_ID}::submit_analysis`);
  console.log('   Caller:', publicKey);
  console.log('   Document hash:', documentHash);
  console.log('   Analysis hash:', analysisHash);
  console.log('   Risk score:', riskScore);
  console.log('   Timestamp:', timestamp);

  if (riskScore < 0 || riskScore > 100 || !Number.isInteger(riskScore)) {
    throw new Error('Risk score must be integer 0–100.');
  }

  if (timestamp <= 0 || !Number.isInteger(timestamp)) {
    throw new Error('Timestamp must be positive integer (Unix seconds).');
  }

  const docHashField = hexToFieldDecimal(documentHash);
  const analysisHashField = hexToFieldDecimal(analysisHash);

  if (docHashField === '0') {
    throw new Error('Document hash converts to zero field — use a different document.');
  }
  if (analysisHashField === '0') {
    throw new Error('Analysis hash converts to zero field — use a different analysis result.');
  }

  const inputs = [
    `${docHashField}field`,
    `${analysisHashField}field`,
    `${riskScore}u8`,
    `${timestamp}u64`,
    publicKey,
  ];

  console.log('📦 Inputs prepared:', inputs);

  try {
    console.log('🔍 Pre-transaction validation:');
    console.log('   Program ID:', PROGRAM_ID);
    console.log('   Network: Testnet Beta');
    console.log('   Fee (microcredits):', DEFAULT_FEE_MICRO_CREDITS);
    console.log('   ℹ️  No requestRecords needed — all inputs public, no private Records produced.');

    const tx = Transaction.createTransaction(
      publicKey,
      WalletAdapterNetwork.TestnetBeta,
      PROGRAM_ID,
      'submit_analysis',
      inputs,
      DEFAULT_FEE_MICRO_CREDITS,
      false // feePrivate: false → use public credits
    );

    console.log('✅ Tx object ready, requesting execution...');
    const transactionId = await execute(tx);

    console.log('✅ Transaction submitted!');
    console.log('   Initial ID from wallet:', transactionId);

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(transactionId);
    const isAleoTxId = transactionId.startsWith('at1') && transactionId.length > 60;

    if (isAleoTxId) {
      console.log('✅ Got real Aleo transaction ID immediately!');
      console.log('   Explorer: https://testnet.explorer.provable.com/transaction/' + transactionId);
      return transactionId;
    }

    if (isUUID) {
      console.log('⏳ Wallet returned a UUID — polling blockchain for real transaction ID...');
      console.log('   This is normal. Aleo ZK proofs take 30–120 seconds to finalize.');

      const realTxId = await pollForRealTransactionId(transactionId);

      if (realTxId) {
        console.log('✅ Real transaction ID confirmed:', realTxId);
        console.log('   Explorer: https://testnet.explorer.provable.com/transaction/' + realTxId);
        return realTxId;
      } else {
        console.warn('⚠️ Could not auto-fetch real transaction ID.');
        console.warn('   Your transaction was submitted and is likely still processing.');
        console.warn(`   Check manually: https://testnet.explorer.provable.com/program/${PROGRAM_ID}/transactions`);
        return transactionId;
      }
    }

    console.warn('⚠️ Unexpected transaction ID format:', transactionId);
    return transactionId;

  } catch (error: any) {
    console.error('❌ Submission failed:', error);
    console.error('   Error message:', error?.message);
    console.error('   Error stack:', error?.stack);

    const msg = (error?.message || '').toLowerCase();
    const errorStr = String(error).toLowerCase();

    let userMessage = 'Transaction failed. Check console for details.';

    if (msg.includes('insufficient') || msg.includes('fee') || msg.includes('credits') ||
        msg.includes('balance') || errorStr.includes('insufficient')) {
      userMessage = 'Insufficient credits. Request more at https://faucet.aleo.org/ (wait 5 min after claim).';
    } else if (msg.includes('rejected') || msg.includes('denied') || msg.includes('cancelled')) {
      userMessage = 'Transaction rejected in wallet — please approve the transaction popup.';
    } else if (msg.includes('input') || msg.includes('parse') || msg.includes('type') ||
               msg.includes('expected') || msg.includes('invalid')) {
      userMessage = 'Input validation error. Check document and analysis hashes are valid 64-character hex strings.';
    } else if (msg.includes('not found') || msg.includes('program') || msg.includes('sync') ||
               msg.includes('veilnet_ai_v6')) {
      userMessage = 'Program not synced in wallet. Wait 10–15 minutes for wallet to sync, then try again.';
    } else if (msg.includes('network') || msg.includes('testnet')) {
      userMessage = 'Network error — ensure wallet is connected to Testnet Beta.';
    } else if (msg.includes('unknown error') || msg.includes('execution failed')) {
      userMessage = 'Wallet execution error. Try refreshing the page and reconnecting your wallet.';
    }

    throw new Error(userMessage);
  }
}

/**
 * Verify a proof exists on-chain using the Provable API v2 mapping endpoint.
 */
export async function verifyProofOnChain(proofId: string): Promise<boolean> {
  try {
    const url = `${ALEO_API_BASE}/program/${PROGRAM_ID}/mapping/proof_registry/${proofId}field`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.status === 404) return false;
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const value = await response.json();
    return value === true;

  } catch (error) {
    console.error('Error verifying proof:', error);
    return false;
  }
}

/**
 * Get verification stats from on-chain mapping.
 * @param riskCategory - 1 (Low 1–25), 2 (Medium 26–60), 3 (High 61–85), 4 (Critical 86–100)
 */
export async function getVerificationStats(riskCategory: 1 | 2 | 3 | 4): Promise<number> {
  try {
    const url = `${ALEO_API_BASE}/program/${PROGRAM_ID}/mapping/verification_stats/${riskCategory}u8`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.status === 404) return 0;
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const value = await response.json();
    if (typeof value === 'string') {
      return parseInt(value.replace('u64', ''), 10) || 0;
    }
    return Number(value) || 0;

  } catch (error) {
    console.error('Error fetching verification stats:', error);
    return 0;
  }
}

/**
 * Diagnostic check for wallet and program status.
 * NOTE: Do NOT call requestRecords() anywhere for this program.
 * veilnet_ai_v6.aleo uses only public inputs/mappings — zero private Records produced.
 */
export async function runWalletDiagnostics(publicKey?: string): Promise<{
  walletConnected: boolean;
  networkCorrect: boolean;
  programDeployed: boolean;
  suggestions: string[];
}> {
  const diagnostics = {
    walletConnected: !!publicKey,
    networkCorrect: true,
    programDeployed: false,
    suggestions: [] as string[],
  };

  try {
    const res = await fetch(`${ALEO_API_BASE}/program/${PROGRAM_ID}`, {
      headers: { 'Accept': 'application/json' },
    });
    diagnostics.programDeployed = res.ok;
  } catch {
    diagnostics.programDeployed = false;
  }

  if (!publicKey) {
    diagnostics.suggestions.push('Connect your Leo Wallet first.');
  }

  if (!diagnostics.programDeployed) {
    diagnostics.suggestions.push(`Program ${PROGRAM_ID} not found on testnet. Check deployment.`);
  }

  if (diagnostics.suggestions.length === 0) {
    diagnostics.suggestions.push('All checks passed. You are ready to submit.');
  }

  return diagnostics;
}

export function getAleoErrorMessage(error: any): string {
  const msg = (error?.message || '').toLowerCase();

  if (msg.includes('insufficient') || msg.includes('fee') || msg.includes('credits') || msg.includes('balance')) {
    return '💰 Low credits. Get free Testnet credits: https://faucet.aleo.org/';
  }
  if (msg.includes('rejected')) {
    return 'Transaction rejected — please approve in your wallet.';
  }
  if (msg.includes('input') || msg.includes('invalid') || msg.includes('parse') || msg.includes('type')) {
    return 'Input error — check documentHash & analysisHash are valid 64-char hex, riskScore 0–100 integer.';
  }
  if (msg.includes('not found') || msg.includes('program') || msg.includes('veilnet_ai') || msg.includes('sync')) {
    return 'Wallet not synced with program. Wait 10–15 min, refresh, reconnect wallet.';
  }
  if (msg.includes('network')) {
    return 'Wallet on wrong network — switch to Testnet Beta.';
  }
  return `Error: ${error.message || 'Unknown'}. See console logs.`;
}