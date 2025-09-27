"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  User,
  CheckCircle,
  Clock,
  Crown,
  AlertCircle,
  DollarSign,
  Users,
} from "lucide-react";
import { cn } from "~/lib/utils";

interface MemberData {
  wallet: string;
  hasContributed: boolean;
  hasBid: boolean;
  bidAmount?: number;
  isWinner: boolean;
  joinedAt: number;
  position: number;
}

interface MembersListProps {
  contractAddress: string;
  members: MemberData[];
  currentUserAddress?: string;
  showDetails?: boolean;
  className?: string;
}

export function MembersList({
  contractAddress,
  members,
  currentUserAddress,
  showDetails = false,
  className,
}: MembersListProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getMemberStatus = (member: MemberData) => {
    if (member.isWinner) {
      return {
        label: "Winner",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <Crown className="h-3 w-3" />,
      };
    }

    if (member.hasContributed && member.hasBid) {
      return {
        label: "Bid Submitted",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircle className="h-3 w-3" />,
      };
    }

    if (member.hasContributed) {
      return {
        label: "Contributed",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="h-3 w-3" />,
      };
    }

    return {
      label: "Pending",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <Clock className="h-3 w-3" />,
    };
  };

  const getMemberAvatar = (member: MemberData) => {
    const isCurrentUser =
      currentUserAddress?.toLowerCase() === member.wallet.toLowerCase();
    const initials = member.wallet.slice(2, 4).toUpperCase();

    return (
      <Avatar
        className={cn("h-10 w-10", isCurrentUser && "ring-2 ring-blue-500")}
      >
        <AvatarFallback
          className={cn(
            "text-sm font-semibold",
            isCurrentUser ? "bg-blue-100 text-blue-800" : "bg-gray-100",
          )}
        >
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  };

  const sortedMembers = [...members].sort((a, b) => a.position - b.position);
  const contributedCount = members.filter((m) => m.hasContributed).length;
  const bidCount = members.filter((m) => m.hasBid).length;
  const winner = members.find((m) => m.isWinner);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Members</CardTitle>
            <CardDescription>
              {members.length} members • {contributedCount} contributed •{" "}
              {bidCount} bids
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              <Users className="mr-1 h-3 w-3" />
              {members.length}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {winner && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-center space-x-2">
              <Crown className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Cycle Winner
              </span>
            </div>
            <p className="mt-1 text-sm text-yellow-700">
              {formatAddress(winner.wallet)} won with {winner.bidAmount}% bid
            </p>
          </div>
        )}

        <div className="space-y-3">
          {sortedMembers.map((member, index) => {
            const isCurrentUser =
              currentUserAddress?.toLowerCase() === member.wallet.toLowerCase();
            const status = getMemberStatus(member);

            return (
              <div
                key={member.wallet}
                className={cn(
                  "flex items-center space-x-3 rounded-lg border p-3",
                  isCurrentUser
                    ? "border-blue-200 bg-blue-50"
                    : "border-gray-200 bg-gray-50",
                )}
              >
                {getMemberAvatar(member)}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        isCurrentUser ? "text-blue-900" : "text-gray-900",
                      )}
                    >
                      {formatAddress(member.wallet)}
                      {isCurrentUser && " (You)"}
                    </p>
                    <Badge className={status.color}>
                      {status.icon}
                      <span className="ml-1">{status.label}</span>
                    </Badge>
                  </div>

                  {showDetails && (
                    <div className="text-muted-foreground mt-1 flex items-center space-x-4 text-xs">
                      <span>Position: {member.position}</span>
                      {member.bidAmount !== undefined && (
                        <span>Bid: {member.bidAmount}%</span>
                      )}
                      <span>
                        Joined:{" "}
                        {new Date(member.joinedAt * 1000).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-1">
                  {member.hasContributed && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs">Paid</span>
                    </div>
                  )}

                  {member.hasBid && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-xs">Bid</span>
                    </div>
                  )}

                  {member.isWinner && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Crown className="h-4 w-4" />
                      <span className="text-xs">Winner</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-4 border-t pt-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {contributedCount}
            </div>
            <div className="text-muted-foreground text-xs">Contributed</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {bidCount}
            </div>
            <div className="text-muted-foreground text-xs">Bids</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-600">
              {members.length - contributedCount}
            </div>
            <div className="text-muted-foreground text-xs">Pending</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
