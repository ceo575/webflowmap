"use client"

import { Clock } from "lucide-react"

const formatTime = (seconds: number) => {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0")
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")
  const secs = String(seconds % 60).padStart(2, "0")
  return `${hours}:${mins}:${secs}`
}

export function ExamHeader({ remainingSeconds }: { remainingSeconds: number }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-6 z-20 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#059669] rounded-md flex items-center justify-center text-white font-bold">F</div>
        <span className="font-bold text-slate-900">FlowMAP</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-500">Thời gian còn lại:</span>
        <div className="bg-emerald-50 border border-emerald-100 px-4 py-1 rounded font-mono font-bold text-[#059669] flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {formatTime(remainingSeconds)}
        </div>
      </div>
    </header>
  )
}
