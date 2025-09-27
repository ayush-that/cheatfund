import { NextRequest, NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      contractAddress,
      name,
      description,
      category,
      organizer,
      totalAmount,
      maxParticipants,
      duration,
      startDate,
      isPublic,
    } = body;

    // Validate required fields
    if (!contractAddress || !name || !organizer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create fund in database
    const fund = await ChitFundDatabase.createFund({
      contractAddress,
      name,
      description,
      category,
      organizer,
      totalAmount: Number(totalAmount),
      maxParticipants: Number(maxParticipants),
      duration: duration ? Number(duration) : undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      isPublic: isPublic ?? true,
    });

    return NextResponse.json({ success: true, fund });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create fund" },
      { status: 500 },
    );
  }
}
