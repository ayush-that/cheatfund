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

export default function FundManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useWallet();

  const fundName = decodeURIComponent(params.fundName as string);
  const organizer = params.organizer as string;
  const isOrganizer = address?.toLowerCase() === organizer.toLowerCase();

  const contractAddress = (params.contractAddress as string) || organizer;

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

  useEffect(() => {
    if (contractAddress) {
      getFundData();
    }
  }, [contractAddress, getFundData]);

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
                  <p className="text-muted-foreground">
                    {fundData.fundInfo?.description || "Chit Fund"}
                  </p>
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
                  cycleData={fundData.currentCycle}
                  totalMembers={fundData.fundInfo?.totalMembers || 0}
                />
              )}

              {fundData.members && (
                <MembersList
                  contractAddress={contractAddress}
                  members={fundData.members}
                  currentUserAddress={address}
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
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Total Amount
                      </p>
                      <p className="font-semibold">
                        {fundData.fundInfo?.contributionAmount
                          ? formatEther(fundData.fundInfo.contributionAmount)
                          : "0"}{" "}
                        ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Members</p>
                      <p className="font-semibold">
                        {fundData.fundInfo?.currentMembers || 0}/
                        {fundData.fundInfo?.totalMembers || 0}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Progress
                      value={
                        ((fundData.fundInfo?.currentMembers || 0) /
                          (fundData.fundInfo?.totalMembers || 1)) *
                        100
                      }
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {fundData.currentCycle?.phase === "contribution" && (
                <ContributionForm
                  contractAddress={contractAddress}
                  contributionAmount={
                    fundData.fundInfo?.contributionAmount || BigInt(0)
                  }
                  isEthBased={
                    fundData.fundInfo?.paymentToken ===
                    "0x0000000000000000000000000000000000000000"
                  }
                  deadline={fundData.currentCycle.contributionDeadline}
                />
              )}

              {fundData.currentCycle?.phase === "bidding" && (
                <BiddingInterface
                  contractAddress={contractAddress}
                  cycleData={fundData.currentCycle}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}
