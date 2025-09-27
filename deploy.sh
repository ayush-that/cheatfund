#!/bin/bash
set -e
forge script script/DeployChitFund.s.sol:DeployChitFund \
    --rpc-url flow_testnet \
    --private-key "$PRIVATE_KEY" \
    --broadcast \
    --legacy
