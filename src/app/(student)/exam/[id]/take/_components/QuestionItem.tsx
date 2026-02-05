"use client"

import { Question } from "../mockData"
import "katex/dist/katex.min.css"
import katex from "katex"
import { cn } from "@/lib/utils"

// Helper to render latex content safely
const LatexContent = ({ content }: { content: string }) => {
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

interface QuestionItemProps {
    question: Question
    userAnswer?: any
    onAnswer: (value: any) => void
}

export function QuestionItem({ question, userAnswer, onAnswer }: QuestionItemProps) {
    return (
        <div id={`question-${question.id}`} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm scroll-mt-24">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-[#059669] font-bold text-lg">{question.title} <span className="text-slate-400 font-normal text-sm ml-1">({question.type === 'multiple_choice' ? 'Trắc nghiệm' : question.type === 'true_false' ? 'Đúng/Sai' : 'Điền số'})</span></h3>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{question.points} điểm</span>
            </div>

            {/* Content */}
            <div className="mb-6 text-slate-800 text-sm leading-relaxed font-medium">
                <LatexContent content={question.content} />
            </div>

            {/* Interactive Area */}
            <div className="space-y-3">
                {question.type === 'multiple_choice' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {question.answers?.map((ans) => {
                            const isSelected = userAnswer === ans.id;
                            return (
                                <div
                                    key={ans.id}
                                    className={cn(
                                        "flex items-center p-3 rounded-lg border cursor-pointer transition-all hover:bg-slate-50",
                                        isSelected ? "border-[#059669] bg-emerald-50/30" : "border-slate-200"
                                    )}
                                    onClick={() => onAnswer(ans.id)}
                                >
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mr-3 transition-colors",
                                        isSelected ? "border-[#059669] bg-[#059669] text-white" : "border-slate-300 text-slate-500"
                                    )}>
                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                    <span className={cn("text-sm font-medium mr-2", isSelected ? "text-[#059669]" : "text-slate-500")}>{ans.label}.</span>
                                    <div className="text-sm text-slate-800">
                                        <LatexContent content={ans.content} />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {question.type === 'true_false' && (
                    <div className="overflow-hidden border border-slate-200 rounded-lg">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">Mệnh đề</th>
                                    <th className="px-4 py-3 text-center w-20 text-[#059669]">Đúng</th>
                                    <th className="px-4 py-3 text-center w-20 text-red-500">Sai</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {question.propositions?.map((prop) => {
                                    const currentVal = userAnswer?.[prop.id]; // 'true' | 'false' | undefined
                                    return (
                                        <tr key={prop.id} className="hover:bg-slate-50">
                                            <td className="px-4 py-3 text-slate-800">
                                                <span className="font-bold text-[#059669] mr-2">{prop.label}</span>
                                                <LatexContent content={prop.content} />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="radio"
                                                    name={`q${question.id}_${prop.id}`}
                                                    className="w-5 h-5 text-[#059669] focus:ring-[#059669] border-slate-300 cursor-pointer"
                                                    checked={currentVal === 'true'}
                                                    onChange={() => onAnswer({ ...userAnswer, [prop.id]: 'true' })}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <input
                                                    type="radio"
                                                    name={`q${question.id}_${prop.id}`}
                                                    className="w-5 h-5 text-red-500 focus:ring-red-500 border-slate-300 cursor-pointer"
                                                    checked={currentVal === 'false'}
                                                    onChange={() => onAnswer({ ...userAnswer, [prop.id]: 'false' })}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {question.type === 'short_answer' && (
                    <div className="bg-emerald-50/50 p-4 rounded-lg border border-[#059669]/20">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Nhập kết quả của bạn (dạng số thập phân hoặc số nguyên):</label>
                        <div className="relative max-w-xs">
                            <input
                                type="text"
                                className="w-full rounded-md border-slate-200 focus:border-[#059669] focus:ring-[#059669] pl-3 pr-10 py-2.5 text-sm"
                                placeholder="Ví dụ: -5"
                                value={userAnswer || ""}
                                onChange={(e) => onAnswer(e.target.value)}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
