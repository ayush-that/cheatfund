import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "connected", timestamp: new Date().toISOString() };
  } catch (error) {
    return {
      status: "disconnected",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };
  }
}

export class ChitFundDatabase {
  static async createFund(data: {
    contractAddress: string;
    name: string;
    description?: string;
    category?: string;
    organizer: string;
    totalAmount: number;
    maxParticipants: number;
    duration?: number;
    startDate?: Date;
    isPublic?: boolean;
  }) {
    return await prisma.chitFund.create({
      data: {
        contractAddress: data.contractAddress,
        name: data.name,
        description: data.description,
        category: data.category,
        organizer: data.organizer,
        totalAmount: data.totalAmount,
        maxParticipants: data.maxParticipants,
        duration: data.duration,
        startDate: data.startDate,
        isPublic: data.isPublic ?? true,
      },
    });
  }

  static async getFundByContractAddress(contractAddress: string) {
    return await prisma.chitFund.findUnique({
      where: { contractAddress },
      include: {
        members: true,
        activities: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
  }

  static async getPublicFunds(limit = 20, offset = 0) {
    return await prisma.chitFund.findMany({
      where: { isPublic: true },
      include: {
        members: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  static async getFundsByOrganizer(organizer: string) {
    return await prisma.chitFund.findMany({
      where: { organizer },
      include: {
        members: true,
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async addMemberToFund(fundId: string, memberAddress: string) {
    return await prisma.fundMember.create({
      data: {
        fundId,
        memberAddress,
        status: "active",
      },
    });
  }

  static async getFundMembers(fundId: string) {
    return await prisma.fundMember.findMany({
      where: { fundId },
      orderBy: { joinedAt: "asc" },
    });
  }

  static async addActivity(data: {
    fundId: string;
    activityType: string;
    description?: string;
    amount?: number;
    memberAddress?: string;
    transactionHash?: string;
  }) {
    return await prisma.fundActivity.create({
      data: {
        fundId: data.fundId,
        activityType: data.activityType,
        description: data.description,
        amount: data.amount,
        memberAddress: data.memberAddress,
        transactionHash: data.transactionHash,
      },
    });
  }

  static async getFundActivities(fundId: string, limit = 20) {
    return await prisma.fundActivity.findMany({
      where: { fundId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  static async updateFundStatus(
    contractAddress: string,
    updates: {
      isPublic?: boolean;
      description?: string;
      category?: string;
    },
  ) {
    return await prisma.chitFund.update({
      where: { contractAddress },
      data: updates,
    });
  }
}
