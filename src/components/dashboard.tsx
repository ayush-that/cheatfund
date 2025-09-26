"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { LogOut, Wallet, User as UserIcon, Shield } from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";

interface DashboardProps {
  user: User;
  session: Session;
  onSignOut: () => void;
}

interface CustomClaims {
  address?: string;
  chain?: string;
  domain?: string;
  network?: string;
  statement?: string;
}

function getWalletAddress(user: User): string {
  const identityCustomClaims = user.identities?.[0]?.identity_data
    ?.custom_claims as CustomClaims | undefined;
  const metadataCustomClaims = user.user_metadata?.custom_claims as
    | CustomClaims
    | undefined;

  return (
    identityCustomClaims?.address ?? metadataCustomClaims?.address ?? "N/A"
  );
}

export function Dashboard({ user, session, onSignOut }: DashboardProps) {
  const walletAddress = getWalletAddress(user);

  const shortAddress =
    walletAddress !== "N/A" && typeof walletAddress === "string"
      ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
      : "N/A";

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Welcome to CheatFund
        </h1>
        <p className="text-gray-300">Your Web3 dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              User Profile
            </CardTitle>
            <CardDescription>Your authentication details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Wallet Address
              </p>
              <p className="font-mono text-sm">{shortAddress}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">User ID</p>
              <p className="font-mono text-sm break-all">{user.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">
                Authentication Method
              </p>
              <Badge variant="secondary">Web3 Wallet</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Session Info
            </CardTitle>
            <CardDescription>Current session details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Session Status
              </p>
              <Badge variant="default">Active</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Expires At</p>
              <p className="text-sm">
                {new Date(session.expires_at! * 1000).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Provider</p>
              <p className="text-sm">Ethereum</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Actions
            </CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={onSignOut} variant="outline" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <p className="text-center text-xs text-gray-500">
              Your wallet connection is secure and encrypted
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
