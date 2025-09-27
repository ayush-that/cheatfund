import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Plus, Users, Clock } from "lucide-react";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import { StatsOverview } from "~/components/ui/dashboard/stats-overview";
import { RecentActivity } from "~/components/ui/dashboard/recent-activity";
// import { UpcomingActions } from "~/components/ui/dashboard/upcoming-actions";

export default function HomePage() {
  const userStats = {
    totalInvested: "12.5",
    totalReturns: "13.8",
    activeFunds: 3,
    completedFunds: 2,
    successRate: 95,
    nextPaymentDue: "2024-04-15",
    monthlyCommitment: "3.0",
  };

  const recentActivities = [
    {
      id: "1",
      type: "bid_won" as const,
      title: "Won Round 3 Bidding",
      description: "You won the bidding round with 0.85 ETH",
      amount: "10.0",
      timestamp: "2 hours ago",
      status: "completed" as const,
      fundName: "Tech Professionals Fund #1",
    },
    {
      id: "2",
      type: "payment" as const,
      title: "Monthly Payment Made",
      description: "Successfully paid monthly contribution",
      amount: "1.0",
      timestamp: "1 day ago",
      status: "completed" as const,
      fundName: "Community Savings Fund",
    },
    {
      id: "3",
      type: "fund_joined" as const,
      title: "Joined New Fund",
      description: "Successfully joined as participant #8",
      timestamp: "3 days ago",
      status: "completed" as const,
      fundName: "Business Network Fund",
    },
  ];

  const upcomingActions = [
    {
      id: "1",
      type: "payment_due" as const,
      title: "Monthly Payment Due",
      description: "Payment due for Tech Professionals Fund #1",
      dueDate: "In 2 days",
      priority: "high" as const,
      fundName: "Tech Professionals Fund #1",
      amount: "1.0",
    },
    {
      id: "2",
      type: "bidding_open" as const,
      title: "Bidding Opens Soon",
      description: "Round 4 bidding starts tomorrow",
      dueDate: "Tomorrow",
      priority: "medium" as const,
      fundName: "Community Savings Fund",
    },
  ];

  return (
    <WalletGuard>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your chit fund activities
            </p>
          </div>
          {/* <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Create Fund
          </Button> */}
        </div>

        <StatsOverview userStats={userStats} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <RecentActivity activities={recentActivities} />

            {/* Active Funds */}
            <div className="space-y-4">
              <h2 className="text-foreground text-xl font-semibold">
                Active Funds
              </h2>
              <div className="grid gap-4">
                {[1, 2, 3].map((fund) => (
                  <Card
                    key={fund}
                    className="hover:bg-card/80 cursor-pointer transition-colors"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            Tech Professionals Fund #{fund}
                          </CardTitle>
                          <CardDescription>
                            Organized by 0x1234...5678
                          </CardDescription>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                        <div>
                          <p className="text-muted-foreground">Amount</p>
                          <p className="text-foreground font-semibold">
                            ₹50,000
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duration</p>
                          <p className="text-foreground font-semibold">
                            12 months
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Participants</p>
                          <p className="text-foreground flex items-center font-semibold">
                            <Users className="mr-1 h-3 w-3" />
                            8/12
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Next Bid</p>
                          <p className="text-foreground font-semibold">
                            2 days
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          Join Fund
                        </Button>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div>{/* <UpcomingActions actions={upcomingActions} /> */}</div>
        </div>
      </div>
    </WalletGuard>
  );
}
