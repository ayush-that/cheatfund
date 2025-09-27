import { NextResponse } from "next/server";
import { checkDatabaseConnection } from "~/lib/database";

export async function GET() {
  try {
    const dbStatus = await checkDatabaseConnection();

    const healthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: dbStatus,
      environment: process.env.NODE_ENV,
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "unknown",
    };

    return NextResponse.json(healthStatus, {
      status: dbStatus.status === "connected" ? 200 : 503,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
