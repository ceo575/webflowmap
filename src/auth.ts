import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
    email: z.string().trim().min(1),
    password: z.string().min(1),
});

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
                const parsedCredentials = credentialsSchema.safeParse(credentials);
                if (!parsedCredentials.success) return null;

                const email = parsedCredentials.data.email.toLowerCase();
                const password = parsedCredentials.data.password;

                try {
                    const user = await prisma.user.findFirst({
                        where: { email: { equals: email, mode: "insensitive" } },
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
                        passwordsMatch = password === user.password;
                    }

                    if (!passwordsMatch) return null;

                    if (!user.password.startsWith("$2")) {
                        try {
                            const upgradedPassword = await bcrypt.hash(password, 10);
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { password: upgradedPassword },
                            });
                        } catch (upgradeError) {
                            console.warn("Password upgrade skipped:", upgradeError);
                        }
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        image: user.image,
                    } as any;
                } catch (error) {
                    console.error("Auth Error:", error);
                    return null;
                }
            },
        }),
    ],
});
