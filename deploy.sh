#!/bin/bash

set -e

if [ ! -f ".env" ]; then
    exit 1
fi

export $(grep -v '^#' .env | xargs)

if [ -z "$PRIVATE_KEY" ]; then
    exit 1
fi

if [ -z "$DEPLOYER_ADDRESS" ]; then
    exit 1
fi

if [[ ! "$PRIVATE_KEY" =~ ^0x[a-fA-F0-9]{64}$ ]]; then
    exit 1
fi

if [[ ! "$DEPLOYER_ADDRESS" =~ ^0x[a-fA-F0-9]{40}$ ]]; then
    exit 1
fi

forge script script/DeployChitFund.s.sol:DeployChitFund \
    --rpc-url flow_testnet \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --legacy
