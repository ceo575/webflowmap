"use client"

import { Edit, Trash2, CheckCircle, Image as ImageIcon } from "lucide-react"

// Mock Data
const questions = [
    {
        id: 1,
        level: "Thông hiểu",
        type: "Trắc nghiệm",
        levelColor: "blue",
        content: (
            <>
                Cho hàm số <span className="font-serif italic">y = f(x)</span> có bảng biến thiên như sau. Số nghiệm thực của phương trình <span className="font-serif italic">2f(x) - 3 = 0</span> là:
            </>
        ),
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCI1Cs7m3pMlBV2uHacxX9hkcYJx_HMJK-NeHelvuTEuRHMEVu36KxXPy3iwETxmfY8BMIsapiQSlLRzyRrGRXyZO3PpMt34y_CRgYHNHOYThxfQ9EKRDLGsWTwm09HT5TqcKOPCcPvPyeE9-_xCtaoBmK4JQ3F6bQ464yhOf-3aiPOC0mYAjphUrADVy4KTaTcwWGt0NRP9vKAPZpA7Y-fJkfskmfCR9RB3BwI-lontJ6emeTJkty4wx-tXDSBOarVgDPmNJeAvVg2",
        answers: [
            { label: "A", text: "3", isCorrect: true },
            { label: "B", text: "1", isCorrect: false },
            { label: "C", text: "2", isCorrect: false },
            { label: "D", text: "0", isCorrect: false },
        ]
    },
    {
        id: 2,
        level: "Vận dụng",
        type: "Trắc nghiệm",
        levelColor: "orange",
        content: (
            <>
                Tính tích phân <span className="font-serif italic">I = ∫<sub>0</sub><sup>1</sup> x.e<sup>x</sup> dx</span>.
            </>
        ),
        imageUrl: null,
        answers: [
            { label: "A", text: "I = 1", isCorrect: false },
            { label: "B", text: "I = 2", isCorrect: true },
            { label: "C", text: "I = e", isCorrect: false },
            { label: "D", text: "I = -1", isCorrect: false },
        ]
    },
]

export function QuestionList() {
    return (
        <section className="flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#10b763] text-white flex items-center justify-center text-xs font-bold">2</div>
                    Xem trước & Chỉnh sửa
                </h2>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-bold rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        Thu gọn tất cả
                    </button>
                    <button className="px-3 py-1.5 text-xs font-bold rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                        Mở rộng tất cả
                    </button>
                </div>
            </div>

            {questions.map((question, index) => (
                <div key={question.id} className="group relative flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md hover:border-[#10b763]/40 transition-all">
                    {/* Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50/50 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="text-[#10b763] font-black text-lg">Câu {index + 1}</span>
                            <span
                                className={`px-2.5 py-1 rounded text-xs font-bold border 
                        ${question.levelColor === "blue" ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-orange-100 text-orange-700 border-orange-200"}`}
                            >
                                {question.level}
                            </span>
                            <span className="px-2.5 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600">
                                {question.type}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 text-slate-400 hover:text-[#10b763] hover:bg-[#10b763]/10 rounded-full transition-colors" title="Chỉnh sửa">
                                <Edit className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Xóa">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex flex-col gap-6">
                        {/* Question Content */}
                        <div className="flex flex-col lg:flex-row gap-6">
                            <div className="flex-1 text-slate-800 leading-relaxed">
                                <p className="mb-2">{question.content}</p>

                                {/* Graph / Image Placeholder */}
                                {question.imageUrl && (
                                    <div className="mt-4 w-full max-w-md h-48 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-slate-100 opacity-30" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/graphy.png')" }}></div>
                                        <img
                                            className="h-full object-contain opacity-80 mix-blend-multiply"
                                            src={question.imageUrl}
                                            alt="Question illustration"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Answers */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {question.answers.map((answer, idx) => (
                                <div
                                    key={idx}
                                    className={`
                                relative flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                ${answer.isCorrect
                                            ? "border-[#10b763] border-2 bg-[#10b763]/5"
                                            : "border-slate-200 hover:bg-slate-50"}
                            `}
                                >
                                    <div
                                        className={`
                                    flex items-center justify-center size-8 rounded-full font-bold text-sm flex-shrink-0
                                    ${answer.isCorrect ? "bg-[#10b763] text-white shadow-sm" : "bg-slate-200 text-slate-600"}
                                `}
                                    >
                                        {answer.label}
                                    </div>
                                    <div className="text-slate-800 font-medium font-serif italic">{answer.text}</div>
                                    {answer.isCorrect && (
                                        <div className="absolute right-3 top-3 text-[#10b763]">
                                            <CheckCircle className="w-5 h-5 fill-current" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Card Footer Action */}
                    <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-end">
                        <button className="flex items-center gap-2 text-xs font-bold text-purple-600 hover:underline">
                            <ImageIcon className="w-4 h-4" />
                            AI Quét Hình ảnh & Giải chi tiết
                        </button>
                    </div>
                </div>
            ))}
        </section>
    )
}
