"use client";

import { useFlowBalance } from "~/hooks/useFlowBalance";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { RefreshCw, Wallet } from "lucide-react";
import numeral from "numeral";

interface FlowBalanceDisplayProps {
  address: string | null;
  network?: "testnet" | "mainnet";
  showRefresh?: boolean;
}

export function FlowBalanceDisplay({
  address,
  network = "testnet",
  showRefresh = true,
}: FlowBalanceDisplayProps) {
  const { balance, loading, error, refetch } = useFlowBalance(address, {
    network,
    refreshInterval: 30000,
  });

  const formatBalance = (value: number) => {
    return numeral(value).format("0.000000");
  };

  if (!address) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
            <Wallet className="mr-1 h-4 w-4" />
            FLOW Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-sm">
            Connect wallet to view balance
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
            <Wallet className="mr-1 h-4 w-4" />
            FLOW Balance
          </CardTitle>
          {showRefresh && (
            <button
              onClick={refetch}
              disabled={loading}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-sm text-red-500">Error: {error}</div>
        ) : (
          <>
            <div className="text-foreground text-2xl font-bold">
              {loading ? "..." : `${formatBalance(balance)} FLOW`}
            </div>
            <div className="mt-1 flex items-center">
              <Badge variant="secondary" className="text-xs">
                {network}
              </Badge>
              {loading && (
                <span className="text-muted-foreground ml-2 text-xs">
                  Loading...
                </span>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
