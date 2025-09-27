// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IChitFund} from "./interfaces/IChitFund.sol";

contract ChitFund is IChitFund {
    
    uint256 public constant MAX_MEMBERS = 10;
    uint256 public constant MIN_MEMBERS = 3;
    uint256 public constant CYCLE_DURATION = 7 days;
    uint256 public constant BIDDING_DURATION = 3 days;
    uint256 public constant MAX_BID_PERCENTAGE = 30;
    
    string public fundName;
    uint256 public contributionAmount;
    uint256 public totalMembers;
    bool public isEthBased;
    IERC20 public paymentToken;
    bool public isChitFundStarted;
    
    Member[] public members;
    mapping(address => uint256) public memberIndex;
    mapping(address => bool) public isMemberAddress;
    Cycle public currentCycle;
    
    constructor(
        string memory _fundName,
        uint256 _contributionAmount,
        uint256 _totalMembers,
        address _paymentToken
    ) {
        fundName = _fundName;
        contributionAmount = _contributionAmount;
        totalMembers = _totalMembers;
        
        if (_paymentToken == address(0)) {
            isEthBased = true;
        } else {
            isEthBased = false;
            paymentToken = IERC20(_paymentToken);
        }
        
        currentCycle = Cycle({
            cycleNumber: 0,
            totalPool: 0,
            winner: address(0),
            winnerPayout: 0,
            isActive: false,
            contributionDeadline: 0,
            biddingDeadline: 0,
            startTime: 0,
            fundsDistributed: false
        });
    }
    
    function joinFund() external override {
        _joinFundForUser(msg.sender);
    }
    
    function joinFundFor(address user) external {
        _joinFundForUser(user);
    }
    
    function _joinFundForUser(address user) internal {
        require(!isChitFundStarted, "Already started");
        require(members.length < totalMembers, "Fund is full");
        require(!isMemberAddress[user], "Already a member");
        
        members.push(Member({
            wallet: user,
            hasJoined: true,
            hasContributed: false,
            hasBid: false,
            bidAmount: 0,
            isWinner: false,
            canParticipate: true,
            joinTime: block.timestamp,
            contributionCount: 0
        }));
        
        memberIndex[user] = members.length - 1;
        isMemberAddress[user] = true;
        
        emit MemberJoined(user, block.timestamp);
        
        if (members.length == totalMembers) {
            _startChitFund();
        }
    }
    
    function startChitFund() external {
        require(!isChitFundStarted, "Already started");
        require(members.length >= MIN_MEMBERS, "Not enough members");
        _startChitFund();
    }
    
    function _startChitFund() internal {
        isChitFundStarted = true;
        _startNewCycle();
    }
    
    function _startNewCycle() internal {
        currentCycle = Cycle({
            cycleNumber: currentCycle.cycleNumber + 1,
            totalPool: 0,
            winner: address(0),
            winnerPayout: 0,
            isActive: true,
            contributionDeadline: block.timestamp + CYCLE_DURATION,
            biddingDeadline: block.timestamp + CYCLE_DURATION + BIDDING_DURATION,
            startTime: block.timestamp,
            fundsDistributed: false
        });
        
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i].canParticipate) {
                members[i].hasContributed = false;
                members[i].hasBid = false;
                members[i].bidAmount = 0;
                members[i].contributionCount = 0;
            }
        }
    }
    
    function contribute() external payable override {
        require(isMemberAddress[msg.sender], "Not a member");
        require(isChitFundStarted && currentCycle.isActive, "Not active");
        require(block.timestamp <= currentCycle.contributionDeadline, "Contribution period ended");
        
        uint256 memberIdx = memberIndex[msg.sender];
        require(members[memberIdx].canParticipate, "Cannot participate");
        require(!members[memberIdx].hasContributed, "Already contributed");
        
        if (isEthBased) {
            require(msg.value == contributionAmount, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not accepted");
            require(paymentToken.transferFrom(msg.sender, address(this), contributionAmount), "Transfer failed");
        }
        
        members[memberIdx].hasContributed = true;
        members[memberIdx].contributionCount++;
        currentCycle.totalPool += contributionAmount;
        
        emit ContributionMade(msg.sender, contributionAmount, currentCycle.cycleNumber);
    }
    
    function submitBid(uint256 _bidPercentage) external override {
        require(isMemberAddress[msg.sender], "Not a member");
        require(isChitFundStarted && currentCycle.isActive, "Not active");
        require(block.timestamp <= currentCycle.biddingDeadline && block.timestamp > currentCycle.contributionDeadline, "Not in bidding period");
        require(_bidPercentage <= MAX_BID_PERCENTAGE, "Bid too high");
        
        uint256 memberIdx = memberIndex[msg.sender];
        require(members[memberIdx].hasContributed, "Must contribute first");
        require(!members[memberIdx].hasBid, "Already bid");
        require(members[memberIdx].canParticipate, "Cannot participate");
        
        members[memberIdx].hasBid = true;
        members[memberIdx].bidAmount = _bidPercentage;
        
        emit BidSubmitted(msg.sender, _bidPercentage, currentCycle.cycleNumber);
    }
    
    function selectWinner() external override returns (address) {
        require(block.timestamp > currentCycle.biddingDeadline, "Bidding not ended");
        require(currentCycle.winner == address(0), "Winner already selected");
        require(_allMembersContributed(), "Not all contributions received");
        
        uint256 highestBid = 0;
        address winner = address(0);
        uint256 winnerIdx = 0;
        
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i].hasBid && members[i].canParticipate && members[i].bidAmount > highestBid) {
                highestBid = members[i].bidAmount;
                winner = members[i].wallet;
                winnerIdx = i;
            }
        }
        
        if (winner == address(0)) {
            for (uint256 i = 0; i < members.length; i++) {
                if (members[i].canParticipate && members[i].hasContributed) {
                    winner = members[i].wallet;
                    winnerIdx = i;
                    highestBid = 0;
                    break;
                }
            }
        }
        
        require(winner != address(0), "No eligible winner");
        
        uint256 bidDeduction = (currentCycle.totalPool * highestBid) / 100;
        uint256 payout = currentCycle.totalPool - bidDeduction;
        
        currentCycle.winner = winner;
        currentCycle.winnerPayout = payout;
        members[winnerIdx].isWinner = true;
        members[winnerIdx].canParticipate = false;
        
        emit WinnerSelected(winner, payout, currentCycle.cycleNumber);
        
        return winner;
    }
    
    function distributeFunds() external override {
        require(currentCycle.winner != address(0), "No winner selected");
        require(!currentCycle.fundsDistributed, "Funds already distributed");
        
        currentCycle.fundsDistributed = true;
        
        if (isEthBased) {
            (bool success, ) = payable(currentCycle.winner).call{value: currentCycle.winnerPayout}("");
            require(success, "ETH transfer failed");
        } else {
            require(paymentToken.transfer(currentCycle.winner, currentCycle.winnerPayout), "Transfer failed");
        }
        
        emit FundsDistributed(currentCycle.winner, currentCycle.winnerPayout, currentCycle.cycleNumber);
        emit CycleCompleted(currentCycle.cycleNumber, currentCycle.winner);
    }
    
    function startNextCycle() external override {
        require(currentCycle.fundsDistributed, "Funds not distributed");
        
        if (currentCycle.cycleNumber >= totalMembers || _countEligibleMembers() == 0) {
            currentCycle.isActive = false;
            emit ChitFundCompleted(currentCycle.cycleNumber);
        } else {
            _startNewCycle();
        }
    }
    
    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory performData) {
        bool canSelectWinner = block.timestamp > currentCycle.biddingDeadline && 
                              currentCycle.winner == address(0) && 
                              _allMembersContributed();
        bool canDistribute = currentCycle.winner != address(0) && !currentCycle.fundsDistributed;
        bool canStartNext = currentCycle.fundsDistributed && currentCycle.cycleNumber < totalMembers;
        
        upkeepNeeded = canSelectWinner || canDistribute || canStartNext;
        
        if (canSelectWinner) {
            performData = abi.encode("SELECT_WINNER");
        } else if (canDistribute) {
            performData = abi.encode("DISTRIBUTE_FUNDS");
        } else if (canStartNext) {
            performData = abi.encode("START_NEXT_CYCLE");
        }
    }
    
    function performUpkeep(bytes calldata performData) external override {
        string memory action = abi.decode(performData, (string));
        
        if (keccak256(bytes(action)) == keccak256(bytes("SELECT_WINNER"))) {
            this.selectWinner();
            emit AutomationTriggered(block.timestamp, "SELECT_WINNER");
        } else if (keccak256(bytes(action)) == keccak256(bytes("DISTRIBUTE_FUNDS"))) {
            this.distributeFunds();
            emit AutomationTriggered(block.timestamp, "DISTRIBUTE_FUNDS");
        } else if (keccak256(bytes(action)) == keccak256(bytes("START_NEXT_CYCLE"))) {
            this.startNextCycle();
            emit AutomationTriggered(block.timestamp, "START_NEXT_CYCLE");
        }
    }
    
    function getPoolStatus() external view override returns (uint256 totalPool, uint256 cycleNumber, bool isActive) {
        return (currentCycle.totalPool, currentCycle.cycleNumber, currentCycle.isActive);
    }
    
    function getMemberStatus(address _member) external view override returns (bool hasContributed, bool hasBid, uint256 bidAmount) {
        if (!isMemberAddress[_member]) {
            return (false, false, 0);
        }
        
        uint256 idx = memberIndex[_member];
        return (members[idx].hasContributed, members[idx].hasBid, members[idx].bidAmount);
    }
    
    function getCurrentCycle() external view override returns (Cycle memory) {
        return currentCycle;
    }
    
    function getMembers() external view override returns (Member[] memory) {
        return members;
    }
    
    function isMember(address _member) external view override returns (bool) {
        return isMemberAddress[_member];
    }
    
    function isChitFundComplete() external view override returns (bool) {
        return !currentCycle.isActive && currentCycle.cycleNumber > 0;
    }
    
    function getFundStats() external view returns (
        uint256 _currentMembers,
        uint256 _completedCycles
    ) {
        return (
            members.length,
            currentCycle.cycleNumber
        );
    }
    
    function _allMembersContributed() internal view returns (bool) {
        uint256 eligibleCount = 0;
        uint256 contributedCount = 0;
        
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i].canParticipate) {
                eligibleCount++;
                if (members[i].hasContributed) {
                    contributedCount++;
                }
            }
        }
        
        return contributedCount == eligibleCount && eligibleCount > 0;
    }
    
    function _countEligibleMembers() internal view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i].canParticipate) {
                count++;
            }
        }
        return count;
    }
    
    receive() external payable {
        require(isEthBased, "ETH not accepted");
    }
    
}
