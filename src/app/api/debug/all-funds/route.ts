import { NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function GET() {
  try {
    const funds = await ChitFundDatabase.getPublicFunds(100, 0);

    const fundsWithMemberCount = funds.map((fund) => ({
      id: fund.id,
      name: fund.name,
      organizer: fund.organizer,
      members: fund.members,
      membersCount: fund.members?.length || 0,
      _count: fund._count,
      maxParticipants: fund.maxParticipants,
    }));

    return NextResponse.json({
      success: true,
      totalFunds: funds.length,
      funds: fundsWithMemberCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch funds", details: error },
      { status: 500 },
    );
  }
}
