"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
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
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import { useWallet } from "~/lib/wallet";
import { useChitFund } from "~/hooks/contracts/useChitFund";
import { useContractEvents } from "~/hooks/contracts/useContractEvents";
import { CycleProgress } from "~/components/ui/fund/cycle-progress";
import { MembersList } from "~/components/ui/fund/members-list";
import { ContributionForm } from "~/components/ui/fund/contribution-form";
import { BiddingInterface } from "~/components/ui/fund/bidding-interface";
import { TransactionHistory } from "~/components/ui/fund/transaction-history";
import { formatEther } from "ethers";
import { ArrowLeft, Share2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ADDRESS_ZERO } from "~/lib/contracts";

export default function FundManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useWallet();

  const fundName = decodeURIComponent(params.fundName as string);
  const organizer = params.organizer as string;
  const isOrganizer = address?.toLowerCase() === organizer.toLowerCase();

  const contractAddress =
    process.env.NEXT_PUBLIC_CHIT_FUND_CONTRACT_ADDRESS || "";

  const {
    fundData,
    loading: fundLoading,
    error: fundError,
    joinFund,
    contribute,
    submitBid,
    getFundData,
  } = useChitFund(contractAddress);

  const { events, loading: eventsLoading } = useContractEvents(contractAddress);

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

  useEffect(() => {
    if (contractAddress) {
      getFundData();

      const interval = setInterval(() => {
        getFundData();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [contractAddress]);

  if (fundLoading) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p>Loading fund data...</p>
          </div>
        </div>
      </WalletGuard>
    );
  }

  if (fundError) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-8 w-8 text-red-500" />
            <p className="text-red-500">Error loading fund: {fundError}</p>
          </div>
        </div>
      </WalletGuard>
    );
  }

  if (!fundData) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p>Fund not found</p>
          </div>
        </div>
      </WalletGuard>
    );
  }

  const shareLink = `${window.location.origin}/join/${encodeURIComponent(fundName)}/${organizer}`;

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareLink);
  };

  return (
    <WalletGuard>
      <div className="bg-background min-h-screen">
        <div className="bg-card border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/home">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">
                    {fundData.fundInfo?.name || fundName}
                  </h1>
                  <p className="text-muted-foreground">Chit Fund Management</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    fundData.fundInfo?.isActive ? "default" : "secondary"
                  }
                >
                  {fundData.fundInfo?.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button variant="outline" size="sm" onClick={copyShareLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              {fundData.currentCycle && (
                <CycleProgress
                  cycleData={{
                    ...fundData.currentCycle,
                    phase: getCyclePhase(fundData.currentCycle),
                  }}
                  totalMembers={fundData.fundInfo?.totalMembers || 0}
                />
              )}

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

              <TransactionHistory
                contractAddress={contractAddress}
                events={events}
                maxItems={5}
              />
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Fund Summary</CardTitle>
                  <CardDescription>
                    Current status and key metrics
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
                      <p className="text-muted-foreground text-sm">Members</p>
                      <p className="font-semibold">
                        {fundData.fundInfo?.currentMembers || 0}/
                        {fundData.fundInfo?.totalMembers || 0}
                      </p>
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
                      <p className="text-muted-foreground text-sm">
                        Pool Amount
                      </p>
                      <p className="font-semibold">
                        {fundData.currentCycle?.totalPool
                          ? formatEther(fundData.currentCycle.totalPool)
                          : "0"}{" "}
                        FLOW
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Fund Progress
                      </span>
                      <span className="font-medium">
                        {Math.round(
                          ((fundData.fundInfo?.currentMembers || 0) /
                            (fundData.fundInfo?.totalMembers || 1)) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        ((fundData.fundInfo?.currentMembers || 0) /
                          (fundData.fundInfo?.totalMembers || 1)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  {/* Member Status */}
                  {fundData.memberStatus && (
                    <div className="border-t pt-4">
                      <h4 className="mb-2 text-sm font-medium">Your Status</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Member</span>
                          <span
                            className={
                              fundData.memberStatus.isMember
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {fundData.memberStatus.isMember ? "Yes" : "No"}
                          </span>
                        </div>
                        {fundData.memberStatus.isMember && (
                          <>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Contributed
                              </span>
                              <span
                                className={
                                  fundData.memberStatus.hasContributed
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }
                              >
                                {fundData.memberStatus.hasContributed
                                  ? "Yes"
                                  : "Pending"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Bid Submitted
                              </span>
                              <span
                                className={
                                  fundData.memberStatus.hasBid
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }
                              >
                                {fundData.memberStatus.hasBid ? "Yes" : "No"}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {fundData.currentCycle &&
                getCyclePhase(fundData.currentCycle) === "contribution" && (
                  <ContributionForm
                    contractAddress={contractAddress}
                    contributionAmount={
                      fundData.fundInfo?.contributionAmount || BigInt(0)
                    }
                    isEthBased={
                      fundData.fundInfo?.paymentToken === ADDRESS_ZERO
                    }
                    deadline={fundData.currentCycle.contributionDeadline}
                  />
                )}

              {fundData.currentCycle &&
                getCyclePhase(fundData.currentCycle) === "bidding" && (
                  <BiddingInterface
                    contractAddress={contractAddress}
                    cycleData={{
                      ...fundData.currentCycle,
                      phase: getCyclePhase(fundData.currentCycle),
                    }}
                  />
                )}

              {isOrganizer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Organizer Actions</CardTitle>
                    <CardDescription>
                      Manage your fund as the organizer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(
                          `/join/${encodeURIComponent(fundName)}/${organizer}`,
                        )
                      }
                    >
                      View Join Link
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={copyShareLink}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Fund
                    </Button>
                    {fundData.currentCycle &&
                      getCyclePhase(fundData.currentCycle) === "complete" && (
                        <Button className="w-full" onClick={() => {}}>
                          Start Next Cycle
                        </Button>
                      )}
                  </CardContent>
                </Card>
              )}

              {!fundData.memberStatus?.isMember && (
                <Card>
                  <CardHeader>
                    <CardTitle>Join This Fund</CardTitle>
                    <CardDescription>
                      Become a member to participate
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() =>
                        router.push(
                          `/join/${encodeURIComponent(fundName)}/${organizer}`,
                        )
                      }
                    >
                      Join Fund
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}
