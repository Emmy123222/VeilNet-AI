# Wave 3 Integration Guide

## Where to Add Wave 3 Features

The test page (`/test-wave3`) is ONLY for testing. Here's where to actually integrate the features:

---

## 1. Streaming Analysis Integration

### Target Files:
- `app/upload/page.tsx` - Main file upload page
- `app/app/page.tsx` - Text analysis page

### What to Add:

**Import the streaming component:**
```typescript
import { StreamingAnalysisDisplay } from '@/components/streaming-analysis-display'
```

**Add state for streaming:**
```typescript
const [isStreaming, setIsStreaming] = useState(false)
const [streamedContent, setStreamedContent] = useState('')
const [streamProgress, setStreamProgress] = useState(0)
```

**Replace the current analyze API call with streaming:**

**OLD CODE (current):**
```typescript
const response = await fetch('/api/analyze', {
  method: 'POST',
  body: JSON.stringify({ documentText })
})
const data = await response.json()
```

**NEW CODE (with streaming):**
```typescript
setIsStreaming(true)
setStreamedContent('')
setStreamProgress(0)

const response = await fetch('/api/analyze-stream-simple', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    documentText,
    analysisType: 'document-risk'
  })
})

const reader = response.body?.getReader()
const decoder = new TextDecoder()
let accumulated = ''

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value, { stream: true })
  accumulated += chunk
  setStreamedContent(accumulated)
  setStreamProgress(prev => Math.min(prev + 5, 95))
}

setStreamProgress(100)
setIsStreaming(false)

// Parse the final JSON
const analysis = JSON.parse(accumulated)
```

**Add the streaming display to JSX:**
```typescript
{isStreaming && (
  <StreamingAnalysisDisplay
    isStreaming={isStreaming}
    streamedContent={streamedContent}
    progress={streamProgress}
  />
)}
```

---

## 2. Image Analysis Integration

### Target File:
- `app/upload/page.tsx` - Main file upload page

### What to Add:

**Import the authenticity card:**
```typescript
import { AuthenticityScoreCard } from '@/components/authenticity-score-card'
```

**Add state for image analysis:**
```typescript
const [imageAnalysis, setImageAnalysis] = useState<any>(null)
```

**Detect image files in upload handler:**

**Add to your file upload function:**
```typescript
const handleFileUpload = async (file: File) => {
  // Check if it's an image
  if (file.type.startsWith('image/')) {
    // Route to image analysis
    await analyzeImage(file)
  } else {
    // Route to text analysis (existing code)
    await analyzeDocument(file)
  }
}

const analyzeImage = async (file: File) => {
  setAnalyzing(true)
  
  // Convert to base64
  const reader = new FileReader()
  reader.onload = async (e) => {
    const base64 = e.target?.result as string
    
    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64: base64,
        analysisType: 'deepfake-detection'
      })
    })
    
    const data = await response.json()
    if (data.success) {
      setImageAnalysis(data.analysis)
      // Also submit to blockchain
      await submitToBlockchain(data.analysis)
    }
  }
  
  reader.readAsDataURL(file)
  setAnalyzing(false)
}
```

**Add the authenticity card to JSX:**
```typescript
{imageAnalysis && (
  <AuthenticityScoreCard
    authenticityScore={imageAnalysis.authenticityScore}
    deepfakeConfidence={imageAnalysis.deepfakeConfidence}
    manipulationIndicators={imageAnalysis.manipulationIndicators || []}
    technicalFindings={imageAnalysis.technicalFindings || []}
    riskLevel={imageAnalysis.riskLevel}
  />
)}
```

---

## 3. File Type Detection

### In `app/upload/page.tsx`:

**Update the file upload form to accept images:**
```typescript
<Input
  type="file"
  accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp"  // Add image types
  onChange={handleFileSelect}
/>
```

**Add file type detection:**
```typescript
const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  const fileType = file.type
  
  if (fileType.startsWith('image/')) {
    console.log('📸 Image file detected - will use vision analysis')
    setAnalysisType('deepfake-detection')
  } else {
    console.log('📄 Document file detected - will use text analysis')
    setAnalysisType('document-risk')
  }
  
  setSelectedFile(file)
}
```

---

## 4. Update Analysis Type Selector

### In `components/file-upload-form.tsx`:

The deepfake-detection option is already there! Just make sure it's enabled:

```typescript
const analysisTypes = [
  { value: 'document-risk', label: 'Document Risk Assessment' },
  { value: 'deepfake-detection', label: 'Deepfake Detection' },  // ✅ Already exists
  { value: 'medical-summary', label: 'Medical Document Summary' },
  // ... others
]
```

---

## Integration Checklist

### Phase 1: Streaming (High Priority)
- [ ] Add streaming state to `app/upload/page.tsx`
- [ ] Replace `/api/analyze` with `/api/analyze-stream-simple`
- [ ] Add `StreamingAnalysisDisplay` component to JSX
- [ ] Test with text documents
- [ ] Add streaming to `app/app/page.tsx` (same process)

### Phase 2: Image Analysis (High Priority)
- [ ] Add image detection in file upload handler
- [ ] Create `analyzeImage()` function
- [ ] Add `AuthenticityScoreCard` component to JSX
- [ ] Update file input to accept images
- [ ] Test with image files

### Phase 3: Polish (Medium Priority)
- [ ] Add loading states for image analysis
- [ ] Add error handling for vision API
- [ ] Update UI to show different cards for images vs documents
- [ ] Add image preview before analysis
- [ ] Test end-to-end flow

---

## Quick Integration Example

Here's a minimal example for `app/upload/page.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { StreamingAnalysisDisplay } from '@/components/streaming-analysis-display'
import { AuthenticityScoreCard } from '@/components/authenticity-score-card'

export default function UploadPage() {
  // Existing state...
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [streamProgress, setStreamProgress] = useState(0)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)

  const handleAnalyze = async (file: File) => {
    // Detect file type
    if (file.type.startsWith('image/')) {
      await analyzeImage(file)
    } else {
      await analyzeTextWithStreaming(file)
    }
  }

  const analyzeTextWithStreaming = async (file: File) => {
    // Extract text from file first
    const text = await extractText(file)
    
    // Stream analysis
    setIsStreaming(true)
    const response = await fetch('/api/analyze-stream-simple', {
      method: 'POST',
      body: JSON.stringify({ documentText: text, analysisType: 'document-risk' })
    })
    
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let accumulated = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      accumulated += decoder.decode(value, { stream: true })
      setStreamedContent(accumulated)
      setStreamProgress(prev => Math.min(prev + 5, 95))
    }
    
    setIsStreaming(false)
    const analysis = JSON.parse(accumulated)
    // Continue with blockchain submission...
  }

  const analyzeImage = async (file: File) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: e.target?.result,
          analysisType: 'deepfake-detection'
        })
      })
      const data = await response.json()
      setImageAnalysis(data.analysis)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div>
      {/* Existing upload UI */}
      
      {/* Add streaming display */}
      {isStreaming && (
        <StreamingAnalysisDisplay
          isStreaming={isStreaming}
          streamedContent={streamedContent}
          progress={streamProgress}
        />
      )}
      
      {/* Add image analysis display */}
      {imageAnalysis && (
        <AuthenticityScoreCard
          authenticityScore={imageAnalysis.authenticityScore}
          deepfakeConfidence={imageAnalysis.deepfakeConfidence}
          manipulationIndicators={imageAnalysis.manipulationIndicators || []}
          technicalFindings={imageAnalysis.technicalFindings || []}
          riskLevel={imageAnalysis.riskLevel}
        />
      )}
      
      {/* Existing result cards */}
    </div>
  )
}
```

---

## Summary

**The test page (`/test-wave3`) is ONLY for verifying the APIs work.**

**The actual features go in:**
1. `app/upload/page.tsx` - Main upload page (add both streaming + image analysis)
2. `app/app/page.tsx` - Text analysis page (add streaming)

**What's already done:**
- ✅ Backend APIs (`/api/analyze-stream-simple`, `/api/analyze-image`)
- ✅ UI Components (`StreamingAnalysisDisplay`, `AuthenticityScoreCard`)
- ✅ AI Service functions (vision analysis, streaming)

**What you need to do:**
- Integrate the components into your main pages
- Add file type detection
- Route images to vision API
- Route text to streaming API

Would you like me to create the actual integration in `app/upload/page.tsx` for you?
