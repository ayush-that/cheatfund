import { NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function GET() {
  try {
    const successRate = await ChitFundDatabase.getSuccessRate();

    return NextResponse.json({
      success: true,
      successRate,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch success rate" },
      { status: 500 },
    );
  }
}
