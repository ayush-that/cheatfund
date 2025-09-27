"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

export default function JoinFundPage() {
  const params = useParams();
  const router = useRouter();
  const { address, balance } = useWallet();

  const fundName = decodeURIComponent(params.fundName as string);
  const organizer = params.organizer as string;

  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  // Mock data - in real app, this would come from smart contract
  const fundData = {
    name: fundName,
    description:
      "A professional chit fund for tech workers to save and invest together.",
    organizer: organizer,
    totalAmount: "10.0",
    duration: 12,
    maxParticipants: 10,
    currentParticipants: 7,
    monthlyAmount: "1.0",
    minimumBid: "0.5",
    category: "Professional Groups",
    startDate: "2024-01-15",
    isPublic: true,
    status: "recruiting",
    nextRoundDate: "2024-04-15",
  };

  const canJoin =
    fundData.currentParticipants < fundData.maxParticipants &&
    fundData.status === "recruiting" &&
    Number.parseFloat(balance || "0") >=
      Number.parseFloat(fundData.monthlyAmount);

  const handleJoinFund = async () => {
    if (!canJoin) return;

    setIsJoining(true);
    setError("");

    try {
      // TODO: Implement smart contract interaction
      console.log("Joining fund:", { fundName, organizer, address });

      // Simulate joining process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to fund page
      router.push(`/fund/${encodeURIComponent(fundName)}/${organizer}`);
    } catch (error) {
      console.error("Error joining fund:", error);
      setError("Failed to join fund. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <WalletGuard>
      <div className="bg-background min-h-screen">
        {/* Header */}
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
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Fund Overview */}
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

              {/* Financial Details */}
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

              {/* Terms and Conditions */}
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Join Action */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Join This Fund</CardTitle>
                  <CardDescription>
                    {fundData.maxParticipants - fundData.currentParticipants}{" "}
                    spots remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Eligibility Check */}
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

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
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
                    {isJoining ? "Joining Fund..." : "Join Fund"}
                  </Button>

                  <p className="text-muted-foreground text-center text-xs">
                    By joining, you agree to the terms and conditions of this
                    chit fund.
                  </p>
                </CardContent>
              </Card>

              {/* Fund Stats */}
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
