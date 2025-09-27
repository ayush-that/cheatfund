"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Button } from "../button";
import { Clock, DollarSign, Gavel, Users, ArrowRight } from "lucide-react";

interface Activity {
  id: string;
  type: "payment" | "bid_won" | "bid_placed" | "fund_joined" | "fund_created";
  title: string;
  description: string;
  amount?: string;
  timestamp: string;
  status: "completed" | "pending" | "failed";
  fundName: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "bid_won":
      case "bid_placed":
        return <Gavel className="h-4 w-4" />;
      case "fund_joined":
        return <Users className="h-4 w-4" />;
      case "fund_created":
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-600";
      case "pending":
        return "bg-yellow-500/10 text-yellow-600";
      case "failed":
        return "bg-red-500/10 text-red-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Activity</CardTitle>
        <Button variant="ghost" size="sm">
          View All
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.length === 0 ? (
          <div className="py-8 text-center">
            <Clock className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">No recent activity</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="hover:bg-muted/50 flex items-start space-x-3 rounded-lg p-3 transition-colors"
            >
              <div className="bg-primary/10 text-primary flex h-8 w-8 items-center justify-center rounded-full">
                {getActivityIcon(activity.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-foreground truncate text-sm font-medium">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    {activity.amount && (
                      <span className="text-foreground text-sm font-medium">
                        {activity.amount} FLOW
                      </span>
                    )}
                    <Badge
                      variant="secondary"
                      className={getStatusColor(activity.status)}
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {activity.description}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">
                    {activity.fundName}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {activity.timestamp}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
