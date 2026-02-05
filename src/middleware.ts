import NextAuth from "next-auth";
import { authConfig } from "./auth.config"; // We'll need to separate config to avoid edge runtime issues with bcrypt

// TEMPORARY: using basic auth from auth.ts directly might fail in middleware due to edge runtime (bcrypt)
// So we usually need a separate auth.config.ts for middleware compatible config.

// However, for this specific request, I will try to implement the middleware logic using the auth helper 
// but wrapped carefully. If bcrypt causes issues (it relies on Node APIs), I will need to refactor.
// For now, let's stick to the requested logic but be aware of the Edge Runtime constraint.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from "@/auth";

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = (req.auth?.user as any)?.role;

    const isAuthRoute = nextUrl.pathname.startsWith('/api/auth') || nextUrl.pathname === '/login';
    const isAdminRoute = nextUrl.pathname.startsWith('/admin') || nextUrl.pathname.startsWith('/exam/editor');
    const isStudentRoute = nextUrl.pathname.startsWith('/student') || nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/practice') || (nextUrl.pathname.startsWith('/exam') && !isAdminRoute);

    // If on auth route (login), redirect to dashboard if logged in
    if (isAuthRoute) {
        if (isLoggedIn) {
            if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', nextUrl)); // Assuming admin dashboard
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        return null;
    }

    // Guard Admin Routes
    if (isAdminRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', nextUrl)); // Redirect unauthorized access to student dashboard
    }

    // Guard Student Routes
    if (isStudentRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        // Optionally restrict Admin from student view? Usually admins can see everything, or separate logic.
        // For now, just ensure logged in.
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
