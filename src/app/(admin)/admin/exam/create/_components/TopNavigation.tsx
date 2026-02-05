"use client"

import { useState } from "react"
import { ChevronRight, Eye, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function TopNavigation() {
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setIsSaving(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500))
        setIsSaving(false)
        toast.success("Đã lưu đề thi thành công vào kho đề thi!")
        router.push("/admin/exam")
    }

    return (
        <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-10 sticky top-0">
            <div className="px-8 py-5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                        <span>Kho đề thi</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-[#10b763]">Tạo đề mới</span>
                    </div>
                    <h1 className="text-slate-900 text-2xl font-black tracking-tight">Biên soạn đề thi</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-bold">
                        <Eye className="w-5 h-5" />
                        <span className="hidden sm:inline">Xem trước</span>
                    </Button>
                    <Button
                        disabled={isSaving}
                        onClick={handleSave}
                        className="flex items-center gap-2 bg-[#10b763] hover:bg-[#0d9651] text-white shadow-lg shadow-emerald-500/30 font-bold min-w-[180px]"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Đang lưu...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                <span>Lưu vào Kho đề thi</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </header>
    )
}
