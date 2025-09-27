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
import { Slider } from "~/components/ui/slider";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Timer,
  Target,
  TrendingDown,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatEther } from "ethers";
import { useWallet } from "~/lib/wallet";
import { useChitFund } from "~/hooks/contracts/useChitFund";
import { TransactionStatus } from "~/components/ui/transaction/transaction-status";
import { BiddingLoading } from "~/components/ui/loading/loading-states";

interface CycleData {
  cycleNumber: number;
  totalPool: bigint;
  isActive: boolean;
  contributionDeadline: number;
  biddingDeadline: number;
  winner: string | null;
  phase: "contribution" | "bidding" | "complete";
}

interface BiddingInterfaceProps {
  contractAddress: string;
  cycleData: CycleData;
  onBidSubmitted?: (bidPercentage: number) => void;
  className?: string;
}

export function BiddingInterface({
  contractAddress,
  cycleData,
  onBidSubmitted,
  className,
}: BiddingInterfaceProps) {
  const { address } = useWallet();
  const { submitBid, loading, error } = useChitFund(contractAddress);
  const [bidPercentage, setBidPercentage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"pending" | "confirmed" | "failed">(
    "pending",
  );
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, cycleData.biddingDeadline - now);
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [cycleData.biddingDeadline]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Expired";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const isBiddingPhase = cycleData.phase === "bidding";
  const isDeadlinePassed = timeRemaining <= 0;
  const canBid = isBiddingPhase && !isDeadlinePassed && address;

  const calculatePayout = (percentage: number) => {
    const poolAmount = Number(formatEther(cycleData.totalPool));
    const bidAmount = (percentage / 100) * poolAmount;
    const payout = poolAmount - bidAmount;
    return {
      bidAmount: bidAmount.toFixed(4),
      payout: payout.toFixed(4),
      percentage: percentage.toFixed(1),
    };
  };

  const payout = calculatePayout(bidPercentage);

  const handleSubmitBid = async () => {
    if (!canBid || bidPercentage <= 0) return;

    try {
      setIsSubmitting(true);
      setTxHash(null);
      setTxStatus("pending");

      const result = await submitBid(bidPercentage);

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        setTxStatus("pending");

        if (result.receipt) {
          setTxStatus(result.receipt.status === 1 ? "confirmed" : "failed");
          if (result.receipt.status === 1) {
            onBidSubmitted?.(bidPercentage);
          }
        }
      }
    } catch (error) {
      setTxStatus("failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const poolAmount = formatEther(cycleData.totalPool);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Submit Your Bid</CardTitle>
            <CardDescription>
              Bid a percentage of the pool you're willing to give up
            </CardDescription>
          </div>
          <Badge
            variant={
              isDeadlinePassed
                ? "destructive"
                : isBiddingPhase
                  ? "default"
                  : "secondary"
            }
          >
            <Clock className="mr-1 h-3 w-3" />
            {isDeadlinePassed
              ? "Expired"
              : isBiddingPhase
                ? "Active"
                : "Not Started"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Total Pool</label>
          <div className="bg-muted flex items-center space-x-2 rounded-lg p-3">
            <DollarSign className="text-muted-foreground h-4 w-4" />
            <span className="text-lg font-semibold">{poolAmount} FLOW</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Bid Percentage</label>
            <span className="text-lg font-semibold text-blue-600">
              {bidPercentage.toFixed(1)}%
            </span>
          </div>

          <Slider
            value={[bidPercentage]}
            onValueChange={([value]) => setBidPercentage(value)}
            max={30}
            min={0}
            step={0.1}
            className="w-full"
            disabled={!canBid}
          />

          <div className="text-muted-foreground flex justify-between text-xs">
            <span>0%</span>
            <span>30%</span>
          </div>
        </div>

        {bidPercentage > 0 && (
          <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Your Payout Calculation
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Bid Amount:</span>
                <span className="ml-2 font-semibold">
                  {payout.bidAmount} FLOW
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">You Receive:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {payout.payout} FLOW
                </span>
              </div>
            </div>

            <div className="text-xs text-blue-700">
              You're bidding {payout.percentage}% of the pool, so you'll receive{" "}
              {payout.payout} FLOW
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <Timer className="text-muted-foreground h-4 w-4" />
            <span>Bidding Deadline</span>
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
            type="Bid Submission"
            onClose={() => {
              setTxHash(null);
              setTxStatus("pending");
            }}
          />
        )}

        {isSubmitting && <BiddingLoading />}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleSubmitBid}
          disabled={!canBid || bidPercentage <= 0 || isSubmitting || loading}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Submitting Bid...
            </>
          ) : isDeadlinePassed ? (
            <>
              <AlertCircle className="mr-2 h-4 w-4" />
              Bidding Closed
            </>
          ) : !isBiddingPhase ? (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Bidding Not Started
            </>
          ) : bidPercentage <= 0 ? (
            <>
              <Target className="mr-2 h-4 w-4" />
              Select Bid Amount
            </>
          ) : (
            <>
              <TrendingDown className="mr-2 h-4 w-4" />
              Submit {bidPercentage.toFixed(1)}% Bid
            </>
          )}
        </Button>

        {txStatus === "confirmed" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your bid of {bidPercentage.toFixed(1)}% has been successfully
              submitted!
            </AlertDescription>
          </Alert>
        )}

        <div className="text-muted-foreground space-y-1 text-xs">
          <p>• Lower bids have a higher chance of winning</p>
          <p>• You can only submit one bid per cycle</p>
          <p>• Bids are final and cannot be changed</p>
          <p>• The lowest bid wins the pool</p>
        </div>
      </CardContent>
    </Card>
  );
}
