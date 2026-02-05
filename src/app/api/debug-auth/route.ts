import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
    const results: any[] = [];
    const password = "8SM6FlRV3TisMtqR";
    const ref = "arciimidezcwuqihxrcd";

    const tests = [
        {
            name: "Pooler Host 0 (Regional)",
            url: `postgresql://postgres.${ref}:${password}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`
        },
        {
            name: "Pooler Host (Simplified)",
            url: `postgresql://postgres.${ref}:${password}@ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true`
        },
        {
            name: "Direct Host (Standard Port)",
            url: `postgresql://postgres:${password}@db.${ref}.supabase.co:5432/postgres?sslmode=require`
        }
    ];

    for (const test of tests) {
        let prisma: any = null;
        try {
            prisma = new PrismaClient({
                datasources: { db: { url: test.url } },
                log: ['error']
            });
            // Use a timeout to prevent hanging
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
            await Promise.race([prisma.$connect(), timeout]);

            results.push({ name: test.name, status: "SUCCESS" });
            await prisma.$disconnect();
        } catch (e: any) {
            results.push({ name: test.name, status: "FAILED", error: e.message.substring(0, 150) });
            if (prisma) await prisma.$disconnect().catch(() => { });
        }
    }

    return NextResponse.json({
        results,
        help: "Copy the SUCCESS url format for your Vercel DATABASE_URL"
    });
}
