# 🚨 CRITICAL: Wave 2 Must-Complete Tasks

## ❌ BLOCKERS - Must Fix Before Submission

### 1. **REAL ALEO SDK INTEGRATION** (HIGHEST PRIORITY)

**Current Status**: ❌ Mock responses removed, but SDK not connected

**What Must Be Done**:

```bash
# Install Aleo SDK
npm install @aleohq/sdk
# or
npm install @provablehq/sdk
```

**File to Update**: `app/api/submit-to-aleo/route.ts`

**Real Implementation Needed**:
```typescript
import { Account, ProgramManager, AleoNetworkClient } from '@aleohq/sdk';

export async function POST(request: NextRequest) {
  const { documentHash, riskScore, timestamp } = await request.json();
  
  // Initialize Aleo client
  const client = new AleoNetworkClient('https://api.explorer.aleo.org/v1');
  const programManager = new ProgramManager(
    'https://api.explorer.aleo.org/v1',
    undefined,
    undefined
  );

  // Execute the program
  const transaction = await programManager.execute(
    'document_verifier.aleo',
    'verify_document',
    [documentHash, `${riskScore}u8`, `${timestamp}u64`],
    { fee: 1000000 }
  );

  // Wait for confirmation
  const result = await transaction.wait();

  return NextResponse.json({
    success: true,
    result: {
      transactionId: transaction.id,
      status: result.status,
      blockHeight: result.blockHeight
    }
  });
}
```

### 2. **DEPLOY LEO PROGRAM TO TESTNET**

**Current Status**: ❌ Program written but not deployed

**Commands to Run**:
```bash
cd contracts

# Build the program
leo build

# Deploy to testnet (requires funded wallet)
leo deploy --network testnet --program document_verifier.aleo

# Save the program ID that's returned
```

**Expected Output**:
```
✅ Program deployed successfully!
Program ID: document_verifier.aleo
Transaction: at1xxxxxxxxxxxxx
```

### 3. **WALLET INTEGRATION FOR TRANSACTIONS**

**Current Status**: ⚠️ Wallet connects but doesn't sign transactions

**File to Update**: `app/app/page.tsx`

**What's Needed**:
```typescript
// Use wallet to sign and submit transaction
const { wallet } = useWallet();

// When submitting to Aleo:
const transaction = await wallet.requestTransaction({
  program: 'document_verifier.aleo',
  function: 'verify_document',
  inputs: [documentHash, riskScore, timestamp]
});
```

### 4. **REAL AI PROCESSING** (Currently Basic)

**Current Status**: ⚠️ Simple keyword-based scoring (acceptable for Wave 2)

**Options to Improve** (choose ONE):

**Option A: Use OpenAI API** (Recommended)
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: "gpt-3.5-turbo",
  messages: [{
    role: "system",
    content: "Analyze this document and return a risk score from 0-100"
  }, {
    role: "user",
    content: documentText
  }]
});

const riskScore = parseInt(completion.choices[0].message.content);
```

**Option B: Use Hugging Face API**
```typescript
const response = await fetch(
  'https://api-inference.huggingface.co/models/distilbert-base-uncased',
  {
    headers: { Authorization: `Bearer ${process.env.HF_API_KEY}` },
    method: 'POST',
    body: JSON.stringify({ inputs: documentText })
  }
);
```

**Option C: Keep Current** (Acceptable for Wave 2)
- Current keyword-based scoring is REAL computation
- Not sophisticated but meets Wave 2 requirements
- Can be improved in Wave 3

## ✅ DEFINITION OF DONE

Wave 2 is complete when a judge can:

1. ✅ Open live URL
2. ✅ Connect Leo Wallet
3. ✅ Paste document text
4. ✅ Click "Analyze"
5. ✅ See REAL Aleo transaction ID from testnet
6. ✅ Verify transaction on Aleo explorer

## 📋 Pre-Submission Checklist

- [ ] Leo program deployed to testnet
- [ ] Program ID saved in environment variables
- [ ] Aleo SDK installed and configured
- [ ] `/api/submit-to-aleo` calls real Aleo program
- [ ] Wallet signs transactions (not just connects)
- [ ] Real transaction IDs returned
- [ ] Transactions visible on Aleo explorer
- [ ] Frontend deployed to live URL
- [ ] Testing completed end-to-end
- [ ] Documentation updated with live URLs

## 🔗 Required Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_ALEO_NETWORK=testnet
NEXT_PUBLIC_PROGRAM_ID=document_verifier.aleo
ALEO_PRIVATE_KEY=your_private_key_here
ALEO_API_URL=https://api.explorer.aleo.org/v1

# Optional: For improved AI
OPENAI_API_KEY=your_openai_key
```

## 🚀 Deployment Steps

1. **Deploy Leo Program**
```bash
cd contracts
leo deploy --network testnet
```

2. **Update Environment Variables**
```bash
# Add program ID to .env.local
echo "NEXT_PUBLIC_PROGRAM_ID=document_verifier.aleo" >> .env.local
```

3. **Test Locally**
```bash
npm run dev
# Test full flow with real wallet
```

4. **Deploy Frontend**
```bash
vercel deploy --prod
```

5. **Verify on Testnet**
- Submit test transaction
- Check Aleo explorer
- Confirm transaction appears

## ⚠️ Common Pitfalls to Avoid

❌ **Don't**: Return mock transaction IDs
✅ **Do**: Return real IDs from Aleo testnet

❌ **Don't**: Skip wallet signing
✅ **Do**: Use wallet.requestTransaction()

❌ **Don't**: Fake success responses
✅ **Do**: Wait for real blockchain confirmation

❌ **Don't**: Use setTimeout() for "processing"
✅ **Do**: Wait for actual Aleo transaction

## 📞 If Stuck

1. Check Aleo SDK docs: https://developer.aleo.org
2. Review Leo Wallet adapter: https://github.com/demox-labs/aleo-wallet-adapter
3. Test program locally: `leo run verify_document`
4. Check testnet explorer: https://explorer.aleo.org

## 🎯 Success Metric

**Judge Experience**:
- Connects wallet: ✅ Works
- Submits text: ✅ Works
- Clicks analyze: ✅ Works
- Sees transaction: ✅ Real Aleo TX ID
- Checks explorer: ✅ Transaction exists

**If all ✅ → Wave 2 Success!**

---

**Current Status**: 🟡 70% Complete
**Blocker**: Aleo SDK integration
**ETA to Complete**: 2-4 hours with SDK setup
**Priority**: 🔴 CRITICAL - Must complete before submission
