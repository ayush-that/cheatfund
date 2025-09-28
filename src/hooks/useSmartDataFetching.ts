"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { dataManager, CACHE_KEYS, createCacheKey } from "~/lib/data-manager";
import { connectionManager } from "~/lib/connection-manager";

export interface SmartFetchOptions {
  ttl?: number;
  enablePolling?: boolean;
  pollingInterval?: number;
  enableEventListening?: boolean;
  retries?: number;
  retryDelay?: number;
  backgroundRefresh?: boolean;
  forceRefresh?: boolean;
}

export interface SmartFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

export function useSmartDataFetching<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: SmartFetchOptions = {},
): SmartFetchResult<T> {
  const {
    ttl = 30000,
    enablePolling = true,
    pollingInterval = 15000,
    enableEventListening = false,
    retries = 3,
    retryDelay = 1000,
    backgroundRefresh = true,
    forceRefresh = false,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const cleanupRef = useRef<(() => void) | null>(null);
  const eventListenersRef = useRef<(() => void) | null>(null);

  const fetchData = useCallback(async (): Promise<T> => {
    return dataManager.get(key, fetcher, {
      ttl,
      retries,
      retryDelay,
      backgroundRefresh,
      forceRefresh,
    });
  }, [key, fetcher, ttl, retries, retryDelay, backgroundRefresh, forceRefresh]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchData();
      setData(result);
      setLastUpdate(new Date());
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  // Set up polling
  useEffect(() => {
    if (!enablePolling) return;

    const cleanup = dataManager.startPolling(key, fetchData, pollingInterval, {
      ttl,
      backgroundRefresh,
    });

    cleanupRef.current = cleanup;

    return cleanup;
  }, [key, enablePolling, pollingInterval, fetchData, ttl, backgroundRefresh]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Listen for data updates from the data manager
  useEffect(() => {
    const handleDataUpdate = (cacheKey: string, newData: any) => {
      if (cacheKey === key) {
        setData(newData);
        setLastUpdate(new Date());
      }
    };

    dataManager.on("data:updated", handleDataUpdate);

    return () => {
      dataManager.off("data:updated", handleDataUpdate);
    };
  }, [key]);

  // Listen for connection state changes
  useEffect(() => {
    const unsubscribe = connectionManager.onStateChange((state) => {
      if (state.isOnline && state.isVisible && enableEventListening) {
        // Refresh data when coming back online
        setTimeout(() => {
          loadData();
        }, 1000);
      }
    });

    return unsubscribe;
  }, [loadData, enableEventListening]);

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

  const refetch = useCallback(async () => {
    dataManager.invalidate(key);
    await loadData();
  }, [key, loadData]);

  const invalidate = useCallback(() => {
    dataManager.invalidate(key);
  }, [key]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refetch,
    invalidate,
  };
}

// Specialized hooks for common use cases
export function useFundData(
  contractAddress: string,
  options: SmartFetchOptions = {},
) {
  const key = CACHE_KEYS.FUND_DATA(contractAddress);

  const fetcher = async () => {
    // This would be the actual fund data fetching logic
    // For now, we'll return a placeholder
    throw new Error("Fund data fetcher not implemented yet");
  };

  return useSmartDataFetching(key, fetcher, {
    ttl: 30000,
    enablePolling: true,
    pollingInterval: 15000,
    enableEventListening: true,
    ...options,
  });
}

export function useFlowBalance(
  address: string | null,
  options: SmartFetchOptions = {},
) {
  const key = address ? CACHE_KEYS.FLOW_BALANCE(address) : "";

  const fetcher = async () => {
    if (!address) return 0;

    // This would be the actual Flow balance fetching logic
    // For now, we'll return a placeholder
    throw new Error("Flow balance fetcher not implemented yet");
  };

  return useSmartDataFetching(key, fetcher, {
    ttl: 60000,
    enablePolling: true,
    pollingInterval: 60000,
    ...options,
  });
}

export function usePublicFunds(options: SmartFetchOptions = {}) {
  const key = CACHE_KEYS.PUBLIC_FUNDS();

  const fetcher = async () => {
    // This would be the actual public funds fetching logic
    // For now, we'll return a placeholder
    throw new Error("Public funds fetcher not implemented yet");
  };

  return useSmartDataFetching(key, fetcher, {
    ttl: 60000,
    enablePolling: true,
    pollingInterval: 30000,
    ...options,
  });
}
