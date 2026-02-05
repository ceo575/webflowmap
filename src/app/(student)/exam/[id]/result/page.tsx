"use client"

import { useEffect, useState } from "react"
import { mockResultData } from "./mockData"
import { ScoreRing } from "./_components/ScoreRing"
import { ChapterAnalysis } from "./_components/ChapterAnalysis"
import { RecoveryPath } from "./_components/RecoveryPath"
import { AIInsight } from "./_components/AIInsight"
import { Clock, Target, Medal, CheckCircle2, RotateCcw, LayoutDashboard } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export default function ExamResultPage() {
    const result = mockResultData

    useEffect(() => {
        // Simulate syncing data
        const timer = setTimeout(() => {
            toast.success("Thành công", {
                description: "Đã đồng bộ kết quả vào Lộ trình học tập cá nhân!"
            });
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f8f7] text-[#0d1c17] flex flex-col font-sans">
            <div className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Post-Exam Analysis</h1>
                    <p className="text-slate-500 mt-1">Chi tiết kết quả bài thi thử Đại học tháng 5</p>
                </div>

                {/* Main Stats Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
                    {/* Score Circle */}
                    <ScoreRing score={result.score} maxScore={result.maxScore} />

                    {/* AI Insight & Metrics */}
                    <div className="lg:col-span-8 flex flex-col gap-6">
                        <AIInsight comment={result.aiComment} />

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="p-2 rounded-full bg-blue-50 mb-2">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                </div>
                                <p className="text-sm text-slate-500">Thời gian</p>
                                <p className="text-xl font-bold text-slate-900">{result.timeSpent}</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="p-2 rounded-full bg-purple-50 mb-2">
                                    <Target className="w-5 h-5 text-purple-500" />
                                </div>
                                <p className="text-sm text-slate-500">Độ chính xác</p>
                                <p className="text-xl font-bold text-slate-900">{result.accuracy}%</p>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center shadow-sm">
                                <div className="p-2 rounded-full bg-orange-50 mb-2">
                                    <Medal className="w-5 h-5 text-orange-500" />
                                </div>
                                <p className="text-sm text-slate-500">Xếp hạng</p>
                                <p className="text-xl font-bold text-slate-900">{result.rank}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chapter Analysis */}
                <ChapterAnalysis chapters={result.chapters} />

                {/* Recovery Path */}
                <RecoveryPath recommendations={result.recommendations} />

                {/* Footer Actions */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-slate-200">
                    <Button variant="outline" className="w-full sm:w-auto px-6 py-3 h-auto rounded-xl border-slate-200 bg-white text-slate-900 font-medium shadow-sm hover:bg-slate-50">
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Xem lại bài làm chi tiết
                    </Button>
                    <Button className="w-full sm:w-auto px-8 py-3 h-auto rounded-xl bg-[#059669] hover:bg-[#047854] text-white font-bold shadow-md shadow-[#059669]/20">
                        <LayoutDashboard className="w-4 h-4 mr-2" />
                        Quay về Dashboard chính
                    </Button>
                </div>

            </div>
        </div>
    )
}
