#!/bin/bash

# VeilNet AI Smart Contract Build Script

echo "🔨 Building VeilNet AI Smart Contract..."
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

echo "✅ Leo CLI found: $(leo --version)"
echo ""

# Build the contract
echo "📦 Building contract..."
leo build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "Next steps:"
    echo "  1. Get testnet credits: https://faucet.aleo.org/"
    echo "  2. Deploy: ./deploy.sh"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo "Check veilnet_ai.leo for syntax errors"
    echo ""
    exit 1
fi
