import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
    const results: any[] = [];
    const pass = "8SM6FlRV3TisMtqR";
    const ref = "arciimidezcwuqihxrcd";

    // These are the most likely working combinations based on ap-south-1 region issues
    const tests = [
        {
            name: "Standard Pooler (Transaction)",
            url: `postgresql://postgres.${ref}:${pass}@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require&supavisor_session_mode=transaction&pgbouncer=true`
        },
        {
            name: "Standard Pooler (Session)",
            url: `postgresql://postgres.${ref}:${pass}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require&supavisor_session_mode=session`
        },
        {
            name: "Direct Host (IPv4 Proxy Guess)",
            url: `postgresql://postgres:${pass}@db.${ref}.supabase.co:5432/postgres?sslmode=require`
        },
        {
            name: "Pooler Host (Port 5432 variant)",
            url: `postgresql://postgres.${ref}:${pass}@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require`
        }
    ];

    for (const test of tests) {
        let prisma: any = null;
        try {
            prisma = new PrismaClient({
                datasources: { db: { url: test.url } }
            });
            const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 4000));
            await Promise.race([prisma.$connect(), timeout]);
            results.push({ name: test.name, status: "SUCCESS" });
            await prisma.$disconnect();
        } catch (e: any) {
            results.push({ name: test.name, status: "FAILED", error: e.message.substring(0, 120) });
            if (prisma) await prisma.$disconnect().catch(() => { });
        }
    }

    return NextResponse.json({
        results,
        note: "If all fail, verify the database password is EXACTLY 8SM6FlRV3TisMtqR"
    });
}
