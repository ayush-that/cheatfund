import { NextRequest, NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { contractAddress } = await request.json();

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 },
      );
    }

    const fund =
      await ChitFundDatabase.ensureOrganizerIsMember(contractAddress);

    if (!fund) {
      return NextResponse.json({ error: "Fund not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Organizer added as member successfully",
      fund: {
        id: fund.id,
        name: fund.name,
        organizer: fund.organizer,
        memberCount: fund.members.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fix organizer membership" },
      { status: 500 },
    );
  }
}
