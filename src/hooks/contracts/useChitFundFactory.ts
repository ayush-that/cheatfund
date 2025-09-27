"use client";

import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACTS } from "~/lib/contracts";
import { getSigner, getProvider, parseEther } from "~/lib/web3";
import { useWallet } from "~/lib/wallet";

export interface CreateChitFundParams {
  fundName: string;
  contributionAmount: string; // In ETH
  totalMembers: number;
  paymentToken?: string; // Optional, defaults to ETH (ADDRESS_ZERO)
}

export interface ChitFundInfo {
  address: string;
  name: string;
  contributionAmount: bigint;
  totalMembers: number;
  currentMembers: number;
  isActive: boolean;
  isEthBased: boolean;
  paymentToken: string;
  creator: string;
}

export function useChitFundFactory() {
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createChitFund = useCallback(
    async (params: CreateChitFundParams) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      try {
        setLoading(true);
        setError(null);

        const signer = await getSigner();

        const contract = new ethers.Contract(
          CONTRACTS.CHITFUND_FACTORY.address,
          CONTRACTS.CHITFUND_FACTORY.abi,
          signer,
        );

        const contributionAmountWei = parseEther(params.contributionAmount);
        const paymentToken = params.paymentToken || ethers.ZeroAddress;
        const tx = await contract.createChitFund(
          params.fundName,
          contributionAmountWei,
          params.totalMembers,
          paymentToken,
        );

        const receipt = await tx.wait();

        const event = receipt.logs.find((log: any) => {
          try {
            const parsed = contract.interface.parseLog(log);
            return parsed?.name === "ChitFundCreated";
          } catch {
            return false;
          }
        });

        let newFundAddress = null;
        if (event) {
          const parsed = contract.interface.parseLog(event);
          newFundAddress = parsed?.args[0];
        }

        return {
          success: true,
          txHash: tx.hash,
          contractAddress: newFundAddress,
          receipt,
        };
      } catch (error: any) {
        const errorMessage =
          error.reason || error.message || "Failed to create chit fund";
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [address],
  );

  const getUserChitFunds = useCallback(async (): Promise<ChitFundInfo[]> => {
    if (!address) {
      return [];
    }

    try {
      const provider = getProvider();
      const contract = new ethers.Contract(
        CONTRACTS.CHITFUND_FACTORY.address,
        CONTRACTS.CHITFUND_FACTORY.abi,
        provider,
      );

      const userFunds = await contract.getUserChitFunds(address);

      const fundDetails: ChitFundInfo[] = [];

      for (const fundAddress of userFunds) {
        try {
          const details = await contract.getChitFundDetails(fundAddress);
          fundDetails.push({
            address: fundAddress,
            name: details.name,
            contributionAmount: details.contributionAmount,
            totalMembers: Number(details.totalMembers),
            currentMembers: Number(details.currentMembers),
            isActive: details.isActive,
            isEthBased: details.paymentToken === ethers.ZeroAddress,
            paymentToken: details.paymentToken,
            creator: details.creator,
          });
        } catch (error) {}
      }

      return fundDetails;
    } catch (error: any) {
      setError(error.message || "Failed to fetch chit funds");
      return [];
    }
  }, [address]);

  const getAllChitFunds = useCallback(async (): Promise<ChitFundInfo[]> => {
    try {
      const provider = getProvider();
      const contract = new ethers.Contract(
        CONTRACTS.CHITFUND_FACTORY.address,
        CONTRACTS.CHITFUND_FACTORY.abi,
        provider,
      );

      const allFunds = await contract.getAllChitFunds();

      const fundDetails: ChitFundInfo[] = [];

      for (const fundAddress of allFunds) {
        try {
          const details = await contract.getChitFundDetails(fundAddress);
          fundDetails.push({
            address: fundAddress,
            name: details.name,
            contributionAmount: details.contributionAmount,
            totalMembers: Number(details.totalMembers),
            currentMembers: Number(details.currentMembers),
            isActive: details.isActive,
            isEthBased: details.paymentToken === ethers.ZeroAddress,
            paymentToken: details.paymentToken,
            creator: details.creator,
          });
        } catch (error) {}
      }

      return fundDetails;
    } catch (error: any) {
      setError(error.message || "Failed to fetch chit funds");
      return [];
    }
  }, []);

  return {
    createChitFund,
    getUserChitFunds,
    getAllChitFunds,
    loading,
    error,
    clearError: () => setError(null),
  };
}
