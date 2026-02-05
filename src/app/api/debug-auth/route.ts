import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const email = "student@flowmap.com";
        console.log("DEBUG-API: Starting diagnostic for", email);
        console.log("DEBUG-API: DB URL present:", !!process.env.DATABASE_URL);
        if (process.env.DATABASE_URL) {
            console.log("DEBUG-API: DB URL starts with:", process.env.DATABASE_URL.substring(0, 20) + "...");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            const allUsers = await prisma.user.findMany({ select: { email: true } });
            return NextResponse.json({
                error: "User not found",
                attempted: email,
                available: allUsers.map(u => u.email)
            });
        }

        const match = await bcrypt.compare("123456", user.password);

        return NextResponse.json({
            status: "User found",
            email: user.email,
            match,
            passwordHashLength: user.password.length,
            passwordHashStart: user.password.substring(0, 7) + "...",
            dbId: user.id
        });
    } catch (error: any) {
        console.error("DEBUG-API: Error:", error);
        return NextResponse.json({
            error: "Exception occurred",
            message: error.message,
            stack: error.stack?.substring(0, 100)
        }, { status: 500 });
    }
}
