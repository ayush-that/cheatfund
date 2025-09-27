// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ChitFundFactory} from "../src/ChitFundFactory.sol";

contract DeployChitFund is Script {
    struct DeployConfig {
        bool deployFactory;
        bool deploySampleChitFund;
        string sampleFundName;
        uint256 sampleContributionAmount;
        uint256 sampleTotalMembers;
        uint256 sampleAutomationInterval;
    }
    
    mapping(uint256 => DeployConfig) public deployConfigs;
    
    function setUp() public {
        deployConfigs[545] = DeployConfig({
            deployFactory: true,
            deploySampleChitFund: true,
            sampleFundName: "Flow Testnet ChitFund",
            sampleContributionAmount: 0.01 ether,
            sampleTotalMembers: 3,
            sampleAutomationInterval: 1 hours
        });
    }
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        uint256 chainId = block.chainid;
        
        console.log("=== ChitFund Deployment Script ===");
        console.log("Chain ID:", chainId);
        console.log("Deployer:", deployer);
        console.log("Deployer balance:", deployer.balance);
        console.log("");
        
        DeployConfig memory config = deployConfigs[chainId];
        
        if (chainId != 545) {
            console.log("This script only supports Flow testnet (chain ID 545). Current chain ID:", chainId);
            return;
        }
        
        if (!config.deployFactory) {
            console.log("No deployment configuration for chain ID:", chainId);
            return;
        }
        
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying ChitFundFactory...");
        ChitFundFactory factory = new ChitFundFactory();
        console.log("ChitFundFactory deployed at:", address(factory));
        console.log("");
        
        address sampleChitFund = address(0);
        if (config.deploySampleChitFund) {
            sampleChitFund = _deploySampleChitFund(factory, config);
        }
        
        vm.stopBroadcast();
        
        _logDeploymentSummary(address(factory), sampleChitFund, config, chainId);
        _saveDeploymentArtifacts(address(factory), sampleChitFund, chainId);
    }
    
    function _deploySampleChitFund(
        ChitFundFactory factory, 
        DeployConfig memory config
    ) internal returns (address) {
        console.log("Creating sample ChitFund...");
        console.log("Fund Name:", config.sampleFundName);
        console.log("Contribution Amount:", config.sampleContributionAmount);
        console.log("Total Members:", config.sampleTotalMembers);
        console.log("Automation Interval:", config.sampleAutomationInterval);
        
        address chitFundAddress = factory.createChitFund(
            config.sampleFundName,
            config.sampleContributionAmount,
            config.sampleTotalMembers,
            address(0)
        );
        
        console.log("Sample ChitFund deployed at:", chitFundAddress);
        console.log("");
        
        return chitFundAddress;
    }
    
    function _logDeploymentSummary(
        address factoryAddress,
        address sampleChitFund,
        DeployConfig memory config,
        uint256 chainId
    ) internal pure {
        console.log("=== Deployment Summary ===");
        console.log("Chain ID:", chainId);
        console.log("ChitFundFactory:", factoryAddress);
        
        if (sampleChitFund != address(0)) {
            console.log("Sample ChitFund:", sampleChitFund);
        }
        
        console.log("");
        console.log("=== Next Steps ===");
        console.log("1. Verify contracts on block explorer");
        console.log("2. Update frontend configuration with new addresses");
        console.log("3. Set up Chainlink Automation for automated cycles");
        console.log("4. Test the deployment with small amounts first");
        
        if (config.deploySampleChitFund) {
            console.log("");
            console.log("=== Sample ChitFund Instructions ===");
            console.log("1. Members can join by calling joinFund()");
            console.log("2. Once all members join, the chit fund starts automatically");
            console.log("3. Members contribute during contribution period");
            console.log("4. Members bid during bidding period");
            console.log("5. Winner is selected and funds distributed automatically");
        }
    }
    
    function _saveDeploymentArtifacts(
        address factoryAddress,
        address sampleChitFund,
        uint256 chainId
    ) internal view {
        string memory chainName = _getChainName(chainId);
        
        string memory json = string(abi.encodePacked(
            '{\n',
            '  "chainId": ', vm.toString(chainId), ',\n',
            '  "chainName": "', chainName, '",\n',
            '  "timestamp": ', vm.toString(block.timestamp), ',\n',
            '  "contracts": {\n',
            '    "ChitFundFactory": "', vm.toString(factoryAddress), '"'
        ));
        
        if (sampleChitFund != address(0)) {
            json = string(abi.encodePacked(
                json,
                ',\n    "SampleChitFund": "', vm.toString(sampleChitFund), '"'
            ));
        }
        
        json = string(abi.encodePacked(
            json,
            '\n  }\n}'
        ));
        
        // Remove unused variable - filename is not used
    }
    
    function _getChainName(uint256 chainId) internal pure returns (string memory) {
        if (chainId == 545) return "flow-testnet";
        return "unknown";
    }
    
    function deployToNetwork(string memory networkName) external pure {
        // This function is a placeholder for network-specific deployment
        // The actual deployment logic would go here
    }
    
    function deployFactoryOnly() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying ChitFundFactory only...");
        console.log("Deployer:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        ChitFundFactory factory = new ChitFundFactory();
        console.log("ChitFundFactory deployed at:", address(factory));
        
        vm.stopBroadcast();
    }
    
    function createChitFundViaFactory(
        address factoryAddress,
        string memory fundName,
        uint256 contributionAmount,
        uint256 totalMembers,
        address paymentToken,
        uint256
    ) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        console.log("Creating ChitFund via Factory...");
        console.log("Factory:", factoryAddress);
        console.log("Fund Name:", fundName);
        
        vm.startBroadcast(deployerPrivateKey);
        
        ChitFundFactory factory = ChitFundFactory(factoryAddress);
        
        address chitFundAddress = factory.createChitFund(
            fundName,
            contributionAmount,
            totalMembers,
            paymentToken
        );
        
        console.log("ChitFund created at:", chitFundAddress);
        
        vm.stopBroadcast();
    }
}
