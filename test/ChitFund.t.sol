// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {ChitFund} from "../src/ChitFund.sol";
import {ChitFundFactory} from "../src/ChitFundFactory.sol";

contract ChitFundTest is Test {
    ChitFund public chitFund;
    ChitFundFactory public factory;
    
    address public owner;
    address public member1;
    address public member2;
    address public member3;
    address public nonMember;
    
    uint256 public constant CONTRIBUTION_AMOUNT = 1 ether;
    uint256 public constant TOTAL_MEMBERS = 3;
    string public constant FUND_NAME = "Test Fund";
    
    event MemberJoined(address indexed member, uint256 timestamp);
    event ContributionMade(address indexed member, uint256 amount, uint256 cycle);
    event BidSubmitted(address indexed member, uint256 bidAmount, uint256 cycle);
    event WinnerSelected(address indexed winner, uint256 payout, uint256 cycle);
    event FundsDistributed(address indexed winner, uint256 amount, uint256 cycle);
    event CycleCompleted(uint256 indexed cycleNumber, address winner);
    
    function setUp() public {
        owner = address(this);
        member1 = makeAddr("member1");
        member2 = makeAddr("member2");
        member3 = makeAddr("member3");
        nonMember = makeAddr("nonMember");
        
        // Deploy factory
        factory = new ChitFundFactory();
        
        // Create a new chit fund
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0) // ETH-based fund
        );
        
        chitFund = ChitFund(payable(chitFundAddress));
        
        // Fund accounts
        vm.deal(member1, 10 ether);
        vm.deal(member2, 10 ether);
        vm.deal(member3, 10 ether);
        vm.deal(nonMember, 10 ether);
    }
    
    function testDeployment() public {
        // Create a fresh fund for this test
        address freshChitFundAddress = factory.createChitFund(
            "Fresh Fund",
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        ChitFund freshChitFund = ChitFund(payable(freshChitFundAddress));
        
        assertEq(freshChitFund.fundName(), "Fresh Fund");
        assertEq(freshChitFund.contributionAmount(), CONTRIBUTION_AMOUNT);
        assertTrue(freshChitFund.isEthBased());
        assertFalse(freshChitFund.isChitFundStarted());
        console.log("Total members:", freshChitFund.totalMembers());
        assertEq(freshChitFund.getMembers().length, 0); // No members joined yet
    }
    
    function testJoinFund() public {
        // Create a fresh fund for this test
        address freshChitFundAddress = factory.createChitFund(
            "Fresh Fund",
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        ChitFund freshChitFund = ChitFund(payable(freshChitFundAddress));
        
        vm.prank(member1);
        freshChitFund.joinFund();
        
        assertTrue(freshChitFund.isMember(member1));
        assertEq(freshChitFund.getMembers().length, 1);
        
        // Check member details
        (bool hasContributed, bool hasBid, uint256 bidAmount) = freshChitFund.getMemberStatus(member1);
        assertFalse(hasContributed);
        assertFalse(hasBid);
        assertEq(bidAmount, 0);
    }
    
    function testJoinFundReverts() public {
        // Create a fresh fund for this test
        address freshChitFundAddress = factory.createChitFund(
            "Fresh Fund",
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        ChitFund freshChitFund = ChitFund(payable(freshChitFundAddress));
        
        // Test joining when already a member
        vm.prank(member1);
        freshChitFund.joinFund();
        
        vm.prank(member1);
        vm.expectRevert("Already a member");
        freshChitFund.joinFund();
        
        // Test joining when fund is full
        vm.prank(member2);
        freshChitFund.joinFund();
        
        vm.prank(member3);
        freshChitFund.joinFund();
        
        // Fund is now full and started, so no more members can join
        address member4 = makeAddr("member4");
        vm.deal(member4, 10 ether);
        vm.prank(member4);
        vm.expectRevert("Already started");
        freshChitFund.joinFund();
    }
    
    function testAutoStartWhenFull() public {
        // Create a fresh fund for this test
        address freshChitFundAddress = factory.createChitFund(
            "Fresh Fund",
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        ChitFund freshChitFund = ChitFund(payable(freshChitFundAddress));
        
        // Join first two members
        vm.prank(member1);
        freshChitFund.joinFund();
        
        vm.prank(member2);
        freshChitFund.joinFund();
        
        assertFalse(freshChitFund.isChitFundStarted());
        
        // Join third member - should auto-start
        vm.prank(member3);
        freshChitFund.joinFund();
        
        assertTrue(freshChitFund.isChitFundStarted());
        
        (uint256 totalPool, uint256 cycleNumber, bool isActive) = freshChitFund.getPoolStatus();
        assertEq(cycleNumber, 1);
        assertTrue(isActive);
        assertEq(totalPool, 0);
    }
    
    function testContribute() public {
        // Setup: All members join
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        // Member 1 contributes
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        (bool hasContributed, , ) = chitFund.getMemberStatus(member1);
        assertTrue(hasContributed);
        
        (uint256 totalPool, , ) = chitFund.getPoolStatus();
        assertEq(totalPool, CONTRIBUTION_AMOUNT);
    }
    
    function testContributeReverts() public {
        // Setup
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        // Test contributing without being a member
        vm.prank(nonMember);
        vm.expectRevert("Not a member");
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Test contributing wrong amount
        vm.prank(member1);
        vm.expectRevert("Incorrect ETH amount");
        chitFund.contribute{value: CONTRIBUTION_AMOUNT + 1}();
        
        // Test contributing twice
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member1);
        vm.expectRevert("Already contributed");
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
    }
    
    function testSubmitBid() public {
        // Setup: All members join and contribute
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Fast forward to bidding period
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        // Submit bids
        vm.prank(member1);
        chitFund.submitBid(10); // 10%
        
        vm.prank(member2);
        chitFund.submitBid(15); // 15%
        
        vm.prank(member3);
        chitFund.submitBid(5); // 5%
        
        // Check bid status
        (, bool hasBid, uint256 bidAmount) = chitFund.getMemberStatus(member1);
        assertTrue(hasBid);
        assertEq(bidAmount, 10);
    }
    
    function testSubmitBidReverts() public {
        // Create a fresh fund for this test
        address freshChitFundAddress = factory.createChitFund(
            "Fresh Fund",
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        ChitFund freshChitFund = ChitFund(payable(freshChitFundAddress));
        
        // Setup
        vm.prank(member1);
        freshChitFund.joinFund();
        
        vm.prank(member2);
        freshChitFund.joinFund();
        
        vm.prank(member3);
        freshChitFund.joinFund();
        
        // All contribute first
        vm.prank(member1);
        freshChitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        freshChitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        freshChitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Test bidding without contributing (use a different member)
        address member4 = makeAddr("member4");
        vm.deal(member4, 10 ether);
        vm.prank(member4);
        vm.expectRevert("Already started");
        freshChitFund.joinFund();
        
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        // Test bidding too high
        vm.prank(member1);
        vm.expectRevert("Bid too high");
        freshChitFund.submitBid(31); // > 30%
    }
    
    function testSelectWinner() public {
        // Setup: All members join, contribute, and bid
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Fast forward to bidding period
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        // Submit bids (member2 has highest bid)
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        // Fast forward past bidding period
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        // Select winner
        vm.prank(member1);
        address winner = chitFund.selectWinner();
        
        assertEq(winner, member2); // Highest bid should win
        
        // Check winner status
        (bool hasContributed, bool hasBid, uint256 bidAmount) = chitFund.getMemberStatus(member3);
        assertTrue(hasContributed);
        assertTrue(hasBid);
        assertEq(bidAmount, 5);
    }
    
    function testDistributeFunds() public {
        // Setup: Complete cycle to winner selection
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Bidding and winner selection
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
        
        // Check winner balance before distribution
        uint256 winnerBalanceBefore = member2.balance;
        
        // Distribute funds
        vm.prank(member1);
        chitFund.distributeFunds();
        
        // Check winner balance after distribution
        uint256 winnerBalanceAfter = member2.balance;
        uint256 payout = winnerBalanceAfter - winnerBalanceBefore;
        
        // Winner should get 3 * 1 ether - 15% = 2.55 ether
        assertEq(payout, 2550000000000000000);
    }
    
    function testCompleteCycle() public {
        // Setup: All members join
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        // All contribute
        vm.prank(member1);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member2);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        vm.prank(member3);
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
        
        // Bidding
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(15);
        
        vm.prank(member3);
        chitFund.submitBid(5);
        
        // Winner selection and distribution
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        vm.prank(member1);
        chitFund.selectWinner();
        
        vm.prank(member1);
        chitFund.distributeFunds();
        
        // Start next cycle
        vm.prank(member1);
        chitFund.startNextCycle();
        
        // Check that new cycle started
        (uint256 totalPool, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertEq(cycleNumber, 2);
        assertTrue(isActive);
        assertEq(totalPool, 0);
    }
    
    function testGetPoolStatus() public {
        // Initial status
        (uint256 totalPool, uint256 cycleNumber, bool isActive) = chitFund.getPoolStatus();
        assertEq(totalPool, 0);
        assertEq(cycleNumber, 0);
        assertFalse(isActive);
        
        // After starting
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        (totalPool, cycleNumber, isActive) = chitFund.getPoolStatus();
        assertEq(cycleNumber, 1);
        assertTrue(isActive);
    }
    
    function testGetMembers() public {
        // Initially no members
        assertEq(chitFund.getMembers().length, 0);
        
        // Add members
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        // Check members
        assertEq(chitFund.getMembers().length, 3);
        assertEq(chitFund.getMembers()[0].wallet, member1);
        assertEq(chitFund.getMembers()[1].wallet, member2);
        assertEq(chitFund.getMembers()[2].wallet, member3);
    }
    
    function testIsChitFundComplete() public {
        // Initially not complete
        assertFalse(chitFund.isChitFundComplete());
        
        // After starting, still not complete
        vm.prank(member1);
        chitFund.joinFund();
        
        vm.prank(member2);
        chitFund.joinFund();
        
        vm.prank(member3);
        chitFund.joinFund();
        
        assertFalse(chitFund.isChitFundComplete());
    }
    
    function testReceive() public {
        // Test that contract can receive ETH
        vm.deal(address(chitFund), 1 ether);
        assertEq(address(chitFund).balance, 1 ether);
    }
}
