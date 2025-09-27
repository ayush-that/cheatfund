import { NextRequest, NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { fundId, memberAddress } = body;

    // Validate required fields
    if (!fundId || !memberAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Add member to fund
    const member = await ChitFundDatabase.addMemberToFund(
      fundId,
      memberAddress,
    );

    return NextResponse.json({ success: true, member });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 },
    );
  }
}
