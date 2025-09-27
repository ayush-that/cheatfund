import { NextRequest, NextResponse } from "next/server";
import { ChitFundDatabase } from "~/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("address");

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 },
      );
    }

    const organizedFunds =
      await ChitFundDatabase.getFundsByOrganizer(userAddress);

    const memberFunds = await ChitFundDatabase.getFundsByMember(userAddress);

    const allUserFunds = [...organizedFunds, ...memberFunds];
    const uniqueFunds = allUserFunds.filter(
      (fund, index, self) => index === self.findIndex((f) => f.id === fund.id),
    );

    return NextResponse.json({ success: true, data: uniqueFunds });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch user funds" },
      { status: 500 },
    );
  }
}
