# VeilNet AI - Future Roadmap (Wave 3 & 4)

This document outlines the strategic milestones for the next phases of development, focusing on production hardening, multimodal capabilities, and full decentralization.

## 🌊 Wave 3: Production Hardening & Feature Expansion

**Goal:** Transition from a functional prototype to a robust, feature-rich dApp with full on-chain verification.

### 1. Full On-Chain Integration (Critical)
- **Current State:** The frontend generates proofs and submits them to a mock/testnet endpoint, or uses deterministic verification for demos.
- **Wave 3 Deliverable:** Full integration with the deployed `veilnet_ai.aleo` smart contract using the Aleo SDK.
- **Technical Task:** Replace the placeholder logic in `/api/proofs/submit` with actual `programManager.execute()` calls to the Aleo Testnet.

### 2. Multimodal AI (Deepfake Detection)
- **Current State:** Text-based document analysis.
- **Wave 3 Deliverable:** Image and Video analysis capabilities.
- **Technical Task:** Integrate Vision-capable models (e.g., Llama 3.2 Vision or GPT-4o) to analyze uploaded media for signs of manipulation (Deepfakes), generating a "Authenticity Score" stored on-chain.

### 3. Specialized Analysis Engines
- **Current State:** General risk assessment.
- **Wave 3 Deliverable:** Domain-specific analysis modes.
- **Technical Task:** Implement specialized system prompts and logic for:
  - **Medical:** HIPAA-compliant summarization and terminology extraction.
  - **Financial:** Fraud detection patterns in transaction logs.
  - **Legal:** Contract clause auditing.

### 4. Real-Time Streaming UI
- **Current State:** Request/Response (user waits for full analysis).
- **Wave 3 Deliverable:** Token-by-token streaming of AI results.
- **Technical Task:** Refactor API routes to use Vercel AI SDK streams, improving perceived performance.

---

## 🌊 Wave 4: Decentralization & Ecosystem

**Goal:** Move towards a fully decentralized, zero-trust architecture where users control the AI and the data.

### 1. Local LLM Support (Zero Trust)
- **Concept:** Allow users to run the AI model on their own machine, ensuring data *never* leaves their device (not even to our backend).
- **Wave 4 Deliverable:** Integration with **Ollama**.
- **Technical Task:** Add a configuration option to switch the AI Provider from "Cloud (Groq)" to "Local (Ollama)", pointing to `http://localhost:11434`.

### 2. Proof Access Control
- **Concept:** Users should be able to share their verified analysis with specific third parties (e.g., an auditor) without making it public.
- **Wave 4 Deliverable:** Encrypted proof sharing.
- **Technical Task:** Update the Leo contract to support `view_keys` or specific `access_mappings` that allow designated wallet addresses to decrypt the analysis metadata.

### 3. Decentralized Reputation System
- **Concept:** Trust the analyst, not just the code.
- **Wave 4 Deliverable:** On-chain reputation scores for AI models/providers.
- **Technical Task:** Allow users to rate the accuracy of an analysis. These ratings are aggregated on-chain, creating a reputation score for the specific AI model version used.

### 4. Batch Verification
- **Concept:** Enterprise efficiency.
- **Wave 4 Deliverable:** Verify hundreds of documents in one transaction.
- **Technical Task:** Implement a `batch_verify` transition in the Leo contract that accepts an array of hashes, significantly reducing gas costs for high-volume users.

---

## 🏆 Summary for Judges

| Feature | Wave 2 (Current) | Wave 3 (Next) | Wave 4 (Future) |
|---------|------------------|---------------|-----------------|
| **AI Model** | Groq (Llama 3.3) | Multimodal (Vision) | Local LLM (Ollama) |
| **Blockchain** | Deployed Contract | Full SDK Integration | Access Control |
| **Privacy** | Hash-based | Encrypted Metadata | Zero-Trust Local |
| **UX** | Static Loading | Streaming | Batch Operations |