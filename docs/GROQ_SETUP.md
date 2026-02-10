# 🚀 Groq Setup - FREE AI for VeilNet

## Why Groq?

- ✅ **100% FREE** - No credit card required
- ✅ **Super Fast** - Fastest inference in the world
- ✅ **High Limits** - Generous free tier
- ✅ **Same API** - Compatible with OpenAI format
- ✅ **LLaMA 3.3 70B** - Powerful open-source model

## Setup (2 Minutes)

### Step 1: Get Free API Key

1. **Go to Groq Console**
   ```
   https://console.groq.com/keys
   ```

2. **Sign Up** (if needed)
   - Use Google/GitHub login
   - No credit card required!

3. **Create API Key**
   - Click "Create API Key"
   - Name it: "VeilNet AI"
   - Copy the key (starts with `gsk_...`)

### Step 2: Update .env.local

```bash
# Edit .env.local
GROQ_API_KEY=gsk_your_actual_key_here
```

### Step 3: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 4: Test

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test analysis
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"documentText":"This is a test document"}'
```

## What Changed

### 1. AI Service (`lib/ai-service.ts`)
- ✅ Switched from OpenAI to Groq SDK
- ✅ Using `llama-3.3-70b-versatile` model
- ✅ Same interface, same functionality
- ✅ FREE and FAST!

### 2. Environment Variables
- ❌ `OPENAI_API_KEY` (removed)
- ✅ `GROQ_API_KEY` (new)

### 3. Dependencies
- ✅ Installed `groq-sdk` package
- ✅ Compatible with existing code

## Groq Features

### Models Available
- **llama-3.3-70b-versatile** (we use this)
  - 70B parameters
  - Best for general tasks
  - Very fast

- **llama-3.1-70b-versatile**
  - Alternative option
  - Slightly older

- **mixtral-8x7b-32768**
  - Good for long context
  - 32k context window

### Free Tier Limits
- **Requests**: 30 requests/minute
- **Tokens**: 6,000 tokens/minute
- **Daily**: Generous limits
- **Cost**: $0 (completely free!)

### Speed
- **Fastest inference** in the industry
- ~300 tokens/second
- Near-instant responses

## Verification

### Check API Key Works
```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY"
```

Should return list of available models.

### Test VeilNet Integration
```bash
# Start server
npm run dev

# Open browser
http://localhost:3000

# Test flow:
1. Connect wallet
2. Enter document text
3. Click "Analyze"
4. See real AI analysis (FREE!)
```

## Comparison

| Feature | OpenAI | Groq |
|---------|--------|------|
| Cost | $0.15/1M tokens | **FREE** |
| Speed | ~50 tokens/sec | **300 tokens/sec** |
| Setup | Credit card required | **No card needed** |
| Model | GPT-4o-mini | LLaMA 3.3 70B |
| Quality | Excellent | **Excellent** |
| Limits | Pay-per-use | 30 req/min free |

## For Wave 2 Judges

**What to say**:
> "We're using Groq for AI inference - it's the fastest AI inference platform in the world, completely free, and uses Meta's LLaMA 3.3 70B model. This gives us production-quality AI analysis at zero cost, which is perfect for a privacy-focused application."

**Benefits**:
- ✅ No billing issues
- ✅ Unlimited testing
- ✅ Production-ready
- ✅ Super fast responses
- ✅ Open-source model

## Troubleshooting

### Error: "GROQ_API_KEY not configured"
1. Check `.env.local` exists
2. Verify key starts with `gsk_`
3. Restart dev server

### Error: "Rate limit exceeded"
- Wait 1 minute
- Free tier: 30 requests/minute
- More than enough for demos

### Error: "Invalid API key"
1. Go to https://console.groq.com/keys
2. Create new key
3. Update `.env.local`
4. Restart server

## Quick Commands

```bash
# Get Groq API key
open https://console.groq.com/keys

# Update .env.local
echo "GROQ_API_KEY=gsk_your_key_here" >> .env.local

# Restart server
npm run dev

# Test
curl http://localhost:3000/api/health
```

## Status

- ✅ Groq SDK installed
- ✅ AI service updated
- ✅ API routes updated
- ✅ Environment template ready
- ⏳ Need to add your Groq API key
- ⏳ Restart dev server

## Next Steps

1. **Get Groq API key** (2 minutes)
   - https://console.groq.com/keys
   
2. **Add to .env.local**
   ```
   GROQ_API_KEY=gsk_...
   ```

3. **Restart server**
   ```bash
   npm run dev
   ```

4. **Test and enjoy FREE AI!** 🎉

## Resources

- Groq Console: https://console.groq.com/
- Groq Docs: https://console.groq.com/docs
- API Reference: https://console.groq.com/docs/api-reference
- Models: https://console.groq.com/docs/models

---

**Bottom Line**: Groq is FREE, FAST, and PERFECT for VeilNet AI. Get your API key and you're ready to go!
