"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Button } from "~/components/ui/button";
import {
  Clock,
  Users,
  DollarSign,
  Crown,
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatEther } from "ethers";

interface CycleData {
  cycleNumber: number;
  totalPool: bigint;
  isActive: boolean;
  contributionDeadline: number;
  biddingDeadline: number;
  winner: string | null;
  phase: "contribution" | "bidding" | "complete";
  contributionStartTime?: number;
  contributionDuration?: number;
  biddingDuration?: number;
}

interface CycleProgressProps {
  cycleData: CycleData;
  totalMembers: number;
  className?: string;
  currency?: string;
  phaseConfig?: {
    contribution: {
      label: string;
      description: string;
      color: string;
    };
    bidding: {
      label: string;
      description: string;
      color: string;
    };
    complete: {
      label: string;
      description: string;
      color: string;
    };
  };
}

export function CycleProgress({
  cycleData,
  totalMembers,
  className,
  currency = "FLOW",
  phaseConfig = {
    contribution: {
      label: "Contribution Phase",
      description: "Members are contributing to the pool",
      color: "bg-blue-100 text-blue-800 border-blue-200",
    },
    bidding: {
      label: "Bidding Phase",
      description: "Members are submitting bids",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    },
    complete: {
      label: "Cycle Complete",
      description: "Winner has been selected",
      color: "bg-green-100 text-green-800 border-green-200",
    },
  },
}: CycleProgressProps) {
  const [timeRemaining, setTimeRemaining] = useState<{
    contribution: number;
    bidding: number;
  }>({ contribution: 0, bidding: 0 });

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const contributionTime = Math.max(
        0,
        cycleData.contributionDeadline - now,
      );
      const biddingTime = Math.max(0, cycleData.biddingDeadline - now);

      setTimeRemaining({
        contribution: contributionTime,
        bidding: biddingTime,
      });
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(interval);
  }, [cycleData.contributionDeadline, cycleData.biddingDeadline]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Expired";

    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getPhaseInfo = () => {
    const now = Math.floor(Date.now() / 1000);

    if (now < cycleData.contributionDeadline) {
      const contributionStartTime =
        cycleData.contributionStartTime ||
        cycleData.contributionDeadline -
          (cycleData.contributionDuration || 7 * 24 * 3600);
      const totalContributionTime =
        cycleData.contributionDeadline - contributionStartTime;

      return {
        phase: "contribution" as const,
        label: phaseConfig.contribution.label,
        description: phaseConfig.contribution.description,
        color: phaseConfig.contribution.color,
        icon: <DollarSign className="h-4 w-4" />,
        progress: Math.max(
          0,
          100 - (timeRemaining.contribution / totalContributionTime) * 100,
        ),
      };
    }

    if (now < cycleData.biddingDeadline) {
      const biddingDuration =
        cycleData.biddingDuration ||
        cycleData.biddingDeadline - cycleData.contributionDeadline;

      return {
        phase: "bidding" as const,
        label: phaseConfig.bidding.label,
        description: phaseConfig.bidding.description,
        color: phaseConfig.bidding.color,
        icon: <Users className="h-4 w-4" />,
        progress: Math.max(
          0,
          100 - (timeRemaining.bidding / biddingDuration) * 100,
        ),
      };
    }

    return {
      phase: "complete" as const,
      label: phaseConfig.complete.label,
      description: cycleData.winner
        ? phaseConfig.complete.description
        : "Waiting for winner selection",
      color: cycleData.winner
        ? phaseConfig.complete.color
        : "bg-gray-100 text-gray-800 border-gray-200",
      icon: cycleData.winner ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <Clock className="h-4 w-4" />
      ),
      progress: 100,
    };
  };

  const phaseInfo = getPhaseInfo();
  const poolAmount = formatEther(cycleData.totalPool);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              Cycle {cycleData.cycleNumber}
            </CardTitle>
            <CardDescription>Current cycle progress and status</CardDescription>
          </div>
          <Badge className={phaseInfo.color}>
            {phaseInfo.icon}
            <span className="ml-1">{phaseInfo.label}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{phaseInfo.description}</span>
            <span>{Math.round(phaseInfo.progress)}%</span>
          </div>
          <Progress value={phaseInfo.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Total Pool</span>
            </div>
            <p className="text-lg font-semibold">
              {poolAmount} {currency}
            </p>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </div>
            <p className="text-lg font-semibold">{totalMembers}</p>
          </div>
        </div>

        {phaseInfo.phase !== "complete" && (
          <div className="space-y-3">
            {phaseInfo.phase === "contribution" && (
              <div className="flex items-center space-x-2 text-sm">
                <Timer className="h-4 w-4 text-blue-600" />
                <span>Contribution deadline:</span>
                <span className="font-mono font-semibold">
                  {formatTime(timeRemaining.contribution)}
                </span>
              </div>
            )}

            {phaseInfo.phase === "bidding" && (
              <div className="flex items-center space-x-2 text-sm">
                <Timer className="h-4 w-4 text-yellow-600" />
                <span>Bidding deadline:</span>
                <span className="font-mono font-semibold">
                  {formatTime(timeRemaining.bidding)}
                </span>
              </div>
            )}
          </div>
        )}

        {cycleData.winner && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Winner Selected
              </span>
            </div>
            <p className="mt-1 text-sm text-green-700">
              Winner: {cycleData.winner.slice(0, 6)}...
              {cycleData.winner.slice(-4)}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Cycle Timeline</h4>
          <div className="space-y-2">
            <div
              className={cn(
                "flex items-center space-x-2 rounded p-2 text-sm",
                phaseInfo.phase === "contribution"
                  ? "bg-blue-50"
                  : "bg-gray-50",
              )}
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  phaseInfo.phase === "contribution"
                    ? "bg-blue-500"
                    : "bg-gray-300",
                )}
              />
              <span>{phaseConfig.contribution.label}</span>
              {phaseInfo.phase === "contribution" && (
                <Badge variant="outline">Active</Badge>
              )}
            </div>

            <div
              className={cn(
                "flex items-center space-x-2 rounded p-2 text-sm",
                phaseInfo.phase === "bidding" ? "bg-yellow-50" : "bg-gray-50",
              )}
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  phaseInfo.phase === "bidding"
                    ? "bg-yellow-500"
                    : "bg-gray-300",
                )}
              />
              <span>{phaseConfig.bidding.label}</span>
              {phaseInfo.phase === "bidding" && (
                <Badge variant="outline">Active</Badge>
              )}
            </div>

            <div
              className={cn(
                "flex items-center space-x-2 rounded p-2 text-sm",
                phaseInfo.phase === "complete" ? "bg-green-50" : "bg-gray-50",
              )}
            >
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  phaseInfo.phase === "complete"
                    ? "bg-green-500"
                    : "bg-gray-300",
                )}
              />
              <span>{phaseConfig.complete.label}</span>
              {phaseInfo.phase === "complete" && (
                <Badge variant="outline">Done</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
