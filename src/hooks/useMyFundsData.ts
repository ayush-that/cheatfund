"use client";

import { useState, useEffect } from "react";
import { useWallet } from "~/lib/wallet";
import { useChitFundFactory } from "./contracts/useChitFundFactory";
import { getNextPaymentDate } from "~/lib/date-utils";

export interface MyFundsData {
  participatingFunds: Array<{
    id: string;
    name: string;
    organizer: string;
    contractAddress: string;
    contributionAmount: string;
    totalAmount: string;
    duration: number;
    currentParticipants: number;
    maxParticipants: number;
    currentCycle: number;
    status: "recruiting" | "active" | "bidding" | "contribution" | "completed";
    nextPaymentDate: string | null;
    userPosition: number;
    hasContributed: boolean;
    hasBid: boolean;
    isWinner: boolean;
    monthlyAmount: string;
    nextAction: "contribute" | "bid" | "wait" | "none";
  }>;
  organizingFunds: Array<{
    id: string;
    name: string;
    organizer: string;
    contractAddress: string;
    totalAmount: string;
    duration: number;
    currentParticipants: number;
    maxParticipants: number;
    currentCycle: number;
    status: "recruiting" | "active" | "bidding" | "contribution" | "completed";
    memberCount: number;
    totalBids: number;
    nextAction:
      | "manage"
      | "view_bids"
      | "add_members"
      | "close_bidding"
      | "none";
  }>;
}

export function useMyFundsData() {
  const { address } = useWallet();
  const { getUserChitFunds } = useChitFundFactory();
  const [data, setData] = useState<MyFundsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyFundsData = async () => {
    if (!address) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let contractFunds: any[] = [];
      try {
        const result = await getUserChitFunds();
        contractFunds = Array.isArray(result) ? result : [];
      } catch (contractError) {
        contractFunds = [];
      }

      let databaseFunds: any[] = [];
      try {
        const dbResponse = await fetch(
          `/api/funds/user?address=${encodeURIComponent(address)}`,
        );
        if (dbResponse.ok) {
          const { data } = await dbResponse.json();
          databaseFunds = data || [];

          for (const fund of databaseFunds) {
            if (fund.organizer?.toLowerCase() === address.toLowerCase()) {
              try {
                await fetch("/api/funds/fix-organizer-members", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    contractAddress: fund.contractAddress,
                  }),
                });
              } catch (fixError) {}
            }
          }
        }
      } catch (dbError) {
        databaseFunds = [];
      }

      const allFunds = [...contractFunds, ...databaseFunds];
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

      const participatingFunds = uniqueFunds
        .filter((fund) => {
          const isMemberInDB = fund.members?.some(
            (member: any) =>
              member.memberAddress?.toLowerCase() === address.toLowerCase(),
          );
          const isOrganizer =
            fund.organizer?.toLowerCase() === address.toLowerCase();

          return isMemberInDB && !isOrganizer;
        })
        .map((fund) => ({
          id: fund.address || fund.contractAddress || fund.id,
          name: fund.name,
          organizer: fund.creator || fund.organizer,
          contractAddress: fund.address || fund.contractAddress,
          contributionAmount: fund.contributionAmount?.toString() || "0",
          totalAmount: fund.totalAmount?.toString() || "0",
          duration: fund.duration || 12,
          currentParticipants: fund.currentMembers || fund.members?.length || 0,
          maxParticipants: fund.totalMembers || fund.maxParticipants,
          currentCycle: 1,
          status: getFundStatus(fund),
          nextPaymentDate: getNextPaymentDateForFund(fund),
          userPosition: getUserPosition(fund, address),
          hasContributed: fund.hasContributed || false,
          hasBid: fund.hasBid || false,
          isWinner: fund.isWinner || false,
          monthlyAmount: calculateMonthlyAmount(fund),
          nextAction: getNextAction(fund, address),
        }));

      const organizingFunds = uniqueFunds
        .filter(
          (fund) => fund.organizer?.toLowerCase() === address.toLowerCase(),
        )
        .map((fund) => {
          const memberCount = Math.max(
            fund.currentMembers || fund.members?.length || 0,
            1,
          );

          return {
            id: fund.address || fund.contractAddress || fund.id,
            name: fund.name,
            organizer: fund.organizer || fund.creator || address,
            contractAddress: fund.address || fund.contractAddress,
            totalAmount: fund.totalAmount?.toString() || "0",
            duration: fund.duration || 12,
            currentParticipants: memberCount,
            maxParticipants: fund.totalMembers || fund.maxParticipants,
            currentCycle: 1,
            status: getFundStatus(fund),
            memberCount: memberCount,
            totalBids: 0,
            nextAction: getOrganizerNextAction(fund),
          };
        });

      setData({
        participatingFunds,
        organizingFunds,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch funds");
      setData({
        participatingFunds: [],
        organizingFunds: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyFundsData();
  }, [address]);

  return {
    data,
    loading,
    error,
    refetch: fetchMyFundsData,
  };
}

function getFundStatus(
  fund: any,
): "recruiting" | "active" | "bidding" | "contribution" | "completed" {
  if (!fund.isActive) return "completed";

  const now = Math.floor(Date.now() / 1000);
  const contributionDeadline = fund.contributionDeadline || now + 86400;
  const biddingDeadline = fund.biddingDeadline || now + 172800;

  if (now <= contributionDeadline) {
    return "contribution";
  } else if (now <= biddingDeadline) {
    return "bidding";
  } else {
    return "active";
  }
}

function getNextPaymentDateForFund(fund: any): string | null {
  return getNextPaymentDate();
}

function getUserPosition(fund: any, address: string): number {
  return 1;
}

function calculateMonthlyAmount(fund: any): string {
  const totalAmount = Number(fund.totalAmount || 0);
  const maxParticipants = Number(fund.maxParticipants || 1);
  return (totalAmount / maxParticipants).toFixed(2);
}

function getNextAction(
  fund: any,
  address: string,
): "contribute" | "bid" | "wait" | "none" {
  const status = getFundStatus(fund);

  if (status === "contribution" && !fund.hasContributed) {
    return "contribute";
  } else if (status === "bidding" && !fund.hasBid) {
    return "bid";
  } else if (status === "active") {
    return "wait";
  }

  return "none";
}

function getOrganizerNextAction(
  fund: any,
): "manage" | "view_bids" | "add_members" | "close_bidding" | "none" {
  const status = getFundStatus(fund);

  if (status === "bidding") {
    return "close_bidding";
  } else if (status === "recruiting") {
    return "add_members";
  } else if (status === "active") {
    return "manage";
  }

  return "none";
}
