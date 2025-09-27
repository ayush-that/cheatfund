"use client";

import { useState, useEffect } from "react";
import { useWallet } from "~/lib/wallet";
import { useChitFundFactory } from "./contracts/useChitFundFactory";
import { formatDate } from "~/lib/date-utils";

export interface HomePageData {
  userStats: {
    totalBalance: string;
    totalInvested: string;
    totalReturns: string;
    activeFunds: number;
    completedFunds: number;
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
  const { address, balance } = useWallet();
  const { getUserChitFunds, getAllChitFunds } = useChitFundFactory();
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomePageData = async () => {
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
            totalBalance: "0",
            totalInvested: "0",
            totalReturns: "0",
            activeFunds: 0,
            completedFunds: 0,
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
      let databaseFunds: any[] = [];

      try {
        const result = await Promise.race([
          getUserChitFunds(),
          contractTimeout,
        ]);
        userFunds = Array.isArray(result) ? result : [];
      } catch (contractError) {
        console.warn(
          "Contract funds fetch failed (continuing with empty array):",
          contractError,
        );
        userFunds = [];
      }

      try {
        const dbResponse = await fetch(
          `/api/funds/user?address=${encodeURIComponent(address)}`,
        );
        if (dbResponse.ok) {
          const { data } = await dbResponse.json();
          databaseFunds = data || [];
        } else {
          console.warn("Database response not ok:", dbResponse.status);
        }
      } catch (dbError) {
        console.warn(
          "Database funds fetch failed (continuing with empty array):",
          dbError,
        );
        databaseFunds = [];
      }

      const allFunds = [...userFunds, ...databaseFunds];
      const uniqueFunds = allFunds.filter(
        (fund, index, self) =>
          index ===
          self.findIndex(
            (f) =>
              f.address === fund.address ||
              f.contractAddress === fund.contractAddress ||
              f.id === fund.id,
          ),
      );

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

      const totalInvested = uniqueFunds.reduce((sum, fund) => {
        const contributionAmount = Number(
          fund.contributionAmount || fund.totalAmount,
        );
        return sum + contributionAmount;
      }, 0);

      const validTotalInvested = isNaN(totalInvested) ? 0 : totalInvested;

      const activeFunds = uniqueFunds.filter((fund) => fund.isActive !== false);
      const completedFunds = uniqueFunds.filter(
        (fund) => fund.isActive === false,
      );

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
        id: fund.address || fund.contractAddress || fund.id,
        name: fund.name,
        organizer: fund.creator || fund.organizer,
        totalAmount: fund.totalAmount
          ? Number(fund.totalAmount).toString()
          : (
              Number(fund.contributionAmount) *
              Number(fund.totalMembers || fund.maxParticipants)
            ).toString(),
        duration: fund.duration || 12,
        currentParticipants: Number(
          fund.currentMembers || fund.members?.length || 0,
        ),
        maxParticipants: Number(fund.totalMembers || fund.maxParticipants),
        nextBidDate: null,
        status: "active" as const,
        contractAddress: fund.address || fund.contractAddress,
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

      const walletBalance = balance || "0";

      const homePageData: HomePageData = {
        userStats: {
          totalBalance: walletBalance,
          totalInvested: validTotalInvested.toString(),
          totalReturns: "0",
          activeFunds: activeFunds.length,
          completedFunds: completedFunds.length,
          nextPaymentDue: null,
          monthlyCommitment: validTotalInvested.toString(),
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
          totalBalance: "0",
          totalInvested: "0",
          totalReturns: "0",
          activeFunds: 0,
          completedFunds: 0,
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
  };

  useEffect(() => {
    fetchHomePageData();

    const timeout = setTimeout(() => {
      if (loading) {
        const fallbackData: HomePageData = {
          userStats: {
            totalBalance: "0",
            totalInvested: "0",
            totalReturns: "0",
            activeFunds: 0,
            completedFunds: 0,
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
  }, [address]);

  return {
    data,
    loading,
    error,
    refetch: fetchHomePageData,
  };
}
