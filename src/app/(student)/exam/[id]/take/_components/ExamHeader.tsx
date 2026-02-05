"use client"

import { Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function ExamHeader() {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#059669] rounded-lg flex items-center justify-center text-white font-bold text-lg">F</div>
                <span className="font-bold text-slate-900 text-lg">FlowMAP</span>
            </div>

            <div className="flex items-center gap-4">
                <span className="text-sm text-slate-500">Thời gian còn lại:</span>
                <Badge variant="outline" className="px-3 py-1.5 text-base font-mono font-bold text-[#059669] border-[#059669] bg-emerald-50 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    01:29:55
                </Badge>
            </div>
        </header>
    )
}
