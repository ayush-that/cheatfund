// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ChitFund} from "./ChitFund.sol";

contract ChitFundFactory {
    
    address[] public chitFunds;
    mapping(address => bool) public isChitFund;
    mapping(address => address[]) public userChitFunds;
    
    uint256 public totalChitFundsCreated;

    event ChitFundCreated(
        address indexed chitFund,
        address indexed creator,
        string fundName,
        uint256 contributionAmount,
        uint256 totalMembers,
        address paymentToken,
        uint256 timestamp
    );
    
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
    
    mapping(address => ChitFundInfo) public chitFundInfo;
    
    function createChitFund(
        string memory _fundName,
        uint256 _contributionAmount,
        uint256 _totalMembers,
        address _paymentToken
    ) external returns (address chitFundAddress) {
        ChitFund newChitFund = new ChitFund(
            _fundName,
            _contributionAmount,
            _totalMembers,
            _paymentToken
        );
        
        chitFundAddress = address(newChitFund);
        
        // Store chit fund information
        chitFunds.push(chitFundAddress);
        isChitFund[chitFundAddress] = true;
        userChitFunds[msg.sender].push(chitFundAddress);
        
        chitFundInfo[chitFundAddress] = ChitFundInfo({
            chitFundAddress: chitFundAddress,
            fundName: _fundName,
            creator: msg.sender,
            contributionAmount: _contributionAmount,
            totalMembers: _totalMembers,
            paymentToken: _paymentToken,
            createdAt: block.timestamp,
            isActive: true
        });
        
        // Update statistics
        totalChitFundsCreated++;
        
        emit ChitFundCreated(
            chitFundAddress,
            msg.sender,
            _fundName,
            _contributionAmount,
            _totalMembers,
            _paymentToken,
            block.timestamp
        );
        
        return chitFundAddress;
    }

    function joinChitFund(address _chitFundAddress) external {
        require(isChitFund[_chitFundAddress], "Invalid chit fund");
        
        ChitFund chitFund = ChitFund(payable(_chitFundAddress));
        chitFund.joinFundFor(msg.sender);
    }
    
    function getAllChitFunds() external view returns (address[] memory) {
        return chitFunds;
    }
    
    
    function getUserChitFunds(address _user) external view returns (address[] memory) {
        return userChitFunds[_user];
    }
    
    function getChitFundCount() external view returns (uint256) {
        return chitFunds.length;
    }
    
    function getChitFundDetails(address _chitFund) external view returns (ChitFundInfo memory) {
        require(isChitFund[_chitFund], "Invalid chit fund");
        return chitFundInfo[_chitFund];
    }
    
}
