"use client";

import { useWeb3Auth } from "~/hooks/use-web3-auth";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Dashboard } from "~/components/dashboard";
import { Loader2, Wallet } from "lucide-react";

export default function AuthPage() {
  const { user, session, loading, error, signInWithWeb3, signOut } =
    useWeb3Auth();

  const handleSignIn = async () => {
    await signInWithWeb3();
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </main>
    );
  }

  if (user && session) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container mx-auto px-4 py-8">
          <Dashboard user={user} session={session} onSignOut={handleSignOut} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6" />
            Web3 Authentication
          </CardTitle>
          <CardDescription>
            Sign in with your Ethereum wallet to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={handleSignIn} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
              </>
            )}
          </Button>

          <p className="text-center text-xs text-gray-400">
            By connecting your wallet, you agree to our Terms of Service and
            Privacy Policy. We use EIP-4361 standard for secure authentication.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
