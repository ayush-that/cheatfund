"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { useWallet } from "~/lib/wallet";
import { User, Edit, Save, X, Shield, Star, Calendar } from "lucide-react";

interface UserProfileProps {
  profile: {
    displayName: string;
    bio: string;
    joinedDate: string;
    reputation: number;
    fundsOrganized: number;
    fundsParticipated: number;
    successRate: number;
    totalVolume: string;
  };
}

export function UserProfile({ profile }: UserProfileProps) {
  const { address } = useWallet();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                <User className="text-primary h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  {isEditing ? (
                    <Input
                      value={editedProfile.displayName}
                      onChange={(e) =>
                        setEditedProfile((prev) => ({
                          ...prev,
                          displayName: e.target.value,
                        }))
                      }
                      className="text-xl font-bold"
                    />
                  ) : (
                    profile.displayName || "Anonymous User"
                  )}
                </CardTitle>
                <CardDescription className="font-mono text-sm">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Save className="mr-1 h-4 w-4" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={editedProfile.bio}
                  onChange={(e) =>
                    setEditedProfile((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  placeholder="Tell others about yourself..."
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground mt-1 text-sm">
                  {profile.bio || "No bio provided"}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span className="text-muted-foreground">
                  Joined {profile.joinedDate}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">{profile.reputation}/5.0</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              Activity Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-foreground text-2xl font-bold">
                  {profile.fundsOrganized}
                </div>
                <p className="text-muted-foreground text-xs">Funds Organized</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-foreground text-2xl font-bold">
                  {profile.fundsParticipated}
                </div>
                <p className="text-muted-foreground text-xs">
                  Funds Participated
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Success Rate</span>
                <span className="text-primary font-medium">
                  {profile.successRate}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Volume</span>
                <span className="font-medium">{profile.totalVolume} FLOW</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reputation</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span className="font-medium">{profile.reputation}/5.0</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <Shield className="mr-1 h-3 w-3" />
                Trusted Organizer
              </Badge>
              <span className="text-muted-foreground text-xs">
                Organized 5+ successful funds
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant="secondary"
                className="bg-green-500/10 text-green-600"
              >
                <Star className="mr-1 h-3 w-3" />
                Perfect Record
              </Badge>
              <span className="text-muted-foreground text-xs">
                100% payment success rate
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge
                variant="secondary"
                className="bg-blue-500/10 text-blue-600"
              >
                <User className="mr-1 h-3 w-3" />
                Active Participant
              </Badge>
              <span className="text-muted-foreground text-xs">
                Participated in 10+ funds
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
