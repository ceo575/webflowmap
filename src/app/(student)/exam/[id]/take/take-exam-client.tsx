"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { TakeExamPayload } from "./types"
import { ExamHeader } from "./_components/ExamHeader"
import { QuestionItem } from "./_components/QuestionItem"
import { AnswerGrid } from "./_components/AnswerGrid"

interface TakeExamClientProps {
  payload: TakeExamPayload
}

export function TakeExamClient({ payload }: TakeExamClientProps) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, unknown>>(payload.initialAnswers)
  const [activeQuestionId, setActiveQuestionId] = useState<string>(payload.questions[0]?.id ?? "")
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  useEffect(() => {
    const startedAt = new Date(payload.startedAt).getTime()
    const expiresAt = startedAt + payload.durationMinutes * 60 * 1000

    const tick = () => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setRemainingSeconds(left)
      if (left === 0) {
        void handleSubmit(true)
      }
    }

    tick()
    const timerId = setInterval(tick, 1000)
    return () => clearInterval(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.startedAt, payload.durationMinutes])

  const answerState = useMemo(() => {
    return payload.questions.map((question) => {
      const current = answers[question.id]
      const isAnswered =
        current !== undefined &&
        current !== null &&
        (!(typeof current === "string") || current.trim().length > 0) &&
        (!(typeof current === "object") || Object.keys(current as Record<string, unknown>).length > 0)
      return { id: question.id, isAnswered }
    })
  }, [answers, payload.questions])

  const persistAnswer = (questionId: string, selected: unknown) => {
    if (saveTimers.current[questionId]) {
      clearTimeout(saveTimers.current[questionId])
    }

    saveTimers.current[questionId] = setTimeout(async () => {
      try {
        await fetch(`/api/exam/attempt/${payload.attemptId}/answer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId, selected }),
        })
      } catch {
        toast.error("Không thể lưu tạm câu trả lời")
      }
    }, 400)
  }

  const handleAnswerChange = (questionId: string, selected: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selected }))
    persistAnswer(questionId, selected)
  }

  const handleNavigate = (questionId: string) => {
    const element = document.getElementById(`q-${questionId}`)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
      setActiveQuestionId(questionId)
      element.classList.add("ring-2", "ring-emerald-200")
      window.setTimeout(() => element.classList.remove("ring-2", "ring-emerald-200"), 1000)
    }
  }

  const handleSubmit = async (auto = false) => {
    if (isSubmitting) return
    if (!auto) {
      const ok = window.confirm("Bạn có chắc chắn muốn nộp bài?")
      if (!ok) return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/exam/attempt/${payload.attemptId}/submit`, { method: "POST" })
      if (!res.ok) throw new Error("Submit failed")
      toast.success(auto ? "Hết giờ, bài đã tự nộp" : "Nộp bài thành công")
      router.push(`/exam/${payload.examId}/result`)
    } catch {
      toast.error("Nộp bài thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleExit = async () => {
    const ok = window.confirm("Rời khỏi bài thi? Câu trả lời đã lưu sẽ được giữ lại.")
    if (!ok) return
    router.push("/my-exams")
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans">
      <ExamHeader remainingSeconds={remainingSeconds} />
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8 pb-24">
            {payload.questions.map((question) => (
              <QuestionItem
                key={question.id}
                question={question}
                answer={answers[question.id]}
                active={activeQuestionId === question.id}
                onAnswerChange={(value) => handleAnswerChange(question.id, value)}
              />
            ))}
            <div className="text-center text-slate-400 text-sm">-- Hết danh sách câu hỏi --</div>
          </div>
        </div>

        <div className="w-[30%] min-w-[360px] hidden lg:block border-l border-slate-200 bg-white">
          <AnswerGrid
            examTitle={payload.title}
            subject={payload.subject}
            grade={payload.grade}
            durationMinutes={payload.durationMinutes}
            questions={payload.questions}
            answerState={answerState}
            activeQuestionId={activeQuestionId}
            isSubmitting={isSubmitting}
            onNavigate={handleNavigate}
            onExit={handleExit}
            onSubmit={() => handleSubmit(false)}
          />
        </div>
      </main>
    </div>
  )
}
