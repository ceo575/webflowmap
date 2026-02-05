"use client"

import { ChapterPerformance } from "../types"
import { cn } from "@/lib/utils"
import { PieChart } from "lucide-react"

interface ChapterAnalysisProps {
    chapters: ChapterPerformance[]
}

export function ChapterAnalysis({ chapters }: ChapterAnalysisProps) {
    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <PieChart className="w-6 h-6 text-[#059669]" />
                    Kết quả theo từng chương
                </h3>
            </div>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-500 w-1/3">Chủ đề</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-500 w-1/3">Hiệu suất</th>
                                <th className="px-6 py-4 text-sm font-semibold text-slate-500 text-right w-1/3">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {chapters.map((chapter) => {
                                let colorClass = "bg-[#059669]";
                                let textClass = "text-[#059669]";
                                let statusText = "Làm rất tốt";

                                if (chapter.status === 'critical') {
                                    colorClass = "bg-red-500";
                                    textClass = "text-red-500";
                                    statusText = "Cần cải thiện nhiều";
                                } else if (chapter.status === 'warning') {
                                    colorClass = "bg-yellow-500";
                                    textClass = "text-yellow-600";
                                    statusText = "Mức độ khá";
                                }

                                return (
                                    <tr key={chapter.id} className="group hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800">{chapter.name}</div>
                                            <div className={cn("text-xs mt-1", textClass)}>{statusText}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn("h-full rounded-full", colorClass)}
                                                        style={{ width: `${chapter.score}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-slate-800 w-8">{chapter.score}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className={cn(
                                                "px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-opacity-10 hover:bg-opacity-20",
                                                textClass,
                                                chapter.status === 'critical' ? 'bg-red-500 text-red-600 hover:bg-red-100' :
                                                    chapter.status === 'warning' ? 'bg-yellow-500 text-yellow-600 hover:bg-yellow-100' :
                                                        'bg-[#059669] text-[#059669] hover:bg-emerald-100'
                                            )}>
                                                {chapter.status === 'critical' ? 'Xem lại' : 'Chi tiết'}
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
