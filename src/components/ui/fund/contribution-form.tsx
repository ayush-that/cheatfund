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
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Timer,
  Wallet,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatEther, parseEther } from "ethers";
import { useWallet } from "~/lib/wallet";
import { useChitFund } from "~/hooks/contracts/useChitFund";
import { TransactionStatus } from "~/components/ui/transaction/transaction-status";
import { ContributingLoading } from "~/components/ui/loading/loading-states";

interface ContributionFormProps {
  contractAddress: string;
  contributionAmount: bigint;
  isEthBased: boolean;
  deadline: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function ContributionForm({
  contractAddress,
  contributionAmount,
  isEthBased,
  deadline,
  onSuccess,
  onError,
  className,
}: ContributionFormProps) {
  const { address, balance } = useWallet();
  const { contribute, loading, error } = useChitFund(contractAddress);
  const [isContributing, setIsContributing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"pending" | "confirmed" | "failed">(
    "pending",
  );
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, deadline - now);
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Expired";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const hasEnoughBalance = () => {
    if (!balance || !contributionAmount) return false;
    const balanceInEth = Number.parseFloat(balance.toString());
    const contributionInEth = Number(formatEther(contributionAmount));
    return balanceInEth >= contributionInEth;
  };

  const isDeadlinePassed = timeRemaining <= 0;

  const handleContribute = async () => {
    if (!address || !hasEnoughBalance() || isDeadlinePassed) return;

    try {
      setIsContributing(true);
      setTxHash(null);
      setTxStatus("pending");

      const result = await contribute();

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        setTxStatus("pending");

        if (result.receipt) {
          setTxStatus(result.receipt.status === 1 ? "confirmed" : "failed");
          if (result.receipt.status === 1) {
            onSuccess?.();
          }
        }
      }
    } catch (error) {
      setTxStatus("failed");
      onError?.(error as Error);
    } finally {
      setIsContributing(false);
    }
  };

  const contributionAmountFormatted = formatEther(contributionAmount);
  const balanceFormatted = balance ? balance.toString() : "0";

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Make Contribution</CardTitle>
            <CardDescription>
              Contribute to the current cycle pool
            </CardDescription>
          </div>
          <Badge variant={isDeadlinePassed ? "destructive" : "default"}>
            <Clock className="mr-1 h-3 w-3" />
            {isDeadlinePassed ? "Expired" : "Active"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Contribution Amount</label>
          <div className="bg-muted flex items-center space-x-2 rounded-lg p-3">
            <DollarSign className="text-muted-foreground h-4 w-4" />
            <span className="text-lg font-semibold">
              {contributionAmountFormatted} FLOW
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Your Balance</span>
            <span>{balanceFormatted} FLOW</span>
          </div>

          {!hasEnoughBalance() && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Insufficient balance. You need {contributionAmountFormatted}{" "}
                FLOW but have {balanceFormatted} FLOW.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Timer className="text-muted-foreground h-4 w-4" />
            <span>Contribution Deadline</span>
          </div>
          <div
            className={cn(
              "rounded-lg border p-3",
              isDeadlinePassed
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-yellow-200 bg-yellow-50 text-yellow-800",
            )}
          >
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="font-mono font-semibold">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>
        </div>

        {txHash && (
          <TransactionStatus
            transactionHash={txHash}
            status={txStatus}
            type="Contribution"
            onClose={() => {
              setTxHash(null);
              setTxStatus("pending");
            }}
          />
        )}

        {isContributing && <ContributingLoading />}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleContribute}
          disabled={
            !address ||
            !hasEnoughBalance() ||
            isDeadlinePassed ||
            isContributing ||
            loading
          }
          className="w-full"
          size="lg"
        >
          {isContributing ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : isDeadlinePassed ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Deadline Passed
            </>
          ) : !hasEnoughBalance() ? (
            <>
              <Wallet className="mr-2 h-4 w-4" />
              Insufficient Balance
            </>
          ) : (
            <>
              <DollarSign className="mr-2 h-4 w-4" />
              Contribute {contributionAmountFormatted} FLOW
            </>
          )}
        </Button>

        {txStatus === "confirmed" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your contribution has been successfully recorded!
            </AlertDescription>
          </Alert>
        )}

        <div className="text-muted-foreground space-y-1 text-xs">
          <p>• Your contribution will be added to the cycle pool</p>
          <p>• You can only contribute once per cycle</p>
          <p>• Contributions are non-refundable</p>
        </div>
      </CardContent>
    </Card>
  );
}
