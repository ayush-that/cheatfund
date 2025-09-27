declare module "@anon-aadhaar/core/src/prover" {
  const _: any;
  export = _;
}
declare module "@anon-aadhaar/core" {
  export interface AnonAadhaarProof {
    nullifier: string;
    timestamp: string;
    pubkeyHash: string;
    nullifierSeed: string;
    signalHash: string;
    ageAbove18: string;
    gender: string;
    state: string;
    pincode: string;
    groth16Proof: number[];
  }

  export interface AnonAadhaarCore {
    type: string;
    id: string;
    claim: {
      pubKey: string;
      signalHash: string;
      proof: AnonAadhaarProof;
    };
  }

  export function generateAnonAadhaarProof(args: any): Promise<AnonAadhaarCore>;
  export function verifyAnonAadhaarProof(
    proof: AnonAadhaarCore,
  ): Promise<boolean>;
  export function convertRevealBigIntToString(bigIntValue: string): string;
}

declare module "@anon-aadhaar/react" {
  import { ReactNode } from "react";

  export interface AnonAadhaarProviderProps {
    _useTestAadhaar?: boolean;
    _appName?: string;
    children: ReactNode;
  }

  export function AnonAadhaarProvider(
    props: AnonAadhaarProviderProps,
  ): JSX.Element;
  export function LogInWithAnonAadhaar(props: {
    nullifierSeed: number;
    fieldsToReveal?: string[];
  }): JSX.Element;
  export function AnonAadhaarProof(props: { code: string }): JSX.Element;
  export function useAnonAadhaar(): [{ status: string }, any];
  export function useProver(): [any, any];
}
