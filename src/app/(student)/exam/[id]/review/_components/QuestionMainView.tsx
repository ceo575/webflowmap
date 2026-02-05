"use client"

import { ReviewQuestion } from "../types"
import { cn } from "@/lib/utils"
import { Flag, Bookmark, X, Check } from "lucide-react"
import "katex/dist/katex.min.css"
import katex from "katex"

// Helper to render latex content safely (reused)
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

interface QuestionMainViewProps {
    question: ReviewQuestion
}

export function QuestionMainView({ question }: QuestionMainViewProps) {
    return (
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fcfb] relative">
            {/* Header */}
            <div className="px-8 py-5 flex items-center justify-between border-b border-slate-200 bg-white z-10 sticky top-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">Câu {question.questionNumber}</h2>
                        <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-semibold border",
                            question.difficulty === 'Vận dụng cao' ? "bg-orange-100 text-orange-700 border-orange-200" :
                                "bg-blue-100 text-blue-700 border-blue-200"
                        )}>{question.difficulty}</span>

                        {!question.isCorrect && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                                <X className="w-3.5 h-3.5" /> Sai
                            </span>
                        )}
                        {question.isCorrect && (
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" /> Đúng
                            </span>
                        )}
                    </div>
                    <p className="text-[#059669] text-sm">Chủ đề: {question.topic}</p>
                </div>
                <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors" title="Báo cáo lỗi">
                        <Flag className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors" title="Đánh dấu">
                        <Bookmark className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
                {/* Question Body */}
                <div className="mb-8 text-base text-[#0d1c17] leading-relaxed font-medium">
                    <p className="mb-4"><LatexContent content={question.content} /></p>
                </div>

                {/* Choices */}
                <div className="flex flex-col gap-3 mb-8">
                    {question.answers?.map((ans) => {
                        const isSelected = question.userAnswer === ans.id;
                        const isCorrectAns = question.correctAnswer === ans.id;

                        let containerClass = "border-slate-200 bg-white hover:border-[#059669]/50";
                        let circleClass = "border-slate-300 text-slate-500";
                        let textClass = "text-[#0d1c17]";
                        let statusText = null;

                        if (isSelected) {
                            if (question.isCorrect) {
                                // Selected & Correct -> Green
                                containerClass = "border-[#059669] bg-emerald-50/50";
                                circleClass = "bg-[#059669] text-white";
                                textClass = "text-[#059669]";
                                statusText = "(Đáp án đúng)";
                            } else {
                                // Selected & Wrong -> Red
                                containerClass = "border-red-500 bg-red-50/50";
                                circleClass = "bg-red-500 text-white";
                                textClass = "text-red-500";
                                statusText = "(Lựa chọn của bạn)";
                            }
                        } else if (isCorrectAns) {
                            // Not selected but Correct -> Green
                            containerClass = "border-[#059669] bg-emerald-50/50";
                            circleClass = "bg-[#059669] text-white";
                            textClass = "text-[#059669]";
                            statusText = "(Đáp án đúng)";
                        }

                        return (
                            <label key={ans.id} className={cn("flex items-center gap-4 rounded-lg border-2 p-4 cursor-pointer transition-colors", containerClass)}>
                                <div className={cn("flex items-center justify-center w-6 h-6 rounded-full border-2 text-xs font-bold", circleClass)}>
                                    {isSelected || isCorrectAns ? (
                                        isCorrectAns ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />
                                    ) : (
                                        ans.label
                                    )}
                                </div>
                                <div className="flex grow flex-col">
                                    <p className={cn("text-sm font-medium", textClass)}>
                                        <LatexContent content={ans.content} /> {statusText && <span className="font-bold ml-1">{statusText}</span>}
                                    </p>
                                </div>
                            </label>
                        )
                    })}
                </div>

                {/* Solution Tabs */}
                <div className="mt-8">
                    <div className="flex border-b border-slate-200 mb-4">
                        <button className="px-4 py-2 text-sm font-bold text-[#059669] border-b-2 border-[#059669]">Lời giải chi tiết</button>
                        <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-[#059669] transition-colors">Video Bài giảng</button>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-base mb-3 text-slate-800">Phương pháp giải</h3>
                        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                            <LatexContent content={question.solutionMethod} />
                        </p>

                        <h3 className="font-bold text-base mb-3 text-slate-800 mt-6">Các bước thực hiện</h3>
                        <ul className="list-none space-y-3">
                            {question.explanationSteps.map((step, index) => (
                                <li key={index} className="flex gap-3 text-sm text-slate-600">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#059669]/10 text-[#059669] flex items-center justify-center text-xs font-bold">{index + 1}</span>
                                    <span><LatexContent content={step} /></span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </main>
    )
}
