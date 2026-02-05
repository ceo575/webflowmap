"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { Menu, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:pl-[280px] min-h-screen transition-all duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-[#059669]" />
                        <span className="font-bold text-gray-900">FlowMAP</span>
                    </div>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6 text-gray-600" />
                    </Button>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    )
}
