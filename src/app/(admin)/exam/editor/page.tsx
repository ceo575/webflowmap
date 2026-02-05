"use client"

import { useState } from "react"
import { PreviewPanel } from "./_components/PreviewPanel"
import { EditPanel } from "./_components/EditPanel"
import { mockQuestions } from "./data"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ExamEditorPage() {
    const [questions, setQuestions] = useState(mockQuestions)
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const selectedQuestion = questions.find(q => q.id === selectedId) || null

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                <nav className="flex items-center text-sm">
                    <span className="text-slate-500 hover:text-[#059669] cursor-pointer transition">Bài tập</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />
                    <span className="text-slate-500 hover:text-[#059669] cursor-pointer transition">Tạo bài tập</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />
                    <span className="font-bold text-slate-900">Chọn dạng đề</span>
                </nav>
                <Button className="bg-[#059669] hover:bg-emerald-700 text-white font-medium shadow-sm">
                    Tiếp tục
                </Button>
            </header>

            {/* Main Content (Split Screen) */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Preview (60%) */}
                <section className="w-full lg:w-3/5 overflow-hidden flex flex-col">
                    <PreviewPanel
                        questions={questions}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </section>

                {/* Right Panel: Edit (40%) */}
                <EditPanel question={selectedQuestion} />
            </main>
        </div>
    )
}
