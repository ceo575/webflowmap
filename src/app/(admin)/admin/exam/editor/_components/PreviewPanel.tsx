"use client"

import { Question } from "@/stores/exam-store"
import { LatexContent } from "@/components/common/LatexContent"
import { Check, Edit } from "lucide-react"
import { cn } from "@/lib/utils"

interface PreviewPanelProps {
    questions: Question[]
    selectedId: string | null
    onSelect: (id: string) => void
}

export function PreviewPanel({ questions, selectedId, onSelect }: PreviewPanelProps) {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20 bg-[#f8fafc]">
            {questions.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                    <p>Chưa có câu hỏi nào. Hãy upload file Word để bắt đầu.</p>
                </div>
            ) : (
                questions.map((q, index) => (
                    <div
                        key={q.id}
                        className={cn(
                            "bg-white rounded-lg shadow-sm border p-5 relative group transition-all cursor-pointer",
                            selectedId === q.id ? "border-[#059669] ring-2 ring-[#059669]/20" : "border-slate-200 hover:border-[#059669]/50"
                        )}
                        onClick={() => onSelect(q.id)}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[#1d4ed8] font-bold text-base">
                                Câu {index + 1}
                            </h3>
                            <div className="flex gap-2">
                                {selectedId === q.id && (
                                    <span className="text-emerald-600 text-xs font-medium flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                                        <Edit className="w-3 h-3" />
                                        Đang chỉnh sửa
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Content with image if exists */}
                        <div className="mb-4">
                            {q.imageBase64 && (
                                <img
                                    src={q.imageBase64}
                                    alt="Question image"
                                    className="mb-3 max-w-full h-auto rounded border"
                                />
                            )}
                            <div
                                className="text-sm text-slate-700"
                                style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8' }}
                            >
                                <LatexContent content={q.content} />
                            </div>
                        </div>

                        {/* Answers for MCQ */}
                        {q.type === 'MCQ' && q.options && (
                            <div className="grid grid-cols-1 gap-2">
                                {q.options.map((option, optIndex) => {
                                    const label = String.fromCharCode(65 + optIndex); // A, B, C, D
                                    const isCorrect = q.correctAnswer === label;

                                    return (
                                        <div
                                            key={optIndex}
                                            className={cn(
                                                "flex items-center border rounded-lg overflow-hidden transition relative",
                                                isCorrect ? "border-[#059669]/30 bg-emerald-50/50" : "border-slate-200"
                                            )}
                                        >
                                            <div className="w-10 bg-slate-100 border-r border-slate-200 flex items-center justify-center font-bold text-slate-600 py-2.5 text-sm">
                                                {label}
                                            </div>
                                            <div className="px-4 py-2.5 flex-1 text-sm">
                                                <LatexContent content={option} />
                                            </div>
                                            {isCorrect && (
                                                <div className="absolute bottom-0 right-0">
                                                    <div className="w-0 h-0 border-l-[24px] border-l-transparent border-b-[24px] border-b-[#059669]"></div>
                                                    <Check className="absolute bottom-[1px] right-[1px] w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Answer for Short Answer */}
                        {q.type === 'SHORT_ANSWER' && (
                            <div className="flex items-center border border-[#059669] rounded-lg overflow-hidden bg-emerald-50/30 relative">
                                <div className="w-20 bg-slate-100 border-r border-slate-200 flex items-center justify-center font-bold text-slate-600 py-2.5 text-xs">
                                    Đáp án
                                </div>
                                <div className="flex-1 px-4 py-2.5 text-slate-800 text-sm font-semibold">
                                    {q.correctAnswer}
                                </div>
                                <div className="absolute bottom-0 right-0 pointer-events-none">
                                    <div className="w-0 h-0 border-l-[24px] border-l-transparent border-b-[24px] border-b-[#059669]"></div>
                                    <Check className="absolute bottom-[1px] right-[1px] w-3 h-3 text-white" />
                                </div>
                            </div>
                        )}

                        {/* Explanation */}
                        {q.explanation && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="pl-3 border-l-2 border-[#059669] text-sm text-slate-600">
                                    <p className="font-bold text-slate-800 mb-1 text-xs uppercase">Lời giải</p>
                                    <LatexContent content={q.explanation} />
                                </div>
                            </div>
                        )}

                        {/* Classification badges */}
                        {(q.chapter || q.lesson || q.problemType) && (
                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                                {q.chapter && (
                                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                        {q.chapter}
                                    </span>
                                )}
                                {q.lesson && (
                                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                        {q.lesson}
                                    </span>
                                )}
                                {q.problemType && (
                                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                                        {q.problemType}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}
