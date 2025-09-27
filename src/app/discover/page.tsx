"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Users, Clock, Search, Filter, ExternalLink } from "lucide-react";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import Link from "next/link";

interface PublicFund {
  id: string;
  name: string;
  description: string;
  organizer: string;
  totalAmount: string;
  duration: number;
  currentParticipants: number;
  maxParticipants: number;
  category: string;
  isPublic: boolean;
  contractAddress: string;
  createdAt: string;
}

export default function DiscoverPage() {
  const [funds, setFunds] = useState<PublicFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const categories = [
    "all",
    "family",
    "friends",
    "business",
    "community",
    "education",
    "health",
    "other",
  ];

  const fetchFunds = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/funds/public?limit=50&offset=0");
      if (!response.ok) {
        throw new Error("Failed to fetch funds");
      }

      const { data } = await response.json();
      setFunds(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch funds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFunds();
  }, []);

  const filteredFunds = funds
    .filter((fund) => {
      const matchesSearch =
        fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fund.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || fund.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount-high":
          return Number(b.totalAmount) - Number(a.totalAmount);
        case "amount-low":
          return Number(a.totalAmount) - Number(b.totalAmount);
        case "participants-high":
          return b.currentParticipants - a.currentParticipants;
        case "participants-low":
          return a.currentParticipants - b.currentParticipants;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <WalletGuard>
        <div className="container mx-auto px-4 py-6">
          <div className="mb-8 text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <span>Loading funds...</span>
          </div>
        </div>
      </WalletGuard>
    );
  }

  if (error) {
    return (
      <WalletGuard>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <span className="mb-4 block text-red-500">
              Error loading funds: {error}
            </span>
            <Button onClick={fetchFunds} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </WalletGuard>
    );
  }

  return (
    <WalletGuard>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-foreground text-3xl font-bold">
              Discover Funds
            </h1>
            <p className="text-muted-foreground">
              Browse and join public chit funds
            </p>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search funds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="amount-high">Amount: High to Low</SelectItem>
                <SelectItem value="amount-low">Amount: Low to High</SelectItem>
                <SelectItem value="participants-high">
                  Participants: High to Low
                </SelectItem>
                <SelectItem value="participants-low">
                  Participants: Low to High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-muted-foreground text-sm">
          Showing {filteredFunds.length} of {funds.length} funds
        </div>

        {/* Funds Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFunds.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    No funds found matching your criteria
                  </p>
                  <p className="text-muted-foreground mt-2">
                    Try adjusting your search or filter settings
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredFunds.map((fund) => (
              <Card
                key={fund.id}
                className="hover:bg-card/80 cursor-pointer transition-colors"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1 text-lg">
                        {fund.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {fund.description}
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {fund.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Amount</p>
                      <p className="text-foreground font-semibold">
                        {fund.totalAmount} FLOW
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="text-foreground font-semibold">
                        {fund.duration} months
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Participants</p>
                      <p className="text-foreground flex items-center font-semibold">
                        <Users className="mr-1 h-3 w-3" />
                        {fund.currentParticipants}/{fund.maxParticipants}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Organizer</p>
                      <p className="text-foreground text-xs font-semibold">
                        {fund.organizer.slice(0, 6)}...
                        {fund.organizer.slice(-4)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="text-muted-foreground mb-1 flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>
                        {Math.round(
                          (fund.currentParticipants / fund.maxParticipants) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="bg-muted h-2 w-full rounded-full">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (fund.currentParticipants / fund.maxParticipants) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      className="bg-primary hover:bg-primary/90 flex-1"
                      asChild
                    >
                      <Link
                        href={`/join/${encodeURIComponent(fund.name)}/${fund.organizer}`}
                      >
                        Join Fund
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link
                        href={`/join/${encodeURIComponent(fund.name)}/${fund.organizer}`}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </WalletGuard>
  );
}
