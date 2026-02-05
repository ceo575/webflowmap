"use client"

import { cn } from "@/lib/utils"

interface ScoreRingProps {
    score: number;
    maxScore: number;
}

export function ScoreRing({ score, maxScore }: ScoreRingProps) {
    const percentage = (score / maxScore) * 100
    const circumference = 251.2
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    // Determine Color based on score
    let colorClass = "text-[#059669]"; // Green
    let ringColorClass = "text-[#059669]";
    let statusText = "Tốt";

    if (score < 5) {
        colorClass = "text-red-500";
        ringColorClass = "text-red-500";
        statusText = "Cần cố gắng";
    } else if (score < 8) {
        colorClass = "text-yellow-500";
        ringColorClass = "text-yellow-500";
        statusText = "Khá";
    }

    return (
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle
                        className="text-slate-100"
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                    ></circle>
                    {/* Progress Circle */}
                    <circle
                        className={cn("transition-all duration-1000 ease-out", ringColorClass)}
                        cx="50"
                        cy="50"
                        fill="transparent"
                        r="40"
                        stroke="currentColor"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        strokeWidth="8"
                    ></circle>
                </svg>
                {/* Center Text */}
                <div className="absolute flex flex-col items-center">
                    <span className={cn("text-4xl font-bold", colorClass)}>
                        {score}
                    </span>
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">
                        / {maxScore}
                    </span>
                </div>
            </div>
            <p className={cn("mt-4 text-lg font-bold", colorClass)}>
                {statusText}
            </p>
        </div>
    )
}
