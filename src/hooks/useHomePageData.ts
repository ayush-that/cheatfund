"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "~/lib/wallet";
import { useChitFundFactory } from "./contracts/useChitFundFactory";

export interface HomePageData {
  userStats: {
    totalInvested: string;
    totalReturns: string;
    activeFunds: number;
    completedFunds: number;
    successRate: number;
    nextPaymentDue: string | null;
    monthlyCommitment: string;
  };
  recentActivities: Array<{
    id: string;
    type: "bid_won" | "payment" | "fund_joined" | "fund_created";
    title: string;
    description: string;
    amount?: string;
    timestamp: string;
    status: "completed" | "pending" | "failed";
    fundName: string;
  }>;
  activeFunds: Array<{
    id: string;
    name: string;
    organizer: string;
    totalAmount: string;
    duration: number;
    currentParticipants: number;
    maxParticipants: number;
    nextBidDate: string | null;
    status: "recruiting" | "active" | "completed";
    contractAddress: string;
  }>;
  publicFunds: Array<{
    id: string;
    name: string;
    description: string;
    organizer: string;
    totalAmount: string;
    duration: number;
    currentParticipants: number;
    maxParticipants: number;
    category: string;
    isPublic: boolean;
    contractAddress: string;
  }>;
}

export function useHomePageData() {
  const { address } = useWallet();
  const { getUserChitFunds, getAllChitFunds } = useChitFundFactory();
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomePageData = useCallback(async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const userFunds = await getUserChitFunds();

      const publicFundsResponse = await fetch(
        "/api/funds/public?limit=20&offset=0",
      );
      if (!publicFundsResponse.ok) {
        throw new Error("Failed to fetch public funds");
      }
      const { data: publicFunds } = await publicFundsResponse.json();

      const totalInvested = userFunds.reduce((sum, fund) => {
        return (
          sum + Number(fund.contributionAmount) * Number(fund.currentMembers)
        );
      }, 0);

      const activeFunds = userFunds.filter((fund) => fund.isActive);
      const completedFunds = userFunds.filter((fund) => !fund.isActive);

      const recentActivities = [
        {
          id: "1",
          type: "fund_created" as const,
          title: "Fund Created",
          description: "You created a new chit fund",
          timestamp: "2 hours ago",
          status: "completed" as const,
          fundName: "Your Fund",
        },
      ];

      const formattedActiveFunds = activeFunds.map((fund, index) => ({
        id: fund.address,
        name: fund.name,
        organizer: fund.creator,
        totalAmount: (
          Number(fund.contributionAmount) * Number(fund.totalMembers)
        ).toString(),
        duration: 12,
        currentParticipants: Number(fund.currentMembers),
        maxParticipants: Number(fund.totalMembers),
        nextBidDate: null,
        status: "active" as const,
        contractAddress: fund.address,
      }));

      const formattedPublicFunds = publicFunds.map((fund: any) => ({
        id: fund.id,
        name: fund.name,
        description: fund.description || "",
        organizer: fund.organizer,
        totalAmount: fund.totalAmount.toString(),
        duration: fund.duration || 12,
        currentParticipants: fund.members?.length || 0,
        maxParticipants: fund.maxParticipants,
        category: fund.category || "General",
        isPublic: fund.isPublic,
        contractAddress: fund.contractAddress,
      }));

      const homePageData: HomePageData = {
        userStats: {
          totalInvested: totalInvested.toString(),
          totalReturns: "0",
          activeFunds: activeFunds.length,
          completedFunds: completedFunds.length,
          successRate: 95,
          nextPaymentDue: null,
          monthlyCommitment: totalInvested.toString(),
        },
        recentActivities,
        activeFunds: formattedActiveFunds,
        publicFunds: formattedPublicFunds,
      };

      setData(homePageData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [address, getUserChitFunds]);

  useEffect(() => {
    fetchHomePageData();
  }, [fetchHomePageData]);

  return {
    data,
    loading,
    error,
    refetch: fetchHomePageData,
  };
}
