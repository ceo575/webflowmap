"use client"

import { ReviewQuestion } from "../types"
import { cn } from "@/lib/utils"
import { Bot, Zap, Eye, Wrench, Flag, Mic, Send } from "lucide-react"

interface AITutorPanelProps {
    question: ReviewQuestion
}

export function AITutorPanel({ question }: AITutorPanelProps) {
    const { aiAnalysis } = question

    return (
        <aside className="w-[30%] min-w-[320px] h-full flex flex-col border-l border-slate-200 bg-[#f0fdf9]">
            {/* Tutor Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shadow-sm">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#059669] to-emerald-300 flex items-center justify-center shadow-inner">
                    <Bot className="text-white w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900">AI Flow Tutor</h3>
                    <p className="text-xs text-[#059669]">Phân tích tư duy & Hỗ trợ</p>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="px-4 pt-4">
                <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                    <button className="flex-1 py-1.5 px-3 rounded text-xs font-bold bg-[#059669] text-white shadow-sm transition-all">Flow Thinking</button>
                    <button className="flex-1 py-1.5 px-3 rounded text-xs font-medium text-slate-500 hover:bg-slate-50 transition-all">Chat với AI</button>
                </div>
            </div>

            {/* Flow Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Timeline Line */}
                <div className="relative pl-4 space-y-6 before:content-[''] before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-[#059669]/50 before:to-transparent">
                    {/* Step 1: Nhận diện */}
                    <div className="relative pl-8">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center z-10">
                            <Eye className="text-emerald-600 w-3.5 h-3.5" />
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Nhận diện bài toán</h4>
                            <p className="text-sm text-slate-700">{aiAnalysis.step1_identify}</p>
                        </div>
                    </div>

                    {/* Step 2: Phương pháp */}
                    <div className="relative pl-8">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center z-10">
                            <Wrench className="text-emerald-600 w-3.5 h-3.5" />
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wide mb-1">Phương pháp</h4>
                            <p className="text-sm text-slate-700">{aiAnalysis.step2_method}</p>
                        </div>
                    </div>

                    {/* Step 3: Thực hiện */}
                    <div className="relative pl-8">
                        <div className={cn(
                            "absolute left-0 top-0 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10",
                            question.isCorrect ? "bg-emerald-100 border-emerald-500" : "bg-red-100 border-red-500"
                        )}>
                            <Zap className={cn("w-3.5 h-3.5", question.isCorrect ? "text-emerald-600" : "text-red-600")} />
                        </div>
                        <div className={cn(
                            "bg-white p-3 rounded-lg border shadow-sm",
                            question.isCorrect ? "border-slate-200" : "border-red-200 ring-1 ring-red-100"
                        )}>
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={cn("text-xs font-bold uppercase tracking-wide", question.isCorrect ? "text-emerald-700" : "text-red-600")}>Thực hiện tính toán</h4>
                                {!question.isCorrect && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase">Lỗi sai</span>}
                            </div>
                            <p className="text-sm text-slate-700 mb-2">{aiAnalysis.step3_execution}</p>

                            {!question.isCorrect && aiAnalysis.mistakeHighlight && (
                                <div className="bg-red-50 p-2 rounded text-xs text-red-800 border border-red-100">
                                    {aiAnalysis.mistakeHighlight}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 4: Kết luận */}
                    <div className="relative pl-8">
                        <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-slate-100 border-2 border-slate-400 flex items-center justify-center z-10">
                            <Flag className="text-slate-500 w-3.5 h-3.5" />
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm opacity-60">
                            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">Kết luận</h4>
                            <p className="text-sm text-slate-700">{aiAnalysis.step4_conclusion}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex gap-2 overflow-x-auto mb-3 pb-1 no-scrollbar">
                    <button className="shrink-0 px-3 py-1.5 rounded-full bg-emerald-50 text-[#059669] text-xs font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors">Gợi ý cách khác</button>
                    <button className="shrink-0 px-3 py-1.5 rounded-full bg-emerald-50 text-[#059669] text-xs font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors">Giải thích lại bước 2</button>
                </div>
                <div className="relative">
                    <input className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/50 focus:border-[#059669]" placeholder="Hỏi AI Tutor về bài toán này..." type="text" />
                    <div className="absolute right-2 top-1.5 flex items-center gap-1">
                        <button className="p-1.5 text-slate-400 hover:text-[#059669] transition-colors rounded-full hover:bg-slate-100">
                            <Mic className="w-5 h-5" />
                        </button>
                        <button className="p-1.5 text-[#059669] hover:text-emerald-700 transition-colors rounded-full hover:bg-emerald-50">
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
