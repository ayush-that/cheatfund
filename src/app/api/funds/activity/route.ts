import { NextRequest, NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      fundId,
      activityType,
      description,
      amount,
      memberAddress,
      transactionHash,
    } = body;

    // Validate required fields
    if (!fundId || !activityType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Add activity to database
    const activity = await ChitFundDatabase.addActivity({
      fundId,
      activityType,
      description,
      amount: amount ? Number(amount) : undefined,
      memberAddress,
      transactionHash,
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add activity" },
      { status: 500 },
    );
  }
}
