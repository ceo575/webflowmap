"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Target, User, GraduationCap } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const sidebarItems = [
    {
        icon: LayoutDashboard,
        label: "Trang chủ",
        href: "/dashboard",
    },
    {
        icon: FileText,
        label: "Bài thi của tôi",
        href: "/my-exams",
    },
    {
        icon: Target,
        label: "Luyện tập",
        href: "/practice",
    },
    {
        icon: User,
        label: "Hồ sơ cá nhân",
        href: "/profile",
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="h-screen w-[280px] border-r bg-white flex-col hidden lg:flex fixed left-0 top-0 z-30">
            {/* Logo Area */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                <GraduationCap className="h-8 w-8 text-[#059669]" />
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">FlowMAP</h1>
                    <p className="text-xs text-[#059669] font-medium">Học toán hiệu quả</p>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {sidebarItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                                isActive
                                    ? "bg-emerald-50 text-[#059669]"
                                    : "text-gray-500 hover:bg-slate-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-[#059669]" : "text-gray-400 group-hover:text-gray-600")} />
                            {item.label}
                        </Link>
                    )
                })}
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
                    <Avatar className="h-10 w-10 border border-gray-200">
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>MA</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">Minh Anh</p>
                        <p className="text-xs text-gray-500 truncate">Học sinh lớp 12</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
