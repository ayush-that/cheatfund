"use client";

import { cn } from "~/lib/utils";
import { Loader2 } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

interface LoadingStateProps {
  type: "skeleton" | "spinner" | "pulse";
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function LoadingState({
  type,
  size = "md",
  className,
  children,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  if (type === "spinner") {
    return (
      <div className={cn("flex items-center justify-center", className)}>
        <Loader2 className={cn("animate-spin", sizeClasses[size])} />
        {children && <span className="ml-2">{children}</span>}
      </div>
    );
  }

  if (type === "pulse") {
    return <div className={cn("animate-pulse", className)}>{children}</div>;
  }

  return <div className={cn("animate-pulse", className)}>{children}</div>;
}

export function FundCardSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function MemberCardSkeleton() {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

export function CycleProgressSkeleton() {
  return (
    <div className="space-y-4 rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
      <Skeleton className="h-2 w-full" />
      <div className="flex justify-between text-sm">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg border p-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4 rounded-lg border p-6">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>

      {/* Active Funds */}
      <div className="space-y-4 rounded-lg border p-6">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <FundCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CreatingFundLoading() {
  return (
    <div className="space-y-4">
      <LoadingState type="spinner" size="lg">
        Creating your chit fund...
      </LoadingState>
      <div className="text-muted-foreground text-center text-sm">
        This may take a few moments. Please don't close this page.
      </div>
    </div>
  );
}

export function JoiningFundLoading() {
  return (
    <div className="space-y-4">
      <LoadingState type="spinner" size="lg">
        Joining the fund...
      </LoadingState>
      <div className="text-muted-foreground text-center text-sm">
        Processing your membership request.
      </div>
    </div>
  );
}

export function ContributingLoading() {
  return (
    <div className="space-y-4">
      <LoadingState type="spinner" size="lg">
        Processing contribution...
      </LoadingState>
      <div className="text-muted-foreground text-center text-sm">
        Your contribution is being processed on the blockchain.
      </div>
    </div>
  );
}

export function BiddingLoading() {
  return (
    <div className="space-y-4">
      <LoadingState type="spinner" size="lg">
        Submitting your bid...
      </LoadingState>
      <div className="text-muted-foreground text-center text-sm">
        Your bid is being recorded on the blockchain.
      </div>
    </div>
  );
}
