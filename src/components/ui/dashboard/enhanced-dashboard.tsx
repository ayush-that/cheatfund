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
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Alert, AlertDescription } from "~/components/ui/alert";
import {
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Timer,
  Target,
} from "lucide-react";
import { useWallet } from "~/lib/wallet";
import { useChitFund } from "~/hooks/contracts/useChitFund";
import { useContractEvents } from "~/hooks/contracts/useContractEvents";
import { CycleProgress } from "~/components/ui/fund/cycle-progress";
import { MembersList } from "~/components/ui/fund/members-list";
import { ContributionForm } from "~/components/ui/fund/contribution-form";
import { BiddingInterface } from "~/components/ui/fund/bidding-interface";
import { TransactionHistory } from "~/components/ui/fund/transaction-history";
import { formatEther } from "ethers";
import { cn } from "~/lib/utils";
import { ADDRESS_ZERO } from "~/lib/contracts";

interface EnhancedDashboardProps {
  contractAddress: string;
  fundName: string;
  organizer: string;
  isOrganizer?: boolean;
}

export function EnhancedDashboard({
  contractAddress,
  fundName,
  organizer,
  isOrganizer = false,
}: EnhancedDashboardProps) {
  const { address } = useWallet();
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const {
    fundData,
    loading: fundLoading,
    error: fundError,
    getFundData,
  } = useChitFund(contractAddress);

  const { events, loading: eventsLoading } = useContractEvents(contractAddress);

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey((prev) => prev + 1);
      setLastUpdate(new Date());
      getFundData();
    }, 30000);

    return () => clearInterval(interval);
  }, [getFundData]);

  const getCyclePhase = (
    cycle: any,
  ): "contribution" | "bidding" | "complete" => {
    if (!cycle || !cycle.isActive) return "complete";

    const now = Math.floor(Date.now() / 1000);

    if (now <= cycle.contributionDeadline) {
      return "contribution";
    } else if (now <= cycle.biddingDeadline) {
      return "bidding";
    } else {
      return "complete";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "recruiting":
        return "bg-blue-100 text-blue-800";
      case "full":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case "contribution":
        return <DollarSign className="h-4 w-4" />;
      case "bidding":
        return <Target className="h-4 w-4" />;
      case "complete":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (fundLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p>Loading fund data...</p>
        </div>
      </div>
    );
  }

  if (fundError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading fund: {fundError}</AlertDescription>
      </Alert>
    );
  }

  if (!fundData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Fund not found</AlertDescription>
      </Alert>
    );
  }

  const currentPhase = fundData.currentCycle
    ? getCyclePhase(fundData.currentCycle)
    : "complete";

  const participationRate = fundData.fundInfo?.totalMembers
    ? (fundData.fundInfo.currentMembers / fundData.fundInfo.totalMembers) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{fundName}</h2>
          <p className="text-muted-foreground">
            Organized by {organizer.slice(0, 6)}...{organizer.slice(-4)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor("active")}>
            <Activity className="mr-1 h-3 w-3" />
            Live
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRefreshKey((prev) => prev + 1);
              getFundData();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-sm">Total Pool</p>
                <p className="text-lg font-semibold">
                  {fundData.currentCycle?.totalPool
                    ? formatEther(fundData.currentCycle.totalPool)
                    : "0"}{" "}
                  FLOW
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-sm">Members</p>
                <p className="text-lg font-semibold">
                  {fundData.fundInfo?.currentMembers || 0}/
                  {fundData.fundInfo?.totalMembers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {getPhaseIcon(currentPhase)}
              <div>
                <p className="text-muted-foreground text-sm">Current Phase</p>
                <p className="text-lg font-semibold capitalize">
                  {currentPhase}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-muted-foreground h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-sm">Progress</p>
                <p className="text-lg font-semibold">
                  {Math.round(participationRate)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Fund Progress</span>
              <span>{Math.round(participationRate)}%</span>
            </div>
            <Progress value={participationRate} className="h-2" />
            <p className="text-muted-foreground text-xs">
              {fundData.fundInfo?.currentMembers || 0} of{" "}
              {fundData.fundInfo?.totalMembers || 0} members joined
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cycle">Current Cycle</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Fund Summary</CardTitle>
                <CardDescription>
                  Key information about this chit fund
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Contribution Amount
                    </p>
                    <p className="font-semibold">
                      {fundData.fundInfo?.contributionAmount
                        ? formatEther(fundData.fundInfo.contributionAmount)
                        : "0"}{" "}
                      FLOW
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Duration</p>
                    <p className="font-semibold">12 months</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Current Cycle
                    </p>
                    <p className="font-semibold">
                      {fundData.currentCycle?.cycleNumber || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Status</p>
                    <Badge variant="outline" className="ml-2">
                      {fundData.fundInfo?.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Status</CardTitle>
                <CardDescription>
                  Your participation in this fund
                </CardDescription>
              </CardHeader>
              <CardContent>
                {fundData.memberStatus ? (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member</span>
                      <Badge
                        variant={
                          fundData.memberStatus.isMember
                            ? "default"
                            : "secondary"
                        }
                      >
                        {fundData.memberStatus.isMember ? "Yes" : "No"}
                      </Badge>
                    </div>
                    {fundData.memberStatus.isMember && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Contributed
                          </span>
                          <Badge
                            variant={
                              fundData.memberStatus.hasContributed
                                ? "default"
                                : "secondary"
                            }
                          >
                            {fundData.memberStatus.hasContributed
                              ? "Yes"
                              : "Pending"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Bid Submitted
                          </span>
                          <Badge
                            variant={
                              fundData.memberStatus.hasBid
                                ? "default"
                                : "secondary"
                            }
                          >
                            {fundData.memberStatus.hasBid ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Not a member</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cycle" className="space-y-6">
          {fundData.currentCycle && (
            <CycleProgress
              cycleData={{
                ...fundData.currentCycle,
                phase: getCyclePhase(fundData.currentCycle),
              }}
              totalMembers={fundData.fundInfo?.totalMembers || 0}
            />
          )}

          {currentPhase === "contribution" && (
            <ContributionForm
              contractAddress={contractAddress}
              contributionAmount={
                fundData.fundInfo?.contributionAmount || BigInt(0)
              }
              isEthBased={fundData.fundInfo?.paymentToken === ADDRESS_ZERO}
              deadline={fundData.currentCycle?.contributionDeadline || 0}
            />
          )}

          {currentPhase === "bidding" && (
            <BiddingInterface
              contractAddress={contractAddress}
              cycleData={{
                ...fundData.currentCycle,
                phase: getCyclePhase(fundData.currentCycle),
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          {fundData.members && (
            <MembersList
              contractAddress={contractAddress}
              members={fundData.members.map((member, index) => ({
                ...member,
                joinedAt: Date.now() - index * 24 * 60 * 60 * 1000,
                position: index + 1,
              }))}
              currentUserAddress={address || undefined}
              showDetails={true}
            />
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionHistory
            contractAddress={contractAddress}
            events={events}
            maxItems={20}
          />
        </TabsContent>
      </Tabs>

      {/* Last Update Indicator */}
      <div className="text-muted-foreground text-center text-xs">
        Last updated: {lastUpdate.toLocaleTimeString()}
      </div>
    </div>
  );
}
