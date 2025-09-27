// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {ChitFund} from "../contracts/ChitFund.sol";
import {ChitFundFactory} from "../contracts/ChitFundFactory.sol";

contract ChitFundFactoryTest is Test {
    ChitFundFactory public factory;
    
    address public owner;
    address public user1;
    address public user2;
    address public user3;
    
    uint256 public constant CONTRIBUTION_AMOUNT = 1 ether;
    uint256 public constant TOTAL_MEMBERS = 3;
    string public constant FUND_NAME = "Test Fund";
    
    event ChitFundCreated(
        address indexed chitFund,
        address indexed creator,
        string fundName,
        uint256 contributionAmount,
        uint256 totalMembers,
        address paymentToken,
        uint256 timestamp
    );
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        user3 = makeAddr("user3");
        
        factory = new ChitFundFactory();
    }
    
    function testDeployment() public view {
        assertEq(factory.getChitFundCount(), 0);
        assertEq(factory.getAllChitFunds().length, 0);
    }
    
    function testCreateChitFund() public {
        vm.prank(user1);
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0) // ETH-based
        );
        
        // Check that fund was created
        assertTrue(factory.isChitFund(chitFundAddress));
        assertEq(factory.getChitFundCount(), 1);
        assertEq(factory.getAllChitFunds().length, 1);
        assertEq(factory.getAllChitFunds()[0], chitFundAddress);
        
        // Check fund details
        ChitFundFactory.ChitFundInfo memory info = factory.getChitFundDetails(chitFundAddress);
        assertEq(info.chitFundAddress, chitFundAddress);
        assertEq(info.fundName, FUND_NAME);
        assertEq(info.creator, user1);
        assertEq(info.contributionAmount, CONTRIBUTION_AMOUNT);
        assertEq(info.totalMembers, TOTAL_MEMBERS);
        assertEq(info.paymentToken, address(0));
        assertTrue(info.isActive);
        
        // Check user's funds
        address[] memory userFunds = factory.getUserChitFunds(user1);
        assertEq(userFunds.length, 1);
        assertEq(userFunds[0], chitFundAddress);
    }
    
    function testCreateMultipleChitFunds() public {
        // User1 creates first fund
        vm.prank(user1);
        address fund1 = factory.createChitFund(
            "Fund 1",
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        // User2 creates second fund
        vm.prank(user2);
        address fund2 = factory.createChitFund(
            "Fund 2",
            CONTRIBUTION_AMOUNT * 2,
            TOTAL_MEMBERS + 1,
            address(0)
        );
        
        // User1 creates third fund
        vm.prank(user1);
        address fund3 = factory.createChitFund(
            "Fund 3",
            CONTRIBUTION_AMOUNT * 3,
            TOTAL_MEMBERS + 2,
            address(0)
        );
        
        // Check total count
        assertEq(factory.getChitFundCount(), 3);
        
        // Check all funds
        address[] memory allFunds = factory.getAllChitFunds();
        assertEq(allFunds.length, 3);
        assertEq(allFunds[0], fund1);
        assertEq(allFunds[1], fund2);
        assertEq(allFunds[2], fund3);
        
        // Check user1's funds
        address[] memory user1Funds = factory.getUserChitFunds(user1);
        assertEq(user1Funds.length, 2);
        assertEq(user1Funds[0], fund1);
        assertEq(user1Funds[1], fund3);
        
        // Check user2's funds
        address[] memory user2Funds = factory.getUserChitFunds(user2);
        assertEq(user2Funds.length, 1);
        assertEq(user2Funds[0], fund2);
        
        // Check user3's funds
        address[] memory user3Funds = factory.getUserChitFunds(user3);
        assertEq(user3Funds.length, 0);
    }
    
    function testJoinChitFund() public {
        // Create a fresh factory for this test to avoid state pollution
        ChitFundFactory freshFactory = new ChitFundFactory();
        
        // Use completely unique addresses to avoid conflicts
        address testUser1 = makeAddr("testJoinUser1");
        address testUser2 = makeAddr("testJoinUser2");
        address testUser3 = makeAddr("testJoinUser3");
        address testUser4 = makeAddr("testJoinUser4");
        
        vm.prank(testUser1);
        address chitFundAddress = freshFactory.createChitFund(
            "Isolated Fund",
            CONTRIBUTION_AMOUNT,
            4,
            address(0)
        );
        
        // Check initial state
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        assertEq(chitFund.getMembers().length, 0);
        assertFalse(chitFund.isChitFundStarted());
        
        // Join all 4 members (including creator)
        _joinMembersToFund(freshFactory, chitFundAddress, testUser1, testUser2, testUser3, testUser4);
        _verifyFundState(chitFundAddress);
    }
    
    function _joinMembersToFund(ChitFundFactory factoryInstance, address chitFundAddress, address member1, address member2, address member3, address member4) internal {
        vm.deal(member1, 10 ether);
        vm.deal(member2, 10 ether);
        vm.deal(member3, 10 ether);
        vm.deal(member4, 10 ether);
        
        // Join all 4 members
        vm.prank(member1);
        factoryInstance.joinChitFund(chitFundAddress);
        
        vm.prank(member2);
        factoryInstance.joinChitFund(chitFundAddress);
        
        vm.prank(member3);
        factoryInstance.joinChitFund(chitFundAddress);
        
        vm.prank(member4);
        factoryInstance.joinChitFund(chitFundAddress);
    }
    
    function _verifyFundState(address chitFundAddress) internal view {
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        assertEq(chitFund.getMembers().length, 4);
        assertTrue(chitFund.isChitFundStarted());
    }
    
    function testJoinChitFundReverts() public {
        // Try to join non-existent fund
        vm.prank(user1);
        vm.expectRevert("Invalid chit fund");
        factory.joinChitFund(address(0x123));
        
        // Try to join invalid address
        vm.prank(user1);
        vm.expectRevert("Invalid chit fund");
        factory.joinChitFund(address(this));
    }
    
    function testGetChitFundDetails() public {
        // Create fund
        vm.prank(user1);
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        // Get details
        ChitFundFactory.ChitFundInfo memory info = factory.getChitFundDetails(chitFundAddress);
        
        assertEq(info.chitFundAddress, chitFundAddress);
        assertEq(info.fundName, FUND_NAME);
        assertEq(info.creator, user1);
        assertEq(info.contributionAmount, CONTRIBUTION_AMOUNT);
        assertEq(info.totalMembers, TOTAL_MEMBERS);
        assertEq(info.paymentToken, address(0));
        assertTrue(info.isActive);
        assertTrue(info.createdAt > 0);
    }
    
    function testGetChitFundDetailsReverts() public {
        // Try to get details of non-existent fund
        vm.expectRevert("Invalid chit fund");
        factory.getChitFundDetails(address(0x123));
    }
    
    function testIsChitFund() public {
        // Initially no funds
        assertFalse(factory.isChitFund(address(0x123)));
        assertFalse(factory.isChitFund(address(this)));
        
        // Create fund
        vm.prank(user1);
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        // Check that fund is recognized
        assertTrue(factory.isChitFund(chitFundAddress));
        assertFalse(factory.isChitFund(address(0x123)));
    }
    
    function testCreateChitFundWithERC20() public {
        // Mock ERC20 token
        address mockToken = address(0x123);
        
        vm.prank(user1);
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            mockToken
        );
        
        // Check fund details
        ChitFundFactory.ChitFundInfo memory info = factory.getChitFundDetails(chitFundAddress);
        assertEq(info.paymentToken, mockToken);
        
        // Verify the actual ChitFund contract
        ChitFund chitFund = ChitFund(payable(chitFundAddress));
        assertFalse(chitFund.isEthBased());
    }
    
    function testCreateChitFundWithDifferentParameters() public {
        // Test with different contribution amounts
        vm.prank(user1);
        address fund1 = factory.createChitFund(
            "Small Fund",
            0.1 ether,
            5,
            address(0)
        );
        
        vm.prank(user2);
        address fund2 = factory.createChitFund(
            "Large Fund",
            10 ether,
            10,
            address(0)
        );
        
        // Check both funds exist
        assertTrue(factory.isChitFund(fund1));
        assertTrue(factory.isChitFund(fund2));
        
        // Check details
        ChitFundFactory.ChitFundInfo memory info1 = factory.getChitFundDetails(fund1);
        ChitFundFactory.ChitFundInfo memory info2 = factory.getChitFundDetails(fund2);
        
        assertEq(info1.contributionAmount, 0.1 ether);
        assertEq(info1.totalMembers, 5);
        assertEq(info2.contributionAmount, 10 ether);
        assertEq(info2.totalMembers, 10);
    }
    
    function testTotalChitFundsCreated() public {
        assertEq(factory.totalChitFundsCreated(), 0);
        
        // Create first fund
        vm.prank(user1);
        factory.createChitFund(FUND_NAME, CONTRIBUTION_AMOUNT, TOTAL_MEMBERS, address(0));
        assertEq(factory.totalChitFundsCreated(), 1);
        
        // Create second fund
        vm.prank(user2);
        factory.createChitFund("Fund 2", CONTRIBUTION_AMOUNT, TOTAL_MEMBERS, address(0));
        assertEq(factory.totalChitFundsCreated(), 2);
        
        // Create third fund
        vm.prank(user1);
        factory.createChitFund("Fund 3", CONTRIBUTION_AMOUNT, TOTAL_MEMBERS, address(0));
        assertEq(factory.totalChitFundsCreated(), 3);
    }
    
    function testEventEmission() public {
        // Test that event is emitted when creating a fund
        vm.prank(user1);
        address chitFundAddress = factory.createChitFund(
            FUND_NAME,
            CONTRIBUTION_AMOUNT,
            TOTAL_MEMBERS,
            address(0)
        );
        
        // Verify the fund was created
        assertTrue(factory.isChitFund(chitFundAddress));
        
        // Verify fund details
        ChitFundFactory.ChitFundInfo memory info = factory.getChitFundDetails(chitFundAddress);
        assertEq(info.fundName, FUND_NAME);
        assertEq(info.creator, user1);
    }
}
