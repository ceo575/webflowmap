"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TakeQuestion } from "../types"

interface AnswerGridProps {
  examTitle: string
  subject: string | null
  grade: string | null
  durationMinutes: number
  questions: TakeQuestion[]
  answerState: Array<{ id: string; isAnswered: boolean }>
  activeQuestionId: string
  isSubmitting: boolean
  onNavigate: (questionId: string) => void
  onExit: () => void
  onSubmit: () => void
}

export function AnswerGrid({
  examTitle,
  subject,
  grade,
  durationMinutes,
  questions,
  answerState,
  activeQuestionId,
  isSubmitting,
  onNavigate,
  onExit,
  onSubmit,
}: AnswerGridProps) {
  const answeredMap = new Map(answerState.map((item) => [item.id, item.isAnswered]))

  return (
    <aside className="bg-white h-full flex flex-col">
      <div className="p-6 border-b border-slate-100 bg-emerald-50/30">
        <h2 className="font-bold text-slate-900 text-base">{examTitle}</h2>
        <p className="text-sm text-slate-500 mt-1">
          {subject || "Môn chưa gán"} {grade ? `- Lớp ${grade}` : ""}
        </p>
        <div className="mt-2 text-xs text-slate-500">{durationMinutes} phút • {questions.length} câu</div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase text-slate-800">Phiếu trả lời</h3>
          <div className="text-[10px] text-slate-500 flex gap-2">
            <span>Đã làm</span>
            <span>•</span>
            <span>Đang xem</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3">
          {questions.map((question) => {
            const isActive = activeQuestionId === question.id
            const isAnswered = Boolean(answeredMap.get(question.id))
            return (
              <button
                key={question.id}
                onClick={() => onNavigate(question.id)}
                className={cn(
                  "aspect-square rounded-lg text-sm font-bold border transition-colors",
                  isActive
                    ? "border-emerald-600 text-emerald-700 ring-2 ring-emerald-100"
                    : isAnswered
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-slate-200 text-slate-500 hover:border-emerald-500"
                )}
              >
                {question.index}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
        <Button variant="outline" className="w-full" onClick={onExit}>
          Rời khỏi
        </Button>
        <Button className="w-full bg-[#059669] hover:bg-emerald-700 text-white" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? "Đang nộp..." : "Nộp bài"}
        </Button>
        <p className="text-center text-[10px] text-slate-400">Vui lòng kiểm tra kỹ bài làm trước khi nộp</p>
      </div>
    </aside>
  )
}
