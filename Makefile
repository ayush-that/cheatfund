-include .env

PRIVATE_KEY ?= 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL ?= https://testnet.evm.nodes.onflow.org

ETHEREUM_RPC ?= https://eth.llamarpc.com
SEPOLIA_RPC ?= https://ethereum-sepolia-rpc.publicnode.com
POLYGON_RPC ?= https://polygon-rpc.com
MUMBAI_RPC ?= https://rpc-mumbai.maticvigil.com
BASE_RPC ?= https://mainnet.base.org
BASE_SEPOLIA_RPC ?= https://sepolia.base.org

.PHONY: help install build test test-verbose test-gas clean deploy-local deploy-sepolia deploy-mumbai deploy-base-sepolia deploy-polygon deploy-base deploy-ethereum verify format lint snapshot

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

install:
	forge install

build:
	forge build

test:
	forge test

test-verbose:
	forge test -vvv

test-gas:
	forge test --gas-report

test-coverage:
	forge coverage

clean:
	forge clean

format:
	forge fmt

lint:
	forge fmt --check

snapshot:
	forge snapshot

anvil:
	anvil --host 0.0.0.0 --port 8545 --chain-id 31337

deploy-local:
	@mkdir -p deployments
	forge script script/DeployLocal.s.sol:DeployLocal --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) --broadcast

deploy-sepolia:
	@mkdir -p deployments
	forge script script/DeployChitFund.s.sol:DeployChitFund --rpc-url $(SEPOLIA_RPC) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY)

deploy-mumbai:
	@mkdir -p deployments
	forge script script/DeployChitFund.s.sol:DeployChitFund --rpc-url $(MUMBAI_RPC) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(POLYGONSCAN_API_KEY)

deploy-base-sepolia:
	@mkdir -p deployments
	forge script script/DeployChitFund.s.sol:DeployChitFund --rpc-url $(BASE_SEPOLIA_RPC) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(BASESCAN_API_KEY)

deploy-ethereum:
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
	@mkdir -p deployments
	forge script script/DeployChitFund.s.sol:DeployChitFund --rpc-url $(ETHEREUM_RPC) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(ETHERSCAN_API_KEY)

deploy-polygon:
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
	@mkdir -p deployments
	forge script script/DeployChitFund.s.sol:DeployChitFund --rpc-url $(POLYGON_RPC) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(POLYGONSCAN_API_KEY)

deploy-base:
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
	@mkdir -p deployments
	forge script script/DeployChitFund.s.sol:DeployChitFund --rpc-url $(BASE_RPC) --private-key $(PRIVATE_KEY) --broadcast --verify --etherscan-api-key $(BASESCAN_API_KEY)

deploy-flow-testnet:
	@mkdir -p deployments
	forge script script/DeployChitFund.s.sol:DeployChitFund --rpc-url flow_testnet --private-key $(PRIVATE_KEY) --broadcast --legacy

deploy-flow-mainnet:
	@read -p "Are you sure? Type 'yes' to continue: " confirm && [ "$$confirm" = "yes" ]
	@mkdir -p deployments
	forge script script/DeployChitFund.s.sol:DeployChitFund --rpc-url flow_mainnet --private-key $(PRIVATE_KEY) --broadcast --legacy

verify-sepolia:
	@read -p "Enter ChitFundFactory address: " factory_addr && \
	forge verify-contract $$factory_addr src/ChitFundFactory.sol:ChitFundFactory --chain-id 11155111 --etherscan-api-key $(ETHERSCAN_API_KEY)

verify-mumbai:
	@read -p "Enter ChitFundFactory address: " factory_addr && \
	forge verify-contract $$factory_addr src/ChitFundFactory.sol:ChitFundFactory --chain-id 80001 --etherscan-api-key $(POLYGONSCAN_API_KEY)

verify-flow-testnet:
	@read -p "Enter ChitFundFactory address: " factory_addr && \
	forge verify-contract --rpc-url flow_testnet \
		--verifier blockscout \
		--verifier-url https://evm-testnet.flowscan.io/api \
		$$factory_addr src/ChitFundFactory.sol:ChitFundFactory

verify-flow-mainnet:
	@read -p "Enter ChitFundFactory address: " factory_addr && \
	forge verify-contract --rpc-url flow_mainnet \
		--verifier blockscout \
		--verifier-url https://evm.flowscan.io/api \
		$$factory_addr src/ChitFundFactory.sol:ChitFundFactory

create-chitfund:
	@read -p "Enter factory address: " factory_addr && \
	read -p "Enter fund name: " fund_name && \
	read -p "Enter contribution amount (in ETH): " contribution && \
	read -p "Enter total members: " members && \
	forge script script/DeployChitFund.s.sol:DeployChitFund --sig "createChitFundViaFactory(address,string,uint256,uint256,address,uint256)" $$factory_addr "$$fund_name" $$(cast --to-wei $$contribution) $$members 0x0000000000000000000000000000000000000000 3600 --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) --broadcast

node-info:
	@cast client --rpc-url $(RPC_URL)
	@cast block-number --rpc-url $(RPC_URL)
	@cast chain-id --rpc-url $(RPC_URL)

account-info:
	@cast wallet address $(PRIVATE_KEY)
	@cast balance $$(cast wallet address $(PRIVATE_KEY)) --rpc-url $(RPC_URL) | cast --from-wei

test-full-cycle:
	forge script script/DeployLocal.s.sol:DeployLocal --sig "completeETHFundCycle()" --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) --broadcast

test-automation:
	forge script script/DeployLocal.s.sol:DeployLocal --sig "testAutomation()" --rpc-url $(RPC_URL) --private-key $(PRIVATE_KEY) --broadcast

docs:
	forge doc

slither:
	slither .

mythril:
	myth analyze src/ChitFund.sol

setup-env:
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
	fi

dev: install build test

quick-test:
	@forge test --no-match-path "test/integration/*"

integration-test:
	@forge test --match-path "test/integration/*" -vvv

fuzz-test:
	@forge test --match-test "testFuzz" -vvv

optimize:
	FOUNDRY_OPTIMIZER=true FOUNDRY_OPTIMIZER_RUNS=200 forge test --gas-report

full-deploy-local: clean build deploy-local
full-deploy-testnet: clean build test deploy-sepolia

default: help
