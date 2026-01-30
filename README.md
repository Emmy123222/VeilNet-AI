# VeilNet AI - Private AI Inference Infrastructure

VeilNet AI is a decentralized privacy infrastructure that enables AI models to run on sensitive user data without exposing raw inputs. Built on Aleo's zero-knowledge blockchain, VeilNet provides private AI inference, encrypted data storage, verifiable outputs, and trustless computation proofs.

## 🚀 Features

- **Private AI Inference**: Run AI models on encrypted data without exposing sensitive information
- **Zero-Knowledge Proofs**: Cryptographic verification of AI analysis without revealing input data
- **Aleo Blockchain Integration**: Immutable proof storage and verification on Aleo network
- **End-to-End Encryption**: Client-side encryption ensures data privacy throughout the process
- **Multiple Analysis Types**: Support for document analysis, deepfake detection, medical summaries, and more
- **Real-time Verification**: Instant proof verification on the blockchain

## 🏗️ Architecture

### Frontend (Next.js + TypeScript)
- **Landing Page**: Product introduction and wallet connection
- **Upload/Analyze**: File upload and AI analysis interface
- **Results Dashboard**: Analysis history and results management
- **Proof Verification**: Blockchain proof verification system

### Backend Services
- **AI Inference Layer**: Secure processing of encrypted data
- **Privacy Layer**: Client-side encryption and secure data handling
- **Aleo Integration**: Smart contract interactions and proof generation

### Blockchain (Aleo)
- **Smart Contracts**: Leo programs for proof verification and storage
- **Zero-Knowledge Proofs**: Cryptographic proof generation and verification
- **Decentralized Storage**: Immutable record keeping without exposing sensitive data

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide React icons
- **Blockchain**: Aleo network, Leo programming language
- **Fonts**: Bitcount Single & Bitcount Prop Single
- **Deployment**: Vercel (frontend), Aleo network (smart contracts)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- Aleo wallet (Leo Wallet browser extension)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/veilnet-ai.git
   cd veilnet-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Wallet Setup

1. **Install Leo Wallet**
   - Visit [Leo App](https://app.leo.app/)
   - Follow the installation instructions for your browser
   - Pin the extension to your browser toolbar for easy access

2. **Create or Import Wallet**
   - Click the Leo Wallet extension icon
   - Choose "Create New Wallet" or "Import Existing Wallet"
   - Follow the setup instructions and securely store your seed phrase
   - Set a strong password for your wallet

3. **Connect to VeilNet AI**
   - Visit the VeilNet AI homepage
   - Click "Connect Wallet & Start"
   - Authorize the connection in the Leo Wallet popup
   - Your wallet address will appear in the header once connected

## 📱 Usage

### 1. Connect Wallet
- Visit the VeilNet AI homepage
- Click "Connect Wallet" and authorize Leo Wallet
- Your wallet address will be displayed in the header

### 2. Upload & Analyze
- Navigate to the Upload page
- Select a file (documents: PDF, DOC, TXT; images: JPG, PNG, GIF)
- Choose an analysis type:
  - Document Risk Assessment
  - Deepfake Detection
  - Medical Document Summary
  - Resume Analysis
  - Financial Fraud Detection
  - Content Moderation
- Click "Start Private Analysis"

### 3. View Results
- Analysis results include summary, confidence score, and insights
- Each analysis generates a cryptographic proof stored on Aleo blockchain
- Access your analysis history in the Results Dashboard

### 4. Verify Proofs
- Use the Proof Verification page to verify any proof hash
- Proofs can be verified independently by anyone
- Verification confirms analysis authenticity without exposing data

## 🔐 Privacy & Security

### Data Protection
- **Client-side encryption**: Files are encrypted before leaving your device
- **No raw data storage**: Only encrypted references and analysis results are stored
- **Temporary processing**: Raw data is discarded immediately after analysis
- **Zero-knowledge proofs**: Verification without data exposure

### Blockchain Security
- **Immutable records**: Proofs cannot be altered once stored on Aleo
- **Decentralized verification**: No single point of failure
- **Cryptographic guarantees**: Mathematical proof of analysis correctness
- **Public auditability**: Anyone can verify proofs independently

## 🧪 Smart Contract

The VeilNet AI Leo smart contract (`contracts/veilnet_ai.leo`) handles:

- **Proof Submission**: Store analysis proof hashes on-chain
- **Proof Verification**: Verify proof existence and validity
- **Status Tracking**: Maintain proof verification status
- **Public Queries**: Allow anyone to verify proofs

### Key Functions
- `submit_proof()`: Submit new analysis proof to blockchain
- `verify_proof()`: Verify existing proof hash
- `get_proof_status()`: Query proof verification status

## 🌐 API Endpoints

### POST `/api/proofs/submit`
Submit a new analysis proof to the blockchain.

**Request Body:**
```json
{
  "analysisType": "document_risk",
  "resultHash": "0x...",
  "userAddress": "aleo1..."
}
```

### POST `/api/proofs/verify`
Verify an existing proof hash.

**Request Body:**
```json
{
  "proofHash": "0x..."
}
```

## 🎯 Use Cases

### Enterprise
- **Contract Analysis**: Risk assessment for legal documents
- **Financial Screening**: Fraud detection and compliance checking
- **HR Analytics**: Resume screening and candidate evaluation

### Healthcare
- **Medical Records**: HIPAA-compliant document analysis
- **Diagnostic Support**: AI-assisted medical analysis
- **Research**: Privacy-preserving medical research

### Media & Content
- **Deepfake Detection**: Verify media authenticity
- **Content Moderation**: Automated policy compliance checking
- **Copyright Protection**: Detect unauthorized content usage

## 🚧 Development Roadmap

### Phase 1 (Current - MVP)
- ✅ Basic file upload and analysis
- ✅ Aleo wallet integration
- ✅ Proof generation and verification
- ✅ Results dashboard

### Phase 2 (Next)
- 🔄 Real Aleo blockchain integration
- 🔄 Enhanced AI model support
- 🔄 Encrypted data vault
- 🔄 Advanced proof explorer

### Phase 3 (Future)
- 📋 Model marketplace
- 📋 Developer API
- 📋 Enterprise features
- 📋 Mobile applications

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [https://veilnet-ai.vercel.app](https://veilnet-ai.vercel.app)
- **Documentation**: [https://docs.veilnet.ai](https://docs.veilnet.ai)
- **Aleo Network**: [https://aleo.org](https://aleo.org)
- **Leo Wallet**: [https://leo.app](https://leo.app)

## 📞 Support

- **Discord**: [VeilNet Community](https://discord.gg/veilnet)
- **Twitter**: [@VeilNetAI](https://twitter.com/VeilNetAI)
- **Email**: support@veilnet.ai

---

**Built with ❤️ for the Aleo ecosystem and privacy-first AI**