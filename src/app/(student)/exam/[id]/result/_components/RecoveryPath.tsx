"use client"

import { RecommendedTopic } from "../types"
import { GraduationCap, AlertTriangle, TrendingUp, ArrowRight, HelpCircle } from "lucide-react"

interface RecoveryPathProps {
    recommendations: RecommendedTopic[]
}

export function RecoveryPath({ recommendations }: RecoveryPathProps) {
    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-[#059669]" />
                    Lộ trình cải thiện
                </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((rec) => {
                    if (rec.priority === 'high') {
                        return (
                            <div key={rec.id} className="flex flex-col bg-white rounded-xl border-l-4 border-red-500 border-y border-r border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 rounded-lg bg-red-100 text-red-600">
                                        <AlertTriangle className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-red-50 text-red-600 rounded-full">Ưu tiên cao</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">{rec.name}</h4>
                                <p className="text-sm text-slate-500 mb-4">{rec.reason}</p>
                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <button className="w-full py-2.5 px-4 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                        <span>Luyện tập ngay</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    if (rec.priority === 'medium') {
                        return (
                            <div key={rec.id} className="flex flex-col bg-white rounded-xl border-l-4 border-yellow-500 border-y border-r border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="p-2 rounded-lg bg-yellow-100 text-yellow-600">
                                        <TrendingUp className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-semibold px-2 py-1 bg-yellow-50 text-yellow-600 rounded-full">Ưu tiên trung bình</span>
                                </div>
                                <h4 className="text-lg font-bold text-slate-800 mb-1">{rec.name}</h4>
                                <p className="text-sm text-slate-500 mb-4">{rec.reason}</p>
                                <div className="mt-auto pt-4 border-t border-slate-100">
                                    <button className="w-full py-2.5 px-4 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-medium text-sm transition-colors flex items-center justify-center gap-2">
                                        <span>Ôn tập lý thuyết</span>
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    // Low / General
                    return (
                        <div key={rec.id} className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-32 bg-[#059669]/5 w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#059669]/10 to-transparent flex items-center justify-center">
                                    <HelpCircle className="w-16 h-16 text-[#059669]/20" />
                                </div>
                            </div>
                            <div className="p-5 flex flex-col h-full">
                                <h4 className="text-lg font-bold text-slate-800 mb-1">{rec.name}</h4>
                                <p className="text-sm text-slate-500 mb-4">{rec.reason}</p>
                                <button className="mt-auto w-full py-2.5 px-4 rounded-lg bg-[#059669]/10 hover:bg-[#059669]/20 text-[#059669] font-medium text-sm transition-colors">
                                    Bắt đầu bài thi nhỏ
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
