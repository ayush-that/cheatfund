"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Button } from "../button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  Clock,
  Gavel,
  ArrowRight,
  History,
} from "lucide-react";
import numeral from "numeral";

interface Activity {
  id: string;
  type: "payment" | "bid_won" | "bid_placed" | "fund_joined" | "fund_created";
  title: string;
  description: string;
  amount?: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  fundName: string;
}

interface StatsOverviewProps {
  userStats: {
    totalBalance: string;
    totalInvested: string;
    activeFunds: number;
    completedFunds: number;
    nextPaymentDue: string | null;
    monthlyCommitment: string;
  };
  recentActivities: Activity[];
}

export function StatsOverview({
  userStats,
  recentActivities,
}: StatsOverviewProps) {
  const formatNumber = (value: string) => {
    const num = Number.parseFloat(value);
    return numeral(num).format("0.0a");
  };

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "bid_won":
      case "bid_placed":
        return <Gavel className="h-4 w-4" />;
      case "fund_joined":
        return <Users className="h-4 w-4" />;
      case "fund_created":
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "failed":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <div className="text-primary flex h-16 w-16 items-center justify-center rounded-lg">
                <DollarSign className="h-14 w-14" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Total FLOW Balance
                </p>
                <p className="text-foreground truncate text-lg font-bold">
                  {userStats.totalBalance} FLOW
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <div className="text-primary flex h-16 w-16 items-center justify-center rounded-lg">
                <Target className="h-14 w-14" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Invested
                </p>
                <p className="text-foreground truncate text-lg font-bold">
                  {formatNumber(userStats.totalInvested)} FLOW
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <div className="text-primary flex h-16 w-16 items-center justify-center rounded-lg">
                <Users className="h-14 w-14" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Active Funds
                </p>
                <p className="text-foreground truncate text-lg font-bold">
                  {userStats.activeFunds}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center space-x-3">
              <div className="text-primary flex h-16 w-16 items-center justify-center rounded-lg">
                <History className="h-14 w-14" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs font-medium">
                  Recent Activity
                </p>
                <p className="text-foreground truncate text-lg font-bold">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="hover:bg-muted/50 flex items-center space-x-4 rounded-lg transition-colors"
                    >
                      <p className="text-muted-foreground mt-1 text-xs">
                        {activity.description}
                      </p>
                    </div>
                  ))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities Section */}
      {/* {recentActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <History className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="hover:bg-muted/50 flex items-center space-x-4 rounded-lg p-3 transition-colors"
              >
                <div className=" text-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-foreground truncate text-sm font-medium">
                      {activity.title}
                    </p>
                    {activity.amount && (
                      <span className="text-foreground ml-2 text-sm font-medium">
                        {activity.amount} FLOW
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mt-1 truncate text-xs">
                    {activity.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">
                      {activity.fundName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getStatusColor(activity.status)}`}
                      >
                        {activity.status}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {activity.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )} */}

      {/* Empty State */}
      {recentActivities.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Clock className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <h3 className="text-foreground mb-2 text-lg font-semibold">
                No Recent Activity
              </h3>
              <p className="text-muted-foreground text-sm">
                Your recent fund activities will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
