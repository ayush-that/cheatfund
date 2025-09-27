"use client";

import { useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACTS } from "~/lib/contracts";
import { getSigner, getProvider } from "~/lib/web3";
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

      const provider = getProvider();
      const readContract = new ethers.Contract(
        contractAddress,
        CONTRACTS.CHITFUND.abi,
        provider,
      );

      try {
        const code = await provider.getCode(contractAddress);
        if (code === "0x") {
          throw new Error("No contract found at this address");
        }
      } catch (error) {
        throw new Error("Contract not found at the specified address");
      }

      try {
        const fundName = await (readContract as any).fundName();

        const contributionAmount = await (
          readContract as any
        ).contributionAmount();
        const totalMembers = await (readContract as any).totalMembers();
      } catch (error) {
        throw new Error(
          "Invalid contract address. This appears to be a factory contract, not a ChitFund instance. Please use the correct ChitFund contract address.",
        );
      }

      const isChitFundStarted = await (readContract as any).isChitFundStarted();
      if (isChitFundStarted) {
        throw new Error(
          "This fund has already started and is no longer accepting new members",
        );
      }

      let poolStatus;
      try {
        poolStatus = await (readContract as any).getPoolStatus();
      } catch (error) {
        throw new Error(
          "Failed to get fund status. The contract may not be properly deployed or accessible.",
        );
      }

      if (poolStatus.currentMembers >= poolStatus.totalMembers) {
        throw new Error("This fund is full and cannot accept more members");
      }

      const isMember = await (readContract as any).isMemberAddress(address);
      if (isMember) {
        throw new Error("You are already a member of this fund");
      }

      if (isChitFundStarted && !poolStatus.isActive) {
        throw new Error(
          "This fund is not active and cannot accept new members",
        );
      }

      const signer = await getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACTS.CHITFUND.abi,
        signer,
      );

      const tx = await (contract as any).joinFund();
      const receipt = await tx.wait();

      if (receipt.status === 1) {
        try {
          const fundResponse = await fetch(
            `/api/funds/public?contractAddress=${contractAddress}`,
          );
          if (fundResponse.ok) {
            const { data: funds } = await fundResponse.json();
            const fund = funds?.find(
              (f: any) => f.contractAddress === contractAddress,
            );

            if (fund) {
              await fetch("/api/funds/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  fundId: fund.id,
                  memberAddress: address,
                }),
              });
            }
          }
        } catch (dbError) {
          console.warn("Failed to add member to database:", dbError);
        }
      }

      return {
        success: true,
        txHash: tx.hash,
        receipt,
      };
    } catch (error: any) {
      let errorMessage = "Failed to join fund";

      if (error.message?.includes("Invalid contract address")) {
        errorMessage = error.message;
      } else if (error.message?.includes("Already started")) {
        errorMessage =
          "This fund has already started and is no longer accepting new members";
      } else if (error.message?.includes("Fund is full")) {
        errorMessage = "This fund is full and cannot accept more members";
      } else if (error.message?.includes("Already a member")) {
        errorMessage = "You are already a member of this fund";
      } else if (error.message?.includes("not active")) {
        errorMessage = "This fund is not active and cannot accept new members";
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.data) {
        try {
          const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
            ["string"],
            error.data,
          );
          errorMessage = decoded[0];
        } catch {
          errorMessage = "Transaction failed: " + error.data;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

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

  const checkCanJoin = useCallback(async (): Promise<{
    canJoin: boolean;
    reason?: string;
    fundStatus: {
      isStarted: boolean;
      isFull: boolean;
      isActive: boolean;
      isMember: boolean;
    };
  }> => {
    if (!address || !contractAddress) {
      return {
        canJoin: false,
        reason: "Wallet not connected",
        fundStatus: {
          isStarted: false,
          isFull: false,
          isActive: false,
          isMember: false,
        },
      };
    }

    try {
      const provider = getProvider();
      const contract = new ethers.Contract(
        contractAddress,
        CONTRACTS.CHITFUND.abi,
        provider,
      );

      try {
        const code = await provider.getCode(contractAddress);
        if (code === "0x") {
          throw new Error("No contract found at this address");
        }
      } catch (error) {
        throw new Error("Contract not found at the specified address");
      }

      let isChitFundStarted, poolStatus, isMember;

      try {
        isChitFundStarted = await (contract as any).isChitFundStarted();
      } catch (error) {
        throw new Error("Failed to check fund status");
      }

      try {
        poolStatus = await (contract as any).getPoolStatus();
      } catch (error) {
        throw new Error(
          "Failed to get fund status. The contract may not be properly deployed or accessible.",
        );
      }

      try {
        isMember = await (contract as any).isMemberAddress(address);
      } catch (error) {
        throw new Error("Failed to check membership status");
      }

      const isFull = poolStatus.currentMembers >= poolStatus.totalMembers;

      let canJoin = true;
      let reason = "";

      if (isChitFundStarted) {
        canJoin = false;
        reason = "Fund has already started";
      } else if (isFull) {
        canJoin = false;
        reason = "Fund is full";
      } else if (isMember) {
        canJoin = false;
        reason = "Already a member";
      } else if (isChitFundStarted && !poolStatus.isActive) {
        canJoin = false;
        reason = "Fund is not active";
      }

      return {
        canJoin,
        reason,
        fundStatus: {
          isStarted: isChitFundStarted,
          isFull,
          isActive: !isChitFundStarted || poolStatus.isActive,
          isMember,
        },
      };
    } catch (error) {
      return {
        canJoin: false,
        reason: "Unable to check fund status",
        fundStatus: {
          isStarted: false,
          isFull: false,
          isActive: false,
          isMember: false,
        },
      };
    }
  }, [address, contractAddress]);

  const selectWinner = useCallback(async () => {
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

      const tx = await (contract as any).selectWinner();
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
      };
    } catch (error: any) {
      const errorMessage =
        error.reason || error.message || "Failed to select winner";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address, contractAddress]);

  const distributeFunds = useCallback(async () => {
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

      const tx = await (contract as any).distributeFunds();
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
      };
    } catch (error: any) {
      const errorMessage =
        error.reason || error.message || "Failed to distribute funds";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address, contractAddress]);

  const startNextCycle = useCallback(async () => {
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

      const tx = await (contract as any).startNextCycle();
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: tx.hash,
        receipt,
      };
    } catch (error: any) {
      const errorMessage =
        error.reason || error.message || "Failed to start next cycle";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address, contractAddress]);

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
    selectWinner,
    distributeFunds,
    startNextCycle,
    getFundData,
    checkCanJoin,
    fundData,
    loading,
    error,
    clearError: () => setError(null),
  };
}
