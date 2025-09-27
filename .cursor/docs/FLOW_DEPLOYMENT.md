# ChitFund Deployment on Flow EVM

This guide explains how to deploy your simplified ChitFund contracts to Flow EVM.

## Prerequisites

1. **Install Foundry** (if not already installed):

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. **Create a wallet for Flow EVM**:

```bash
cast wallet new
```

Save the private key and address. You'll need both.

3. **Fund your wallet** with Flow tokens:

- Go to the [Flow Faucet](https://testnet-faucet.onflow.org/)
- Enter your EVM address
- Request testnet FLOW tokens

4. **Verify your balance**:

```bash
cast balance --ether --rpc-url https://testnet.evm.nodes.onflow.org YOUR_ADDRESS
```

## Environment Setup

Create a `.env` file in the project root:

```bash
# Flow EVM Private Key
PRIVATE_KEY=your_private_key_here

# Optional: For verification
FLOWSCAN_API_KEY=your_api_key_if_available
```

## Deployment Commands

### Deploy to Flow EVM Testnet

```bash
# Using make command
make deploy-flow-testnet

# Or using forge directly
forge script script/DeployChitFund.s.sol:DeployChitFund \
    --rpc-url flow_testnet \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --legacy
```

### Deploy to Flow EVM Mainnet

```bash
# Using make command (with confirmation prompt)
make deploy-flow-mainnet

# Or using forge directly
forge script script/DeployChitFund.s.sol:DeployChitFund \
    --rpc-url flow_mainnet \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --legacy
```

## Key Differences for Flow EVM

1. **Legacy Transactions**: Flow EVM requires the `--legacy` flag to disable EIP-1559 style transactions
2. **No Gas Fees**: Currently, Flow EVM doesn't charge gas fees for transactions
3. **Block Explorer**: Use [FlowScan](https://evm-testnet.flowscan.io/) for testnet or [FlowScan Mainnet](https://evm.flowscan.io/) for mainnet

## Contract Verification

After deployment, verify your contracts:

```bash
# For testnet
make verify-flow-testnet

# For mainnet
make verify-flow-mainnet
```

## Interacting with Deployed Contracts

### Check deployment

```bash
# Get factory address from deployment logs, then:
cast call YOUR_FACTORY_ADDRESS \
    --rpc-url https://testnet.evm.nodes.onflow.org \
    "getChitFundCount()(uint256)"
```

### Create a ChitFund

```bash
cast send YOUR_FACTORY_ADDRESS \
    --rpc-url https://testnet.evm.nodes.onflow.org \
    --private-key $PRIVATE_KEY \
    --legacy \
    "createChitFund(string,uint256,uint256,address)(address)" \
    "My Test Fund" 1000000000000000000 5 0x0000000000000000000000000000000000000000
```

### Join a ChitFund

```bash
cast send YOUR_CHITFUND_ADDRESS \
    --rpc-url https://testnet.evm.nodes.onflow.org \
    --private-key $PRIVATE_KEY \
    --legacy \
    "joinFund()"
```

## Simplified Contract Features

Your POC contracts have the following simplified features:

✅ **Included:**

- Basic chit fund creation and joining
- Contribution and bidding system
- Winner selection and fund distribution
- Cycle management
- ETH and ERC20 token support
- Basic automation functions

❌ **Removed for POC:**

- Access control (no owner restrictions)
- Pause/unpause functionality
- Emergency withdrawal
- Creation fees
- Complex validation
- Reentrancy guards

## Network Details

- **Testnet RPC**: https://testnet.evm.nodes.onflow.org
- **Mainnet RPC**: https://mainnet.evm.nodes.onflow.org
- **Testnet Explorer**: https://evm-testnet.flowscan.io/
- **Mainnet Explorer**: https://evm.flowscan.io/
- **Testnet Chain ID**: 545
- **Mainnet Chain ID**: 747

## Next Steps

1. Deploy to Flow EVM Testnet first
2. Test all functionality with small amounts
3. Verify contracts on FlowScan
4. Deploy to mainnet when ready
5. Build your frontend to interact with the deployed contracts

## Troubleshooting

- Always use the `--legacy` flag for Flow EVM transactions
- Make sure your wallet has sufficient FLOW tokens
- Check the correct RPC URL and chain ID
- Verify contract addresses after deployment
