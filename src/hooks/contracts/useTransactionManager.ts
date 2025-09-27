"use client";

import { useState, useCallback } from "react";
import { getProvider } from "~/lib/web3";

export interface TransactionStatus {
  hash: string;
  status: "pending" | "confirmed" | "failed";
  confirmations: number;
  blockNumber?: number;
  gasUsed?: bigint;
  error?: string;
  timestamp: number;
}

export interface TransactionManagerState {
  transactions: Record<string, TransactionStatus>;
  loading: boolean;
}

export function useTransactionManager() {
  const [state, setState] = useState<TransactionManagerState>({
    transactions: {},
    loading: false,
  });

  const addTransaction = useCallback((txHash: string) => {
    const transaction: TransactionStatus = {
      hash: txHash,
      status: "pending",
      confirmations: 0,
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      transactions: {
        ...prev.transactions,
        [txHash]: transaction,
      },
    }));

    monitorTransaction(txHash);
  }, []);

  const monitorTransaction = useCallback(async (txHash: string) => {
    const provider = getProvider();

    const receipt = await provider.waitForTransaction(txHash, 1);

    if (receipt) {
      const status: TransactionStatus = {
        hash: txHash,
        status: receipt.status === 1 ? "confirmed" : "failed",
        confirmations: 1,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        timestamp: Date.now(),
      };

      if (receipt.status === 0) {
        status.error = "Transaction failed";
      }

      setState((prev) => ({
        ...prev,
        transactions: {
          ...prev.transactions,
          [txHash]: status,
        },
      }));

      if (receipt.status === 1) {
        monitorConfirmations(txHash, receipt.blockNumber);
      }
    }
  }, []);

  const monitorConfirmations = useCallback(
    async (txHash: string, txBlockNumber: number) => {
      const provider = getProvider();

      const checkConfirmations = async () => {
        const currentBlock = await provider.getBlockNumber();
        const confirmations = Math.max(0, currentBlock - txBlockNumber + 1);

        setState((prev) => ({
          ...prev,
          transactions: {
            ...prev.transactions,
            [txHash]: {
              ...prev.transactions[txHash],
              confirmations,
            } as TransactionStatus,
          },
        }));

        if (confirmations < 12) {
          setTimeout(checkConfirmations, 15000);
        }
      };

      checkConfirmations();
    },
    [],
  );

  const waitForTransaction = useCallback(
    async (txHash: string): Promise<TransactionStatus> => {
      return new Promise((resolve, reject) => {
        const checkStatus = () => {
          const tx = state.transactions[txHash];
          if (tx) {
            if (tx.status === "confirmed") {
              resolve(tx);
            } else if (tx.status === "failed") {
              reject(new Error(tx.error || "Transaction failed"));
            } else {
              setTimeout(checkStatus, 1000);
            }
          } else {
            reject(new Error("Transaction not found"));
          }
        };

        checkStatus();
      });
    },
    [state.transactions],
  );

  const getTransaction = useCallback(
    (txHash: string): TransactionStatus | null => {
      return state.transactions[txHash] || null;
    },
    [state.transactions],
  );

  const clearTransaction = useCallback((txHash: string) => {
    setState((prev) => {
      const { [txHash]: removed, ...remaining } = prev.transactions;
      return {
        ...prev,
        transactions: remaining,
      };
    });
  }, []);

  const clearAllTransactions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transactions: {},
    }));
  }, []);

  return {
    transactions: state.transactions,
    loading: state.loading,
    addTransaction,
    waitForTransaction,
    getTransaction,
    clearTransaction,
    clearAllTransactions,
  };
}
