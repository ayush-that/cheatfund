import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AadharState {
  isAadharVerified: boolean;
  isAgeVerified: boolean;
  anonAadhaarProof: any;
  verificationStatus: "idle" | "verifying" | "verified" | "failed";
  error: string | null;
}

interface AadharActions {
  setAadharVerified: (verified: boolean) => void;
  setAgeVerified: (verified: boolean) => void;
  setAnonAadhaarProof: (proof: any) => void;
  setVerificationStatus: (status: AadharState["verificationStatus"]) => void;
  setError: (error: string | null) => void;
  resetVerification: () => void;
}

type AadharStore = AadharState & AadharActions;

const initialState: AadharState = {
  isAadharVerified: false,
  isAgeVerified: false,
  anonAadhaarProof: null,
  verificationStatus: "idle",
  error: null,
};

export const useAadharStore = create<AadharStore>()(
  persist(
    (set) => ({
      ...initialState,
      setAadharVerified: (verified: boolean) =>
        set({ isAadharVerified: verified }),
      setAgeVerified: (verified: boolean) => set({ isAgeVerified: verified }),
      setAnonAadhaarProof: (proof: any) => set({ anonAadhaarProof: proof }),
      setVerificationStatus: (status: AadharState["verificationStatus"]) =>
        set({ verificationStatus: status }),
      setError: (error: string | null) => set({ error }),
      resetVerification: () =>
        set({
          ...initialState,
        }),
    }),
    {
      name: "aadhar-verification-store",
      partialize: (state) => ({
        isAadharVerified: state.isAadharVerified,
        isAgeVerified: state.isAgeVerified,
        verificationStatus: state.verificationStatus,
      }),
    },
  ),
);
