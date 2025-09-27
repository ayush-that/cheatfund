"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Progress } from "~/components/ui/progress";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import { useWallet } from "~/lib/wallet";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Crown,
  Share2,
  Settings,
  UserPlus,
  Eye,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export default function FundManagementPage() {
  const params = useParams();
  const router = useRouter();
  const { address } = useWallet();

  const fundName = decodeURIComponent(params.fundName as string);
  const organizer = params.organizer as string;
  const isOrganizer = address?.toLowerCase() === organizer.toLowerCase();

  // Mock data - in real app, this would come from smart contract
  const fundData = {
    name: fundName,
    description:
      "A professional chit fund for tech workers to save and invest together.",
    totalAmount: "10.0",
    duration: 12,
    maxParticipants: 10,
    currentParticipants: 7,
    monthlyAmount: "1.0",
    currentRound: 3,
    status: "active",
    startDate: "2024-01-15",
    nextBidDate: "2024-04-15",
    isPublic: true,
    category: "Professional Groups",
  };

  const participants = [
    {
      address: "0x1234...5678",
      joinedDate: "2024-01-15",
      status: "active",
      position: 1,
    },
    {
      address: "0x2345...6789",
      joinedDate: "2024-01-16",
      status: "active",
      position: 2,
    },
    {
      address: "0x3456...7890",
      joinedDate: "2024-01-17",
      status: "active",
      position: 3,
    },
    {
      address: "0x4567...8901",
      joinedDate: "2024-01-18",
      status: "active",
      position: 4,
    },
    {
      address: "0x5678...9012",
      joinedDate: "2024-01-19",
      status: "active",
      position: 5,
    },
    {
      address: "0x6789...0123",
      joinedDate: "2024-01-20",
      status: "active",
      position: 6,
    },
    {
      address: "0x7890...1234",
      joinedDate: "2024-01-21",
      status: "active",
      position: 7,
    },
  ];

  const rounds = [
    {
      round: 1,
      winner: "0x1234...5678",
      bidAmount: "0.8",
      date: "2024-02-15",
      status: "completed",
    },
    {
      round: 2,
      winner: "0x2345...6789",
      bidAmount: "0.75",
      date: "2024-03-15",
      status: "completed",
    },
    {
      round: 3,
      winner: null,
      bidAmount: null,
      date: "2024-04-15",
      status: "bidding",
    },
  ];

  const shareLink = `${window.location.origin}/join/${encodeURIComponent(fundName)}/${organizer}`;

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(shareLink);
    // TODO: Show toast notification
  };

  return (
    <WalletGuard>
      <div className="bg-background min-h-screen">
        {/* Header */}
        <div className="border-border bg-card/50 border-b backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/home">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Link>
                </Button>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-foreground text-2xl font-bold">
                      Fund Management
                    </h1>
                    {isOrganizer && <Crown className="text-primary h-5 w-5" />}
                  </div>
                  <p className="h-2">{fundData.name}</p>
                  {/* <p className="text-muted-foreground">
                    Organized by {organizer.slice(0, 6)}...{organizer.slice(-4)}
                  </p> */}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={copyShareLink}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
                {isOrganizer && (
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto space-y-6 px-4 py-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Total Amount
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  {fundData.totalAmount} ETH
                </div>
                <p className="text-muted-foreground text-xs">
                  Monthly: {fundData.monthlyAmount} ETH
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
                  <Users className="mr-1 h-4 w-4" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  {fundData.currentParticipants}/{fundData.maxParticipants}
                </div>
                <Progress
                  value={
                    (fundData.currentParticipants / fundData.maxParticipants) *
                    100
                  }
                  className="mt-2"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
                  <Calendar className="mr-1 h-4 w-4" />
                  Current Round
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  {fundData.currentRound}/{fundData.duration}
                </div>
                <p className="text-muted-foreground text-xs">
                  Next: {fundData.nextBidDate}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-muted-foreground flex items-center text-sm font-medium">
                  <Eye className="mr-1 h-4 w-4" />
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary"
                >
                  <Clock className="mr-1 h-3 w-3" />
                  {fundData.status === "active" ? "Active" : "Inactive"}
                </Badge>
                <p className="text-muted-foreground mt-1 text-xs">
                  {fundData.isPublic ? "Public" : "Private"} Fund
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="rounds">Rounds</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Fund Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-foreground mb-2 font-medium">
                        Description
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        {fundData.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="text-foreground font-medium">
                          {fundData.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p className="text-foreground font-medium">
                          {fundData.startDate}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Duration</p>
                        <p className="text-foreground font-medium">
                          {fundData.duration} months
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Visibility</p>
                        <p className="text-foreground font-medium">
                          {fundData.isPublic ? "Public" : "Private"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="bg-primary h-2 w-2 rounded-full"></div>
                      <span className="text-muted-foreground">
                        Round 3 bidding started
                      </span>
                      <span className="text-muted-foreground ml-auto text-xs">
                        2 days ago
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-muted-foreground">
                        0x2345...6789 won Round 2
                      </span>
                      <span className="text-muted-foreground ml-auto text-xs">
                        1 month ago
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-muted-foreground">
                        New participant joined
                      </span>
                      <span className="text-muted-foreground ml-auto text-xs">
                        1 month ago
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Participants ({participants.length}/{fundData.maxParticipants}
                  )
                </h3>
                {isOrganizer && (
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Participants
                  </Button>
                )}
              </div>
              <div className="grid gap-4">
                {participants.map((participant, index) => (
                  <Card key={participant.address}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full">
                            <span className="text-primary text-sm font-medium">
                              {participant.position}
                            </span>
                          </div>
                          <div>
                            <p className="font-mono text-sm font-medium">
                              {participant.address}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              Joined {participant.joinedDate}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-600"
                        >
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rounds" className="space-y-4">
              <h3 className="text-lg font-semibold">Bidding Rounds</h3>
              <div className="grid gap-4">
                {rounds.map((round) => (
                  <Card key={round.round}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                            <span className="text-primary font-medium">
                              R{round.round}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">Round {round.round}</p>
                            <p className="text-muted-foreground text-sm">
                              {round.date}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {round.status === "completed" ? (
                            <div>
                              <p className="font-medium">
                                Winner: {round.winner}
                              </p>
                              <p className="text-muted-foreground text-sm">
                                Bid: {round.bidAmount} ETH
                              </p>
                            </div>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary"
                            >
                              Bidding Open
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                {isOrganizer ? (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Organizer Actions</CardTitle>
                        <CardDescription>
                          Manage your fund as the organizer
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="bg-primary hover:bg-primary/90 w-full">
                          Start Next Round
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          View All Bids
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          Send Notifications
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          Export Fund Data
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Fund Management</CardTitle>
                        <CardDescription>
                          Advanced fund management options
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          Update Fund Settings
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          Manage Participants
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          View Analytics
                        </Button>
                        <Button variant="destructive" className="w-full">
                          Emergency Actions
                        </Button>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card>
                      <CardHeader>
                        <CardTitle>Participant Actions</CardTitle>
                        <CardDescription>
                          Actions available to you as a participant
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button className="bg-primary hover:bg-primary/90 w-full">
                          Place Bid for Round 3
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          Make Monthly Payment
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          View Payment History
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                        >
                          Contact Organizer
                        </Button>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Status</CardTitle>
                        <CardDescription>
                          Your participation details
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Your Position:
                            </span>
                            <span className="font-medium">3/10</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Payments Made:
                            </span>
                            <span className="font-medium">3/12</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Next Payment:
                            </span>
                            <span className="font-medium">Apr 15, 2024</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Status:
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-green-500/10 text-green-600"
                            >
                              Good Standing
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </WalletGuard>
  );
}
