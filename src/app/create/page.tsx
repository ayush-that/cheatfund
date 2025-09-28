// @ts-nocheck
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
import { useChitFundFactory } from "~/hooks/contracts/useChitFundFactory";
import { useTransactionManager } from "~/hooks/contracts/useTransactionManager";
import { TransactionStatus } from "~/components/ui/transaction/transaction-status";
import { CreatingFundLoading } from "~/components/ui/loading/loading-states";
import { switchToFlowTestnet, checkNetwork } from "~/lib/web3";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  Shield,
  Info,
  Loader2,
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
  const {
    createChitFund,
    loading: contractLoading,
    error: contractError,
  } = useChitFundFactory();
  const { addTransaction, getTransaction } = useTransactionManager();
  const [isCreating, setIsCreating] = useState(false);
  const [currentTx, setCurrentTx] = useState<string | null>(null);
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

    if (!formData.name.trim())
      newErrors.name = (
        <span className="text-red-800">Fund name is required</span>
      );
    if (!formData.description.trim())
      newErrors.description = (
        <span className="text-red-800">Description is required</span>
      );
    if (!formData.totalAmount || Number.parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = (
        <span className="text-red-800">Valid total amount is required</span>
      );
    }
    if (!formData.category)
      newErrors.category = (
        <span className="text-red-800">Category is required</span>
      );
    if (!formData.startDate)
      newErrors.startDate = (
        <span className="text-red-800">Start date is required</span>
      );

    const participants = Number.parseInt(formData.maxParticipants);
    if (participants < 3 || participants > 50) {
      newErrors.maxParticipants = (
        <span className="text-red-800">
          Participants must be between 3 and 50
        </span>
      );
    }

    const duration = Number.parseInt(formData.duration);
    if (duration < 3 || duration > 60) {
      newErrors.duration = (
        <span className="text-red-800">
          Duration must be between 3 and 60 months
        </span>
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsCreating(true);

    try {
      const isOnFlowTestnet = await checkNetwork();
      if (!isOnFlowTestnet) {
        toast.loading("Switching to Flow Testnet...", { id: "switch-network" });
        const switched = await switchToFlowTestnet();
        if (!switched) {
          toast.error("Please switch to Flow Testnet to create funds", {
            id: "switch-network",
          });
          setIsCreating(false);
          return;
        }
        toast.success("Switched to Flow Testnet!", { id: "switch-network" });
      }

      const contributionAmount = (
        Number.parseFloat(formData.totalAmount) /
        Number.parseInt(formData.maxParticipants)
      ).toString();

      const params = {
        fundName: formData.name,
        contributionAmount,
        totalMembers: Number.parseInt(formData.maxParticipants),
      };

      toast.loading("Creating chit fund...", { id: "create-fund" });

      const result = await createChitFund(params);

      if (result.success && result.txHash) {
        addTransaction(result.txHash);
        setCurrentTx(result.txHash);

        toast.success("Fund creation transaction submitted!", {
          id: "create-fund",
        });

        setTimeout(async () => {
          if (result.contractAddress) {
            try {
              const fundResponse = await fetch("/api/funds/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  contractAddress: result.contractAddress,
                  name: formData.name,
                  description: formData.description,
                  category: formData.category,
                  organizer: address,
                  totalAmount: Number.parseFloat(formData.totalAmount),
                  maxParticipants: Number.parseInt(formData.maxParticipants),
                  duration: Number.parseInt(formData.duration),
                  startDate: formData.startDate,
                  isPublic: formData.isPublic,
                }),
              });

              if (!fundResponse.ok) {
                throw new Error("Failed to save fund to database");
              }

              const { fund } = await fundResponse.json();

              await fetch("/api/funds/activity", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  fundId: fund.id,
                  activityType: "fund_created",
                  description: `Fund "${formData.name}" created by organizer`,
                  memberAddress: address,
                  transactionHash: result.txHash,
                }),
              });

              toast.success("Chit fund created and saved successfully!");
              router.push(
                `/fund/${encodeURIComponent(formData.name)}/${address}`,
              );
            } catch (dbError) {
              toast.error(
                "Fund created on blockchain but failed to save metadata",
              );
              router.push(
                `/fund/${encodeURIComponent(formData.name)}/${address}`,
              );
            }
          }
        }, 3000);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create fund", {
        id: "create-fund",
      });
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
      <div className="mx-auto space-y-6 p-6">
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
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
                      <p className="text-destructive text-sm">{errors.name}</p>
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
                      className={errors.description ? "border-destructive" : ""}
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
                        className={errors.category ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">
                          Professional Groups
                        </SelectItem>
                        <SelectItem value="family">Family & Friends</SelectItem>
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
                        Total Fund Amount (FLOW) *
                      </Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        step="0.01"
                        min="1"
                        value={formData.totalAmount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            totalAmount: e.target.value,
                          }))
                        }
                        placeholder="Enter total amount in FLOW"
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
                        className={errors.startDate ? "border-destructive" : ""}
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
                        {monthlyContribution} FLOW
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

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
                        {formData.totalAmount || "0"} FLOW
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
                        {monthlyContribution} FLOW
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
                    disabled={isCreating || contractLoading}
                  >
                    {isCreating || contractLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Fund...
                      </>
                    ) : (
                      "Create Fund"
                    )}
                  </Button>

                  <p className="text-muted-foreground text-center text-xs">
                    By creating this fund, you agree to act as the organizer and
                    manage the fund according to the terms.
                  </p>

                  {currentTx && (
                    <div className="mt-4">
                      <TransactionStatus
                        transactionHash={currentTx}
                        status="pending"
                        type="Fund Creation"
                        onClose={() => setCurrentTx(null)}
                      />
                    </div>
                  )}

                  {isCreating && (
                    <div className="mt-4">
                      <CreatingFundLoading />
                    </div>
                  )}

                  {contractError && (
                    <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
                      <strong>Error:</strong> {contractError}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </WalletGuard>
  );
}
