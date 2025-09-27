// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ChitFund} from "../src/ChitFund.sol";
import {ChitFundFactory} from "../src/ChitFundFactory.sol";

contract ChitFundEdgeCasesTest is Test {
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
    string public constant FUND_NAME = "Edge Case Fund";
    
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
    
    function testMinimumMembers() public {
        // Test with minimum members (3)
        address chitFundAddress = factory.createChitFund(
            "Min Fund",
            CONTRIBUTION_AMOUNT,
            3,
            address(0)
        );
        
        ChitFund minChitFund = ChitFund(payable(chitFundAddress));
        
        // Join 2 members
        vm.prank(member1);
        minChitFund.joinFund();
        
        vm.prank(member2);
        minChitFund.joinFund();
        
        // Should not start yet
        assertFalse(minChitFund.isChitFundStarted());
        
        // Join third member
        vm.prank(member3);
        minChitFund.joinFund();
        
        // Should start now
        assertTrue(minChitFund.isChitFundStarted());
    }
    
    function testMaximumMembers() public {
        // Test with maximum members (10)
        address chitFundAddress = factory.createChitFund(
            "Max Fund",
            CONTRIBUTION_AMOUNT,
            10,
            address(0)
        );
        
        ChitFund maxChitFund = ChitFund(payable(chitFundAddress));
        
        // Join 9 members
        for (uint256 i = 0; i < 9; i++) {
            address member = makeAddr(string(abi.encodePacked("member", i)));
            vm.deal(member, 10 ether);
            vm.prank(member);
            maxChitFund.joinFund();
        }
        
        // Should not start yet
        assertFalse(maxChitFund.isChitFundStarted());
        
        // Join 10th member
        address member10 = makeAddr("member10");
        vm.deal(member10, 10 ether);
        vm.prank(member10);
        maxChitFund.joinFund();
        
        // Should start now
        assertTrue(maxChitFund.isChitFundStarted());
    }
    
    function testExceedMaximumMembers() public {
        // Create a new fund with maximum members (10)
        address chitFundAddress = factory.createChitFund(
            "Max Fund",
            CONTRIBUTION_AMOUNT,
            10,
            address(0)
        );
        
        ChitFund maxChitFund = ChitFund(payable(chitFundAddress));
        
        // Join maximum members (10)
        for (uint256 i = 0; i < 10; i++) {
            address member = makeAddr(string(abi.encodePacked("member", i)));
            vm.deal(member, 10 ether);
            vm.prank(member);
            maxChitFund.joinFund();
        }
        
        // Verify fund is started
        assertTrue(maxChitFund.isChitFundStarted());
        
        // Try to join 11th member - should fail with "Already started"
        address member11 = makeAddr("member11");
        vm.deal(member11, 10 ether);
        vm.prank(member11);
        vm.expectRevert("Already started");
        maxChitFund.joinFund();
    }
    
    function testBidAtMaximumPercentage() public {
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
        
        // Test maximum bid (30%)
        vm.prank(member1);
        chitFund.submitBid(30);
        
        // Test bid above maximum
        vm.prank(member2);
        vm.expectRevert("Bid too high");
        chitFund.submitBid(31);
    }
    
    function testBidAtZeroPercentage() public {
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
        
        // Test zero bid
        vm.prank(member1);
        chitFund.submitBid(0);
        
        // Check bid was recorded
        (, bool hasBid, uint256 bidAmount) = chitFund.getMemberStatus(member1);
        assertTrue(hasBid);
        assertEq(bidAmount, 0);
    }
    
    function testNoBidsScenario() public {
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
        
        // Select winner - should select first eligible member
        vm.prank(member1);
        address winner = chitFund.selectWinner();
        
        // Should select first member who contributed
        assertEq(winner, member1);
    }
    
    function testTieBiddingScenario() public {
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
        
        // Submit same bid amounts
        vm.prank(member1);
        chitFund.submitBid(10);
        
        vm.prank(member2);
        chitFund.submitBid(10);
        
        vm.prank(member3);
        chitFund.submitBid(10);
        
        vm.prank(member4);
        chitFund.submitBid(10);
        
        vm.prank(member5);
        chitFund.submitBid(10);
        
        // Fast forward past bidding period
        vm.warp(block.timestamp + 3 days + 1 hours);
        
        // Select winner - should select first member with highest bid
        vm.prank(member1);
        address winner = chitFund.selectWinner();
        
        // Should select first member (member1)
        assertEq(winner, member1);
    }
    
    function testContributionDeadlineExpired() public {
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
        
        // Fast forward past contribution deadline
        vm.warp(block.timestamp + 7 days + 1 hours);
        
        // Try to contribute after deadline
        vm.prank(member1);
        vm.expectRevert("Contribution period ended");
        chitFund.contribute{value: CONTRIBUTION_AMOUNT}();
    }
    
    function testBiddingBeforeContributionPeriod() public {
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
        
        // Try to bid before contribution period ends
        vm.prank(member1);
        vm.expectRevert("Not in bidding period");
        chitFund.submitBid(10);
    }
    
    function testBiddingAfterBiddingPeriod() public {
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
        
        // Fast forward past bidding period
        vm.warp(block.timestamp + 7 days + 3 days + 1 hours);
        
        // Try to bid after deadline
        vm.prank(member1);
        vm.expectRevert("Not in bidding period");
        chitFund.submitBid(10);
    }
    
    function testSelectWinnerBeforeBiddingEnds() public {
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
        
        // Try to select winner before bidding ends
        vm.prank(member1);
        vm.expectRevert("Bidding not ended");
        chitFund.selectWinner();
    }
    
    function testSelectWinnerTwice() public {
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
        
        // Select winner first time
        vm.prank(member1);
        chitFund.selectWinner();
        
        // Try to select winner again
        vm.prank(member1);
        vm.expectRevert("Winner already selected");
        chitFund.selectWinner();
    }
    
    function testDistributeFundsTwice() public {
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
        
        // Distribute funds first time
        vm.prank(member1);
        chitFund.distributeFunds();
        
        // Try to distribute funds again
        vm.prank(member1);
        vm.expectRevert("Funds already distributed");
        chitFund.distributeFunds();
    }
    
    function testStartNextCycleBeforeDistribution() public {
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
        
        // Try to start next cycle before distribution
        vm.prank(member1);
        vm.expectRevert("Funds not distributed");
        chitFund.startNextCycle();
    }
    
    function testInsufficientFunds() public {
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
        
        // Try to contribute with insufficient funds
        vm.prank(member1);
        vm.expectRevert("Incorrect ETH amount");
        chitFund.contribute{value: CONTRIBUTION_AMOUNT - 1}();
    }
    
    function testExcessFunds() public {
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
        
        // Try to contribute with excess funds
        vm.prank(member1);
        vm.expectRevert("Incorrect ETH amount");
        chitFund.contribute{value: CONTRIBUTION_AMOUNT + 1}();
    }
}
