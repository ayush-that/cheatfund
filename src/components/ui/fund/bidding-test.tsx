"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { TestTube, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useWallet } from "~/lib/wallet";
import { useChitFund } from "~/hooks/contracts/useChitFund";
import { formatEther } from "ethers";

interface BiddingTestProps {
  contractAddress: string;
  className?: string;
}

export function BiddingTest({ contractAddress, className }: BiddingTestProps) {
  const { address } = useWallet();
  const { getFundData, fundData, loading, error } =
    useChitFund(contractAddress);
  const [testResults, setTestResults] = useState<{
    [key: string]: "pending" | "passed" | "failed";
  }>({});

  const runTest = async (
    testName: string,
    testFunction: () => Promise<boolean>,
  ) => {
    setTestResults((prev) => ({ ...prev, [testName]: "pending" }));

    try {
      const result = await testFunction();
      setTestResults((prev) => ({
        ...prev,
        [testName]: result ? "passed" : "failed",
      }));
    } catch (error) {
      setTestResults((prev) => ({ ...prev, [testName]: "failed" }));
    }
  };

  const testFundData = async () => {
    const data = await getFundData();
    return data !== null && data.fundInfo !== null;
  };

  const testCycleData = async () => {
    const data = await getFundData();
    return Boolean(data?.currentCycle !== null && data?.currentCycle.isActive);
  };

  const testMemberStatus = async () => {
    const data = await getFundData();
    return data?.memberStatus !== null;
  };

  const testBiddingPhase = async () => {
    const data = await getFundData();
    if (!data?.currentCycle) return false;

    const now = Math.floor(Date.now() / 1000);
    const isBiddingPhase =
      now > data.currentCycle.contributionDeadline &&
      now <= data.currentCycle.biddingDeadline;

    return isBiddingPhase;
  };

  const testPoolAmount = async () => {
    const data = await getFundData();
    return Boolean(
      data?.currentCycle?.totalPool && data.currentCycle.totalPool > 0,
    );
  };

  const runAllTests = async () => {
    await runTest("Fund Data Loading", testFundData);
    await runTest("Cycle Data Available", testCycleData);
    await runTest("Member Status Check", testMemberStatus);
    await runTest("Bidding Phase Detection", testBiddingPhase);
    await runTest("Pool Amount Available", testPoolAmount);
  };

  useEffect(() => {
    if (contractAddress) {
      runAllTests();
    }
  }, [contractAddress]);

  const getTestIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 animate-spin text-yellow-600" />;
    }
  };

  const getTestColor = (status: string) => {
    switch (status) {
      case "passed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const allTestsPassed = Object.values(testResults).every(
    (status) => status === "passed",
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center text-lg">
              <TestTube className="mr-2 h-5 w-5" />
              Bidding System Test
            </CardTitle>
            <CardDescription>
              Verify all bidding/auction components are working
            </CardDescription>
          </div>
          <Badge variant={allTestsPassed ? "default" : "secondary"}>
            {allTestsPassed ? "All Tests Passed" : "Testing..."}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {Object.entries(testResults).map(([testName, status]) => (
            <div
              key={testName}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center space-x-3">
                {getTestIcon(status)}
                <span className="font-medium">{testName}</span>
              </div>
              <span className={`text-sm font-medium ${getTestColor(status)}`}>
                {status === "pending" ? "Testing..." : status}
              </span>
            </div>
          ))}
        </div>

        {fundData && (
          <div className="space-y-3 rounded-lg border p-4">
            <h4 className="font-medium">Current Fund Status</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Pool Amount:</span>
                <span className="ml-2 font-semibold">
                  {fundData.currentCycle?.totalPool
                    ? formatEther(fundData.currentCycle.totalPool)
                    : "0"}{" "}
                  FLOW
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Members:</span>
                <span className="ml-2 font-semibold">
                  {fundData.fundInfo?.currentMembers || 0}/
                  {fundData.fundInfo?.totalMembers || 0}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Cycle:</span>
                <span className="ml-2 font-semibold">
                  {fundData.currentCycle?.cycleNumber || 0}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Active:</span>
                <span className="ml-2 font-semibold">
                  {fundData.currentCycle?.isActive ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        )}

        <Button onClick={runAllTests} className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <TestTube className="mr-2 h-4 w-4" />
              Run All Tests
            </>
          )}
        </Button>

        <div className="text-muted-foreground space-y-1 text-xs">
          <p>Tests verify bidding system components are working</p>
          <p>All tests must pass for bidding to function properly</p>
          <p>Check console for detailed test results</p>
        </div>
      </CardContent>
    </Card>
  );
}
