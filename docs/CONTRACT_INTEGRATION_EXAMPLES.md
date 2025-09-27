# Smart Contract Integration Examples

## 📋 Overview

This document provides detailed code examples for integrating the ChitFund smart contracts with the frontend application.

## 🔧 Contract Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CHITFUND_FACTORY_ADDRESS=0x1234567890123456789012345678901234567890
NEXT_PUBLIC_FLOW_TESTNET_RPC=https://testnet.evm.nodes.onflow.org
NEXT_PUBLIC_DEPLOYMENT_BLOCK=12345678
```

### Contract Configuration (`src/lib/contracts.ts`)

```typescript
import ChitFundFactoryABI from "./abis/ChitFundFactory.json";
import ChitFundABI from "./abis/ChitFund.json";

export const CONTRACTS = {
  CHITFUND_FACTORY: {
    address: process.env.NEXT_PUBLIC_CHITFUND_FACTORY_ADDRESS!,
    abi: ChitFundFactoryABI.abi,
  },
  CHITFUND: {
    abi: ChitFundABI.abi,
  },
} as const;

export const SUPPORTED_NETWORKS = {
  545: {
    name: "Flow Testnet",
    rpcUrl: "https://testnet.evm.nodes.onflow.org",
    blockExplorer: "https://evm-testnet.flowscan.org",
    nativeCurrency: {
      name: "Flow",
      symbol: "FLOW",
      decimals: 18,
    },
  },
} as const;

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
```

## 🎣 Contract Interaction Hooks

### ChitFund Factory Hook (`src/hooks/contracts/useChitFundFactory.ts`)

```typescript
import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "~/lib/wallet";
import { CONTRACTS } from "~/lib/contracts";
import { toast } from "sonner";

export interface CreateChitFundParams {
  fundName: string;
  contributionAmount: string; // in ETH
  totalMembers: number;
  paymentToken?: string; // Optional ERC20 token address
}

export interface ChitFundInfo {
  chitFundAddress: string;
  fundName: string;
  creator: string;
  contributionAmount: bigint;
  totalMembers: number;
  paymentToken: string;
  createdAt: number;
  isActive: boolean;
}

export function useChitFundFactory() {
  const { address, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const getContract = () => {
    if (!window.ethereum) throw new Error("No ethereum provider");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();

    return new ethers.Contract(
      CONTRACTS.CHITFUND_FACTORY.address,
      CONTRACTS.CHITFUND_FACTORY.abi,
      signer,
    );
  };

  const createChitFund = async (params: CreateChitFundParams) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      const contract = await getContract();
      const contributionAmount = ethers.parseEther(params.contributionAmount);
      const paymentToken = params.paymentToken || ADDRESS_ZERO;

      // Estimate gas
      const gasEstimate = await contract.createChitFund.estimateGas(
        params.fundName,
        contributionAmount,
        params.totalMembers,
        paymentToken,
      );

      // Add 20% buffer
      const gasLimit = (gasEstimate * 120n) / 100n;

      const tx = await contract.createChitFund(
        params.fundName,
        contributionAmount,
        params.totalMembers,
        paymentToken,
        { gasLimit },
      );

      toast.success("Transaction submitted! Creating fund...");

      const receipt = await tx.wait();

      // Extract the new ChitFund address from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = contract.interface.parseLog(log);
          return parsed?.name === "ChitFundCreated";
        } catch {
          return false;
        }
      });

      if (!event) {
        throw new Error("ChitFund creation event not found");
      }

      const parsedEvent = contract.interface.parseLog(event);
      const chitFundAddress = parsedEvent?.args[0];

      toast.success("ChitFund created successfully!");

      return {
        transactionHash: tx.hash,
        chitFundAddress,
        blockNumber: receipt.blockNumber,
      };
    } catch (error: any) {
      console.error("Create ChitFund error:", error);

      if (error.code === "ACTION_REJECTED") {
        toast.error("Transaction cancelled by user");
      } else if (error.message.includes("insufficient funds")) {
        toast.error("Insufficient funds for transaction");
      } else {
        toast.error("Failed to create ChitFund. Please try again.");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserChitFunds = async (): Promise<string[]> => {
    if (!address) return [];

    try {
      const contract = await getContract();
      return await contract.getUserChitFunds(address);
    } catch (error) {
      console.error("Get user ChitFunds error:", error);
      return [];
    }
  };

  const getAllChitFunds = async (): Promise<string[]> => {
    try {
      const contract = await getContract();
      return await contract.getAllChitFunds();
    } catch (error) {
      console.error("Get all ChitFunds error:", error);
      return [];
    }
  };

  const getChitFundDetails = async (
    chitFundAddress: string,
  ): Promise<ChitFundInfo | null> => {
    try {
      const contract = await getContract();
      const details = await contract.getChitFundDetails(chitFundAddress);

      return {
        chitFundAddress: details.chitFundAddress,
        fundName: details.fundName,
        creator: details.creator,
        contributionAmount: details.contributionAmount,
        totalMembers: Number(details.totalMembers),
        paymentToken: details.paymentToken,
        createdAt: Number(details.createdAt),
        isActive: details.isActive,
      };
    } catch (error) {
      console.error("Get ChitFund details error:", error);
      return null;
    }
  };

  const joinChitFund = async (chitFundAddress: string) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      const contract = await getContract();

      const gasEstimate =
        await contract.joinChitFund.estimateGas(chitFundAddress);
      const gasLimit = (gasEstimate * 120n) / 100n;

      const tx = await contract.joinChitFund(chitFundAddress, { gasLimit });

      toast.success("Transaction submitted! Joining fund...");
      await tx.wait();
      toast.success("Successfully joined ChitFund!");

      return tx.hash;
    } catch (error: any) {
      console.error("Join ChitFund error:", error);

      if (error.message.includes("Already a member")) {
        toast.error("You are already a member of this fund");
      } else if (error.message.includes("Fund is full")) {
        toast.error("This fund is already full");
      } else if (error.message.includes("Already started")) {
        toast.error("This fund has already started");
      } else {
        toast.error("Failed to join fund. Please try again.");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createChitFund,
    getUserChitFunds,
    getAllChitFunds,
    getChitFundDetails,
    joinChitFund,
    isLoading,
  };
}
```

### Individual ChitFund Hook (`src/hooks/contracts/useChitFund.ts`)

```typescript
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useWallet } from "~/lib/wallet";
import { CONTRACTS } from "~/lib/contracts";
import { toast } from "sonner";

export interface FundData {
  fundName: string;
  contributionAmount: bigint;
  totalMembers: number;
  isEthBased: boolean;
  paymentToken: string;
  isChitFundStarted: boolean;
}

export interface CycleData {
  cycleNumber: number;
  totalPool: bigint;
  winner: string;
  winnerPayout: bigint;
  isActive: boolean;
  contributionDeadline: number;
  biddingDeadline: number;
  startTime: number;
  fundsDistributed: boolean;
}

export interface MemberData {
  wallet: string;
  hasJoined: boolean;
  hasContributed: boolean;
  hasBid: boolean;
  bidAmount: number;
  isWinner: boolean;
  canParticipate: boolean;
  joinTime: number;
  contributionCount: number;
}

export interface MemberStatus {
  hasContributed: boolean;
  hasBid: boolean;
  bidAmount: number;
}

export function useChitFund(contractAddress: string) {
  const { address, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [fundData, setFundData] = useState<FundData | null>(null);
  const [cycleData, setCycleData] = useState<CycleData | null>(null);
  const [memberStatus, setMemberStatus] = useState<MemberStatus | null>(null);

  const getContract = () => {
    if (!window.ethereum) throw new Error("No ethereum provider");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = provider.getSigner();

    return new ethers.Contract(contractAddress, CONTRACTS.CHITFUND.abi, signer);
  };

  const getReadOnlyContract = () => {
    const provider = new ethers.JsonRpcProvider(SUPPORTED_NETWORKS[545].rpcUrl);
    return new ethers.Contract(
      contractAddress,
      CONTRACTS.CHITFUND.abi,
      provider,
    );
  };

  // Fetch fund data
  const fetchFundData = async () => {
    try {
      const contract = getReadOnlyContract();

      const [
        fundName,
        contributionAmount,
        totalMembers,
        isEthBased,
        paymentToken,
        isChitFundStarted,
      ] = await Promise.all([
        contract.fundName(),
        contract.contributionAmount(),
        contract.totalMembers(),
        contract.isEthBased(),
        contract.paymentToken(),
        contract.isChitFundStarted(),
      ]);

      setFundData({
        fundName,
        contributionAmount,
        totalMembers: Number(totalMembers),
        isEthBased,
        paymentToken,
        isChitFundStarted,
      });
    } catch (error) {
      console.error("Fetch fund data error:", error);
    }
  };

  // Fetch current cycle data
  const fetchCycleData = async () => {
    try {
      const contract = getReadOnlyContract();
      const cycle = await contract.getCurrentCycle();

      setCycleData({
        cycleNumber: Number(cycle.cycleNumber),
        totalPool: cycle.totalPool,
        winner: cycle.winner,
        winnerPayout: cycle.winnerPayout,
        isActive: cycle.isActive,
        contributionDeadline: Number(cycle.contributionDeadline),
        biddingDeadline: Number(cycle.biddingDeadline),
        startTime: Number(cycle.startTime),
        fundsDistributed: cycle.fundsDistributed,
      });
    } catch (error) {
      console.error("Fetch cycle data error:", error);
    }
  };

  // Fetch member status
  const fetchMemberStatus = async () => {
    if (!address) return;

    try {
      const contract = getReadOnlyContract();
      const status = await contract.getMemberStatus(address);

      setMemberStatus({
        hasContributed: status.hasContributed,
        hasBid: status.hasBid,
        bidAmount: Number(status.bidAmount),
      });
    } catch (error) {
      console.error("Fetch member status error:", error);
    }
  };

  // Join fund
  const joinFund = async () => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    setIsLoading(true);
    try {
      const contract = await getContract();

      const gasEstimate = await contract.joinFund.estimateGas();
      const gasLimit = (gasEstimate * 120n) / 100n;

      const tx = await contract.joinFund({ gasLimit });

      toast.success("Transaction submitted! Joining fund...");
      await tx.wait();
      toast.success("Successfully joined the fund!");

      // Refresh data
      await Promise.all([
        fetchFundData(),
        fetchCycleData(),
        fetchMemberStatus(),
      ]);

      return tx.hash;
    } catch (error: any) {
      console.error("Join fund error:", error);

      if (error.message.includes("Already started")) {
        toast.error("This fund has already started");
      } else if (error.message.includes("Fund is full")) {
        toast.error("This fund is already full");
      } else if (error.message.includes("Already a member")) {
        toast.error("You are already a member of this fund");
      } else {
        toast.error("Failed to join fund. Please try again.");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Contribute to current cycle
  const contribute = async () => {
    if (!isConnected || !address || !fundData) {
      throw new Error("Wallet not connected or fund data not loaded");
    }

    setIsLoading(true);
    try {
      const contract = await getContract();

      const value = fundData.isEthBased ? fundData.contributionAmount : 0n;

      let tx;
      if (fundData.isEthBased) {
        const gasEstimate = await contract.contribute.estimateGas({ value });
        const gasLimit = (gasEstimate * 120n) / 100n;
        tx = await contract.contribute({ value, gasLimit });
      } else {
        // For ERC20 tokens, need to approve first
        // This is a simplified version - in practice, you'd handle approval separately
        const gasEstimate = await contract.contribute.estimateGas();
        const gasLimit = (gasEstimate * 120n) / 100n;
        tx = await contract.contribute({ gasLimit });
      }

      toast.success("Transaction submitted! Making contribution...");
      await tx.wait();
      toast.success("Contribution successful!");

      // Refresh data
      await Promise.all([fetchCycleData(), fetchMemberStatus()]);

      return tx.hash;
    } catch (error: any) {
      console.error("Contribute error:", error);

      if (error.message.includes("Not a member")) {
        toast.error("You must join the fund first");
      } else if (error.message.includes("Already contributed")) {
        toast.error("You have already contributed for this cycle");
      } else if (error.message.includes("Contribution period ended")) {
        toast.error("The contribution period has ended");
      } else if (error.message.includes("Incorrect ETH amount")) {
        toast.error("Incorrect contribution amount");
      } else {
        toast.error("Failed to make contribution. Please try again.");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Submit bid
  const submitBid = async (bidPercentage: number) => {
    if (!isConnected || !address) {
      throw new Error("Wallet not connected");
    }

    if (bidPercentage < 0 || bidPercentage > 30) {
      throw new Error("Bid percentage must be between 0 and 30");
    }

    setIsLoading(true);
    try {
      const contract = await getContract();

      const gasEstimate = await contract.submitBid.estimateGas(bidPercentage);
      const gasLimit = (gasEstimate * 120n) / 100n;

      const tx = await contract.submitBid(bidPercentage, { gasLimit });

      toast.success("Transaction submitted! Submitting bid...");
      await tx.wait();
      toast.success("Bid submitted successfully!");

      // Refresh data
      await Promise.all([fetchCycleData(), fetchMemberStatus()]);

      return tx.hash;
    } catch (error: any) {
      console.error("Submit bid error:", error);

      if (error.message.includes("Must contribute first")) {
        toast.error("You must contribute before bidding");
      } else if (error.message.includes("Already bid")) {
        toast.error("You have already submitted a bid for this cycle");
      } else if (error.message.includes("Not in bidding period")) {
        toast.error("Bidding is not currently open");
      } else if (error.message.includes("Bid too high")) {
        toast.error("Bid percentage cannot exceed 30%");
      } else {
        toast.error("Failed to submit bid. Please try again.");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get all members
  const getMembers = async (): Promise<MemberData[]> => {
    try {
      const contract = getReadOnlyContract();
      return await contract.getMembers();
    } catch (error) {
      console.error("Get members error:", error);
      return [];
    }
  };

  // Check if user is a member
  const isMember = async (): Promise<boolean> => {
    if (!address) return false;

    try {
      const contract = getReadOnlyContract();
      return await contract.isMember(address);
    } catch (error) {
      console.error("Is member error:", error);
      return false;
    }
  };

  // Get pool status
  const getPoolStatus = async () => {
    try {
      const contract = getReadOnlyContract();
      return await contract.getPoolStatus();
    } catch (error) {
      console.error("Get pool status error:", error);
      return null;
    }
  };

  // Initialize data on mount
  useEffect(() => {
    if (contractAddress) {
      Promise.all([
        fetchFundData(),
        fetchCycleData(),
        fetchMemberStatus(),
      ]).catch(console.error);
    }
  }, [contractAddress, address]);

  // Refresh data periodically
  useEffect(() => {
    if (!contractAddress) return;

    const interval = setInterval(() => {
      Promise.all([fetchCycleData(), fetchMemberStatus()]).catch(console.error);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [contractAddress, address]);

  return {
    // Data
    fundData,
    cycleData,
    memberStatus,

    // Actions
    joinFund,
    contribute,
    submitBid,

    // Queries
    getMembers,
    isMember,
    getPoolStatus,

    // State
    isLoading,

    // Refresh functions
    refreshData: () =>
      Promise.all([fetchFundData(), fetchCycleData(), fetchMemberStatus()]),
  };
}
```

## 🎭 Event Listening Hook (`src/hooks/contracts/useContractEvents.ts`)

```typescript
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACTS, SUPPORTED_NETWORKS } from "~/lib/contracts";

export interface ContractEvent {
  eventName: string;
  args: any[];
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
}

export function useContractEvents(
  contractAddress: string,
  startBlock?: number,
) {
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (!contractAddress) return;

    const provider = new ethers.JsonRpcProvider(SUPPORTED_NETWORKS[545].rpcUrl);
    const contract = new ethers.Contract(
      contractAddress,
      CONTRACTS.CHITFUND.abi,
      provider,
    );

    const setupEventListeners = () => {
      setIsListening(true);

      // Define event handlers
      const handleMemberJoined = (
        member: string,
        timestamp: bigint,
        event: any,
      ) => {
        const contractEvent: ContractEvent = {
          eventName: "MemberJoined",
          args: [member, timestamp],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: Number(timestamp),
        };

        setEvents((prev) => [contractEvent, ...prev]);
      };

      const handleContributionMade = (
        member: string,
        amount: bigint,
        cycle: bigint,
        event: any,
      ) => {
        const contractEvent: ContractEvent = {
          eventName: "ContributionMade",
          args: [member, amount, cycle],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: Date.now() / 1000,
        };

        setEvents((prev) => [contractEvent, ...prev]);
      };

      const handleBidSubmitted = (
        member: string,
        bidAmount: bigint,
        cycle: bigint,
        event: any,
      ) => {
        const contractEvent: ContractEvent = {
          eventName: "BidSubmitted",
          args: [member, bidAmount, cycle],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: Date.now() / 1000,
        };

        setEvents((prev) => [contractEvent, ...prev]);
      };

      const handleWinnerSelected = (
        winner: string,
        payout: bigint,
        cycle: bigint,
        event: any,
      ) => {
        const contractEvent: ContractEvent = {
          eventName: "WinnerSelected",
          args: [winner, payout, cycle],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: Date.now() / 1000,
        };

        setEvents((prev) => [contractEvent, ...prev]);
      };

      const handleFundsDistributed = (
        winner: string,
        amount: bigint,
        cycle: bigint,
        event: any,
      ) => {
        const contractEvent: ContractEvent = {
          eventName: "FundsDistributed",
          args: [winner, amount, cycle],
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber,
          timestamp: Date.now() / 1000,
        };

        setEvents((prev) => [contractEvent, ...prev]);
      };

      // Set up listeners
      contract.on("MemberJoined", handleMemberJoined);
      contract.on("ContributionMade", handleContributionMade);
      contract.on("BidSubmitted", handleBidSubmitted);
      contract.on("WinnerSelected", handleWinnerSelected);
      contract.on("FundsDistributed", handleFundsDistributed);

      return () => {
        contract.removeAllListeners();
        setIsListening(false);
      };
    };

    const cleanup = setupEventListeners();

    return cleanup;
  }, [contractAddress]);

  // Fetch historical events
  const fetchHistoricalEvents = async (fromBlock: number = 0) => {
    if (!contractAddress) return;

    try {
      const provider = new ethers.JsonRpcProvider(
        SUPPORTED_NETWORKS[545].rpcUrl,
      );
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACTS.CHITFUND.abi,
        provider,
      );

      const currentBlock = await provider.getBlockNumber();
      const toBlock = currentBlock;

      // Fetch all event types
      const eventNames = [
        "MemberJoined",
        "ContributionMade",
        "BidSubmitted",
        "WinnerSelected",
        "FundsDistributed",
      ];

      const allEvents: ContractEvent[] = [];

      for (const eventName of eventNames) {
        const filter = contract.filters[eventName]();
        const events = await contract.queryFilter(filter, fromBlock, toBlock);

        for (const event of events) {
          const block = await provider.getBlock(event.blockNumber);

          allEvents.push({
            eventName,
            args: event.args ? Array.from(event.args) : [],
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber,
            timestamp: block?.timestamp || 0,
          });
        }
      }

      // Sort by block number (most recent first)
      allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

      setEvents(allEvents);
    } catch (error) {
      console.error("Fetch historical events error:", error);
    }
  };

  return {
    events,
    isListening,
    fetchHistoricalEvents,
  };
}
```

## 🔄 Transaction Management (`src/hooks/useTransactionManager.ts`)

```typescript
import { useState, useCallback } from "react";
import { ethers } from "ethers";

export interface Transaction {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  type: string;
  timestamp: number;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

export function useTransactionManager() {
  const [transactions, setTransactions] = useState<Record<string, Transaction>>(
    {},
  );

  const addTransaction = useCallback((hash: string, type: string) => {
    setTransactions((prev) => ({
      ...prev,
      [hash]: {
        hash,
        status: "pending",
        type,
        timestamp: Date.now(),
      },
    }));
  }, []);

  const updateTransaction = useCallback(
    (hash: string, updates: Partial<Transaction>) => {
      setTransactions((prev) => ({
        ...prev,
        [hash]: {
          ...prev[hash],
          ...updates,
        },
      }));
    },
    [],
  );

  const waitForTransaction = useCallback(
    async (hash: string) => {
      try {
        if (!window.ethereum) throw new Error("No ethereum provider");

        const provider = new ethers.BrowserProvider(window.ethereum);
        const receipt = await provider.waitForTransaction(hash);

        if (receipt) {
          updateTransaction(hash, {
            status: receipt.status === 1 ? "confirmed" : "failed",
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
          });
        }

        return receipt;
      } catch (error: any) {
        updateTransaction(hash, {
          status: "failed",
          error: error.message,
        });
        throw error;
      }
    },
    [updateTransaction],
  );

  const getTransaction = useCallback(
    (hash: string) => {
      return transactions[hash];
    },
    [transactions],
  );

  const getPendingTransactions = useCallback(() => {
    return Object.values(transactions).filter((tx) => tx.status === "pending");
  }, [transactions]);

  const clearTransaction = useCallback((hash: string) => {
    setTransactions((prev) => {
      const { [hash]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    transactions,
    addTransaction,
    updateTransaction,
    waitForTransaction,
    getTransaction,
    getPendingTransactions,
    clearTransaction,
  };
}
```

## 🎨 UI Integration Examples

### Fund Creation Form Integration

```typescript
// In CreateFundPage component
import { useChitFundFactory } from "~/hooks/contracts/useChitFundFactory";
import { useTransactionManager } from "~/hooks/useTransactionManager";

export default function CreateFundPage() {
  const { createChitFund, isLoading } = useChitFundFactory();
  const { addTransaction, waitForTransaction } = useTransactionManager();

  const handleSubmit = async (formData: FundFormData) => {
    try {
      setIsCreating(true);

      const result = await createChitFund({
        fundName: formData.name,
        contributionAmount: formData.totalAmount,
        totalMembers: parseInt(formData.maxParticipants),
        paymentToken: formData.isEthBased ? undefined : formData.tokenAddress,
      });

      // Track transaction
      addTransaction(result.transactionHash, "CREATE_FUND");
      await waitForTransaction(result.transactionHash);

      // Redirect to fund page
      router.push(`/fund/${result.chitFundAddress}`);
    } catch (error) {
      console.error("Error creating fund:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Rest of component...
}
```

### Fund Dashboard Integration

```typescript
// In FundDashboard component
import { useChitFund } from '~/hooks/contracts/useChitFund';
import { useContractEvents } from '~/hooks/contracts/useContractEvents';

export default function FundDashboard({ contractAddress }: { contractAddress: string }) {
  const {
    fundData,
    cycleData,
    memberStatus,
    joinFund,
    contribute,
    submitBid,
    isLoading,
  } = useChitFund(contractAddress);

  const { events } = useContractEvents(contractAddress);

  if (!fundData || !cycleData) {
    return <div>Loading fund data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Fund Info */}
      <Card>
        <CardHeader>
          <CardTitle>{fundData.fundName}</CardTitle>
          <CardDescription>
            {ethers.formatEther(fundData.contributionAmount)} ETH per cycle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Members</p>
              <p className="text-2xl font-bold">{fundData.totalMembers}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Current Cycle</p>
              <p className="text-2xl font-bold">{cycleData.cycleNumber}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pool Amount</p>
              <p className="text-2xl font-bold">
                {ethers.formatEther(cycleData.totalPool)} ETH
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="grid gap-4">
        {!memberStatus && (
          <Button onClick={joinFund} disabled={isLoading}>
            Join Fund
          </Button>
        )}

        {memberStatus && !memberStatus.hasContributed && (
          <Button onClick={contribute} disabled={isLoading}>
            Make Contribution
          </Button>
        )}

        {memberStatus?.hasContributed && !memberStatus.hasBid && (
          <BiddingForm onSubmitBid={submitBid} isLoading={isLoading} />
        )}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {events.slice(0, 5).map((event, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{event.eventName}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(event.timestamp * 1000).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

This comprehensive integration guide provides all the necessary code examples and patterns to connect your perfect smart contracts with the frontend application. The contracts are ready - now it's just a matter of implementing these integration patterns! 🚀
