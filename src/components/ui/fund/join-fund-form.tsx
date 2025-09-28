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
  UserPlus,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatEther } from "ethers";
import { useWallet } from "~/lib/wallet";
import { useChitFund } from "~/hooks/contracts/useChitFund";
import { TransactionStatus } from "~/components/ui/transaction/transaction-status";
import { JoiningFundLoading } from "~/components/ui/loading/loading-states";

interface JoinFundFormProps {
  contractAddress: string;
  fundName: string;
  contributionAmount: bigint;
  totalMembers: number;
  currentMembers: number;
  totalVolume?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function JoinFundForm({
  contractAddress,
  fundName,
  contributionAmount,
  totalMembers,
  currentMembers,
  onSuccess,
  onError,
  className,
}: JoinFundFormProps) {
  const { address, balance } = useWallet();
  const { joinFund, checkCanJoin, loading, error } =
    useChitFund(contractAddress);
  const [isJoining, setIsJoining] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"pending" | "confirmed" | "failed">(
    "pending",
  );
  const [canJoinInfo, setCanJoinInfo] = useState<{
    canJoin: boolean;
    reason?: string;
    fundStatus: {
      isStarted: boolean;
      isFull: boolean;
      isActive: boolean;
      isMember: boolean;
    };
  } | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (contractAddress && address) {
        setCheckingStatus(true);
        try {
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Check timeout")), 10000),
          );

          const status = (await Promise.race([
            checkCanJoin(),
            timeoutPromise,
          ])) as any;

          setCanJoinInfo(status);
        } catch (err) {
          setCanJoinInfo({
            canJoin: false,
            reason: "Failed to check fund status",
            fundStatus: {
              isStarted: false,
              isFull: false,
              isActive: false,
              isMember: false,
            },
          });
        } finally {
          setCheckingStatus(false);
        }
      }
    };

    checkStatus();
  }, [contractAddress, address, checkCanJoin]);

  const hasEnoughBalance = () => {
    if (!balance || !contributionAmount) return false;
    const balanceInEth = Number.parseFloat(balance.toString());
    const contributionInEth = Number(formatEther(contributionAmount));
    return balanceInEth >= contributionInEth;
  };

  const handleJoin = async () => {
    if (!address || !canJoinInfo?.canJoin) return;

    try {
      setIsJoining(true);
      setTxHash(null);
      setTxStatus("pending");

      const result = await joinFund();

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
      setIsJoining(false);
    }
  };

  const contributionAmountFormatted = formatEther(contributionAmount);
  const balanceFormatted = balance ? balance.toString() : "0";
  const spotsRemaining = totalMembers - currentMembers;

  const getStatusBadge = () => {
    if (checkingStatus || !canJoinInfo)
      return <Badge variant="secondary">Checking...</Badge>;

    if (canJoinInfo.fundStatus.isStarted) {
      return <Badge variant="destructive">Started</Badge>;
    }
    if (canJoinInfo.fundStatus.isFull) {
      return <Badge variant="destructive">Full</Badge>;
    }
    if (canJoinInfo.fundStatus.isMember) {
      return <Badge variant="default">Member</Badge>;
    }
    if (!canJoinInfo.fundStatus.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    return <Badge variant="outline">Open</Badge>;
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Join This Fund</CardTitle>
            <CardDescription>
              Review the details and join the fund
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {canJoinInfo && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Spots Remaining</span>
              <span className="font-semibold">{spotsRemaining} spots</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Your Balance</span>
              <span
                className={cn(
                  "",
                  hasEnoughBalance() ? "text-green-600" : "text-red-600",
                )}
              >
                {balanceFormatted} FLOW
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Required</span>
              <span className="font-semibold">
                {contributionAmountFormatted} FLOW
              </span>
            </div>
          </div>
        )}

        {canJoinInfo && !canJoinInfo.canJoin && (
          <Alert
            variant={
              canJoinInfo.reason === "Already a member"
                ? "default"
                : "destructive"
            }
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {canJoinInfo.reason}
              {canJoinInfo.reason === "Failed to check fund status" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => {
                    setCanJoinInfo(null);
                    setCheckingStatus(false);
                  }}
                >
                  Retry
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        {!hasEnoughBalance() && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Insufficient balance. You need {contributionAmountFormatted} FLOW
              but have {balanceFormatted} FLOW.
            </AlertDescription>
          </Alert>
        )}

        {txHash && (
          <TransactionStatus
            transactionHash={txHash}
            status={txStatus}
            type="Join Fund"
            onClose={() => {
              setTxHash(null);
              setTxStatus("pending");
            }}
          />
        )}

        {isJoining && <JoiningFundLoading />}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!(canJoinInfo?.reason === "Already a member") && (
          <Button
            onClick={handleJoin}
            disabled={
              !address ||
              !canJoinInfo?.canJoin ||
              !hasEnoughBalance() ||
              isJoining ||
              loading
            }
            className="w-full"
            size="lg"
          >
            {isJoining ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Joining Fund...
              </>
            ) : !canJoinInfo?.canJoin ? (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Cannot Join
              </>
            ) : !hasEnoughBalance() ? (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Insufficient Balance
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Join Fund
              </>
            )}
          </Button>
        )}

        {txStatus === "confirmed" && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Successfully joined the fund! Welcome to {fundName}.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-muted-foreground space-y-1 text-xs">
          <p>
            • By joining, you agree to the terms and conditions of this chit
            fund
          </p>
          <p>
            • You'll be required to make monthly contributions of{" "}
            {contributionAmountFormatted} FLOW
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
