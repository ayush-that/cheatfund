// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ChitFund} from "../contracts/ChitFund.sol";
import {ChitFundFactory} from "../contracts/ChitFundFactory.sol";

contract ChitFundAutomationTest is Test {
    ChitFund public chitFund;
    ChitFundFactory public factory;
    
    address public owner;
    address public member1;
    address public member2;
    address public member3;
    address public member4;
    address public member5;
    
    uint256 public constant CONTRIBUTION_AMOUNT = 1 ether;
    uint256 public constant TOTAL_MEMBERS = 5;
    string public constant FUND_NAME = "Automation Fund";
    
    function setUp() public {
        owner = address(this);
        member1 = makeAddr("member1");
        member2 = makeAddr("member2");
        member3 = makeAddr("member3");
        member4 = makeAddr("member4");
        member5 = makeAddr("member5");
        
        factory = new ChitFundFactory();
        
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        chitFund = ChitFund(payable(chitFundAddress));
        
        // Fund all accounts
        vm.deal(member1, 10 ether);
        vm.deal(member2, 10 ether);
        vm.deal(member3, 10 ether);
        vm.deal(member4, 10 ether);
        vm.deal(member5, 10 ether);
    }
    
    function testCheckUpkeepSelectWinner() public {
        // Setup: All members join and contribute
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Fast forward to bidding period
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        // All submit bids
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.prank(member4);
        chitFund.submitBid(20);
        
        vm.prank(member5);
        chitFund.submitBid(25);
        
        // Fast forward past bidding period
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        // Check upkeep
        (bool upkeepNeeded, bytes memory performData) = chitFund.checkUpkeep("");
        
        assertTrue(upkeepNeeded);
        string memory action = abi.decode(performData, (string));
        assertEq(action, "SELECT_WINNER");
    }
    
    function testCheckUpkeepDistributeFunds() public {
        // Setup: Complete cycle to winner selection
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Bidding and winner selection
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.prank(member4);
        chitFund.submitBid(20);
        
        vm.prank(member5);
        chitFund.submitBid(25);
        
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        vm.prank(member1);
        chitFund.selectWinner();
        
        // Check upkeep
        (bool upkeepNeeded, bytes memory performData) = chitFund.checkUpkeep("");
        
        assertTrue(upkeepNeeded);
        string memory action = abi.decode(performData, (string));
        assertEq(action, "DISTRIBUTE_FUNDS");
    }
    
    function testCheckUpkeepStartNextCycle() public {
        // Setup: Complete cycle to distribution
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Bidding and winner selection
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.prank(member4);
        chitFund.submitBid(20);
        
        vm.prank(member5);
        chitFund.submitBid(25);
        
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        vm.prank(member1);
        chitFund.selectWinner();
        
        vm.prank(member1);
        chitFund.distributeFunds();
        
        // Check upkeep
        (bool upkeepNeeded, bytes memory performData) = chitFund.checkUpkeep("");
        
        assertTrue(upkeepNeeded);
        string memory action = abi.decode(performData, (string));
        assertEq(action, "START_NEXT_CYCLE");
    }
    
    function testCheckUpkeepNoActionNeeded() public {
        // Setup: All members join but haven't contributed yet
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // Check upkeep - should not need any action
        (bool upkeepNeeded, bytes memory performData) = chitFund.checkUpkeep("");
        
        assertFalse(upkeepNeeded);
        assertEq(performData.length, 0);
    }
    
    function testPerformUpkeepSelectWinner() public {
        // Setup: All members join and contribute
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Fast forward to bidding period
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        // All submit bids
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.prank(member4);
        chitFund.submitBid(20);
        
        vm.prank(member5);
        chitFund.submitBid(25);
        
        // Fast forward past bidding period
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        // Perform upkeep
        vm.prank(member1);
        chitFund.performUpkeep(abi.encode("SELECT_WINNER"));
        
        // Check that winner was selected
        (, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertTrue(isActive);
        assertEq(cycleNumber, 1);
    }
    
    function testPerformUpkeepDistributeFunds() public {
        // Setup: Complete cycle to winner selection
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Bidding and winner selection
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.prank(member4);
        chitFund.submitBid(20);
        
        vm.prank(member5);
        chitFund.submitBid(25);
        
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        vm.prank(member1);
        chitFund.selectWinner();
        
        // Perform upkeep
        vm.prank(member1);
        chitFund.performUpkeep(abi.encode("DISTRIBUTE_FUNDS"));
        
        // Check that funds were distributed
        (, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertTrue(isActive);
        assertEq(cycleNumber, 1);
    }
    
    function testPerformUpkeepStartNextCycle() public {
        // Setup: Complete cycle to distribution
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Bidding and winner selection
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.prank(member4);
        chitFund.submitBid(20);
        
        vm.prank(member5);
        chitFund.submitBid(25);
        
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        vm.prank(member1);
        chitFund.selectWinner();
        
        vm.prank(member1);
        chitFund.distributeFunds();
        
        // Perform upkeep
        vm.prank(member1);
        chitFund.performUpkeep(abi.encode("START_NEXT_CYCLE"));
        
        // Check that next cycle started
        (uint256 totalPool, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertTrue(isActive);
        assertEq(cycleNumber, 2);
        assertEq(totalPool, 0);
    }
    
    function testPerformUpkeepInvalidAction() public {
        // Setup: All members join
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // Try to perform invalid action
        vm.prank(member1);
        chitFund.performUpkeep(abi.encode("INVALID_ACTION"));
        
        // Should not revert but also not do anything
        (, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertTrue(isActive);
        assertEq(cycleNumber, 1);
    }
    
    function testAutomationTriggeredEvent() public {
        // Setup: All members join and contribute
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Fast forward to bidding period
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        // All submit bids
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.prank(member4);
        chitFund.submitBid(20);
        
        vm.prank(member5);
        chitFund.submitBid(25);
        
        // Fast forward past bidding period
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        // Perform upkeep
        vm.prank(member1);
        chitFund.performUpkeep(abi.encode("SELECT_WINNER"));
    }
    
    function testCompleteAutomatedCycle() public {
        // Setup: All members join
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Fast forward to bidding period
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        // All submit bids
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.prank(member4);
        chitFund.submitBid(20);
        
        vm.prank(member5);
        chitFund.submitBid(25);
        
        // Fast forward past bidding period
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        // Automated winner selection
        vm.prank(member1);
        chitFund.performUpkeep(abi.encode("SELECT_WINNER"));
        
        // Automated fund distribution
        vm.prank(member1);
        chitFund.performUpkeep(abi.encode("DISTRIBUTE_FUNDS"));
        
        // Automated next cycle start
        vm.prank(member1);
        chitFund.performUpkeep(abi.encode("START_NEXT_CYCLE"));
        
        // Check that next cycle started
        (uint256 totalPool, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertTrue(isActive);
        assertEq(cycleNumber, 2);
        assertEq(totalPool, 0);
    }
    
    function testAutomationWithNoBids() public {
        // Setup: All members join and contribute
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Fast forward past bidding period without any bids
        vm.warp(block.timestamp + 7 days + 3 days + 1 hours);
        
        // Automated winner selection (should select first eligible member)
        vm.prank(member1);
        chitFund.performUpkeep(abi.encode("SELECT_WINNER"));
        
        // Check that winner was selected
        (, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertTrue(isActive);
        assertEq(cycleNumber, 1);
    }
    
    function testAutomationWithPartialContributions() public {
        // Setup: All members join
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        vm.prank(member4);
        chitFund.joinFund();
        
        vm.prank(member5);
        chitFund.joinFund();
        
        // Only some members contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Fast forward past bidding period
        vm.warp(block.timestamp + 7 days + 3 days + 1 hours);
        
        // Check upkeep - should not need action because not all members contributed
        (bool upkeepNeeded, bytes memory performData) = chitFund.checkUpkeep("");
        
        assertFalse(upkeepNeeded);
        assertEq(performData.length, 0);
    }
}
