import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

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
            if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        return NextResponse.next();
    }

    // Guard Admin Routes
    if (isAdminRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }

    // Guard Student Routes
    if (isStudentRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    // Optimized matcher: excludes static files, api routes, and common assets
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
