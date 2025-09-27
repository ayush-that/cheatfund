"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Progress } from "../progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  Target,
} from "lucide-react";

interface StatsOverviewProps {
  userStats: {
    totalInvested: string;
    totalReturns: string;
    activeFunds: number;
    completedFunds: number;
    successRate: number;
    nextPaymentDue: string;
    monthlyCommitment: string;
  };
}

export function StatsOverview({ userStats }: StatsOverviewProps) {
  const profitLoss =
    Number.parseFloat(userStats.totalReturns) -
    Number.parseFloat(userStats.totalInvested);
  const profitLossPercentage =
    (profitLoss / Number.parseFloat(userStats.totalInvested)) * 100;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
            <DollarSign className="mr-1 h-4 w-4" />
            Total Invested
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-foreground text-2xl font-bold">
            {userStats.totalInvested} ETH
          </div>
          <div className="mt-1 flex items-center">
            <span className="text-muted-foreground text-xs">
              Monthly: {userStats.monthlyCommitment} ETH
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
            <Target className="mr-1 h-4 w-4" />
            Total Returns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-foreground text-2xl font-bold">
            {userStats.totalReturns} ETH
          </div>
          <div className="mt-1 flex items-center">
            {profitLoss >= 0 ? (
              <div className="flex items-center text-green-600">
                <TrendingUp className="mr-1 h-3 w-3" />
                <span className="text-xs">
                  +{profitLossPercentage.toFixed(1)}%
                </span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <TrendingDown className="mr-1 h-3 w-3" />
                <span className="text-xs">
                  {profitLossPercentage.toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
            <Users className="mr-1 h-4 w-4" />
            Active Funds
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-foreground text-2xl font-bold">
            {userStats.activeFunds}
          </div>
          <div className="mt-1 flex items-center">
            <span className="text-muted-foreground text-xs">
              {userStats.completedFunds} completed
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
            <Calendar className="mr-1 h-4 w-4" />
            Success Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-primary text-2xl font-bold">
            {userStats.successRate}%
          </div>
          <Progress value={userStats.successRate} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}
