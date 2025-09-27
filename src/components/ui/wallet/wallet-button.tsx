"use client";

import { Button } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { useWallet } from "~/lib/wallet";
import { Wallet, Copy, ExternalLink, LogOut, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "../badge";

export function WalletButton() {
  const {
    isConnected,
    address,
    balance,
    chainId,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useWallet();
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getChainName = (id: number) => {
    switch (id) {
      case 1:
        return "Ethereum";
      case 11155111:
        return "Sepolia";
      case 137:
        return "Polygon";
      default:
        return `Chain ${id}`;
    }
  };

  if (error) {
    return (
      <Button variant="destructive" size="sm" onClick={connect}>
        <AlertCircle className="mr-2 h-4 w-4" />
        Retry Connection
      </Button>
    );
  }

  if (isConnecting) {
    return (
      <Button disabled size="sm">
        <Wallet className="mr-2 h-4 w-4 animate-pulse" />
        Connecting...
      </Button>
    );
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connect}
        size="sm"
        className="bg-primary hover:bg-primary/90"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-primary/10 border-primary/20 hover:bg-primary/20"
        >
          <Wallet className="mr-2 h-4 w-4" />
          {formatAddress(address!)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <div className="space-y-2 p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Wallet Connected</span>
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary text-xs"
            >
              {chainId && getChainName(chainId)}
            </Badge>
          </div>
          <div className="text-muted-foreground font-mono text-xs">
            {address}
          </div>
          {balance && (
            <div className="text-sm">
              <span className="text-muted-foreground">Balance: </span>
              <span className="font-medium">{balance} FLOW</span>
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy Address"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (address) {
              const baseUrl =
                chainId === 1
                  ? "https://etherscan.io"
                  : chainId === 11155111
                    ? "https://sepolia.etherscan.io"
                    : chainId === 137
                      ? "https://polygonscan.com"
                      : "https://etherscan.io";
              window.open(`${baseUrl}/address/${address}`, "_blank");
            }
          }}
          className="cursor-pointer"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={disconnect}
          className="text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
