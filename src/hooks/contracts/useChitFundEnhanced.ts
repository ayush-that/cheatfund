"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ethers } from "ethers";
import { CONTRACTS } from "~/lib/contracts";
import { getSigner, getProvider } from "~/lib/web3";
import { useWallet } from "~/lib/wallet";
import { dataManager, CACHE_KEYS, createCacheKey } from "~/lib/data-manager";
import type { FundDashboardData } from "./useChitFund";

export interface UseChitFundEnhancedOptions {
  enablePolling?: boolean;
  pollingInterval?: number;
  enableEventListening?: boolean;
  cacheTTL?: number;
}

export function useChitFundEnhanced(
  contractAddress: string,
  options: UseChitFundEnhancedOptions = {},
) {
  const {
    enablePolling = true,
    pollingInterval = 15000, // 15 seconds instead of 30
    enableEventListening = true,
    cacheTTL = 30000,
  } = options;

  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fundData, setFundData] = useState<FundDashboardData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const cleanupRef = useRef<(() => void) | null>(null);
  const eventListenersRef = useRef<(() => void) | null>(null);

  const fetchFundData =
    useCallback(async (): Promise<FundDashboardData | null> => {
      if (!contractAddress) return null;

      const cacheKey = CACHE_KEYS.FUND_DATA(contractAddress);

      return dataManager.get(
        cacheKey,
        async () => {
          try {
            const provider = getProvider();
            const contract = new ethers.Contract(
              contractAddress,
              CONTRACTS.CHITFUND.abi,
              provider,
            );

            const [poolStatus, currentCycle, members] = await Promise.all([
              (contract as any).getPoolStatus(),
              (contract as any).getCurrentCycle(),
              (contract as any).getMembers(),
            ]);

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
              } catch (error) {
                console.warn("Failed to fetch member status:", error);
              }
            }

            const membersData = members.map(
              (member: string, index: number) => ({
                wallet: member,
                hasContributed: false,
                hasBid: false,
                isWinner: member === currentCycle.winner,
              }),
            );

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

            return fundData;
          } catch (error: any) {
            throw new Error(error.message || "Failed to fetch fund data");
          }
        },
        {
          ttl: cacheTTL,
          retries: 2,
          retryDelay: 1000,
        },
      );
    }, [contractAddress, address, cacheTTL]);

  const loadFundData = useCallback(async () => {
    if (!contractAddress) return;

    try {
      setLoading(true);
      setError(null);

      const data = await fetchFundData();
      setFundData(data);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to load fund data");
    } finally {
      setLoading(false);
    }
  }, [contractAddress, fetchFundData]);

  // Set up event listeners for real-time updates
  useEffect(() => {
    if (!enableEventListening || !contractAddress) return;

    const setupEventListeners = () => {
      try {
        const provider = getProvider();
        const contract = new ethers.Contract(
          contractAddress,
          CONTRACTS.CHITFUND.abi,
          provider,
        );

        const events = [
          "MemberJoined",
          "ContributionMade",
          "BidSubmitted",
          "WinnerSelected",
          "FundsDistributed",
          "CycleStarted",
        ];

        const listeners: Array<{ event: string; handler: any }> = [];

        events.forEach((eventName) => {
          const handler = (...args: any[]) => {
            console.log(`Event received: ${eventName}`, args);

            // Invalidate cache and refresh data
            const cacheKey = CACHE_KEYS.FUND_DATA(contractAddress);
            dataManager.invalidate(cacheKey);

            // Debounced refresh
            setTimeout(() => {
              loadFundData();
            }, 1000);
          };

          contract.on(eventName, handler);
          listeners.push({ event: eventName, handler });
        });

        return () => {
          listeners.forEach(({ event, handler }) => {
            contract.removeListener(event, handler);
          });
        };
      } catch (error) {
        console.warn("Failed to setup event listeners:", error);
        return () => {};
      }
    };

    const cleanup = setupEventListeners();
    eventListenersRef.current = cleanup;

    return cleanup;
  }, [contractAddress, enableEventListening, loadFundData]);

  // Set up polling
  useEffect(() => {
    if (!enablePolling || !contractAddress) return;

    const cacheKey = CACHE_KEYS.FUND_DATA(contractAddress);

    const cleanup = dataManager.startPolling(
      cacheKey,
      fetchFundData,
      pollingInterval,
      {
        ttl: cacheTTL,
        backgroundRefresh: true,
      },
    );

    cleanupRef.current = cleanup;

    return cleanup;
  }, [
    contractAddress,
    enablePolling,
    pollingInterval,
    fetchFundData,
    cacheTTL,
  ]);

  // Initial data load
  useEffect(() => {
    loadFundData();
  }, [loadFundData]);

  // Listen for data updates from the data manager
  useEffect(() => {
    const cacheKey = CACHE_KEYS.FUND_DATA(contractAddress);

    const handleDataUpdate = (key: string, data: any) => {
      if (key === cacheKey) {
        setFundData(data);
        setLastUpdate(new Date());
      }
    };

    dataManager.on("data:updated", handleDataUpdate);

    return () => {
      dataManager.off("data:updated", handleDataUpdate);
    };
  }, [contractAddress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
      if (eventListenersRef.current) {
        eventListenersRef.current();
      }
    };
  }, []);

  const refreshData = useCallback(async () => {
    if (!contractAddress) return;

    const cacheKey = CACHE_KEYS.FUND_DATA(contractAddress);
    dataManager.invalidate(cacheKey);
    await loadFundData();
  }, [contractAddress, loadFundData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    fundData,
    loading,
    error,
    lastUpdate,
    refreshData,
    clearError,
    // Include all the original methods from useChitFund
    // (These would need to be imported or reimplemented)
  };
}
