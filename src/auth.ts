import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    secret: process.env.AUTH_SECRET,
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsedCredentials.success) return null;

                const { email, password } = parsedCredentials.data;

                try {
                    const user = await prisma.user.findUnique({
                        where: { email },
                        select: {
                            id: true,
                            email: true,
                            password: true,
                            name: true,
                            image: true,
                            role: true,
                        },
                    });

                    if (!user || !user.password) return null;

                    let passwordsMatch = false;

                    try {
                        passwordsMatch = await bcrypt.compare(password, user.password);
                    } catch {
                        // Legacy plain-text passwords in older datasets can make bcrypt.compare throw.
                        // We fallback to plain comparison once, then transparently upgrade to bcrypt hash.
                        passwordsMatch = password === user.password;
                    }

                    if (!passwordsMatch && password === user.password) {
                        passwordsMatch = true;
                    }

                    if (passwordsMatch && !user.password.startsWith("$2")) {
                        const upgradedPassword = await bcrypt.hash(password, 10);
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { password: upgradedPassword },
                        });
                    }

                    if (passwordsMatch) return user;
                } catch (error) {
                    console.error("Auth Error:", error);
                }

                return null;
            },
        }),
    ],
});
