"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Users, Clock, Loader2, AlertCircle } from "lucide-react";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import { StatsOverview } from "~/components/ui/dashboard/stats-overview";
import { RecentActivity } from "~/components/ui/dashboard/recent-activity";
import { useHomePageData } from "~/hooks/useHomePageData";
import Link from "next/link";

export default function HomePage() {
  const { data, loading, error, refetch } = useHomePageData();

  if (loading) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </WalletGuard>
    );
  }

  if (error) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <span className="ml-2 text-red-500">
            Error loading dashboard: {error}
          </span>
        </div>
      </WalletGuard>
    );
  }

  if (!data) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <span>No data available</span>
        </div>
      </WalletGuard>
    );
  }

  const { userStats, recentActivities, activeFunds, publicFunds } = data;

  return (
    <WalletGuard>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your chit fund activities
            </p>
          </div>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Fund
            </Link>
          </Button>
        </div>

        <StatsOverview userStats={userStats} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <RecentActivity activities={recentActivities} />

            <div className="space-y-4">
              <h2 className="text-foreground text-xl font-semibold">
                Your Active Funds
              </h2>
              <div className="grid gap-4">
                {activeFunds.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No active funds yet
                      </p>
                      <Button asChild className="mt-4">
                        <Link href="/create">Create Your First Fund</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  activeFunds.map((fund) => (
                    <Card
                      key={fund.id}
                      className="hover:bg-card/80 cursor-pointer transition-colors"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {fund.name}
                            </CardTitle>
                            <CardDescription>
                              Organized by {fund.organizer.slice(0, 6)}...
                              {fund.organizer.slice(-4)}
                            </CardDescription>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-primary/10 text-primary"
                          >
                            <Clock className="mr-1 h-3 w-3" />
                            {fund.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="text-foreground font-semibold">
                              {fund.totalAmount} ETH
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="text-foreground font-semibold">
                              {fund.duration} months
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Participants
                            </p>
                            <p className="text-foreground flex items-center font-semibold">
                              <Users className="mr-1 h-3 w-3" />
                              {fund.currentParticipants}/{fund.maxParticipants}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Next Bid</p>
                            <p className="text-foreground font-semibold">
                              {fund.nextBidDate || "TBD"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/fund/${encodeURIComponent(fund.name)}/${fund.organizer}`}
                            >
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-foreground text-xl font-semibold">
                Discover Public Funds
              </h2>
              <div className="grid gap-4">
                {publicFunds.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">
                        No public funds available
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  publicFunds.slice(0, 3).map((fund) => (
                    <Card
                      key={fund.id}
                      className="hover:bg-card/80 cursor-pointer transition-colors"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {fund.name}
                            </CardTitle>
                            <CardDescription>
                              {fund.description}
                            </CardDescription>
                          </div>
                          <Badge variant="outline">{fund.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="text-foreground font-semibold">
                              {fund.totalAmount} ETH
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Duration</p>
                            <p className="text-foreground font-semibold">
                              {fund.duration} months
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Participants
                            </p>
                            <p className="text-foreground flex items-center font-semibold">
                              <Users className="mr-1 h-3 w-3" />
                              {fund.currentParticipants}/{fund.maxParticipants}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Organizer</p>
                            <p className="text-foreground font-semibold">
                              {fund.organizer.slice(0, 6)}...
                              {fund.organizer.slice(-4)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90"
                            asChild
                          >
                            <Link
                              href={`/join/${encodeURIComponent(fund.name)}/${fund.organizer}`}
                            >
                              Join Fund
                            </Link>
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link
                              href={`/join/${encodeURIComponent(fund.name)}/${fund.organizer}`}
                            >
                              View Details
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          <div></div>
        </div>
      </div>
    </WalletGuard>
  );
}
