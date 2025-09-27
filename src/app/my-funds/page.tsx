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
import { Crown, Users, Clock, AlertCircle } from "lucide-react";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";

export default function MyFundsPage() {
  return (
    <WalletGuard>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-foreground text-3xl font-bold">My Chit Funds</h1>
          <p className="text-muted-foreground">
            Manage your participations and organized funds
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="participating" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participating">Participating</TabsTrigger>
            <TabsTrigger value="organizing">Organizing</TabsTrigger>
          </TabsList>

          <TabsContent value="participating" className="space-y-4">
            <div className="grid gap-4">
              {[1, 2].map((fund) => (
                <Card key={fund}>
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
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          Active
                        </Badge>
                        {fund === 1 && (
                          <Badge variant="destructive">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Action Required
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-muted-foreground">Monthly Amount</p>
                        <p className="text-foreground font-semibold">₹4,167</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Your Position</p>
                        <p className="text-foreground font-semibold">3/12</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="text-foreground font-semibold">
                          {fund === 1 ? "Bidding Open" : "Waiting"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Payment</p>
                        <p className="text-foreground font-semibold">Dec 15</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {fund === 1 && (
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90"
                        >
                          Place Bid
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Make Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="organizing" className="space-y-4">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center text-lg">
                        <Crown className="text-primary mr-2 h-4 w-4" />
                        My Community Fund
                      </CardTitle>
                      <CardDescription>You are the organizer</CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-primary"
                    >
                      <Users className="mr-1 h-3 w-3" />
                      10/12 Members
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                    <div>
                      <p className="text-muted-foreground">Fund Amount</p>
                      <p className="text-foreground font-semibold">₹60,000</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="text-foreground font-semibold">12 months</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Round</p>
                      <p className="text-foreground font-semibold">3/12</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Status</p>
                      <p className="text-foreground font-semibold">
                        Collecting Bids
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Manage Fund
                    </Button>
                    <Button size="sm" variant="outline">
                      View Bids
                    </Button>
                    <Button size="sm" variant="outline">
                      Add Members
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </WalletGuard>
  );
}
