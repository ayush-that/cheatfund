"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../card";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
} from "lucide-react";
import numeral from "numeral";

interface StatsOverviewProps {
  userStats: {
    totalBalance: string;
    totalInvested: string;
    totalReturns: string;
    activeFunds: number;
    completedFunds: number;
    nextPaymentDue: string | null;
    monthlyCommitment: string;
  };
}

export function StatsOverview({ userStats }: StatsOverviewProps) {
  const profitLoss =
    Number.parseFloat(userStats.totalReturns) -
    Number.parseFloat(userStats.totalInvested);
  const profitLossPercentage =
    (profitLoss / Number.parseFloat(userStats.totalInvested)) * 100;

  const formatNumber = (value: string) => {
    const num = Number.parseFloat(value);
    return numeral(num).format("0.0a");
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
            <DollarSign className="mr-1 h-4 w-4" />
            Total FLOW Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-foreground text-2xl font-bold">
            {formatNumber(userStats.totalBalance)} FLOW
          </div>
          <div className="mt-1 flex items-center">
            <span className="text-muted-foreground text-xs">
              Available balance
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
            <Target className="mr-1 h-4 w-4" />
            Invested
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-foreground text-2xl font-bold">
            {formatNumber(userStats.totalInvested)} FLOW
          </div>
          <div className="mt-1 flex items-center">
            <span className="text-muted-foreground text-xs">
              Total invested amount
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
            <TrendingUp className="mr-1 h-4 w-4" />
            Returns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-foreground text-2xl font-bold">
            {formatNumber(userStats.totalReturns)} FLOW
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
    </div>
  );
}
