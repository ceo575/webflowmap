"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ReviewSidebar } from "./_components/ReviewSidebar";
import { QuestionMainView } from "./_components/QuestionMainView";
import { AITutorPanel } from "./_components/AITutorPanel";
import { mockReviewData } from "./mockData";

export default function ExamReviewPage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;

    // State for currently selected question
    // Default to the first question if available
    const [currentQuestionId, setCurrentQuestionId] = useState<number>(
        mockReviewData.length > 0 ? mockReviewData[0].id : -1
    );

    // Find the currently active question object
    const activeQuestion = mockReviewData.find((q) => q.id === currentQuestionId);

    if (!activeQuestion) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-500">
                <div>Question not found or no data available.</div>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full flex-col bg-gray-50 overflow-hidden text-slate-800">
            {/* Header */}
            <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Results
                    </button>
                    <div className="h-6 w-px bg-gray-200" />
                    <h1 className="text-lg font-bold text-gray-900">
                        Exam Review: Mid-term Mathematics
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 border border-emerald-100">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Score: 8.5/10
                    </div>
                </div>
            </header>

            {/* Main Content Layout */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Question List */}
                <aside className="w-64 shrink-0 border-r bg-white h-full overflow-y-auto">
                    <ReviewSidebar
                        questions={mockReviewData}
                        currentQuestionId={currentQuestionId}
                        onSelectQuestion={setCurrentQuestionId}
                    />
                </aside>

                {/* Center - Question View */}
                <main className="flex-1 overflow-y-auto bg-gray-50 p-6 flex justify-center">
                    <div className="w-full max-w-3xl">
                        <QuestionMainView question={activeQuestion} />
                    </div>
                </main>

                {/* Right Sidebar - AI Tutor */}
                <aside className="w-[400px] shrink-0 border-l bg-white h-full overflow-y-auto shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10">
                    <AITutorPanel question={activeQuestion} />
                </aside>
            </div>
        </div>
    );
}
