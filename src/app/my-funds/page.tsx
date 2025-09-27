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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Crown,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  DollarSign,
  Target,
  CheckCircle,
} from "lucide-react";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import { useMyFundsData } from "~/hooks/useMyFundsData";
import Link from "next/link";
import { formatEther } from "ethers";
import { formatDate, getNextPaymentDate } from "~/lib/date-utils";

export default function MyFundsPage() {
  const { data, loading, error, refetch } = useMyFundsData();

  if (loading) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <span>Loading your funds...</span>
          </div>
        </div>
      </WalletGuard>
    );
  }

  if (error) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
            <span className="mb-4 block text-red-500">
              Error loading funds: {error}
            </span>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </WalletGuard>
    );
  }

  if (!data) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <span className="text-lg">No data available</span>
            <p className="text-muted-foreground mt-2">
              This might be because you have not joined any funds yet.
            </p>
            <Button onClick={refetch} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </WalletGuard>
    );
  }

  const { participatingFunds, organizingFunds } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "contribution":
        return (
          <Badge variant="destructive">
            <AlertCircle className="mr-1 h-3 w-3" />
            Action Required
          </Badge>
        );
      case "bidding":
        return (
          <Badge variant="default">
            <Target className="mr-1 h-3 w-3" />
            Bidding Open
          </Badge>
        );
      case "active":
        return (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Clock className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  const getActionButton = (fund: any) => {
    switch (fund.nextAction) {
      case "contribute":
        return (
          <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
            <Link
              href={`/fund/${encodeURIComponent(fund.name)}/${fund.organizer}`}
            >
              <DollarSign className="mr-1 h-3 w-3" />
              Contribute
            </Link>
          </Button>
        );
      case "bid":
        return (
          <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
            <Link
              href={`/fund/${encodeURIComponent(fund.name)}/${fund.organizer}`}
            >
              <Target className="mr-1 h-3 w-3" />
              Place Bid
            </Link>
          </Button>
        );
      case "wait":
        return (
          <Button size="sm" variant="outline" disabled>
            <Clock className="mr-1 h-3 w-3" />
            Waiting
          </Button>
        );
      default:
        return null;
    }
  };

  const getOrganizerActionButton = (fund: any) => {
    switch (fund.nextAction) {
      case "manage":
        return (
          <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
            <Link
              href={`/fund/${encodeURIComponent(fund.name)}/${fund.organizer}`}
            >
              Manage Fund
            </Link>
          </Button>
        );
      case "close_bidding":
        return (
          <Button size="sm" className="bg-primary hover:bg-primary/90" asChild>
            <Link
              href={`/fund/${encodeURIComponent(fund.name)}/${fund.organizer}`}
            >
              Close Bidding
            </Link>
          </Button>
        );
      case "add_members":
        return (
          <Button size="sm" variant="outline" asChild>
            <Link
              href={`/fund/${encodeURIComponent(fund.name)}/${fund.organizer}`}
            >
              Add Members
            </Link>
          </Button>
        );
      default:
        return null; // Don't render anything for default case
    }
  };

  return (
    <WalletGuard>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">
              My Chit Funds
            </h1>
            <p className="text-muted-foreground">
              Manage your participations and organized funds
            </p>
          </div>
          <Button onClick={refetch} variant="outline">
            Refresh
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="participating" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participating">
              Participating ({participatingFunds.length})
            </TabsTrigger>
            <TabsTrigger value="organizing">
              Organizing ({organizingFunds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participating" className="space-y-4">
            {participatingFunds.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    You are not participating in any funds yet
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Discover and join funds to start participating
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/discover">Discover Funds</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {participatingFunds.map((fund) => (
                  <Card key={fund.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{fund.name}</CardTitle>
                          <CardDescription>
                            Organized by {fund.organizer.slice(0, 6)}...
                            {fund.organizer.slice(-4)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(fund.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground">
                            Monthly Amount
                          </p>
                          <p className="text-foreground font-semibold">
                            {fund.monthlyAmount} FLOW
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Your Position</p>
                          <p className="text-foreground font-semibold">
                            {fund.userPosition}/{fund.maxParticipants}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="text-foreground font-semibold capitalize">
                            {fund.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Payment</p>
                          <p className="text-foreground font-semibold">
                            {fund.nextPaymentDate || "TBD"}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {getActionButton(fund)}
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
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="organizing" className="space-y-4">
            {organizingFunds.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    You have not organized any funds yet
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Create your first fund to start organizing
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/create">Create Fund</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {organizingFunds.map((fund) => (
                  <Card key={fund.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center text-lg">
                            <Crown className="text-primary mr-2 h-4 w-4" />
                            {fund.name}
                          </CardTitle>
                          <CardDescription>
                            You are the organizer
                          </CardDescription>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          <Users className="mr-1 h-3 w-3" />
                          {fund.memberCount}/{fund.maxParticipants} Members
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground">Fund Amount</p>
                          <p className="text-foreground font-semibold">
                            {fund.totalAmount} FLOW
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="text-foreground font-semibold">
                            {fund.duration} months
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Current Round</p>
                          <p className="text-foreground font-semibold">
                            {fund.currentCycle}/{fund.duration}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Status</p>
                          <p className="text-foreground font-semibold capitalize">
                            {fund.status}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {getOrganizerActionButton(fund)}
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
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </WalletGuard>
  );
}
