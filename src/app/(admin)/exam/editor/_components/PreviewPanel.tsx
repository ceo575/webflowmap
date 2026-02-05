"use client"

import { Question } from "../types"
import "katex/dist/katex.min.css"
import katex from "katex"
import { Check, Edit, ChevronDown, ChevronUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Helper to render latex content safely
const LatexContent = ({ content }: { content: string }) => {
    // Simple parser to split by $...$ and render InlineMath
    const parts = content.split(/(\$[^$]+\$)/g);
    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    const math = part.slice(1, -1);
                    try {
                        const html = katex.renderToString(math, {
                            throwOnError: false,
                            displayMode: false,
                        });
                        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
                    } catch (e) {
                        return <span key={index} className="text-red-500">{part}</span>;
                    }
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

interface PreviewPanelProps {
    questions: Question[]
    selectedId: number | null
    onSelect: (id: number) => void
}

export function PreviewPanel({ questions, selectedId, onSelect }: PreviewPanelProps) {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-20 bg-[#f8fafc] dark:bg-[#0f172a]">
            {questions.map((q) => (
                <div
                    key={q.id}
                    className={cn(
                        "bg-white dark:bg-[#1e293b] rounded-lg shadow-sm border p-5 relative group transition-all cursor-pointer",
                        selectedId === q.id ? "border-[#059669] ring-1 ring-[#059669]" : "border-slate-200 dark:border-slate-700 hover:border-[#059669]/50"
                    )}
                    onClick={() => onSelect(q.id)}
                >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-[#1d4ed8] dark:text-blue-400 font-bold text-base">{q.title}</h3>
                        <div className="flex gap-2">
                            <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 flex items-center gap-1">
                                <Edit className="w-4 h-4" />
                                <span className="text-xs font-medium">Sửa</span>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        <LatexContent content={q.content} />
                    </div>

                    {/* Answers based on Type */}
                    {q.type === 'multiple_choice' && (
                        <div className="grid grid-cols-1 gap-3">
                            {q.answers?.map((ans) => (
                                <div key={ans.id} className={cn(
                                    "flex items-center border rounded-lg overflow-hidden transition relative",
                                    ans.isCorrect ? "border-[#059669]/30 bg-emerald-50/20" : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                                )}>
                                    <div className="w-10 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 flex items-center justify-center font-bold text-slate-600 py-3">
                                        {ans.label}
                                    </div>
                                    <div className="px-4 py-3 flex-1">
                                        <LatexContent content={ans.content} />
                                    </div>
                                    {ans.isCorrect && (
                                        <div className="absolute bottom-0 right-0">
                                            <div className="w-0 h-0 border-l-[30px] border-l-transparent border-b-[30px] border-b-[#059669]"></div>
                                            <Check className="absolute bottom-[1px] right-[1px] w-3.5 h-3.5 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {q.type === 'true_false' && (
                        <div className="overflow-hidden border border-slate-200 rounded-lg">
                            <table className="w-full text-sm text-slate-700">
                                <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Mệnh đề</th>
                                        <th className="px-4 py-3 text-center w-24">Đúng</th>
                                        <th className="px-4 py-3 text-center w-24">Sai</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {q.propositions?.map((prop) => (
                                        <tr key={prop.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <span className="font-bold mr-2 text-[#1d4ed8]">{prop.label}</span>
                                                <LatexContent content={prop.content} />
                                            </td>
                                            <td className="px-4 py-3 text-center align-middle">
                                                <input type="radio" checked={prop.isCorrect} readOnly className="w-4 h-4 text-[#059669] border-slate-300 focus:ring-[#059669]" />
                                            </td>
                                            <td className="px-4 py-3 text-center align-middle">
                                                <input type="radio" checked={!prop.isCorrect} readOnly className="w-4 h-4 text-[#059669] border-slate-300 focus:ring-[#059669]" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {q.type === 'short_answer' && (
                        <div className="flex items-center border border-[#059669] rounded-lg overflow-hidden bg-white relative">
                            <div className="w-20 bg-slate-100 border-r border-slate-200 flex items-center justify-center font-bold text-slate-600 py-3 text-sm">
                                Đáp án
                            </div>
                            <input
                                type="text"
                                value={q.correctAnswer}
                                readOnly
                                className="flex-1 px-4 py-3 border-none bg-transparent focus:ring-0 text-slate-800 text-sm font-semibold"
                            />
                            <div className="absolute bottom-0 right-0 pointer-events-none">
                                <div className="w-0 h-0 border-l-[30px] border-l-transparent border-b-[30px] border-b-[#059669]"></div>
                                <Check className="absolute bottom-[1px] right-[1px] w-3.5 h-3.5 text-white" />
                            </div>
                        </div>
                    )}

                    {/* Explanation Toggle */}
                    <div className="mt-6 pt-4 border-t border-slate-200">
                        <button className="text-blue-600 text-sm font-medium flex items-center gap-1 mb-2">
                            <ChevronUp className="w-4 h-4" /> Ẩn lời giải
                        </button>
                        {q.explanation && (
                            <div className="pl-2 border-l-2 border-[#059669] mt-2 text-sm text-slate-600">
                                <p className="font-bold text-slate-800 mb-1">Lời giải</p>
                                <LatexContent content={q.explanation} />
                            </div>
                        )}
                    </div>

                </div>
            ))}
        </div>
    )
}
