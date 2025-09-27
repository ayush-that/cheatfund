"use client";

import { useState, useCallback } from "react";
import { supabase } from "~/lib/supabase";
import { useAadharStore } from "~/stores/aadhar-store";

export function useAadharVerification() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { setAadharVerified, setError } = useAadharStore();
  const updateUserVerificationStatus = async (
    userId: string,
    verified: boolean,
    ageVerified = false,
  ) => {
    try {
      setIsUpdating(true);

      const { data: existingUser, error: fetchError } = await supabase
        .from("User")
        .select("id, aadharVerified, ageVerified")
        .eq("id", userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      if (!existingUser) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        const email = authUser?.email || `user-${userId}@web3.local`;

        const userData = {
          id: userId,
          email: email,
          aadharVerified: verified,
          aadharVerifiedAt: verified ? new Date().toISOString() : null,
          ageVerified: ageVerified,
          updatedAt: new Date().toISOString(),
        };

        const { data: newUser, error: insertError } = await supabase
          .from("User")
          .insert(userData)
          .select()
          .single();

        if (insertError) {
          throw insertError;
        }
      } else {
        const updateData = {
          aadharVerified: verified,
          aadharVerifiedAt: verified ? new Date().toISOString() : null,
          ageVerified: ageVerified,
          updatedAt: new Date().toISOString(),
        };

        const { error: updateError } = await supabase
          .from("User")
          .update(updateData)
          .eq("id", userId);

        if (updateError) {
          throw updateError;
        }
      }

      setAadharVerified(verified);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update verification status";
      setError(errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const checkUserVerificationStatus = useCallback(async (userId: string) => {
    try {
      const { data: user, error } = await supabase
        .from("User")
        .select("aadharVerified, ageVerified")
        .eq("id", userId)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return {
        aadharVerified: (user?.aadharVerified as boolean) ?? false,
        ageVerified: (user?.ageVerified as boolean) ?? false,
      };
    } catch (error) {
      return false;
    }
  }, []);

  return {
    isUpdating,
    updateUserVerificationStatus,
    checkUserVerificationStatus,
  };
}
