import { NextRequest, NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { fundId, memberAddress } = body;

    console.log("Adding member to fund:", { fundId, memberAddress });

    if (!fundId || !memberAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const member = await ChitFundDatabase.addMemberToFund(
      fundId,
      memberAddress,
    );

    console.log("Member added successfully:", member);

    return NextResponse.json({ success: true, member });
  } catch (error) {
    console.error("Failed to add member:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 },
    );
  }
}
