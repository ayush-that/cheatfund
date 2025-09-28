"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { dataManager, CACHE_KEYS } from "~/lib/data-manager";
import {
  getFlowBalanceWithRetry,
  convertEthToFlowAddress,
} from "~/lib/flow-balance";

export interface UseFlowBalanceEnhancedOptions {
  network?: "testnet" | "mainnet";
  refreshInterval?: number;
  enablePolling?: boolean;
  cacheTTL?: number;
  retries?: number;
}

export interface UseFlowBalanceEnhancedReturn {
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
}

export function useFlowBalanceEnhanced(
  address: string | null,
  options: UseFlowBalanceEnhancedOptions = {},
): UseFlowBalanceEnhancedReturn {
  const {
    network = "testnet",
    refreshInterval = 60000, // 1 minute instead of 30 seconds
    enablePolling = true,
    cacheTTL = 60000,
    retries = 3,
  } = options;

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const cleanupRef = useRef<(() => void) | null>(null);

  const fetchBalance = useCallback(async (): Promise<number> => {
    if (!address) {
      return 0;
    }

    const cacheKey = CACHE_KEYS.FLOW_BALANCE(address);

    return dataManager.get(
      cacheKey,
      async () => {
        try {
          const flowAddress = convertEthToFlowAddress(address);
          const flowBalance = await getFlowBalanceWithRetry(
            flowAddress,
            retries,
          );
          return flowBalance;
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch FLOW balance";
          throw new Error(errorMessage);
        }
      },
      {
        ttl: cacheTTL,
        retries: 2,
        retryDelay: 1000,
      },
    );
  }, [address, network, retries, cacheTTL]);

  const loadBalance = useCallback(async () => {
    if (!address) {
      setBalance(0);
      setError(null);
      setLastUpdate(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const balanceValue = await fetchBalance();
      setBalance(balanceValue);
      setLastUpdate(new Date());
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch FLOW balance";
      setError(errorMessage);
      console.error("useFlowBalanceEnhanced error:", err);
    } finally {
      setLoading(false);
    }
  }, [address, fetchBalance]);

  // Set up polling
  useEffect(() => {
    if (!enablePolling || !address) return;

    const cacheKey = CACHE_KEYS.FLOW_BALANCE(address);

    const cleanup = dataManager.startPolling(
      cacheKey,
      fetchBalance,
      refreshInterval,
      {
        ttl: cacheTTL,
        backgroundRefresh: true,
      },
    );

    cleanupRef.current = cleanup;

    return cleanup;
  }, [address, enablePolling, refreshInterval, fetchBalance, cacheTTL]);

  // Initial data load
  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  // Listen for data updates from the data manager
  useEffect(() => {
    if (!address) return;

    const cacheKey = CACHE_KEYS.FLOW_BALANCE(address);

    const handleDataUpdate = (key: string, data: any) => {
      if (key === cacheKey) {
        setBalance(data);
        setLastUpdate(new Date());
      }
    };

    dataManager.on("data:updated", handleDataUpdate);

    return () => {
      dataManager.off("data:updated", handleDataUpdate);
    };
  }, [address]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  const refetch = useCallback(async () => {
    if (!address) return;

    const cacheKey = CACHE_KEYS.FLOW_BALANCE(address);
    dataManager.invalidate(cacheKey);
    await loadBalance();
  }, [address, loadBalance]);

  return {
    balance,
    loading,
    error,
    lastUpdate,
    refetch,
  };
}
