// Aleo transaction submission logic for veilnet_ai.aleo::submit_analysis

import {
  Transaction,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';

const DEFAULT_FEE_MICRO_CREDITS = 5_000_000; // 5 credits – adjust if needed

// Aleo field prime (for field type conversion)
const FIELD_PRIME = BigInt('8444461749428370424248824938781546531375899830566350301575494140362904909311');

/**
 * Converts hex string to decimal field value for Aleo
 */
function hexToFieldDecimal(hex: string): string {
  const cleanHex = hex.replace(/^0x/i, '');
  let val = BigInt(`0x${cleanHex}`);
  val = val % FIELD_PRIME;
  return val.toString();
}

/**
 * Submits analysis result to veilnet_ai.aleo on Testnet Beta
 * @param params - Destructured params from useWallet()
 */
export async function submitToAleo({
  requestTransaction,
  requestRecords,
  documentHash,
  riskScore,
  timestamp,
  publicKey,
}: {
  requestTransaction: (tx: Transaction) => Promise<string>;
  requestRecords?: (program: string) => Promise<any[]>;
  documentHash: string;
  riskScore: number;
  timestamp: number;
  publicKey: string;
}): Promise<string> {
  if (!requestTransaction || typeof requestTransaction !== 'function') {
    throw new Error('requestTransaction function is not available. Wallet may not be properly connected.');
  }

  if (!publicKey) {
    throw new Error('No public key available. Wallet must be connected.');
  }

  console.log('📤 Submitting to veilnet_ai.aleo::submit_analysis');
  console.log('   User address:', publicKey);

  // Step 1: Fetch and check records for fee
  let feeRecord = null;
  if (requestRecords && typeof requestRecords === 'function') {
    try {
      console.log('💰 Fetching credit records...');
      const records = await requestRecords('credits.aleo');
      console.log('📊 Total records found:', records?.length || 0);
      
      if (records && records.length > 0) {
        console.log('Records details:', records.map((r: any) => ({
          spent: r.spent,
          microcredits: r.microcredits,
          plaintext: r.plaintext?.substring(0, 100)
        })));
        
        // Find unspent record with sufficient balance
        const usableRecords = records.filter((r: any) => 
          !r.spent && r.microcredits && parseInt(r.microcredits) >= DEFAULT_FEE_MICRO_CREDITS
        );
        
        console.log('💵 Usable records:', usableRecords.length);
        
        if (usableRecords.length > 0) {
          feeRecord = usableRecords[0].plaintext || usableRecords[0];
          console.log('✅ Using fee record with', usableRecords[0].microcredits, 'microcredits');
        } else {
          console.warn('⚠️ No usable records found. Need at least', DEFAULT_FEE_MICRO_CREDITS, 'microcredits');
          throw new Error(
            `Insufficient balance. You need at least ${DEFAULT_FEE_MICRO_CREDITS / 1_000_000} credits. ` +
            `Get testnet credits from: https://faucet.aleo.org/`
          );
        }
      } else {
        console.warn('⚠️ No records found in wallet');
        throw new Error(
          'No credit records found. Get testnet credits from: https://faucet.aleo.org/'
        );
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch records:', error);
      if (error.message.includes('Insufficient balance') || error.message.includes('No credit records')) {
        throw error;
      }
      console.warn('⚠️ Continuing without explicit fee record (wallet may handle it)');
    }
  } else {
    console.warn('⚠️ requestRecords not available, wallet will handle fee automatically');
  }

  console.log('   Document hash:', documentHash);
  console.log('   Risk score:', riskScore);
  console.log('   Timestamp:', timestamp);

  // Clean the hash (remove 0x prefix if present)
  const cleanHash = documentHash.replace(/^0x/i, '');

  // Convert hex hashes to decimal field values (required for field type in Leo)
  const inputHashField = hexToFieldDecimal(cleanHash);
  const aiHashField = hexToFieldDecimal(cleanHash.substring(0, 64));

  console.log('🔢 Converted field values:');
  console.log('   Input hash:', inputHashField);
  console.log('   AI hash:', aiHashField);
  console.log('   Length check:', inputHashField.length, 'digits');

  // Leo field literals require the 'field' suffix
  // Signature: submit_analysis(input_hash: field, ai_output_hash: field, ai_score: u8, timestamp: u64, owner: address)
  const inputs = [
    `${inputHashField}field`,    // input_hash: field
    `${aiHashField}field`,       // ai_output_hash: field
    `${riskScore}u8`,            // ai_score: u8
    `${timestamp}u64`,           // timestamp: u64
    publicKey,                    // owner: address
  ];

  console.log('📦 Final inputs:', inputs);

  try {
    const tx = Transaction.createTransaction(
      publicKey,                          // payer / caller
      WalletAdapterNetwork.TestnetBeta,   // network
      'veilnet_ai.aleo',                  // program name
      'submit_analysis',                  // transition/function name
      inputs,                             // array of string inputs
      DEFAULT_FEE_MICRO_CREDITS,          // fee in microcredits
      feeRecord                           // fee record (if available)
    );

    console.log('✅ Transaction object created');
    console.log('   Using fee record:', feeRecord ? 'Yes' : 'No (wallet will handle)');

    const transactionId = await requestTransaction(tx);

    console.log('✅ Transaction broadcasted successfully!');
    console.log('   Transaction ID:', transactionId);
    console.log('   View on explorer: https://explorer.aleo.org/transaction/' + transactionId);
    
    return transactionId;
  } catch (error: any) {
    console.error('❌ Failed to submit transaction:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      name: error.name
    });
    throw error;
  }
}

/**
 * Converts raw error to user-friendly message
 */
export function getAleoErrorMessage(error: any): string {
  const msg = (error?.message || '').toLowerCase();

  if (msg.includes('no records') || msg.includes('fee')) {
    return '💰 Insufficient testnet credits. Get free credits from: https://faucet.aleo.org/ (wait 2-3 minutes after requesting)';
  }
  if (msg.includes('not connected') || msg.includes('requesttransaction')) {
    return 'Wallet connection issue. Please reconnect Leo Wallet and ensure it is on Testnet Beta.';
  }
  if (msg.includes('insufficient') || msg.includes('balance') || msg.includes('credits')) {
    return 'Insufficient credits. Please request more Testnet Beta credits at https://faucet.aleo.org/';
  }
  if (msg.includes('rejected')) {
    return 'Transaction was rejected in your wallet. Please approve it.';
  }
  if (msg.includes('inputs') || msg.includes('invalid') || msg.includes('type') || msg.includes('parse') || msg.includes('expected input')) {
    return 'Input format error. Check console logs for details. Ensure contract is deployed correctly.';
  }
  if (msg.includes('not found') || msg.includes('program') || msg.includes('veilnet_ai')) {
    return 'Program veilnet_ai.aleo not found on Testnet Beta. Confirm deployment on https://testnet.explorer.provable.com/';
  }
  if (msg.includes('network')) {
    return 'Network mismatch. Please ensure Leo Wallet is set to Testnet Beta.';
  }
  return `Blockchain error: ${error.message || 'Unknown issue'}. Check browser console for details.`;
}