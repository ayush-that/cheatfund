// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {ChitFund} from "../ChitFund.sol";

contract TestCompleteCycle is Script {
    address public chitFundAddress = 0xA7f48897EE08157482b2c9289c535Dd895E22Ac2;
    
    function run() external {
        console.log("=== Complete ChitFund Cycle Test on Flow Testnet ===");
        
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
        
        console.log("=== STEP 1: All Members Join ===");
        console.log("ChitFund Address:", chitFundAddress);
        console.log("Contribution Amount:", chitFund.contributionAmount());
        console.log("Total Members Required:", chitFund.totalMembers());
        
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
        
        console.log("=== STEP 2: All Members Contribute FLOW ===");
        uint256 contributionAmount = chitFund.contributionAmount();
        console.log("Contribution Amount per member:", contributionAmount);
        
        vm.startBroadcast(member1PrivateKey);
        chitFund.contribute{value: contributionAmount}();
        console.log("Member 1 contributed", contributionAmount, "FLOW");
        vm.stopBroadcast();
        
        vm.startBroadcast(member2PrivateKey);
        chitFund.contribute{value: contributionAmount}();
        console.log("Member 2 contributed", contributionAmount, "FLOW");
        vm.stopBroadcast();
        
        vm.startBroadcast(member3PrivateKey);
        chitFund.contribute{value: contributionAmount}();
        console.log("Member 3 contributed", contributionAmount, "FLOW");
        vm.stopBroadcast();
        
        (totalPool, cycleNumber, isActive) = chitFund.getPoolStatus();
        console.log("After contributions - Total Pool:", totalPool);
        console.log("After contributions - Cycle Number:", cycleNumber);
        console.log("After contributions - Is Active:", isActive);
        
        console.log("=== STEP 3: Members Submit Bids ===");
        vm.startBroadcast(member1PrivateKey);
        chitFund.submitBid(10);
        console.log("Member 1 submitted 10% bid");
        vm.stopBroadcast();
        
        vm.startBroadcast(member2PrivateKey);
        chitFund.submitBid(15);
        console.log("Member 2 submitted 15% bid");
        vm.stopBroadcast();
        
        vm.startBroadcast(member3PrivateKey);
        chitFund.submitBid(5);
        console.log("Member 3 submitted 5% bid (lowest - should win)");
        vm.stopBroadcast();
        
        console.log("=== STEP 4: Select Winner and Distribute ===");
        vm.startBroadcast(member1PrivateKey);
        address winner = chitFund.selectWinner();
        console.log("Winner selected:", winner);
        vm.stopBroadcast();
        
        vm.startBroadcast(member1PrivateKey);
        chitFund.distributeFunds();
        console.log("Funds distributed to winner");
        vm.stopBroadcast();
        
        console.log("=== STEP 5: Start Next Cycle ===");
        vm.startBroadcast(member1PrivateKey);
        chitFund.startNextCycle();
        console.log("Next cycle started");
        vm.stopBroadcast();
        
        console.log("=== COMPLETE CYCLE TEST FINISHED ===");
        console.log("All ChitFund operations completed successfully on Flow testnet!");
    }
}
