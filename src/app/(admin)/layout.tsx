"use client"

import { AdminSidebar } from "@/components/layout/AdminSidebar"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#f6f8f7] flex font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:pl-72 min-h-screen relative overflow-hidden">
                {children}
            </div>
        </div>
    )
}
