// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IChitFund
 * @dev Interface for the ChitFund contract
 * @notice Defines the core functions for a decentralized chit fund system
 */
interface IChitFund {
    // Structs
    struct Member {
        address wallet;
        bool hasJoined;
        bool hasContributed;
        bool hasBid;
        uint256 bidAmount;
        bool isWinner;
        bool canParticipate;
        uint256 joinTime;
        uint256 contributionCount;
    }
    
    struct Cycle {
        uint256 cycleNumber;
        uint256 totalPool;
        address winner;
        uint256 winnerPayout;
        bool isActive;
        uint256 contributionDeadline;
        uint256 biddingDeadline;
        uint256 startTime;
        bool fundsDistributed;
    }
    
    // Events
    event MemberJoined(address indexed member, uint256 timestamp);
    event ContributionMade(address indexed member, uint256 amount, uint256 cycle);
    event BidSubmitted(address indexed member, uint256 bidAmount, uint256 cycle);
    event WinnerSelected(address indexed winner, uint256 payout, uint256 cycle);
    event CycleCompleted(uint256 indexed cycleNumber, address winner);
    event FundsDistributed(address indexed winner, uint256 amount, uint256 cycle);
    event AutomationTriggered(uint256 timestamp, string action);
    event ChitFundCompleted(uint256 totalCycles);
    
    // Core Functions
    function joinFund() external;
    function contribute() external payable;
    function submitBid(uint256 _bidAmount) external;
    function selectWinner() external returns (address);
    function distributeFunds() external;
    function startNextCycle() external;
    
    // Automation Functions
    function checkUpkeep(bytes calldata checkData) external view returns (bool upkeepNeeded, bytes memory performData);
    function performUpkeep(bytes calldata performData) external;
    
    // View Functions
    function getPoolStatus() external view returns (uint256 totalPool, uint256 cycleNumber, bool isActive);
    function getMemberStatus(address _member) external view returns (bool hasContributed, bool hasBid, uint256 bidAmount);
    function getCurrentCycle() external view returns (Cycle memory);
    function getMembers() external view returns (Member[] memory);
    function isMember(address _member) external view returns (bool);
    function isChitFundComplete() external view returns (bool);
}
