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
                console.log("--- Auth Start ---");
                console.log("Email:", credentials?.email);
                console.log("Secret present:", !!process.env.AUTH_SECRET);
                console.log("DB URL present:", !!process.env.DATABASE_URL);
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.error("Zod validation failed:", parsedCredentials.error.format());
                    return null;
                }

                const { email, password } = parsedCredentials.data;

                try {
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user) {
                        console.warn("User not found in DB:", email);
                        return null;
                    }

                    if (!user.password) {
                        console.error("User exists but has no password set:", email);
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (!passwordsMatch) {
                        console.warn("Password mismatch for:", email);
                        return null;
                    }

                    console.log("Authorize successful for:", email);
                    return user;
                } catch (dbError) {
                    console.error("Database error during authorize:", dbError);
                    throw dbError;
                }
            },
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role as string;
            }
            return session;
        },
    },
});
