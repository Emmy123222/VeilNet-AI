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

# Load environment variables from .env.local if it exists
if [ -f "../.env.local" ]; then
    echo "📄 Loading environment variables from .env.local..."
    # Export each variable properly
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! $key =~ ^#.* ]] && [[ -n $key ]]; then
            # Remove quotes if present
            value=$(echo "$value" | sed 's/^"//;s/"$//')
            export "$key"="$value"
        fi
    done < "../.env.local"
fi

# Check if private key is set
if [ -z "$ALEO_PRIVATE_KEY" ]; then
    echo "⚠️  ALEO_PRIVATE_KEY not found in .env.local"
    echo ""
    echo "Please add your private key to .env.local:"
    echo "  ALEO_PRIVATE_KEY=APrivateKey1..."
    echo ""
    echo "⚠️  SECURITY WARNING: Never commit .env.local to git!"
    echo ""
    read -p "Do you want to deploy interactively instead? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        leo deploy --network testnet --endpoint https://api.explorer.provable.com/v1 --broadcast
    else
        echo "Deployment cancelled"
        exit 1
    fi
else
    echo "✅ Private key found in .env.local"
    echo ""
    echo "📤 Deploying to testnet with broadcast..."
    # Set PRIVATE_KEY for Leo CLI
    export PRIVATE_KEY="$ALEO_PRIVATE_KEY"
    leo deploy --network testnet --endpoint https://api.explorer.provable.com/v1 --broadcast
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🔍 Verify on Aleo Explorer:"
    echo "   https://testnet.explorer.provable.com/program/veilnet_ai_v6.aleo"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Copy the transaction ID from the output above"
    echo "   2. Update NEXT_PUBLIC_TRANSACTION_ID in .env.local"
    echo "   3. Test the frontend integration"
    echo ""
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues:"
    echo "  - Insufficient balance (get credits from https://faucet.aleo.org/)"
    echo "  - Invalid private key format"
    echo "  - Network timeout (try again)"
    echo "  - Program already exists (use existing deployment)"
    echo ""
    exit 1
fi
