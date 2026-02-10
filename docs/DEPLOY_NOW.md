# 🚀 Deploy VeilNet AI Smart Contract - Step by Step

## Prerequisites Check

### 1. Install Leo CLI

**Option A: Using Cargo (Recommended)**
```bash
# Install Rust if not already installed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Leo
cargo install --git https://github.com/AleoHQ/leo --branch testnet3
```

**Option B: Download Binary**
```bash
# For Linux
wget https://github.com/AleoHQ/leo/releases/download/v1.9.3/leo-v1.9.3-x86_64-unknown-linux-gnu.zip
unzip leo-v1.9.3-x86_64-unknown-linux-gnu.zip
sudo mv leo /usr/local/bin/
```

**Verify Installation**
```bash
leo --version
# Should show: leo 1.9.3 or similar
```

### 2. Create Aleo Account

```bash
leo account new
```

**Save this information securely:**
```
Private Key: APrivateKey1...
View Key: AViewKey1...
Address: aleo1...
```

⚠️ **IMPORTANT**: Save your private key! You'll need it for deployment.

### 3. Get Testnet Credits

1. Go to: https://faucet.aleo.org/
2. Enter your address (aleo1...)
3. Request credits
4. Wait 1-2 minutes for confirmation

**Check Balance:**
```bash
# Visit Aleo Explorer
https://explorer.aleo.org/address/YOUR_ADDRESS
```

You need at least 10-20 credits for deployment.

## Deployment Steps

### Step 1: Navigate to Contracts Directory
```bash
cd contracts
```

### Step 2: Initialize Leo Project (if needed)
```bash
# Create program.json if it doesn't exist
cat > program.json << 'EOF'
{
    "program": "veilnet_ai.aleo",
    "version": "0.0.0",
    "description": "Privacy-preserving AI analysis verification",
    "license": "MIT"
}
EOF
```

### Step 3: Build the Contract
```bash
leo build
```

**Expected Output:**
```
✅ Compiled 'veilnet_ai.aleo'
```

**If you see errors:**
- Check Leo syntax in `veilnet_ai.leo`
- Ensure all types are correct
- Verify program name matches

### Step 4: Deploy to Testnet

**Set your private key:**
```bash
export PRIVATE_KEY="APrivateKey1..."
```

**Deploy:**
```bash
leo deploy --network testnet3 --private-key $PRIVATE_KEY
```

**Alternative (interactive):**
```bash
leo deploy --network testnet3
# It will prompt for your private key
```

**Expected Output:**
```
✅ Deployed 'veilnet_ai.aleo' to Aleo Testnet
📦 Program ID: veilnet_ai.aleo
🔗 Transaction: at1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
⛓️  Block Height: 123456
```

### Step 5: Verify Deployment

**Check on Aleo Explorer:**
```
https://explorer.aleo.org/program/veilnet_ai.aleo
```

You should see:
- Program name: veilnet_ai.aleo
- Functions: submit_analysis, verify_proof
- Deployment transaction
- Block height

### Step 6: Test the Contract

**Test submit_analysis:**
```bash
leo run submit_analysis \
  12345678901234567890123456789012field \
  98765432109876543210987654321098field \
  85u8 \
  1707580800u64
```

**Expected Output:**
```
✅ Executed 'submit_analysis'
Output: AnalysisProof {
  owner: aleo1...,
  input_hash: 12345678901234567890123456789012field,
  ai_output_hash: 98765432109876543210987654321098field,
  ai_score: 85u8,
  timestamp: 1707580800u64,
  proof_id: ...field
}
```

## Update Frontend Configuration

After successful deployment, update your environment:

```bash
# Add to .env.local
echo "NEXT_PUBLIC_ALEO_PROGRAM_ID=veilnet_ai.aleo" >> ../.env.local
echo "NEXT_PUBLIC_ALEO_NETWORK=testnet3" >> ../.env.local
```

## Troubleshooting

### Error: "leo: command not found"
```bash
# Reinstall Leo
cargo install --git https://github.com/AleoHQ/leo --branch testnet3 --force

# Or add to PATH
export PATH="$HOME/.cargo/bin:$PATH"
echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

### Error: "Insufficient balance"
```bash
# Get more credits from faucet
# Visit: https://faucet.aleo.org/
# Wait 2-3 minutes and try again
```

### Error: "Program already exists"
```bash
# Option 1: Use existing deployment
# The program is already deployed, you can use it!

# Option 2: Change program name
# Edit veilnet_ai.leo and change:
# program veilnet_ai.aleo { ... }
# to:
# program veilnet_ai_v2.aleo { ... }
```

### Error: "Invalid private key"
```bash
# Make sure your private key starts with "APrivateKey1"
# Create a new account if needed:
leo account new
```

### Error: "Network timeout"
```bash
# Try again with longer timeout
leo deploy --network testnet3 --timeout 120

# Or check Aleo network status:
# https://status.aleo.org/
```

## Verification Checklist

After deployment, verify:

- [ ] Contract appears on Aleo Explorer
- [ ] Functions are visible (submit_analysis, verify_proof)
- [ ] Transaction ID is valid
- [ ] Block height is recent
- [ ] You can call functions via Leo CLI
- [ ] Frontend can connect to contract

## Next Steps

### 1. Test End-to-End Flow
```bash
cd ..
npm run dev
```

1. Open http://localhost:3000
2. Connect Leo Wallet
3. Analyze a document
4. Sign transaction
5. Verify transaction on explorer

### 2. Update Documentation
Add your program ID to:
- `README.md`
- `JUDGES_README.md`
- `WAVE2_SUBMISSION_CHECKLIST.md`

### 3. Record Demo
Show judges:
1. Contract on Aleo Explorer
2. Frontend analysis flow
3. Transaction signing
4. Proof verification

## Quick Reference

### Useful Commands
```bash
# Check Leo version
leo --version

# Build contract
leo build

# Deploy contract
leo deploy --network testnet3

# Run function locally
leo run submit_analysis <args>

# Check account
leo account new

# Clean build
leo clean
```

### Useful Links
- Aleo Explorer: https://explorer.aleo.org/
- Aleo Faucet: https://faucet.aleo.org/
- Leo Documentation: https://developer.aleo.org/leo/
- Aleo Discord: https://discord.gg/aleo

## Cost Summary

### Deployment
- One-time cost: ~10-20 testnet credits
- Source: Free from faucet

### Transactions
- Per submit_analysis: ~1-5 credits
- Per verify_proof: ~0.5-1 credit
- Source: User's wallet

## Support

If you encounter issues:

1. Check Leo version: `leo --version`
2. Check network status: https://status.aleo.org/
3. Check balance on explorer
4. Ask on Aleo Discord: https://discord.gg/aleo
5. Review Leo docs: https://developer.aleo.org/

## Success Criteria

✅ Contract deployed to testnet  
✅ Visible on Aleo Explorer  
✅ Functions callable via CLI  
✅ Frontend can submit transactions  
✅ Proofs are verifiable  

**When all checked, you're ready for Wave 2 submission!**
