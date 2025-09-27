"use client";

import { useState } from "react";
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
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  DollarSign,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatEther } from "ethers";
import { useWallet } from "~/lib/wallet";
import { useChitFund } from "~/hooks/contracts/useChitFund";
import { TransactionStatus } from "~/components/ui/transaction/transaction-status";

interface CycleData {
  cycleNumber: number;
  totalPool: bigint;
  isActive: boolean;
  contributionDeadline: number;
  biddingDeadline: number;
  winner: string | null;
  phase: "contribution" | "bidding" | "complete";
}

interface WinnerSelectionProps {
  contractAddress: string;
  cycleData: CycleData;
  onWinnerSelected?: (winner: string) => void;
  onFundsDistributed?: (amount: bigint) => void;
  className?: string;
}

export function WinnerSelection({
  contractAddress,
  cycleData,
  onWinnerSelected,
  onFundsDistributed,
  className,
}: WinnerSelectionProps) {
  const { address } = useWallet();
  const { selectWinner, distributeFunds, startNextCycle, loading, error } =
    useChitFund(contractAddress);
  const [isSelectingWinner, setIsSelectingWinner] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [isStartingNext, setIsStartingNext] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"pending" | "confirmed" | "failed">(
    "pending",
  );

  const isBiddingPhase = cycleData.phase === "bidding";
  const isComplete = cycleData.phase === "complete";
  const hasWinner = cycleData.winner !== null;
  const isOrganizer =
    address?.toLowerCase() === cycleData.winner?.toLowerCase();

  const handleSelectWinner = async () => {
    try {
      setIsSelectingWinner(true);
      setTxHash(null);
      setTxStatus("pending");

      const result = await selectWinner();

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        setTxStatus("pending");

        if (result.receipt) {
          setTxStatus(result.receipt.status === 1 ? "confirmed" : "failed");
          if (result.receipt.status === 1) {
            onWinnerSelected?.(cycleData.winner || "");
          }
        }
      }
    } catch (error) {
      setTxStatus("failed");
    } finally {
      setIsSelectingWinner(false);
    }
  };

  const handleDistributeFunds = async () => {
    try {
      setIsDistributing(true);
      setTxHash(null);
      setTxStatus("pending");

      const result = await distributeFunds();

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        setTxStatus("pending");

        if (result.receipt) {
          setTxStatus(result.receipt.status === 1 ? "confirmed" : "failed");
          if (result.receipt.status === 1) {
            onFundsDistributed?.(cycleData.totalPool);
          }
        }
      }
    } catch (error) {
      setTxStatus("failed");
    } finally {
      setIsDistributing(false);
    }
  };

  const handleStartNextCycle = async () => {
    try {
      setIsStartingNext(true);
      setTxHash(null);
      setTxStatus("pending");

      const result = await startNextCycle();

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        setTxStatus("pending");

        if (result.receipt) {
          setTxStatus(result.receipt.status === 1 ? "confirmed" : "failed");
        }
      }
    } catch (error) {
      setTxStatus("failed");
    } finally {
      setIsStartingNext(false);
    }
  };

  const poolAmount = formatEther(cycleData.totalPool);

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Cycle Management</CardTitle>
            <CardDescription>
              Manage the current cycle and fund distribution
            </CardDescription>
          </div>
          <Badge
            variant={
              isComplete
                ? "default"
                : hasWinner
                  ? "secondary"
                  : isBiddingPhase
                    ? "destructive"
                    : "outline"
            }
          >
            <Trophy className="mr-1 h-3 w-3" />
            {isComplete
              ? "Complete"
              : hasWinner
                ? "Winner Selected"
                : isBiddingPhase
                  ? "Bidding Active"
                  : "In Progress"}
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

        {hasWinner && (
          <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Winner Selected
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Winner:</span>
              <span className="ml-2 font-semibold">
                {cycleData.winner?.slice(0, 6)}...{cycleData.winner?.slice(-4)}
              </span>
            </div>
          </div>
        )}

        {txHash && (
          <TransactionStatus
            transactionHash={txHash}
            status={txStatus}
            type="Cycle Management"
            onClose={() => {
              setTxHash(null);
              setTxStatus("pending");
            }}
          />
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {!hasWinner && isBiddingPhase && (
            <Button
              onClick={handleSelectWinner}
              disabled={isSelectingWinner || loading}
              className="w-full"
              size="lg"
            >
              {isSelectingWinner ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Selecting Winner...
                </>
              ) : (
                <>
                  <Trophy className="mr-2 h-4 w-4" />
                  Select Winner
                </>
              )}
            </Button>
          )}

          {hasWinner && !isComplete && (
            <Button
              onClick={handleDistributeFunds}
              disabled={isDistributing || loading}
              className="w-full"
              size="lg"
            >
              {isDistributing ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Distributing Funds...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Distribute Funds
                </>
              )}
            </Button>
          )}

          {isComplete && (
            <Button
              onClick={handleStartNextCycle}
              disabled={isStartingNext || loading}
              className="w-full"
              size="lg"
            >
              {isStartingNext ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Starting Next Cycle...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Start Next Cycle
                </>
              )}
            </Button>
          )}
        </div>

        {txStatus === "confirmed" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              {isSelectingWinner
                ? "Winner has been selected successfully!"
                : isDistributing
                  ? "Funds have been distributed successfully!"
                  : "Next cycle has been started successfully!"}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-muted-foreground space-y-1 text-xs">
          <p>Only the organizer can manage cycle progression</p>
          <p>Winner selection happens after bidding deadline</p>
          <p>Funds are distributed to the winner</p>
          <p>Next cycle starts automatically after distribution</p>
        </div>
      </CardContent>
    </Card>
  );
}
