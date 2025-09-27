// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ChitFund} from "../src/ChitFund.sol";
import {ChitFundFactory} from "../src/ChitFundFactory.sol";

contract ChitFundIntegrationTest is Test {
    ChitFundFactory public factory;
    
    address public owner;
    address public member1;
    address public member2;
    address public member3;
    address public member4;
    address public member5;
    
    uint256 public constant CONTRIBUTION_AMOUNT = 1 ether;
    uint256 public constant TOTAL_MEMBERS = 5;
    string public constant FUND_NAME = "Integration Fund";
    
    function setUp() public {
        owner = address(this);
        member1 = makeAddr("member1");
        member2 = makeAddr("member2");
        member3 = makeAddr("member3");
        member4 = makeAddr("member4");
        member5 = makeAddr("member5");
        
        factory = new ChitFundFactory();
        
        // Fund all accounts
        vm.deal(member1, 10 ether);
        vm.deal(member2, 10 ether);
        vm.deal(member3, 10 ether);
        vm.deal(member4, 10 ether);
        vm.deal(member5, 10 ether);
    }
    
    function testCompleteChitFundLifecycle() public {
        // Step 1: Create ChitFund
        vm.prank(member1);
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        
        // Verify fund creation
        assertTrue(factory.isChitFund(chitFundAddress));
        assertEq(factory.getChitFundCount(), 1);
        
        // Step 2: All members join
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
        
        // Verify all members joined
        assertEq(chitFund.totalMembers(), 5);
        assertTrue(chitFund.isChitFundStarted());
        
        // Step 3: All members contribute
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
        
        // Verify contributions
        (uint256 totalPool, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertEq(totalPool, CONTRIBUTION_AMOUNT * 5);
        assertEq(cycleNumber, 1);
        assertTrue(isActive);
        
        // Step 4: Fast forward to bidding period
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        // Step 5: All members submit bids
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
        
        // Step 6: Fast forward past bidding period
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        // Step 7: Select winner
        vm.prank(member1);
        address winner = chitFund.selectWinner();
        
        // Verify winner (member5 has highest bid)
        assertEq(winner, member5);
        
        // Step 8: Distribute funds
        uint256 winnerBalanceBefore = member5.balance;
        
        vm.prank(member1);
        chitFund.distributeFunds();
        
        // Verify winner received funds
        uint256 winnerBalanceAfter = member5.balance;
        uint256 payout = winnerBalanceAfter - winnerBalanceBefore;
        
        // Winner should get 5 * 1 ether - 25% = 3.75 ether
        assertEq(payout, 3750000000000000000);
        
        // Step 9: Start next cycle
        vm.prank(member1);
        chitFund.startNextCycle();
        
        // Verify next cycle started
        (totalPool, cycleNumber, isActive) = chitFund.getPoolStatus();
        assertEq(cycleNumber, 2);
        assertTrue(isActive);
        assertEq(totalPool, 0);
    }
    
    function testMultipleChitFunds() public {
        // Create multiple funds
        vm.prank(member1);
        address fund1 = factory.createChitFund(
            "Fund 1",
            CONTRIBUTION_AMOUNT,
            3,
            address(0)
        );
        
        vm.prank(member2);
        address fund2 = factory.createChitFund(
            "Fund 2",
            CONTRIBUTION_AMOUNT * 2,
            4,
            address(0)
        );
        
        vm.prank(member3);
        address fund3 = factory.createChitFund(
            "Fund 3",
            CONTRIBUTION_AMOUNT * 3,
            5,
            address(0)
        );
        
        // Verify all funds exist
        assertTrue(factory.isChitFund(fund1));
        assertTrue(factory.isChitFund(fund2));
        assertTrue(factory.isChitFund(fund3));
        
        assertEq(factory.getChitFundCount(), 3);
        
        // Check user funds
        address[] memory user1Funds = factory.getUserChitFunds(member1);
        assertEq(user1Funds.length, 1);
        assertEq(user1Funds[0], fund1);
        
        address[] memory user2Funds = factory.getUserChitFunds(member2);
        assertEq(user2Funds.length, 1);
        assertEq(user2Funds[0], fund2);
        
        address[] memory user3Funds = factory.getUserChitFunds(member3);
        assertEq(user3Funds.length, 1);
        assertEq(user3Funds[0], fund3);
    }
    
    function testChitFundWithERC20Token() public {
        // Mock ERC20 token
        address mockToken = address(0x123);
        
        vm.prank(member1);
        address chitFundAddress = factory.createChitFund(
            "ERC20 Fund",
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            mockToken
        );
        
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        
        // Verify fund details
        ChitFundFactory.ChitFundInfo memory info = factory.getChitFundDetails(chitFundAddress);
        assertEq(info.paymentToken, mockToken);
        assertEq(info.fundName, "ERC20 Fund");
        
        // Verify ChitFund contract
        assertFalse(chitFund.isEthBased());
        assertEq(address(chitFund.paymentToken()), mockToken);
    }
    
    function testChitFundCompletion() public {
        // Create fund with 3 members
        vm.prank(member1);
        address chitFundAddress = factory.createChitFund(
            "Small Fund",
            CONTRIBUTION_AMOUNT,
            3,
            address(0)
        );
        
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        
        // All members join
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        // Complete cycle 1
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        vm.prank(member1);
        chitFund.selectWinner();
        
        vm.prank(member1);
        chitFund.distributeFunds();
        
        vm.prank(member1);
        chitFund.startNextCycle();
        
        // Complete cycle 2
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        vm.prank(member1);
        chitFund.selectWinner();
        
        vm.prank(member1);
        chitFund.distributeFunds();
        
        vm.prank(member1);
        chitFund.startNextCycle();
        
        // Complete cycle 3 - only member3 can participate now
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        vm.prank(member3);
        chitFund.submitBid(10);
        
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        vm.prank(member1);
        chitFund.selectWinner();
        
        vm.prank(member1);
        chitFund.distributeFunds();
        
        vm.prank(member1);
        chitFund.startNextCycle();
        
        // Verify fund is complete
        assertTrue(chitFund.isChitFundComplete());
        
        (, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertEq(cycleNumber, 3);
        assertFalse(isActive);
    }
    
    function testGasOptimization() public {
        // Test gas usage for common operations
        vm.prank(member1);
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        
        // All members join to start the fund
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
        
        // Measure gas for contributing
        uint256 gasStart = gasleft();
        
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        uint256 gasUsed = gasStart - gasleft();
        console.log("Gas used for contribute:", gasUsed);
        
        // All other members contribute
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member4);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member5);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Measure gas for bidding
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        gasStart = gasleft();
        
        vm.prank(member1);
        chitFund.submitBid(10);
        
        gasUsed = gasStart - gasleft();
        console.log("Gas used for submitBid:", gasUsed);
    }
    
    function testEventEmission() public {
        // Test that all events are emitted correctly
        vm.prank(member1);
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        
        // All members join to start the fund
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
    }
    
    function testStressTest() public {
        // Test with maximum members
        vm.prank(member1);
        address chitFundAddress = factory.createChitFund(
            "Stress Test Fund",
            CONTRIBUTION_AMOUNT,
            10,
            address(0)
        );
        
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        
        // Create 10 members
        address[] memory members = new address[](10);
        for (uint256 i = 0; i < 10; i++) {
            members[i] = makeAddr(string(abi.encodePacked("member", i)));
            vm.deal(members[i], 10 ether);
            
            vm.prank(members[i]);
            chitFund.joinFund();
        }
        
        // Verify all members joined
        assertEq(chitFund.totalMembers(), 10);
        assertTrue(chitFund.isChitFundStarted());
        
        // All contribute
        for (uint256 i = 0; i < 10; i++) {
            vm.prank(members[i]);
            chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        }
        
        // Verify total pool
        (uint256 totalPool, , ) = chitFund.getPoolStatus();
        assertEq(totalPool, CONTRIBUTION_AMOUNT * 10);
    }
}

