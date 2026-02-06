import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const role = (req.auth?.user as any)?.role;

    const isAuthRoute = nextUrl.pathname.startsWith('/api/auth') || nextUrl.pathname === '/login';
    const isAdminRoute = nextUrl.pathname.startsWith('/(admin)') || nextUrl.pathname.startsWith('/admin');
    const isStudentRoute = nextUrl.pathname.startsWith('/(student)') || nextUrl.pathname.startsWith('/student') || nextUrl.pathname.startsWith('/dashboard') || nextUrl.pathname.startsWith('/practice') || nextUrl.pathname.startsWith('/exam') || nextUrl.pathname.startsWith('/my-exams') || nextUrl.pathname.startsWith('/profile');

    // If on auth route (login), redirect to appropriate dashboard if logged in
    if (isAuthRoute) {
        if (isLoggedIn) {
            if (role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
        return NextResponse.next();
    }

    // Guard Admin Routes - only ADMIN role allowed
    if (isAdminRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        if (role !== 'ADMIN') {
            // Non-admin trying to access admin route - redirect to student dashboard
            return NextResponse.redirect(new URL('/dashboard', nextUrl));
        }
    }

    // Guard Student Routes - any authenticated user allowed (but typically STUDENT role)
    if (isStudentRoute) {
        if (!isLoggedIn) return NextResponse.redirect(new URL('/login', nextUrl));
        // If ADMIN tries to access student routes, redirect to admin dashboard
        if (role === 'ADMIN') {
            return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
        }
    }

    return NextResponse.next();
});

export const config = {
    // Optimized matcher: excludes static files, api routes, and common assets
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
