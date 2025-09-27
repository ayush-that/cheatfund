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
import { Separator } from "~/components/ui/separator";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import { useWallet } from "~/lib/wallet";
import { useChitFund } from "~/hooks/contracts/useChitFund";
import { useTransactionManager } from "~/hooks/contracts/useTransactionManager";
import { TransactionStatus } from "~/components/ui/transaction/transaction-status";
import { switchToFlowTestnet, checkNetwork } from "~/lib/web3";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Info,
  Loader2,
} from "lucide-react";
import Link from "next/link";

export default function JoinFundPage() {
  const contractAddress = "0x66cb2eb0baa986b241d43d652ae912a4dbfce50c";
  const params = useParams();
  const router = useRouter();
  const { address, balance } = useWallet();
  const fundName = decodeURIComponent(params.fundName as string);
  const organizer = params.organizer as string;
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [currentTx, setCurrentTx] = useState<string | null>(null);

  const {
    joinFund,
    getFundData,
    loading: contractLoading,
    error: contractError,
  } = useChitFund(contractAddress);
  const { addTransaction, getTransaction } = useTransactionManager();

  const [fundData, setFundData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>("");

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
          nextRoundDate: fund.startDate
            ? new Date(fund.startDate).toISOString().split("T")[0]
            : null,
        };

        setFundData(completeFundData);
      } catch (err) {
        setFetchError("Failed to load fund data");
      } finally {
        setLoading(false);
      }
    };

    fetchFundData();
  }, [fundName, organizer]);

  const canJoin =
    fundData &&
    fundData.currentParticipants < fundData.maxParticipants &&
    fundData.status === "recruiting" &&
    Number.parseFloat(balance || "0") >=
      Number.parseFloat(fundData.monthlyAmount);

  const handleJoinFund = async () => {
    if (!canJoin) return;
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsJoining(true);
    setJoinError("");

    try {
      // Check and switch to Flow Testnet
      const isOnFlowTestnet = await checkNetwork();
      if (!isOnFlowTestnet) {
        toast.loading("Switching to Flow Testnet...", { id: "switch-network" });
        const switched = await switchToFlowTestnet();
        if (!switched) {
          toast.error("Please switch to Flow Testnet to join funds", {
            id: "switch-network",
          });
          setIsJoining(false);
          return;
        }
        toast.success("Switched to Flow Testnet!", { id: "switch-network" });
      }

      toast.loading("Joining fund...", { id: "join-fund" });
      const result = await joinFund();

      if (result.success && result.txHash) {
        addTransaction(result.txHash);
        setCurrentTx(result.txHash);

        toast.success("Join transaction submitted!", { id: "join-fund" });

        setTimeout(async () => {
          try {
            await fetch("/api/funds/members", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fundId: fundData.id,
                memberAddress: address,
              }),
            });

            await fetch("/api/funds/activity", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                fundId: fundData.id,
                activityType: "member_joined",
                description: `Member ${address} joined the fund`,
                memberAddress: address,
                transactionHash: result.txHash,
              }),
            });

            toast.success("Successfully joined the fund!");
            router.push(`/fund/${encodeURIComponent(fundName)}/${organizer}`);
          } catch (dbError) {
            toast.error("Joined fund but failed to save member data");
            router.push(`/fund/${encodeURIComponent(fundName)}/${organizer}`);
          }
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to join fund", { id: "join-fund" });
      setJoinError(error.message || "Failed to join fund. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) {
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

  return (
    <WalletGuard>
      <div className="bg-background min-h-screen">
        <div className="border-border bg-card/50 border-b backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/home">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
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

        <div className="container mx-auto max-w-4xl px-4 py-6">
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
                            {fundData.totalAmount} ETH
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
                          <p className="font-semibold">{fundData.startDate}</p>
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
                        {fundData.monthlyAmount} ETH
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
                        {fundData.minimumBid} ETH
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Lowest possible bid
                      </p>
                    </div>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      You'll pay {fundData.monthlyAmount} ETH every month. When
                      you win a round through bidding, you'll receive the full
                      fund amount and pay the difference between your bid and
                      the monthly amount.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <p>
                        Monthly payments are mandatory and must be made on time
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <p>
                        Bidding is open to all participants during designated
                        periods
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <p>
                        All transactions are secured by smart contracts on
                        Ethereum
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <p>
                        Funds are distributed transparently based on bidding
                        results
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <p>
                        Early withdrawal may result in penalties as per fund
                        rules
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Join This Fund</CardTitle>
                  <CardDescription>
                    {fundData.maxParticipants - fundData.currentParticipants}{" "}
                    spots remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Wallet Balance
                      </span>
                      <span
                        className={
                          Number.parseFloat(balance || "0") >=
                          Number.parseFloat(fundData.monthlyAmount)
                            ? "text-green-600"
                            : "text-destructive"
                        }
                      >
                        {balance || "0"} ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Required</span>
                      <span className="font-medium">
                        {fundData.monthlyAmount} ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Available Spots
                      </span>
                      <span className="font-medium">
                        {fundData.maxParticipants -
                          fundData.currentParticipants}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {joinError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{joinError}</AlertDescription>
                    </Alert>
                  )}

                  {!canJoin && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {Number.parseFloat(balance || "0") <
                        Number.parseFloat(fundData.monthlyAmount)
                          ? "Insufficient wallet balance to join this fund"
                          : fundData.currentParticipants >=
                              fundData.maxParticipants
                            ? "This fund is full"
                            : "This fund is not currently accepting new participants"}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    onClick={handleJoinFund}
                    disabled={!canJoin || isJoining}
                    className="bg-primary hover:bg-primary/90 w-full"
                  >
                    {isJoining || contractLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Joining Fund...
                      </>
                    ) : (
                      "Join Fund"
                    )}
                  </Button>

                  <p className="text-muted-foreground text-center text-xs">
                    By joining, you agree to the terms and conditions of this
                    chit fund.
                  </p>

                  {currentTx && (
                    <div className="mt-4">
                      <TransactionStatus
                        transaction={getTransaction(currentTx)!}
                        onClose={() => setCurrentTx(null)}
                      />
                    </div>
                  )}

                  {contractError && (
                    <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                      <strong>Error:</strong> {contractError}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Fund Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Success Rate</span>
                    <span className="font-medium text-green-600">98.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Organizer Rating
                    </span>
                    <span className="font-medium">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Funds Organized
                    </span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Volume</span>
                    <span className="font-medium">245.8 ETH</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </WalletGuard>
  );
}
