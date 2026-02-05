"use client"

import { Bot } from "lucide-react"

interface AIInsightProps {
    comment: string
}

export function AIInsight({ comment }: AIInsightProps) {
    return (
        <div className="flex-1 bg-[#e6f4f1] rounded-2xl p-6 border border-[#059669]/20 flex items-start gap-4 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#059669]/10 rounded-full blur-2xl"></div>
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#059669] flex items-center justify-center shadow-md z-10">
                <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="z-10">
                <h3 className="font-bold text-[#059669] text-lg mb-1">AI Insight</h3>
                <p className="text-slate-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: `"${comment}"` }} />
            </div>
        </div>
    )
}
