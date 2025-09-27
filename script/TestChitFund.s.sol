// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ChitFund} from "../src/ChitFund.sol";

contract TestChitFund is Script {
    address public factoryAddress = 0x3B0F27234E1c5922B5C76Be0eC2002B9217DD264;
    address public chitFundAddress = 0xA7f48897EE08157482b2c9289c535Dd895E22Ac2;
    
    function run() external {
        console.log("=== Testing ChitFund on Flow Testnet ===");
        
        uint256 member1PrivateKey = vm.envUint("TEST_MEMBER_1_PRIVATE_KEY");
        uint256 member2PrivateKey = vm.envUint("TEST_MEMBER_2_PRIVATE_KEY");
        uint256 member3PrivateKey = vm.envUint("TEST_MEMBER_3_PRIVATE_KEY");
        
        address member1 = vm.addr(member1PrivateKey);
        address member2 = vm.addr(member2PrivateKey);
        address member3 = vm.addr(member3PrivateKey);
        
        console.log("Member 1:", member1);
        console.log("Member 2:", member2);
        console.log("Member 3:", member3);
        
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        
        console.log("ChitFund Address:", chitFundAddress);
        console.log("Contribution Amount:", chitFund.contributionAmount());
        console.log("Total Members:", chitFund.totalMembers());
        console.log("Is ChitFund Started:", chitFund.isChitFundStarted());
        
        vm.startBroadcast(member1PrivateKey);
        chitFund.joinFund();
        console.log("Member 1 joined");
        vm.stopBroadcast();
        
        vm.startBroadcast(member2PrivateKey);
        chitFund.joinFund();
        console.log("Member 2 joined");
        vm.stopBroadcast();
        
        vm.startBroadcast(member3PrivateKey);
        chitFund.joinFund();
        console.log("Member 3 joined");
        vm.stopBroadcast();
        
        console.log("All members joined! ChitFund should start automatically");
        console.log("Is ChitFund Started:", chitFund.isChitFundStarted());
        
        (uint256 totalPool, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        console.log("Pool Status - Total Pool:", totalPool);
        console.log("Pool Status - Cycle Number:", cycleNumber);
        console.log("Pool Status - Is Active:", isActive);
    }
}
