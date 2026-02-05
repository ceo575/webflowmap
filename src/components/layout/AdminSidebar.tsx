"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Archive, Users, School, BarChart, Settings, LogOut, FilePlus } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "next-auth/react"

const sidebarItems = [
    {
        icon: LayoutDashboard,
        label: "Tổng quan",
        href: "/admin/dashboard",
    },
    {
        icon: Archive,
        label: "Kho đề thi",
        href: "/admin/exam", // Active context for this task
    },
    {
        icon: Users,
        label: "Lớp học",
        href: "/admin/classes",
    },
    {
        icon: School,
        label: "Học sinh",
        href: "/admin/students",
    },
    {
        icon: BarChart,
        label: "Báo cáo",
        href: "/admin/reports",
    },
    {
        icon: FilePlus,
        label: "Tạo đề thi",
        href: "/admin/exam/create",
        isAction: true
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    // For this demo, we assume we are in the "Kho đề thi" section if the path starts with /admin/exam
    // or just default active state visualisation as per requirements

    return (
        <div className="h-screen w-72 border-r border-slate-200 bg-white flex-col hidden md:flex fixed left-0 top-0 z-30">
            <div className="flex flex-col h-full p-6 justify-between">
                <div className="flex flex-col gap-8">
                    {/* User Profile */}
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Avatar className="h-12 w-12 border-2 border-slate-100 shadow-sm">
                                <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuCL86ASsGUJESvOHkFMo-CbNg2YDiVLJTrTR8vhULcvZgp8cgGHlN2LzwaeU0auzt9EznItlSKGXscv2CfHhg2V0185mmzhpIfYNW1CTVMlfWp4sG1qhlX270_EGQDxbPh1IVz_rQNkfueY95j8sB_t6XaMzv8CwWtDfPiJsE9bEnqoz4gc5QnobaEOKoQEq6_8HLnyxdrfMlgJiyeVMPVSVymOqlZDTjBVFSl8YHt2wRleuW5qSR8gSylAHGUG0IZbJQU3TZxyXImC" alt="Ms. Minh Anh" />
                                <AvatarFallback>MA</AvatarFallback>
                            </Avatar>
                            <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold text-slate-900 leading-tight">Ms. Minh Anh</h1>
                            <p className="text-xs font-medium text-slate-500">FlowMAP Teacher</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex flex-col gap-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            // Exact match for dashboard, prefix match for others
                            const isActive = item.href === "/admin/dashboard"
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                            const isActionButton = (item as any).isAction;

                            // If we're on a subpage of exam (like create), don't highlight the main "Kho đề thi" 
                            // if there's a more specific match (the action button)
                            const shouldHighlight = isActionButton
                                ? isActive
                                : (isActive && !pathname.includes("/create"));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group",
                                        shouldHighlight
                                            ? "bg-emerald-50 text-emerald-600"
                                            : isActionButton
                                                ? "bg-emerald-600 text-white hover:bg-emerald-700 mt-2 shadow-sm"
                                                : "hover:bg-slate-50 text-slate-600"
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            "w-6 h-6",
                                            shouldHighlight
                                                ? "fill-current"
                                                : isActionButton
                                                    ? "text-white"
                                                    : "text-slate-500 group-hover:text-emerald-600"
                                        )}
                                        strokeWidth={shouldHighlight ? 2 : 1.5}
                                    />
                                    <span className={cn(
                                        "text-sm font-medium",
                                        shouldHighlight || isActionButton ? "font-bold" : "group-hover:text-emerald-600"
                                    )}>
                                        {item.label}
                                    </span>
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Bottom Actions */}
                <div className="border-t border-slate-100 pt-6">
                    <Link
                        href="/admin/settings"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors group"
                    >
                        <Settings className="w-6 h-6 text-slate-500 group-hover:text-emerald-600" strokeWidth={1.5} />
                        <span className="text-sm font-medium group-hover:text-emerald-600">Cài đặt</span>
                    </Link>

                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors group mt-2"
                    >
                        <LogOut className="w-6 h-6 text-red-500 group-hover:text-red-700" strokeWidth={1.5} />
                        <span className="text-sm font-medium group-hover:text-red-700">Đăng xuất</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
