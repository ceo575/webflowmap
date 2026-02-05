"use client"

import { ReviewQuestion } from "../types"
import { cn } from "@/lib/utils"
import { ChevronDown, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReviewSidebarProps {
    questions: ReviewQuestion[]
    currentQuestionId: number
    onSelectQuestion: (id: number) => void
}

export function ReviewSidebar({ questions, currentQuestionId, onSelectQuestion }: ReviewSidebarProps) {
    return (
        <aside className="w-[20%] min-w-[280px] h-full flex flex-col border-r border-slate-200 bg-white">
            <div className="p-5 border-b border-slate-200">
                <h1 className="text-lg font-bold leading-normal mb-1 text-slate-900">Danh sách câu hỏi</h1>
                <p className="text-[#059669] text-sm font-normal">Bài thi #1024 - Toán Cao Cấp</p>
            </div>

            <div className="p-3 flex flex-wrap gap-2">
                <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-emerald-50 pl-3 pr-2 transition hover:bg-emerald-100">
                    <span className="text-[#059669] text-xs font-bold">Tất cả</span>
                    <ChevronDown className="text-[#059669] w-4 h-4" />
                </button>
                <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-transparent border border-slate-200 pl-3 pr-2 transition hover:bg-slate-50">
                    <span className="text-slate-900 text-xs font-medium">Câu sai</span>
                </button>
                <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-transparent border border-slate-200 pl-3 pr-2 transition hover:bg-slate-50">
                    <span className="text-slate-900 text-xs font-medium">Đã đánh dấu</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q) => {
                        const isSelected = q.id === currentQuestionId;

                        // Style logic
                        let baseClasses = "aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors border";
                        let colorClasses = "";

                        if (q.isCorrect) {
                            colorClasses = "bg-emerald-50 text-[#059669] border-[#059669]/20 hover:bg-[#059669] hover:text-white";
                        } else {
                            colorClasses = "bg-red-500 text-white border-red-500 hover:bg-red-600";
                            if (isSelected) {
                                colorClasses += " ring-2 ring-offset-2 ring-red-500";
                            }
                        }

                        // Specific override for current selection if correct? Or just border?
                        // The user design shows specific styles.
                        // Correct: Green bg/text
                        // Wrong: Red bg/white text
                        // Selected: Ring/Border emphasis

                        if (isSelected && q.isCorrect) {
                            colorClasses += " ring-2 ring-offset-2 ring-[#059669]";
                        }

                        // Fallback for not done? Assuming all done here for review.

                        return (
                            <button
                                key={q.id}
                                onClick={() => onSelectQuestion(q.id)}
                                className={cn(baseClasses, colorClasses)}
                            >
                                {q.questionNumber}
                            </button>
                        )
                    })}

                    {/* Fillers for demo to match UI look if needed, but we used real map */}
                </div>
            </div>

            <div className="p-4 border-t border-slate-200">
                <Button className="w-full bg-[#059669] hover:bg-[#047a55] text-white font-bold h-10">
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Quay lại trang chủ
                </Button>
            </div>
        </aside>
    )
}
