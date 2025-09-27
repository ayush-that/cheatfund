"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { Badge } from "../badge";
import { Button } from "../button";
import { Progress } from "../progress";
import { CheckCircle, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { SUPPORTED_NETWORKS } from "~/lib/contracts";
import type { TransactionStatus } from "~/hooks/contracts/useTransactionManager";

interface TransactionStatusProps {
  transaction: TransactionStatus;
  onClose?: () => void;
  showDetails?: boolean;
}

export function TransactionStatus({
  transaction,
  onClose,
  showDetails = true,
}: TransactionStatusProps) {
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Date.now() - transaction.timestamp);
    }, 1000);

    return () => clearInterval(interval);
  }, [transaction.timestamp]);

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case "confirmed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case "confirmed":
        return "Transaction Confirmed";
      case "failed":
        return "Transaction Failed";
      default:
        return "Transaction Pending";
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  const getExplorerUrl = () => {
    const network = SUPPORTED_NETWORKS[545];
    return `${network.blockExplorer}/tx/${transaction.hash}`;
  };

  const getProgressValue = () => {
    if (transaction.status === "confirmed") return 100;
    if (transaction.status === "failed") return 100;
    return Math.min(90, (transaction.confirmations / 12) * 100);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{getStatusText()}</CardTitle>
          </div>
          <Badge
            variant={
              transaction.status === "confirmed" ? "default" : "secondary"
            }
            className={transaction.status === "confirmed" ? "bg-green-500" : ""}
          >
            {transaction.status}
          </Badge>
        </div>
        <CardDescription>
          Transaction submitted {formatTime(timeElapsed)} ago
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{transaction.confirmations}/12 confirmations</span>
          </div>
          <Progress value={getProgressValue()} className="h-2" />
        </div>

        {showDetails && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hash:</span>
              <span className="font-mono text-xs">
                {transaction.hash.slice(0, 10)}...{transaction.hash.slice(-8)}
              </span>
            </div>

            {transaction.blockNumber && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Block:</span>
                <span>{transaction.blockNumber.toLocaleString()}</span>
              </div>
            )}

            {transaction.gasUsed && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gas Used:</span>
                <span>{transaction.gasUsed.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {transaction.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {transaction.error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => window.open(getExplorerUrl(), "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
          </Button>

          {onClose && (
            <Button
              variant={transaction.status === "pending" ? "outline" : "default"}
              size="sm"
              onClick={onClose}
              className="flex-1"
            >
              {transaction.status === "pending" ? "Hide" : "Close"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
