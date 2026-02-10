# 🔧 Troubleshooting Guide

## Error: 500 Internal Server Error on /api/analyze

### Symptoms
- Frontend shows "Analysis failed" error
- Console shows: `Failed to load resource: the server responded with a status of 500`
- API endpoint `/api/analyze` returns 500 error

### Root Cause
The OpenAI API key is not being loaded from environment variables.

### Solution

#### Step 1: Verify .env.local exists
```bash
ls -la .env.local
```

Should show the file exists in the project root.

#### Step 2: Check .env.local content
```bash
cat .env.local
```

Should contain:
```env
OPENAI_API_KEY=sk-your-openai-api-key-here
```

#### Step 3: Restart Development Server
**IMPORTANT**: Environment variables are only loaded when the dev server starts.

```bash
# Stop the current dev server (Ctrl+C)

# Start it again
npm run dev
```

#### Step 4: Test Health Endpoint
```bash
# Open in browser or curl
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": {
    "hasOpenAIKey": true,
    "keyLength": 164,
    "keyPrefix": "sk-proj-sq..."
  },
  "services": {
    "openai": "configured",
    "aleo": {
      "network": "testnet",
      "programId": "veilnet_ai.aleo"
    }
  }
}
```

If `hasOpenAIKey` is `false`, the environment variable is not loaded.

#### Step 5: Test Analysis Endpoint
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"documentText":"This is a test document for analysis"}'
```

Expected response:
```json
{
  "success": true,
  "analysis": {
    "documentHash": "0x...",
    "riskScore": 25,
    "summary": "...",
    "insights": [...],
    ...
  }
}
```

### Common Issues

#### Issue 1: .env.local in wrong location
**Problem**: File is in subdirectory instead of project root

**Solution**:
```bash
# Move to project root
mv contracts/.env.local .env.local
# or
mv app/.env.local .env.local
```

#### Issue 2: Wrong file name
**Problem**: File is named `.env` instead of `.env.local`

**Solution**:
```bash
mv .env .env.local
```

#### Issue 3: Server not restarted
**Problem**: Changed .env.local but didn't restart server

**Solution**:
```bash
# Kill all node processes
pkill -f "next dev"

# Start fresh
npm run dev
```

#### Issue 4: Invalid API key
**Problem**: OpenAI API key is incorrect or expired

**Solution**:
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Update .env.local
4. Restart server

#### Issue 5: OpenAI package not installed
**Problem**: `openai` npm package missing

**Solution**:
```bash
npm install openai --legacy-peer-deps
```

### Verification Checklist

- [ ] .env.local exists in project root
- [ ] OPENAI_API_KEY is set in .env.local
- [ ] API key starts with `sk-proj-` or `sk-`
- [ ] Dev server was restarted after setting env var
- [ ] /api/health shows `hasOpenAIKey: true`
- [ ] /api/analyze returns success response
- [ ] Frontend can analyze documents

### Quick Fix Script

```bash
#!/bin/bash

echo "🔧 VeilNet AI - Quick Fix Script"
echo ""

# Check .env.local
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found!"
    echo "Creating from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local and add your OpenAI API key"
    exit 1
fi

echo "✅ .env.local found"

# Check if OPENAI_API_KEY is set
if grep -q "OPENAI_API_KEY=sk-" .env.local; then
    echo "✅ OPENAI_API_KEY appears to be set"
else
    echo "❌ OPENAI_API_KEY not found or invalid in .env.local"
    exit 1
fi

# Kill existing dev server
echo "🔄 Stopping existing dev server..."
pkill -f "next dev" 2>/dev/null || true

# Start dev server
echo "🚀 Starting dev server..."
npm run dev &

# Wait for server to start
sleep 5

# Test health endpoint
echo "🧪 Testing health endpoint..."
curl -s http://localhost:3000/api/health | grep -q "configured" && echo "✅ API configured correctly" || echo "❌ API not configured"

echo ""
echo "✅ Setup complete!"
echo "Open http://localhost:3000 in your browser"
```

Save as `fix.sh`, make executable with `chmod +x fix.sh`, and run with `./fix.sh`

### Still Having Issues?

1. **Check server logs**:
   - Look at terminal where `npm run dev` is running
   - Check for error messages

2. **Check browser console**:
   - Open DevTools (F12)
   - Look at Console tab
   - Check Network tab for API responses

3. **Verify OpenAI account**:
   - Go to https://platform.openai.com/
   - Check if you have credits
   - Verify API key is active

4. **Test OpenAI directly**:
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### Contact Support

If none of these solutions work:
1. Check the GitHub issues
2. Join Aleo Discord
3. Review OpenAI documentation

## Other Common Errors

### Error: Wallet not connecting

**Solution**:
1. Install Leo Wallet extension
2. Create/import account
3. Refresh page
4. Click "Connect Wallet"

### Error: Transaction failed

**Solution**:
1. Check wallet has credits (https://faucet.aleo.org/)
2. Verify contract is deployed
3. Check network is set to testnet
4. Try again

### Error: Build failed

**Solution**:
```bash
# Clean and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run dev
```

## Success Indicators

When everything is working:
- ✅ Health endpoint returns `"openai": "configured"`
- ✅ Analysis endpoint returns real AI summaries
- ✅ Frontend shows unique analysis results
- ✅ Wallet can sign transactions
- ✅ Transactions appear on Aleo Explorer

## Quick Test

```bash
# 1. Check health
curl http://localhost:3000/api/health

# 2. Test analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"documentText":"Test document"}'

# 3. Open frontend
open http://localhost:3000
```

All three should work without errors.
