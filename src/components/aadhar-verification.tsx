"use client";

import { useEffect, useState, useRef } from "react";
import {
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  useProver,
  AnonAadhaarProof,
} from "@anon-aadhaar/react";
import { useAadharStore } from "~/stores/aadhar-store";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CheckCircle, Calendar } from "lucide-react";

interface AadharVerificationProps {
  onVerificationComplete: (verified: boolean, isAbove18: boolean) => void;
  onSkip?: () => void;
}

export function AadharVerification({
  onVerificationComplete,
  onSkip,
}: AadharVerificationProps) {
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    isAadharVerified,
    isAgeVerified,
    verificationStatus,
    setAadharVerified,
    setAgeVerified,
    setAnonAadhaarProof,
    setError,
  } = useAadharStore();

  const verificationStatusRef = useRef(verificationStatus);
  const lastProcessedStatusRef = useRef<string>("");
  const lastProcessedProofRef = useRef<any>(null);

  useEffect(() => {
    const anonAadhaarKey = Object.keys(localStorage).find(
      (key) => key.includes("anon-aadhaar") || key.includes("anonAadhaar"),
    );
    if (anonAadhaarKey) {
      const storedValue = localStorage.getItem(anonAadhaarKey);
      if (storedValue && storedValue.includes("logging-in")) {
        localStorage.removeItem(anonAadhaarKey);
      }
    }
  }, []);

  useEffect(() => {
    const currentStatus = anonAadhaar.status;
    const currentProof = latestProof;

    if (
      lastProcessedStatusRef.current === currentStatus &&
      lastProcessedProofRef.current === currentProof
    ) {
      return;
    }

    lastProcessedStatusRef.current = currentStatus;
    lastProcessedProofRef.current = currentProof;
    verificationStatusRef.current = verificationStatus;

    const processStatusChange = async () => {
      if (currentStatus === "logging-in") {
        setIsProcessing(true);
        setError(null);
      } else if (currentStatus === "logged-in" && currentProof) {
        setIsProcessing(false);

        try {
          const proofData = currentProof?.proof;
          const ageAbove18 = proofData?.ageAbove18;

          let isAbove18 = false;

          if (ageAbove18 !== undefined && ageAbove18 !== null) {
            isAbove18 =
              ageAbove18 === "1" || ageAbove18 === 1 || ageAbove18 === true;
          } else {
            isAbove18 = false;
          }

          setAnonAadhaarProof(currentProof);
          setAadharVerified(true);
          setAgeVerified(isAbove18);
          setError(null);

          await onVerificationComplete(true, isAbove18);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to process verification proof";
          setError(errorMessage);
          setIsProcessing(false);
        }
      } else if (currentStatus === "logged-out") {
        setIsProcessing(false);
        if (verificationStatusRef.current === "verifying") {
          setError("Verification was cancelled or failed. Please try again.");
        }
      }
    };

    processStatusChange().catch(() => {});
  }, [anonAadhaar.status, latestProof]);

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  if (isAadharVerified && verificationStatus === "verified") {
    return (
      <div className="space-y-4">
        <Card className="mx-auto w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-6 w-6" />
              <CardTitle>Aadhar Verified</CardTitle>
            </div>
            <CardDescription>
              Your identity has been successfully verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant={isAgeVerified ? "default" : "destructive"}
                className="flex items-center gap-1"
              >
                <Calendar className="h-3 w-3" />
                {isAgeVerified ? "Age 18+ Verified" : "Under 18"}
              </Badge>
            </div>

            <div className="text-muted-foreground text-center text-sm">
              <p>Identity verified with zero-knowledge proof</p>
              <p>Privacy preserved - no personal data stored</p>
              {isAgeVerified ? (
                <p>Age requirement met (18+)</p>
              ) : (
                <p className="text-red-600">
                  Age requirement not met (must be 18+)
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {latestProof && (
          <div className="mx-auto w-full max-w-md">
            <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Age Verification Required</CardTitle>
          <CardDescription>
            You must verify your age to continue using this platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-center">
              <LogInWithAnonAadhaar
                nullifierSeed={1234}
                fieldsToReveal={["revealAgeAbove18"]}
              />
            </div>
            {isProcessing && (
              <div className="text-center text-blue-600">
                Processing verification...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {anonAadhaar.status === "logged-in" && (
        <Card className="w-full max-w-md">
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="font-medium text-green-600">Proof is valid</p>
              <p>Got your Aadhaar Identity Proof</p>
              <p className="text-lg font-semibold">Welcome anon!</p>
            </div>

            {latestProof && (
              <div className="mx-auto w-full">
                <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
