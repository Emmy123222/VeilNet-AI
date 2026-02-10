#!/bin/bash

# VeilNet AI Smart Contract Deployment Script

echo "🚀 Deploying VeilNet AI to Aleo Testnet..."
echo ""

# Check if Leo is installed
if ! command -v leo &> /dev/null; then
    echo "❌ Leo CLI not found!"
    echo ""
    echo "Install Leo with:"
    echo "  cargo install --git https://github.com/AleoHQ/leo --branch testnet3"
    echo ""
    exit 1
fi

# Check if private key is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "⚠️  PRIVATE_KEY environment variable not set"
    echo ""
    echo "Options:"
    echo "  1. Set it: export PRIVATE_KEY='APrivateKey1...'"
    echo "  2. Or run: leo deploy --network testnet3 (will prompt)"
    echo ""
    read -p "Do you want to deploy interactively? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        leo deploy --network testnet3
    else
        echo "Deployment cancelled"
        exit 1
    fi
else
    echo "✅ Private key found"
    echo ""
    echo "📤 Deploying to testnet3..."
    leo deploy --network testnet3 --private-key $PRIVATE_KEY
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🔍 Verify on Aleo Explorer:"
    echo "   https://explorer.aleo.org/program/veilnet_ai.aleo"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Copy the transaction ID"
    echo "   2. Update .env.local with program ID"
    echo "   3. Test the frontend integration"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  - Insufficient balance (get credits from https://faucet.aleo.org/)"
    echo "  - Invalid private key"
    echo "  - Network timeout (try again)"
    echo "  - Program already exists (use existing deployment)"
    echo ""
    exit 1
fi
