"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  ExternalLink,
  Clock,
  CheckCircle,
  DollarSign,
  Users,
  Crown,
  AlertCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatEther } from "ethers";
import { SUPPORTED_NETWORKS } from "~/lib/contracts";

interface ContractEvent {
  id: string;
  type: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  data: any;
}

interface TransactionHistoryProps {
  contractAddress: string;
  events: ContractEvent[];
  showUserOnly?: boolean;
  maxItems?: number;
  className?: string;
}

export function TransactionHistory({
  contractAddress,
  events,
  showUserOnly = false,
  maxItems = 10,
  className,
}: TransactionHistoryProps) {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "MemberJoined":
        return <Users className="h-4 w-4 text-blue-600" />;
      case "ContributionMade":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "BidSubmitted":
        return <CheckCircle className="h-4 w-4 text-yellow-600" />;
      case "WinnerSelected":
        return <Crown className="h-4 w-4 text-purple-600" />;
      case "FundsDistributed":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "MemberJoined":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ContributionMade":
        return "bg-green-100 text-green-800 border-green-200";
      case "BidSubmitted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "WinnerSelected":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "FundsDistributed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEventDescription = (event: ContractEvent) => {
    const { type, data } = event;

    switch (type) {
      case "MemberJoined":
        return `Member ${data.member?.slice(0, 6)}...${data.member?.slice(-4)} joined the fund`;
      case "ContributionMade":
        return `Contribution of ${formatEther(data.amount || 0)} ETH made by ${data.member?.slice(0, 6)}...${data.member?.slice(-4)}`;
      case "BidSubmitted":
        return `Bid of ${data.bidPercentage}% submitted by ${data.member?.slice(0, 6)}...${data.member?.slice(-4)}`;
      case "WinnerSelected":
        return `Winner selected: ${data.winner?.slice(0, 6)}...${data.winner?.slice(-4)} with ${data.bidPercentage}% bid`;
      case "FundsDistributed":
        return `Funds distributed: ${formatEther(data.amount || 0)} ETH to ${data.recipient?.slice(0, 6)}...${data.recipient?.slice(-4)}`;
      default:
        return `${type} event occurred`;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  const getBlockExplorerUrl = (txHash: string) => {
    const network = SUPPORTED_NETWORKS[545]; // Flow Testnet
    return `${network.blockExplorer}/tx/${txHash}`;
  };

  const filteredEvents = events
    .slice(0, maxItems)
    .sort((a, b) => b.timestamp - a.timestamp);

  if (filteredEvents.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="text-lg">Transaction History</CardTitle>
          <CardDescription>Recent activity for this fund</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <AlertCircle className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground">No transactions yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle className="text-lg">Transaction History</CardTitle>
        <CardDescription>Recent activity for this fund</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="flex items-center space-x-3 rounded-lg border bg-gray-50 p-3"
          >
            <div className="flex-shrink-0">{getEventIcon(event.type)}</div>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center space-x-2">
                <Badge className={getEventColor(event.type)}>
                  {event.type}
                </Badge>
                <span className="text-muted-foreground text-xs">
                  Block #{event.blockNumber}
                </span>
              </div>

              <p className="text-sm text-gray-900">
                {getEventDescription(event)}
              </p>

              <div className="text-muted-foreground mt-1 flex items-center space-x-4 text-xs">
                <span>{formatTimestamp(event.timestamp)}</span>
                <span>
                  TX: {event.transactionHash.slice(0, 8)}...
                  {event.transactionHash.slice(-6)}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  getBlockExplorerUrl(event.transactionHash),
                  "_blank",
                )
              }
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        ))}

        {events.length > maxItems && (
          <div className="pt-4 text-center">
            <Button variant="outline" size="sm">
              View All Transactions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
