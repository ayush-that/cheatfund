"use client";

import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACTS } from "~/lib/contracts";
import { getSigner, getProvider, parseEther, formatEther } from "~/lib/web3";
import { useWallet } from "~/lib/wallet";

export interface FundDashboardData {
  fundInfo: {
    name: string;
    totalMembers: number;
    currentMembers: number;
    contributionAmount: bigint;
    isEthBased: boolean;
    paymentToken: string;
    creator: string;
    isActive: boolean;
  };
  currentCycle: {
    cycleNumber: number;
    totalPool: bigint;
    isActive: boolean;
    contributionDeadline: number;
    biddingDeadline: number;
    winner: string | null;
  };
  memberStatus: {
    isMember: boolean;
    hasContributed: boolean;
    hasBid: boolean;
    bidAmount: number;
    canParticipate: boolean;
  };
  members: Array<{
    wallet: string;
    hasContributed: boolean;
    hasBid: boolean;
    isWinner: boolean;
  }>;
}

export function useChitFund(contractAddress: string) {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fundData, setFundData] = useState<FundDashboardData | null>(null);

  const joinFund = useCallback(async () => {
    if (!address || !contractAddress) {
      throw new Error("Wallet not connected or invalid contract address");
    }

    try {
      setLoading(true);
      setError(null);

      const signer = await getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACTS.CHITFUND.abi,
        signer,
      );

      const tx = await (contract as any).joinFund();
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
      };
    } catch (error: any) {
      const errorMessage =
        error.reason || error.message || "Failed to join fund";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address, contractAddress]);

  const contribute = useCallback(async () => {
    if (!address || !contractAddress) {
      throw new Error("Wallet not connected or invalid contract address");
    }

    try {
      setLoading(true);
      setError(null);

      const signer = await getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACTS.CHITFUND.abi,
        signer,
      );

      const poolStatus = await (contract as any).getPoolStatus();
      const contributionAmount = poolStatus.contributionAmount;

      const tx = await (contract as any).contribute({
        value: contributionAmount,
      });
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
      };
    } catch (error: any) {
      const errorMessage =
        error.reason || error.message || "Failed to contribute";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address, contractAddress]);

  const submitBid = useCallback(
    async (bidPercentage: number) => {
      if (!address || !contractAddress) {
        throw new Error("Wallet not connected or invalid contract address");
      }

      if (bidPercentage < 0 || bidPercentage > 100) {
        throw new Error("Bid percentage must be between 0 and 100");
      }

      try {
        setLoading(true);
        setError(null);

        const signer = await getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          CONTRACTS.CHITFUND.abi,
          signer,
        );

        const tx = await (contract as any).submitBid(bidPercentage);
        const receipt = await tx.wait();

        return {
          success: true,
          txHash: tx.hash,
          receipt,
        };
      } catch (error: any) {
        const errorMessage =
          error.reason || error.message || "Failed to submit bid";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [address, contractAddress],
  );

  const getFundData =
    useCallback(async (): Promise<FundDashboardData | null> => {
      if (!contractAddress) {
        return null;
      }

      try {
        const provider = getProvider();
        const contract = new ethers.Contract(
          contractAddress,
          CONTRACTS.CHITFUND.abi,
          provider,
        );

        const poolStatus = await (contract as any).getPoolStatus();
        const currentCycle = await (contract as any).getCurrentCycle();
        const members = await (contract as any).getMembers();

        let memberStatus = {
          isMember: false,
          hasContributed: false,
          hasBid: false,
          bidAmount: 0,
          canParticipate: false,
        };

        if (address) {
          try {
            const status = await (contract as any).getMemberStatus(address);
            memberStatus = {
              isMember: status.isMember,
              hasContributed: status.hasContributed,
              hasBid: status.hasBid,
              bidAmount: Number(status.bidAmount),
              canParticipate: status.canParticipate,
            };
          } catch (error) {}
        }

        const membersData = members.map((member: string, index: number) => ({
          wallet: member,
          hasContributed: false,
          hasBid: false,
          isWinner: member === currentCycle.winner,
        }));

        const fundData: FundDashboardData = {
          fundInfo: {
            name: poolStatus.name || "Chit Fund",
            totalMembers: Number(poolStatus.totalMembers),
            currentMembers: Number(poolStatus.currentMembers),
            contributionAmount: poolStatus.contributionAmount,
            isEthBased: poolStatus.paymentToken === ethers.ZeroAddress,
            paymentToken: poolStatus.paymentToken,
            creator: poolStatus.creator,
            isActive: poolStatus.isActive,
          },
          currentCycle: {
            cycleNumber: Number(currentCycle.cycleNumber),
            totalPool: currentCycle.totalPool,
            isActive: currentCycle.isActive,
            contributionDeadline: Number(currentCycle.contributionDeadline),
            biddingDeadline: Number(currentCycle.biddingDeadline),
            winner:
              currentCycle.winner === ethers.ZeroAddress
                ? null
                : currentCycle.winner,
          },
          memberStatus,
          members: membersData,
        };

        setFundData(fundData);
        return fundData;
      } catch (error: any) {
        setError(error.message || "Failed to fetch fund data");
        return null;
      }
    }, [contractAddress, address]);

  useEffect(() => {
    if (contractAddress) {
      getFundData();
    }
  }, [contractAddress, address, getFundData]);

  return {
    joinFund,
    contribute,
    submitBid,
    getFundData,
    fundData,
    loading,
    error,
    clearError: () => setError(null),
  };
}
