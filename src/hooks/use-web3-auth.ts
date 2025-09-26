"use client";

import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface Web3AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

export function useWeb3Auth() {
  const [state, setState] = useState<Web3AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({
        user: session?.user ?? null,
        session,
        loading: false,
        error: null,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithWeb3 = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      if (!window.ethereum) {
        throw new Error(
          "No Ethereum wallet found. Please install MetaMask or another Ethereum wallet.",
        );
      }

      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const { data, error } = await supabase.auth.signInWithWeb3({
        chain: "ethereum",
      });

      if (error) {
        throw error;
      }
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Authentication failed";
      setState((prev) => ({ ...prev, error: errorMessage, loading: false }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign out failed";
      setState((prev) => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  return {
    ...state,
    signInWithWeb3,
    signOut,
  };
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<string[]>;
      isMetaMask?: boolean;
    };
  }
}
