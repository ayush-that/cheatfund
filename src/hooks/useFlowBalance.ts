"use client";

import { useState, useEffect } from "react";
import {
  getFlowBalanceWithRetry,
  convertEthToFlowAddress,
} from "~/lib/flow-balance";

interface UseFlowBalanceOptions {
  network?: "testnet" | "mainnet";
  refreshInterval?: number; // in milliseconds
  retries?: number;
}

interface UseFlowBalanceReturn {
  balance: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useFlowBalance(
  address: string | null,
  options: UseFlowBalanceOptions = {},
): UseFlowBalanceReturn {
  const { network = "testnet", refreshInterval, retries = 3 } = options;

  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!address) {
      setBalance(0);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const flowAddress = convertEthToFlowAddress(address);
      const flowBalance = await getFlowBalanceWithRetry(
        flowAddress,
        network,
        retries,
      );

      setBalance(flowBalance);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch FLOW balance";
      setError(errorMessage);
      console.error("useFlowBalance error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [address, network]);
  useEffect(() => {
    if (!refreshInterval || !address) return;

    const interval = setInterval(fetchBalance, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, address, network]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}
