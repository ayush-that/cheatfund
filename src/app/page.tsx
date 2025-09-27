"use client";

import { useEffect, useState } from "react";
import { useWeb3Auth } from "~/hooks/use-web3-auth";
import { useAadharVerification } from "~/hooks/use-aadhar-verification";
import { useAadharStore } from "~/stores/aadhar-store";
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
import { AadharVerification } from "~/components/aadhar-verification";
import { Loader2, Wallet } from "lucide-react";

export default function AuthPage() {
  const { user, session, loading, error, signInWithWeb3, signOut } =
    useWeb3Auth();

  const { checkUserVerificationStatus, updateUserVerificationStatus } =
    useAadharVerification();

  const { resetVerification } = useAadharStore();
  const [showAadharVerification, setShowAadharVerification] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [hasCheckedVerification, setHasCheckedVerification] = useState(false);
  const [isVerificationComplete, setIsVerificationComplete] = useState(false);

  useEffect(() => {
    const checkVerificationStatus = async () => {
      if (
        user &&
        session &&
        !isCheckingVerification &&
        !hasCheckedVerification
      ) {
        setIsCheckingVerification(true);
        setHasCheckedVerification(true);

        try {
          const verificationStatus = await checkUserVerificationStatus(user.id);

          const isVerified =
            typeof verificationStatus === "boolean"
              ? verificationStatus
              : verificationStatus.aadharVerified &&
                verificationStatus.ageVerified;

          if (!isVerified) {
            setShowAadharVerification(true);
          } else {
            setIsVerificationComplete(true);
          }
        } catch (error) {
          setHasCheckedVerification(false);
        } finally {
          setIsCheckingVerification(false);
        }
      }
    };

    checkVerificationStatus().catch(() => {});
  }, [
    user?.id,
    session,
    checkUserVerificationStatus,
    isCheckingVerification,
    hasCheckedVerification,
  ]);

  const handleSignIn = async () => {
    await signInWithWeb3();
  };

  const handleSignOut = async () => {
    resetVerification();
    const anonAadhaarKey = Object.keys(localStorage).find(
      (key) => key.includes("anon-aadhaar") || key.includes("anonAadhaar"),
    );
    if (anonAadhaarKey) {
      localStorage.removeItem(anonAadhaarKey);
    }
    await signOut();
  };

  const handleVerificationComplete = async (
    verified: boolean,
    isAbove18: boolean,
  ) => {
    if (user && verified && isAbove18) {
      const success = await updateUserVerificationStatus(
        user.id,
        true,
        isAbove18,
      );
      if (success) {
        setShowAadharVerification(false);
        setIsVerificationComplete(true);
      }
    } else if (verified && !isAbove18) {
      if (user) {
        await updateUserVerificationStatus(user.id, true, false);
      }
      alert("Sorry, you must be 18 years or older to use this platform.");
    }
  };

  const handleSkipVerification = () => {
    setShowAadharVerification(false);
  };

  if (loading) {
    return <div></div>;
  }

  if (user && session) {
    if (isCheckingVerification) {
      return <div></div>;
    }

    if (showAadharVerification) {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            <AadharVerification
              onVerificationComplete={handleVerificationComplete}
              onSkip={handleSkipVerification}
            />
          </div>
        </main>
      );
    }

    if (isVerificationComplete) {
      return (
        <main className="min-h-screen">
          <div className="container mx-auto px-4 py-8">
            <Dashboard
              user={user}
              session={session}
              onSignOut={handleSignOut}
            />
          </div>
        </main>
      );
    }

    return <div></div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Wallet className="h-6 w-6" />
            Sign in
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

          <p className="text-muted-foreground text-center text-xs">
            By connecting your wallet, you agree to our Terms of Service and
            Privacy Policy. We use EIP-4361 standard for secure authentication.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
