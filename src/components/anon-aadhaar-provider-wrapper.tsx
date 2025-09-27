"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface AnonAadhaarProviderWrapperProps {
  children: React.ReactNode;
}

const AnonAadhaarProvider = dynamic(
  () =>
    import("@anon-aadhaar/react").then((mod) => ({
      default: mod.AnonAadhaarProvider,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

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
