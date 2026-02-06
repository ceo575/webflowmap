import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prismaClient =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: ["query"],
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prismaClient;

// NOTE:
// Keep a loose exported type because generated client shape can lag behind schema
// in some deployment environments during rolling updates.
export const prisma = prismaClient as unknown as any;
