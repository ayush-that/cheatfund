import { NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function GET() {
  try {
    const totalVolume = await ChitFundDatabase.getTotalVolume();

    return NextResponse.json({
      success: true,
      totalVolume: totalVolume.toString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch total volume" },
      { status: 500 },
    );
  }
}
