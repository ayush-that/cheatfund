// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IChitFundFactory
 * @dev Interface for the ChitFundFactory contract
 */
interface IChitFundFactory {
    struct ChitFundInfo {
        address chitFundAddress;
        string fundName;
        address creator;
        uint256 contributionAmount;
        uint256 totalMembers;
        address paymentToken;
        uint256 createdAt;
        bool isActive;
    }
    
    // Events
    event ChitFundCreated(
        address indexed chitFund,
        address indexed creator,
        string fundName,
        uint256 contributionAmount,
        uint256 totalMembers,
        address paymentToken,
        uint256 timestamp
    );
    
    
    // Core Functions
    function createChitFund(
        string memory _fundName,
        uint256 _contributionAmount,
        uint256 _totalMembers,
        address _paymentToken
    ) external returns (address chitFundAddress);
    
    function joinChitFund(address _chitFundAddress) external;
    
    // View Functions
    function getAllChitFunds() external view returns (address[] memory);
    function getUserChitFunds(address _user) external view returns (address[] memory);
    function getChitFundCount() external view returns (uint256);
    function getChitFundDetails(address _chitFund) external view returns (ChitFundInfo memory);
    function isChitFund(address _address) external view returns (bool);
}
