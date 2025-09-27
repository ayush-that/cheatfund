"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Button } from "../button";
import { Badge } from "../badge";
import { AlertCircle, Calendar, Gavel, DollarSign, Clock } from "lucide-react";

interface UpcomingAction {
  id: string;
  type: "payment_due" | "bidding_open" | "fund_starting" | "round_ending";
  title: string;
  description: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  fundName: string;
  amount?: string;
}

interface UpcomingActionsProps {
  actions: UpcomingAction[];
}

export function UpcomingActions({ actions }: UpcomingActionsProps) {
  const getActionIcon = (type: UpcomingAction["type"]) => {
    switch (type) {
      case "payment_due":
        return <DollarSign className="h-4 w-4" />;
      case "bidding_open":
        return <Gavel className="h-4 w-4" />;
      case "fund_starting":
        return <Calendar className="h-4 w-4" />;
      case "round_ending":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: UpcomingAction["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const sortedActions = actions.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="mr-2 h-5 w-5" />
          Upcoming Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedActions.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">No upcoming actions</p>
          </div>
        ) : (
          sortedActions.map((action) => (
            <div
              key={action.id}
              className={`rounded-lg border p-4 ${getPriorityColor(action.priority)} transition-colors`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="bg-background flex h-8 w-8 items-center justify-center rounded-full">
                    {getActionIcon(action.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium">{action.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {action.priority}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {action.description}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-medium">
                        {action.fundName}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {action.dueDate}
                      </span>
                    </div>
                  </div>
                </div>
                {action.amount && (
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {action.amount} FLOW
                    </p>
                  </div>
                )}
              </div>
              <div className="mt-3 flex space-x-2">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  Take Action
                </Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
