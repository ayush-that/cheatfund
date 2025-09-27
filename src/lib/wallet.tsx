"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { useWeb3Auth } from "~/hooks/use-web3-auth";
import type { User } from "@supabase/supabase-js";

function getWalletAddress(user: User | null): string | null {
  if (!user) return null;

  const identityCustomClaims = user.identities?.[0]?.identity_data
    ?.custom_claims as any;
  const metadataCustomClaims = user.user_metadata?.custom_claims as any;

  return identityCustomClaims?.address ?? metadataCustomClaims?.address ?? null;
}

function getChainInfo(user: User | null): number | null {
  if (!user) return null;

  const identityCustomClaims = user.identities?.[0]?.identity_data
    ?.custom_claims as any;
  const metadataCustomClaims = user.user_metadata?.custom_claims as any;

  const chainId = identityCustomClaims?.chain ?? metadataCustomClaims?.chain;
  return chainId ? Number.parseInt(chainId, 16) : null;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

export interface WalletContextType extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const {
    user,
    loading,
    error: authError,
    signInWithWeb3,
    signOut,
  } = useWeb3Auth();

  const [state, setState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    chainId: null,
    isConnecting: false,
    error: null,
  });

  useEffect(() => {
    if (loading) {
      setState((prev) => ({ ...prev, isConnecting: true }));
      return;
    }

    if (user) {
      const address = getWalletAddress(user);
      const chainId = getChainInfo(user);

      if (address) {
        setState((prev) => ({
          ...prev,
          isConnected: true,
          address,
          chainId,
          isConnecting: false,
          error: null,
        }));

        // Fetch balance if we have an address
        updateBalance(address);
      }
    } else {
      setState({
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        isConnecting: false,
        error: authError,
      });
    }
  }, [user, loading, authError]);

  const updateBalance = async (address: string) => {
    try {
      if (window.ethereum) {
        const balance = (await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        } as any)) as string;
        const balanceInEth = (
          Number.parseInt(balance, 16) / Math.pow(10, 18)
        ).toFixed(4);
        setState((prev) => ({ ...prev, balance: balanceInEth }));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const connect = async () => {
    if (!window.ethereum) {
      const errorMsg =
        "No Ethereum wallet found. Please install MetaMask or another Ethereum wallet.";
      setState((prev) => ({ ...prev, error: errorMsg }));
      toast.error(errorMsg);
      return;
    }

    setState((prev) => ({ ...prev, isConnecting: true, error: null }));

    try {
      await signInWithWeb3();
      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      const errorMsg = error.message || "Failed to connect wallet";
      setState((prev) => ({
        ...prev,
        error: errorMsg,
        isConnecting: false,
      }));
      toast.error(errorMsg);
    }
  };

  const disconnect = async () => {
    try {
      await signOut();
      setState({
        isConnected: false,
        address: null,
        balance: null,
        chainId: null,
        isConnecting: false,
        error: null,
      });
      toast.success("Wallet disconnected successfully.");
    } catch (error: any) {
      toast.error("Failed to disconnect wallet");
    }
  };

  const switchChain = async (targetChainId: number) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      } as any);

      // Update the chain ID in our state
      setState((prev) => ({ ...prev, chainId: targetChainId }));
      toast.success(`Switched to chain ${targetChainId}`);
    } catch (error: any) {
      const errorMsg = error.message || "Failed to switch network";
      setState((prev) => ({ ...prev, error: errorMsg }));
      toast.error(errorMsg);
    }
  };

  const value: WalletContextType = {
    ...state,
    connect,
    disconnect,
    switchChain,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}
