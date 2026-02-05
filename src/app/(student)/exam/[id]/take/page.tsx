"use client"

import { useState } from "react"
import { mockExamData } from "./mockData"
import { ExamHeader } from "./_components/ExamHeader"
import { QuestionItem } from "./_components/QuestionItem"
import { AnswerGrid } from "./_components/AnswerGrid"

export default function ExamTakePage() {
    const [answers, setAnswers] = useState<Record<string, any>>({})

    const handleAnswer = (questionId: number, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }))
    }

    const scrollToQuestion = (id: number) => {
        const element = document.getElementById(`question-${id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    return (
        <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans">
            <ExamHeader />

            <main className="flex-1 flex overflow-hidden">
                {/* Left Column: Questions (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
                    <div className="max-w-3xl mx-auto space-y-8 pb-32">
                        {mockExamData.map((question) => (
                            <QuestionItem
                                key={question.id}
                                question={question}
                                userAnswer={answers[question.id]}
                                onAnswer={(val) => handleAnswer(question.id, val)}
                            />
                        ))}

                        <div className="text-center text-slate-400 text-sm">-- Hết danh sách câu hỏi --</div>
                    </div>
                </div>

                {/* Right Column: Grid (Sticky) */}
                <div className="w-[320px] shrink-0 border-l border-slate-200 bg-white shadow-lg z-10 hidden md:block">
                    <AnswerGrid
                        questions={mockExamData}
                        answers={answers}
                        onNavigate={scrollToQuestion}
                    />
                </div>
            </main>
        </div>
    )
}
