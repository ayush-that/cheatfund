import { NextRequest, NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fundId = searchParams.get("fundId");

    if (!fundId) {
      return NextResponse.json({ error: "Missing fundId" }, { status: 400 });
    }

    const members = await ChitFundDatabase.getFundMembers(fundId);

    return NextResponse.json({
      success: true,
      fundId,
      members,
      count: members.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch fund members", details: error },
      { status: 500 },
    );
  }
}
