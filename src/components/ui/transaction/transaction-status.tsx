"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useTransactionManager } from "~/hooks/contracts/useTransactionManager";
import { SUPPORTED_NETWORKS } from "~/lib/contracts";

interface TransactionStatusProps {
  transactionHash?: string;
  status: "pending" | "confirmed" | "failed";
  type: string;
  onClose?: () => void;
  onRetry?: () => void;
  className?: string;
}

export function TransactionStatus({
  transactionHash,
  status,
  type,
  onClose,
  onRetry,
  className,
}: TransactionStatusProps) {
  const { transactions } = useTransactionManager();
  const [copied, setCopied] = useState(false);

  const transaction = transactionHash ? transactions[transactionHash] : null;
  const currentStatus = transaction?.status || status;
  const confirmations = transaction?.confirmations || 0;
  const blockNumber = transaction?.blockNumber;
  const gasUsed = transaction?.gasUsed;
  const error = transaction?.error;

  const copyHash = async () => {
    if (transactionHash) {
      await navigator.clipboard.writeText(transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getBlockExplorerUrl = () => {
    if (!transactionHash) return null;
    const network = SUPPORTED_NETWORKS[545]; // Flow Testnet
    return `${network.blockExplorer}/tx/${transactionHash}`;
  };

  const getStatusIcon = () => {
    switch (currentStatus) {
      case "confirmed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "pending":
      default:
        return <Clock className="h-5 w-5 animate-pulse text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case "confirmed":
        return "Transaction Confirmed";
      case "failed":
        return "Transaction Failed";
      case "pending":
      default:
        return "Transaction Pending";
    }
  };

  const getProgressValue = () => {
    if (currentStatus === "confirmed") return 100;
    if (currentStatus === "failed") return 100;
    return Math.min((confirmations / 1) * 100, 90); // Assuming 1 confirmation needed
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <CardTitle className="text-lg">{getStatusText()}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor()}>{type}</Badge>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          {currentStatus === "pending" &&
            "Your transaction is being processed on the blockchain"}
          {currentStatus === "confirmed" &&
            "Your transaction has been successfully confirmed"}
          {currentStatus === "failed" && "Your transaction failed to execute"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {currentStatus === "pending" && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Confirmations: {confirmations}/1</span>
              <span>{Math.round(getProgressValue())}%</span>
            </div>
            <Progress value={getProgressValue()} className="h-2" />
          </div>
        )}

        {transactionHash && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Transaction Hash</label>
            <div className="flex items-center space-x-2">
              <code className="bg-muted flex-1 rounded px-2 py-1 font-mono text-sm">
                {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={copyHash}
                disabled={copied}
              >
                {copied ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
              {getBlockExplorerUrl() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = getBlockExplorerUrl();
                    if (url) window.open(url, "_blank");
                  }}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {(blockNumber || gasUsed) && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            {blockNumber && (
              <div>
                <span className="font-medium">Block Number:</span>
                <span className="ml-2 font-mono">{blockNumber.toString()}</span>
              </div>
            )}
            {gasUsed && (
              <div>
                <span className="font-medium">Gas Used:</span>
                <span className="ml-2 font-mono">{gasUsed.toString()}</span>
              </div>
            )}
          </div>
        )}

        {currentStatus === "failed" && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-2">
          {currentStatus === "failed" && onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          )}
          {currentStatus === "confirmed" && onClose && (
            <Button onClick={onClose}>Close</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
