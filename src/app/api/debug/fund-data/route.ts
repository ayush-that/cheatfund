import { NextRequest, NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fundName = searchParams.get("fundName");
    const organizer = searchParams.get("organizer");

    if (!fundName || !organizer) {
      return NextResponse.json(
        { error: "Missing fundName or organizer" },
        { status: 400 },
      );
    }

    const funds = await ChitFundDatabase.getPublicFunds(100, 0);
    const fund = funds.find(
      (f: any) =>
        f.name.toLowerCase() === fundName.toLowerCase() &&
        f.organizer.toLowerCase() === organizer.toLowerCase(),
    );

    if (!fund) {
      return NextResponse.json({ error: "Fund not found" });
    }

    return NextResponse.json({
      success: true,
      fund: {
        id: fund.id,
        name: fund.name,
        organizer: fund.organizer,
        members: fund.members,
        membersCount: fund.members?.length,
        _count: fund._count,
        maxParticipants: fund.maxParticipants,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch fund data", details: error },
      { status: 500 },
    );
  }
}
