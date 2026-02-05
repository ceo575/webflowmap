import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            // Basic check: we handle specific routing in middleware.ts
            return true;
        },
    },
    providers: [], // Add empty providers array, logic added in auth.ts
} satisfies NextAuthConfig;
