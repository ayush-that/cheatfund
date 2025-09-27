"use client";

import { useEffect, useState } from "react";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";

interface AnonAadhaarProviderWrapperProps {
  children: React.ReactNode;
}

export function AnonAadhaarProviderWrapper({
  children,
}: AnonAadhaarProviderWrapperProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <AnonAadhaarProvider _useTestAadhaar={false} _appName="CheatFund">
      {children}
    </AnonAadhaarProvider>
  );
}
