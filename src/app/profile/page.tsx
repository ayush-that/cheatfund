"use client";

import { useState, useEffect } from "react";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import { UserProfile } from "~/components/ui/user/user-profile";

export default function ProfilePage() {
  const [totalVolume, setTotalVolume] = useState<string>("0");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const volumeResponse = await fetch("/api/funds/total-volume");

        if (volumeResponse.ok) {
          const { totalVolume: volume } = await volumeResponse.json();
          setTotalVolume(volume);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const userProfile = {
    displayName: "John Doe",
    bio: "Experienced chit fund participant and organizer. Passionate about decentralized finance and community savings.",
    joinedDate: "January 2024",
    reputation: 4.8,
    fundsOrganized: 3,
    fundsParticipated: 12,
    totalVolume,
  };

  return (
    <WalletGuard>
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-6">
          <h1 className="text-foreground text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile and view your activity
          </p>
        </div>

        <UserProfile profile={userProfile} />
      </div>
    </WalletGuard>
  );
}
