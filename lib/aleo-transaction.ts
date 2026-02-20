// Aleo transaction submission logic for veilnet_ai.aleo::submit_analysis

import {
  Transaction,
  WalletAdapterNetwork,
} from '@demox-labs/aleo-wallet-adapter-base';

const DEFAULT_FEE_MICRO_CREDITS = 1_000_000; // 1 credit - reduced for testnet

// Aleo field prime (for field type conversion)
const FIELD_PRIME = BigInt('8444461749428370424248824938781546531375899830566350301575494140362904909311');

/**
 * Converts hex string to decimal field value for Aleo
 */
function hexToFieldDecimal(hex: string): string {
  const cleanHex = hex.replace(/^0x/i, '');
  
  // Validate hex string
  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) {
    throw new Error(`Invalid hex string: ${hex}`);
  }
  
  // Ensure hex is not too long (max 64 characters for 256-bit)
  if (cleanHex.length > 64) {
    throw new Error(`Hex string too long: ${cleanHex.length} characters (max 64)`);
  }
  
  let val = BigInt(`0x${cleanHex}`);
  val = val % FIELD_PRIME;
  
  const result = val.toString();
  console.log(`🔢 Hex conversion: ${hex} -> ${result}`);
  
  return result;
}

/**
 * Submits analysis result to veilnet_ai.aleo on Testnet Beta
 * @param params - Destructured params from useWallet()
 */
export async function submitToAleo({
  requestExecution,
  requestTransaction,
  requestRecords,
  documentHash,
  riskScore,
  timestamp,
  publicKey,
}: {
  requestExecution?: (tx: Transaction) => Promise<string>;
  requestTransaction?: (tx: Transaction) => Promise<string>;
  requestRecords?: (program: string) => Promise<any[]>;
  documentHash: string;
  riskScore: number;
  timestamp: number;
  publicKey: string;
}): Promise<string> {
  // Use requestExecution for program transitions (execute); requestTransaction is for transfers
  const execute = requestExecution ?? requestTransaction;
  if (!execute || typeof execute !== 'function') {
    throw new Error('requestExecution/requestTransaction not available. Wallet may not be properly connected.');
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
          console.warn('⚠️ No usable records found, but continuing - wallet may handle fees automatically');
          // Don't throw error here - let the wallet handle it
        }
      } else {
        console.warn('⚠️ No records returned, but continuing - wallet may handle fees automatically');
        // Don't throw error here - let the wallet handle it
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch records:', error);
      console.warn('⚠️ Continuing without explicit fee record - wallet will handle fees automatically');
      // Don't throw error here - the wallet adapter should handle fees automatically
    }
  } else {
    console.warn('⚠️ requestRecords not available, wallet will handle fee automatically');
  }

  console.log('   Document hash:', documentHash);
  console.log('   Risk score:', riskScore);
  console.log('   Timestamp:', timestamp);

  // Validate inputs
  if (riskScore < 0 || riskScore > 100) {
    throw new Error(`Invalid risk score: ${riskScore}. Must be between 0 and 100.`);
  }
  
  if (timestamp <= 0) {
    throw new Error(`Invalid timestamp: ${timestamp}. Must be positive.`);
  }

  // Clean the hash (remove 0x prefix if present)
  const cleanHash = documentHash.replace(/^0x/i, '');
  
  if (cleanHash.length !== 64) {
    throw new Error(`Invalid document hash length: ${cleanHash.length}. Expected 64 hex characters.`);
  }

  // Convert hex hashes to decimal field values (required for field type in Leo)
  const inputHashField = hexToFieldDecimal(cleanHash);
  const aiHashField = hexToFieldDecimal(cleanHash.substring(0, 64));

  console.log('🔢 Converted field values:');
  console.log('   Input hash:', inputHashField);
  console.log('   AI hash:', aiHashField);
  console.log('   Length check:', inputHashField.length, 'digits');

  // Leo field literals require the 'field' suffix
  // Signature: submit_analysis(public input_hash: field, public ai_output_hash: field, public ai_score: u8, public timestamp: u64, owner: address)
  // Note: 'owner' is private parameter - handled by wallet, not passed in inputs
  const inputs = [
    `${inputHashField}field`,    // public input_hash: field
    `${aiHashField}field`,       // public ai_output_hash: field
    `${riskScore}u8`,            // public ai_score: u8
    `${timestamp}u64`,           // public timestamp: u64
    // owner: address is private - wallet handles this automatically
  ];

  console.log('📦 Final inputs:', inputs);

  try {
    // Create transaction - wallet handles fee records internally
    // IMPORTANT: 7th param is feePrivate (boolean), NOT fee record - passing an object caused "unknown error"
    const tx = Transaction.createTransaction(
      publicKey,                          // payer / caller
      WalletAdapterNetwork.TestnetBeta,   // network
      'veilnet_ai.aleo',                  // program name
      'submit_analysis',                  // transition/function name
      inputs,                             // array of string inputs
      DEFAULT_FEE_MICRO_CREDITS,          // fee in microcredits
      true                                // feePrivate: use private fee (wallet selects fee record)
    );

    console.log('✅ Transaction object created');
    console.log('   Network:', WalletAdapterNetwork.TestnetBeta);
    console.log('   Program:', 'veilnet_ai.aleo');
    console.log('   Function:', 'submit_analysis');
    console.log('   Inputs:', inputs);
    console.log('   Fee (microcredits):', DEFAULT_FEE_MICRO_CREDITS);
    console.log('   Payer address:', publicKey);

    console.log('🚀 Calling requestExecution (program transition)...');
    const transactionId = await execute(tx);

    console.log('✅ Transaction broadcasted successfully!');
    console.log('   Transaction ID:', transactionId);
    console.log('   View on explorer: https://testnet.explorer.provable.com/transaction/' + transactionId);
    
    return transactionId;
  } catch (error: any) {
    console.error('❌ Failed to submit transaction:', error);
    console.error('   Error details:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack?.substring(0, 500)
    });
    
    // Log the transaction details that failed
    console.error('   Failed transaction details:', {
      program: 'veilnet_ai.aleo',
      function: 'submit_analysis',
      inputs: inputs,
      fee: DEFAULT_FEE_MICRO_CREDITS,
      payer: publicKey,
      network: WalletAdapterNetwork.TestnetBeta
    });
    
    // Provide more specific error handling
    if (error.message?.toLowerCase().includes('insufficient')) {
      throw new Error('Insufficient testnet credits. Please visit https://faucet.aleo.org/ to get more credits and wait 2-3 minutes.');
    }
    if (error.message?.toLowerCase().includes('rejected')) {
      throw new Error('Transaction was rejected in your wallet. Please approve the transaction to continue.');
    }
    if (error.message?.toLowerCase().includes('network')) {
      throw new Error('Network error. Please ensure your wallet is connected to Testnet Beta.');
    }
    if (error.message?.toLowerCase().includes('unknown error')) {
      throw new Error('Transaction failed. This might be due to: 1) Insufficient credits, 2) Wrong network (ensure Testnet Beta), 3) Program not found, or 4) Invalid parameters. Please check your wallet and try again.');
    }
    
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