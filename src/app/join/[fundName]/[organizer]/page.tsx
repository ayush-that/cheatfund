"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import { useWallet } from "~/lib/wallet";
import { useChitFund } from "~/hooks/contracts/useChitFund";
import { useTransactionManager } from "~/hooks/contracts/useTransactionManager";
import { JoinFundForm } from "~/components/ui/fund/join-fund-form";
import { switchToFlowTestnet, checkNetwork } from "~/lib/web3";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Info,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "~/lib/date-utils";

export default function JoinFundPage() {
  const params = useParams();
  const router = useRouter();
  const { balance } = useWallet();
  const fundName = decodeURIComponent(params.fundName as string);
  const organizer = params.organizer as string;
  const [contractAddress, setContractAddress] = useState<string>("");

  const { getFundData, error: contractError } = useChitFund(contractAddress);

  const [fundData, setFundData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>("");
  const [totalVolume, setTotalVolume] = useState<string>("0");

  useEffect(() => {
    const fetchFundData = async () => {
      try {
        setLoading(true);

        const fundsResponse = await fetch(
          "/api/funds/public?limit=100&offset=0",
        );
        if (!fundsResponse.ok) {
          throw new Error("Failed to fetch funds");
        }
        const { data: funds } = await fundsResponse.json();
        const fund = funds.find(
          (f: any) =>
            f.name.toLowerCase() === fundName.toLowerCase() &&
            f.organizer.toLowerCase() === organizer.toLowerCase(),
        );

        if (!fund) {
          setFetchError("Fund not found");
          return;
        }

        setContractAddress(fund.contractAddress);

        const blockchainData = await getFundData();

        const completeFundData = {
          ...fund,
          ...blockchainData,
          monthlyAmount: (
            Number(fund.totalAmount) / fund.maxParticipants
          ).toFixed(2),
          minimumBid: (
            (Number(fund.totalAmount) / fund.maxParticipants) *
            0.5
          ).toFixed(2),
          currentParticipants: fund.members?.length || 0,
          status:
            fund.members?.length >= fund.maxParticipants
              ? "full"
              : "recruiting",
          nextRoundDate: fund.startDate ? formatDate(fund.startDate) : null,
        };

        setFundData(completeFundData);

        const volumeResponse = await fetch("/api/funds/total-volume");
        if (volumeResponse.ok) {
          const { totalVolume: volume } = await volumeResponse.json();
          setTotalVolume(volume);
        }
      } catch (err) {
        setFetchError("Failed to load fund data");
      } finally {
        setLoading(false);
      }
    };

    fetchFundData();
  }, [fundName, organizer, getFundData]);

  const canJoin =
    fundData &&
    fundData.currentParticipants < fundData.maxParticipants &&
    fundData.status === "recruiting" &&
    Number.parseFloat(balance || "0") >=
      Number.parseFloat(fundData.monthlyAmount);

  if (loading || !contractAddress) {
    return (
      <WalletGuard>
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading fund data...</span>
          </div>
        </div>
      </WalletGuard>
    );
  }

  if (fetchError || !fundData) {
    return (
      <WalletGuard>
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <Alert variant="destructive">
            <AlertDescription>
              {fetchError || "Fund not found"}
            </AlertDescription>
          </Alert>
        </div>
      </WalletGuard>
    );
  }

  if (contractError) {
    return (
      <WalletGuard>
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          <Alert variant="destructive">
            <AlertDescription>Contract Error: {contractError}</AlertDescription>
          </Alert>
        </div>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <div className="bg-background min-h-screen">
        <div className="border-border bg-card/50 border-b backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-foreground text-xl font-bold">
                  Join Chit Fund
                </h1>
                <p className="text-muted-foreground text-sm">
                  Review fund details and join
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {fundData.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        Organized by {fundData.organizer.slice(0, 6)}...
                        {fundData.organizer.slice(-4)}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      {fundData.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {fundData.description}
                  </p>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Total Fund Amount
                          </p>
                          <p className="font-semibold">
                            {fundData.totalAmount} FLOW
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Duration
                          </p>
                          <p className="font-semibold">
                            {fundData.duration} months
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Users className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Participants
                          </p>
                          <p className="font-semibold">
                            {fundData.currentParticipants}/
                            {fundData.maxParticipants}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <div>
                          <p className="text-muted-foreground text-sm">
                            Start Date
                          </p>
                          <p className="font-semibold">
                            {formatDate(fundData.startDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Financial Commitment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-primary/5 border-primary/20 rounded-lg border p-4">
                      <p className="text-muted-foreground text-sm">
                        Monthly Payment
                      </p>
                      <p className="text-primary text-2xl font-bold">
                        {fundData.monthlyAmount} FLOW
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Due every month
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-muted-foreground text-sm">
                        Minimum Bid
                      </p>
                      <p className="text-xl font-semibold">
                        {fundData.minimumBid} FLOW
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Lowest possible bid
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      You'll pay {fundData.monthlyAmount} FLOW every month. When
                      you win a round through bidding, you'll receive the full
                      fund amount and pay the difference between your bid and
                      the monthly amount.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <JoinFundForm
                contractAddress={contractAddress}
                fundName={fundData.name}
                contributionAmount={BigInt(
                  Number.parseFloat(fundData.monthlyAmount) * 1e18,
                )}
                totalMembers={fundData.maxParticipants}
                currentMembers={fundData.currentParticipants}
                totalVolume={totalVolume}
                onSuccess={() => {
                  toast.success("Successfully joined the fund!");
                  router.push(
                    `/fund/${encodeURIComponent(fundData.name)}/${organizer}`,
                  );
                }}
                onError={(error) => {
                  toast.error(`Failed to join fund: ${error.message}`);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}
