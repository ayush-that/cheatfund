import { NextRequest, NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit")) || 20;
    const offset = Number(searchParams.get("offset")) || 0;

    const funds = await ChitFundDatabase.getPublicFunds(limit, offset);

    return NextResponse.json({ success: true, data: funds });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch funds" },
      { status: 500 },
    );
  }
}
