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
import { Progress } from "~/components/ui/progress";
import {
  Users,
  DollarSign,
  Clock,
  Eye,
  UserPlus,
  Crown,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { formatEther } from "ethers";

interface ChitFundInfo {
  chitFundAddress: string;
  fundName: string;
  description: string;
  contributionAmount: bigint;
  totalMembers: number;
  currentMembers: number;
  paymentToken: string;
  isActive: boolean;
  createdAt: number;
  creator: string;
}

interface FundCardProps {
  contractAddress: string;
  fundInfo: ChitFundInfo;
  showActions?: boolean;
  variant?: "default" | "compact" | "detailed";
  currentUserAddress?: string;
  onJoin?: (contractAddress: string) => void;
  onView?: (contractAddress: string) => void;
  className?: string;
}

export function FundCard({
  contractAddress,
  fundInfo,
  showActions = true,
  variant = "default",
  currentUserAddress,
  onJoin,
  onView,
  className,
}: FundCardProps) {
  const [isJoining, setIsJoining] = useState(false);

  const isCreator =
    currentUserAddress?.toLowerCase() === fundInfo.creator.toLowerCase();
  const isFull = fundInfo.currentMembers >= fundInfo.totalMembers;
  const isActive = fundInfo.isActive;
  const canJoin = !isCreator && !isFull && isActive;

  const memberProgress =
    (fundInfo.currentMembers / fundInfo.totalMembers) * 100;
  const contributionAmount = formatEther(fundInfo.contributionAmount);

  const getStatusBadge = () => {
    if (!isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (isFull) {
      return <Badge variant="default">Full</Badge>;
    }
    return <Badge variant="outline">Open</Badge>;
  };

  const getStatusColor = () => {
    if (!isActive) return "text-muted-foreground";
    if (isFull) return "text-green-600";
    return "text-blue-600";
  };

  const handleJoin = async () => {
    if (!canJoin || !onJoin) return;

    setIsJoining(true);
    try {
      await onJoin(contractAddress);
    } finally {
      setIsJoining(false);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(contractAddress);
    }
  };

  if (variant === "compact") {
    return (
      <Card className={cn("transition-shadow hover:shadow-md", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{fundInfo.fundName}</h3>
              <p className="text-muted-foreground truncate text-sm">
                {fundInfo.currentMembers}/{fundInfo.totalMembers} members
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge()}
              {showActions && (
                <Button variant="outline" size="sm" onClick={handleView}>
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === "detailed") {
    return (
      <Card className={cn("transition-shadow hover:shadow-md", className)}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{fundInfo.fundName}</CardTitle>
              <CardDescription className="line-clamp-2">
                {fundInfo.description}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                <DollarSign className="h-4 w-4" />
                <span>Contribution</span>
              </div>
              <p className="font-semibold">{contributionAmount} FLOW</p>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4" />
                <span>Members</span>
              </div>
              <p className="font-semibold">
                {fundInfo.currentMembers}/{fundInfo.totalMembers}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Member Progress</span>
              <span>{Math.round(memberProgress)}%</span>
            </div>
            <Progress value={memberProgress} className="h-2" />
          </div>

          <div className="text-muted-foreground flex items-center space-x-2 text-sm">
            <Crown className="h-4 w-4" />
            <span>Created by</span>
            <span className="font-mono">
              {fundInfo.creator.slice(0, 6)}...{fundInfo.creator.slice(-4)}
            </span>
          </div>

          {showActions && (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleView} className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              {canJoin && (
                <Button
                  onClick={handleJoin}
                  disabled={isJoining}
                  className="flex-1"
                >
                  {isJoining ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Join Fund
                    </>
                  )}
                </Button>
              )}
              {isCreator && (
                <Button variant="secondary" className="flex-1" disabled>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Your Fund
                </Button>
              )}
              {isFull && !isCreator && (
                <Button variant="secondary" className="flex-1" disabled>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Fund Full
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-shadow hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{fundInfo.fundName}</CardTitle>
            <CardDescription className="line-clamp-1">
              {fundInfo.description}
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <DollarSign className="h-4 w-4" />
              <span>Amount</span>
            </div>
            <p className="font-semibold">{contributionAmount} FLOW</p>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center space-x-2 text-sm">
              <Users className="h-4 w-4" />
              <span>Members</span>
            </div>
            <p className="font-semibold">
              {fundInfo.currentMembers}/{fundInfo.totalMembers}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Member Progress</span>
            <span>{Math.round(memberProgress)}%</span>
          </div>
          <Progress value={memberProgress} className="h-2" />
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleView} className="flex-1">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            {canJoin && (
              <Button
                onClick={handleJoin}
                disabled={isJoining}
                className="flex-1"
              >
                {isJoining ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Join
                  </>
                )}
              </Button>
            )}
            {isCreator && (
              <Button variant="secondary" className="flex-1" disabled>
                <CheckCircle className="mr-2 h-4 w-4" />
                Your Fund
              </Button>
            )}
            {isFull && !isCreator && (
              <Button variant="secondary" className="flex-1" disabled>
                <AlertCircle className="mr-2 h-4 w-4" />
                Full
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
