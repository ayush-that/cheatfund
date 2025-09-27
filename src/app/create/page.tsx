"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { WalletGuard } from "~/components/ui/wallet/wallet-guard";
import { useWallet } from "~/lib/wallet";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Info,
} from "lucide-react";
import Link from "next/link";

interface FundFormData {
  name: string;
  description: string;
  totalAmount: string;
  duration: string;
  maxParticipants: string;
  isPublic: boolean;
  category: string;
  startDate: string;
}

export default function CreateFundPage() {
  const router = useRouter();
  const { address } = useWallet();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<FundFormData>({
    name: "",
    description: "",
    totalAmount: "",
    duration: "12",
    maxParticipants: "10",
    isPublic: true,
    category: "",
    startDate: "",
  });

  const [errors, setErrors] = useState<Partial<FundFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<FundFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Fund name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.totalAmount || Number.parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = "Valid total amount is required";
    }
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";

    const participants = Number.parseInt(formData.maxParticipants);
    if (participants < 3 || participants > 50) {
      newErrors.maxParticipants = "Participants must be between 3 and 50";
    }

    const duration = Number.parseInt(formData.duration);
    if (duration < 3 || duration > 60) {
      newErrors.duration = "Duration must be between 3 and 60 months";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsCreating(true);

    try {
      // TODO: Implement smart contract interaction
      console.log("Creating fund with data:", formData);

      // Simulate fund creation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to fund management page
      router.push(`/fund/${encodeURIComponent(formData.name)}/${address}`);
    } catch (error) {
      console.error("Error creating fund:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const monthlyContribution =
    formData.totalAmount && formData.maxParticipants
      ? (
          Number.parseFloat(formData.totalAmount) /
          Number.parseInt(formData.maxParticipants)
        ).toFixed(2)
      : "0";

  return (
    <WalletGuard>
      <div className="h-full w-full">
        {/* Header */}
        <div className="from-background to-muted/20 w-full bg-gradient-to-r">
          <div className="px-6 py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-foreground text-3xl font-bold">
                  Create Chit Fund
                </h1>
                <p className="text-muted-foreground">
                  Set up a new chit fund for your community
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6">
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Form */}
              <div className="space-y-6 lg:col-span-2">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Info className="mr-2 h-5 w-5" />
                      Basic Information
                    </CardTitle>
                    <CardDescription>
                      Provide the essential details for your chit fund
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Fund Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Tech Professionals Fund"
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe the purpose and rules of your chit fund..."
                        rows={3}
                        className={
                          errors.description ? "border-destructive" : ""
                        }
                      />
                      {errors.description && (
                        <p className="text-destructive text-sm">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, category: value }))
                        }
                      >
                        <SelectTrigger
                          className={
                            errors.category ? "border-destructive" : ""
                          }
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">
                            Professional Groups
                          </SelectItem>
                          <SelectItem value="family">
                            Family & Friends
                          </SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="investment">
                            Investment Club
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p className="text-destructive text-sm">
                          {errors.category}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="mr-2 h-5 w-5" />
                      Financial Details
                    </CardTitle>
                    <CardDescription>
                      Configure the financial structure of your fund
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="totalAmount">
                          Total Fund Amount (ETH) *
                        </Label>
                        <Input
                          id="totalAmount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.totalAmount}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              totalAmount: e.target.value,
                            }))
                          }
                          placeholder="10.0"
                          className={
                            errors.totalAmount ? "border-destructive" : ""
                          }
                        />
                        {errors.totalAmount && (
                          <p className="text-destructive text-sm">
                            {errors.totalAmount}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="maxParticipants">
                          Max Participants *
                        </Label>
                        <Input
                          id="maxParticipants"
                          type="number"
                          min="3"
                          max="50"
                          value={formData.maxParticipants}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              maxParticipants: e.target.value,
                            }))
                          }
                          className={
                            errors.maxParticipants ? "border-destructive" : ""
                          }
                        />
                        {errors.maxParticipants && (
                          <p className="text-destructive text-sm">
                            {errors.maxParticipants}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="duration">Duration (Months) *</Label>
                        <Select
                          value={formData.duration}
                          onValueChange={(value) =>
                            setFormData((prev) => ({
                              ...prev,
                              duration: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3 months</SelectItem>
                            <SelectItem value="6">6 months</SelectItem>
                            <SelectItem value="12">12 months</SelectItem>
                            <SelectItem value="18">18 months</SelectItem>
                            <SelectItem value="24">24 months</SelectItem>
                            <SelectItem value="36">36 months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          min={new Date().toISOString().split("T")[0]}
                          className={
                            errors.startDate ? "border-destructive" : ""
                          }
                        />
                        {errors.startDate && (
                          <p className="text-destructive text-sm">
                            {errors.startDate}
                          </p>
                        )}
                      </div>
                    </div>

                    {monthlyContribution !== "0" && (
                      <div className="bg-primary/10 border-primary/20 rounded-lg border p-4">
                        <p className="text-muted-foreground text-sm">
                          Monthly contribution per participant:
                        </p>
                        <p className="text-primary text-lg font-semibold">
                          {monthlyContribution} ETH
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Settings */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Fund Settings
                    </CardTitle>
                    <CardDescription>
                      Configure privacy and access settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="isPublic">Public Fund</Label>
                        <p className="text-muted-foreground text-sm">
                          Allow anyone to discover and join this fund
                        </p>
                      </div>
                      <Switch
                        id="isPublic"
                        checked={formData.isPublic}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            isPublic: checked,
                          }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Sidebar */}
              <div className="space-y-6">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle>Fund Summary</CardTitle>
                    <CardDescription>Review your fund details</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Total Amount
                        </span>
                        <span className="font-medium">
                          {formData.totalAmount || "0"} ETH
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Participants
                        </span>
                        <span className="flex items-center font-medium">
                          <Users className="mr-1 h-3 w-3" />
                          {formData.maxParticipants || "0"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Duration
                        </span>
                        <span className="flex items-center font-medium">
                          <Calendar className="mr-1 h-3 w-3" />
                          {formData.duration} months
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Monthly Payment
                        </span>
                        <span className="text-primary font-medium">
                          {monthlyContribution} ETH
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Visibility
                        </span>
                        <Badge
                          variant={formData.isPublic ? "default" : "secondary"}
                        >
                          {formData.isPublic ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground text-sm">
                          Organizer
                        </span>
                        <span className="font-mono text-xs">
                          {address?.slice(0, 6)}...{address?.slice(-4)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <Button
                      type="submit"
                      className="bg-primary hover:bg-primary/90 w-full"
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating Fund..." : "Create Fund"}
                    </Button>

                    <p className="text-muted-foreground text-center text-xs">
                      By creating this fund, you agree to act as the organizer
                      and manage the fund according to the terms.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>
    </WalletGuard>
  );
}
