"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Clock, Users, TrendingUp, Gavel } from "lucide-react";

interface Bid {
  id: string;
  bidder: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
}

interface Auction {
  id: string;
  title: string;
  description: string;
  currentBid: number;
  minimumBid: number;
  timeRemaining: string;
  totalBidders: number;
  status: "active" | "ending" | "ended";
}

const demoAuction: Auction = {
  id: "auction-001",
  title: "Monthly Chit Fund Round #12",
  description:
    "This is a 12-month chit fund with 20 participants. Each participant contributes ₹5,000 monthly, and the total pot is ₹100,000.",
  currentBid: 85000,
  minimumBid: 80000,
  timeRemaining: "2h 15m",
  totalBidders: 8,
  status: "active",
};

const existingBids: Bid[] = [
  {
    id: "bid-001",
    bidder: "Alice Johnson",
    amount: 90000,
    timestamp: "2 hours ago",
    isWinning: false,
  },
  {
    id: "bid-002",
    bidder: "Bob Smith",
    amount: 85000,
    timestamp: "1 hour ago",
    isWinning: true,
  },
];

export default function BiddingDemoPage() {
  const [userBid, setUserBid] = useState("");
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);

  const handlePlaceBid = async () => {
    if (!userBid || isNaN(Number(userBid))) return;

    setIsPlacingBid(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setBidPlaced(true);
    setIsPlacingBid(false);

    // Check if user is the winner (bid is lower than current lowest)
    if (Number(userBid) < demoAuction.currentBid) {
      setIsWinner(true);
    }
  };

  const handleTransferFunds = async () => {
    setIsTransferring(true);

    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 3000));

    setTransferComplete(true);
    setIsTransferring(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "ending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "ended":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Bidding</h1>
        <p className="text-muted-foreground">
          Experience the chit fund bidding process with live auction simulation
        </p>
      </div>

      {/* Auction Overview */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{demoAuction.title}</CardTitle>
              <CardDescription className="mt-2">
                {demoAuction.description}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(demoAuction.status)}>
              {demoAuction.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary h-12 w-12" />
              <div>
                <p className="text-muted-foreground text-sm">
                  Current Lowest Bid
                </p>
                <p className="font-semibold">
                  {formatCurrency(demoAuction.currentBid)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gavel className="text-primary h-12 w-12" />
              <div>
                <p className="text-muted-foreground text-sm">Maximum Bid</p>
                <p className="font-semibold">
                  {formatCurrency(demoAuction.minimumBid)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-primary h-12 w-12" />
              <div>
                <p className="text-muted-foreground text-sm">Time Left</p>
                <p className="font-semibold">{demoAuction.timeRemaining}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="text-primary h-12 w-12" />
              <div>
                <p className="text-muted-foreground text-sm">Bidders</p>
                <p className="font-semibold">{demoAuction.totalBidders}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Existing Bids */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Bids</CardTitle>
            <CardDescription>
              See what other participants have bid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingBids.map((bid) => (
                <div
                  key={bid.id}
                  className={`rounded-lg border p-4 ${
                    bid.isWinning
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{bid.bidder}</p>
                      <p className="text-muted-foreground text-sm">
                        {bid.timestamp}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {formatCurrency(bid.amount)}
                      </p>
                      {bid.isWinning && (
                        <Badge variant="default" className="mt-1">
                          Winning
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Place Your Bid */}
        <Card>
          <CardHeader>
            <CardTitle>Place Your Bid</CardTitle>
            <CardDescription>
              Enter your bid amount to participate in this auction
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bidPlaced ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <Gavel className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  Bid Placed Successfully!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your bid of {formatCurrency(Number(userBid))} has been
                  submitted.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setBidPlaced(false);
                    setUserBid("");
                  }}
                >
                  Place Another Bid
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Bid Amount (₹)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter your bid amount"
                    value={userBid}
                    onChange={(e) => setUserBid(e.target.value)}
                    min={demoAuction.minimumBid}
                    step="100"
                  />
                  <p className="text-muted-foreground mt-1 text-xs">
                    Maximum bid: {formatCurrency(demoAuction.minimumBid)} (Total
                    Chit Amount)
                  </p>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <h4 className="mb-2 font-medium">Bid Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Your Bid:</span>
                      <span className="font-medium">
                        {userBid ? formatCurrency(Number(userBid)) : "₹0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Lowest:</span>
                      <span>{formatCurrency(demoAuction.currentBid)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 font-semibold">
                      <span>Your Discount:</span>
                      <span
                        className={
                          Number(userBid) < demoAuction.currentBid
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {userBid
                          ? formatCurrency(
                              demoAuction.currentBid - Number(userBid),
                            )
                          : "₹0"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handlePlaceBid}
                  disabled={
                    !userBid ||
                    Number(userBid) > demoAuction.minimumBid ||
                    isPlacingBid
                  }
                >
                  {isPlacingBid ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                      Placing Bid...
                    </>
                  ) : (
                    <>
                      <Gavel className="mr-2 h-4 w-4" />
                      Place Bid
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Winner Declaration */}
      {isWinner && !transferComplete && (
        <Card className="mt-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <Gavel className="h-6 w-6" />
              🎉 Congratulations! You Won the Auction!
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              Your bid of {formatCurrency(Number(userBid))} was the lowest bid.
              You are now the winner of this chit fund round.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border bg-white p-4 dark:bg-gray-800">
                <h4 className="mb-3 font-semibold">Winning Details</h4>
                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Your Winning Bid:</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(Number(userBid))}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Chit Amount:</p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(100000)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Your Discount:</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrency(100000 - Number(userBid))}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Amount You'll Receive:
                    </p>
                    <p className="text-lg font-semibold">
                      {formatCurrency(Number(userBid))}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <h4 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">
                  Next Steps
                </h4>
                <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-300">
                  <li>• Funds will be transferred to your account</li>
                  <li>
                    • Discount amount will be distributed to other members
                  </li>
                  <li>• Transaction will be processed on blockchain</li>
                </ul>
              </div>

              <Button
                onClick={handleTransferFunds}
                disabled={isTransferring}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isTransferring ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                    Processing Transfer...
                  </>
                ) : (
                  <>
                    <Gavel className="mr-2 h-4 w-4" />
                    Transfer Funds to My Account
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transfer Complete */}
      {transferComplete && (
        <Card className="mt-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600">
                <span className="font-bold text-white">✓</span>
              </div>
              Transfer Complete!
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-300">
              Your funds have been successfully transferred to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border bg-white p-4 dark:bg-gray-800">
                <h4 className="mb-3 font-semibold">Transaction Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Transaction Hash:</span>
                    <span className="font-mono text-xs">
                      0x7a8b9c2d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Transferred:</span>
                    <span className="font-semibold">
                      {formatCurrency(Number(userBid))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Fee:</span>
                    <span>₹50</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Received:</span>
                    <span>{formatCurrency(Number(userBid) - 50)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                <h4 className="mb-2 font-semibold text-blue-700 dark:text-blue-300">
                  What Happens Next?
                </h4>
                <ul className="space-y-1 text-sm text-blue-600 dark:text-blue-300">
                  <li>• You have received your winning bid amount</li>
                  <li>
                    • The discount of {formatCurrency(100000 - Number(userBid))}{" "}
                    will be distributed to other 19 members
                  </li>
                  <li>
                    • Each member will receive approximately{" "}
                    {formatCurrency(
                      Math.floor((100000 - Number(userBid)) / 19),
                    )}
                  </li>
                  <li>• You are now out of this chit fund round</li>
                </ul>
              </div>

              <Button
                onClick={() => {
                  setBidPlaced(false);
                  setIsWinner(false);
                  setTransferComplete(false);
                  setUserBid("");
                }}
                variant="outline"
                className="w-full"
              >
                Start New Auction
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
