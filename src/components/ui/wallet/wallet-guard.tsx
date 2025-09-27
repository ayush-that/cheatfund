"use client";

import { useWallet } from "~/lib/wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { Button } from "../button";
import { Wallet, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";

interface WalletGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WalletGuard({ children, fallback }: WalletGuardProps) {
  const { isConnected, isConnecting, error, connect } = useWallet();

  if (isConnected) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Wallet className="text-primary h-8 w-8" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            You need to connect your Ethereum wallet to access this feature and
            participate in chit funds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-destructive flex items-center justify-center space-x-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          <Button
            onClick={connect}
            disabled={isConnecting}
            className="bg-primary hover:bg-primary/90 w-full"
            size="lg"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
          </Button>
          <p className="text-muted-foreground text-xs">
            Make sure you have MetaMask or another Ethereum wallet installed in
            your browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
