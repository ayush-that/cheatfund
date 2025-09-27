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

      const contractAddress = process.env.NEXT_PUBLIC_CHITFUND_FACTORY_ADDRESS;
      if (!contractAddress) {
        const fallbackData: HomePageData = {
          userStats: {
            totalInvested: "0",
            totalReturns: "0",
            activeFunds: 0,
            completedFunds: 0,
            successRate: 0,
            nextPaymentDue: null,
            monthlyCommitment: "0",
          },
          recentActivities: [],
          activeFunds: [],
          publicFunds: [],
        };
        setData(fallbackData);
        setLoading(false);
        return;
      }

      const contractTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Contract call timeout")), 10000),
      );

      let userFunds: any[] = [];
      try {
        userFunds = await Promise.race([getUserChitFunds(), contractTimeout]);
      } catch (contractError) {
        userFunds = [];
      }

      let publicFunds: any[] = [];
      try {
        const publicFundsResponse = await fetch(
          "/api/funds/public?limit=20&offset=0",
        );
        if (publicFundsResponse.ok) {
          const { data } = await publicFundsResponse.json();
          publicFunds = data || [];
        }
      } catch (apiError) {
        publicFunds = [];
      }

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

      const fallbackData: HomePageData = {
        userStats: {
          totalInvested: "0",
          totalReturns: "0",
          activeFunds: 0,
          completedFunds: 0,
          successRate: 0,
          nextPaymentDue: null,
          monthlyCommitment: "0",
        },
        recentActivities: [],
        activeFunds: [],
        publicFunds: [],
      };
      setData(fallbackData);
    } finally {
      setLoading(false);
    }
  }, [address, getUserChitFunds]);

  useEffect(() => {
    fetchHomePageData();

    const timeout = setTimeout(() => {
      if (loading) {
        const fallbackData: HomePageData = {
          userStats: {
            totalInvested: "0",
            totalReturns: "0",
            activeFunds: 0,
            completedFunds: 0,
            successRate: 0,
            nextPaymentDue: null,
            monthlyCommitment: "0",
          },
          recentActivities: [],
          activeFunds: [],
          publicFunds: [],
        };
        setData(fallbackData);
        setLoading(false);
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [fetchHomePageData, loading]);

  return {
    data,
    loading,
    error,
    refetch: fetchHomePageData,
  };
}
