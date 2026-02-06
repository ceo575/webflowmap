import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock3, Target, Trophy, Sparkles, BarChart3 } from "lucide-react"

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const formatDuration = (startedAt: Date, submittedAt: Date | null) => {
  if (!submittedAt) return "--"
  const totalSeconds = Math.max(0, Math.floor((submittedAt.getTime() - startedAt.getTime()) / 1000))
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  if (mins > 0) return `${mins}p ${String(secs).padStart(2, "0")}s`
  return `${secs}s`
}

const statusText = (accuracy: number) => {
  if (accuracy >= 85) return "Rất tốt"
  if (accuracy >= 70) return "Khá tốt"
  if (accuracy >= 50) return "Trung bình"
  return "Cần cải thiện"
}

const insightText = (strongTopics: string[], weakTopics: string[]) => {
  const strong = strongTopics.length > 0 ? `Bạn làm tốt ở ${strongTopics.slice(0, 2).join(", ")}.` : "Bạn đã hoàn thành bài thi." 
  const weak = weakTopics.length > 0 ? ` Cần luyện thêm ${weakTopics.slice(0, 2).join(", ")} ngay.` : " Hãy giữ vững phong độ ở các chuyên đề tiếp theo."
  return `${strong}${weak}`
}

type ResultPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ attemptId?: string }>
}

type AttemptQuestion = {
  id: string
  chapter: string | null
}

type AttemptAnswer = {
  questionId: string
  isCorrect: boolean
}

type SubmittedAttempt = {
  id: string
  score: number | null
}

export default async function ExamResultPage({ params, searchParams }: ResultPageProps) {
  const session = await auth()
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    redirect("/login")
  }

  const { id: examId } = await params
  const { attemptId } = await searchParams

  const attempt = await prisma.examAttempt.findFirst({
    where: {
      examId,
      userId,
      status: "SUBMITTED",
      ...(attemptId ? { id: attemptId } : {}),
    },
    orderBy: { submittedAt: "desc" },
    include: {
      exam: {
        select: {
          id: true,
          title: true,
          subject: true,
          questions: {
            select: {
              id: true,
              chapter: true,
            },
          },
        },
      },
      answers: {
        select: {
          questionId: true,
          isCorrect: true,
        },
      },
    },
  })

  if (!attempt) {
    redirect(`/exam/${examId}/take`)
  }

  const questions = attempt.exam.questions as AttemptQuestion[]
  const answers = attempt.answers as AttemptAnswer[]

  const totalQuestions = questions.length || 1
  const correctCount = answers.filter((answer) => answer.isCorrect).length
  const accuracy = clampPercent((correctCount / totalQuestions) * 100)
  const score = attempt.score ?? Number(((correctCount / totalQuestions) * 10).toFixed(2))

  const submittedAttempts = (await prisma.examAttempt.findMany({
    where: { examId, status: "SUBMITTED" },
    select: { id: true, score: true },
    orderBy: [{ score: "desc" }, { submittedAt: "asc" }],
  })) as SubmittedAttempt[]

  const ranking = Math.max(1, submittedAttempts.findIndex((item: SubmittedAttempt) => item.id === attempt.id) + 1)

  const questionMap = new Map<string, string>(
    questions.map((question: AttemptQuestion) => [question.id, question.chapter || "Chủ đề khác"])
  )

  const chapterStats = new Map<string, { total: number; correct: number }>()

  for (const answer of answers) {
    const chapter = questionMap.get(answer.questionId) || "Chủ đề khác"
    const current = chapterStats.get(chapter) || { total: 0, correct: 0 }
    current.total += 1
    if (answer.isCorrect) current.correct += 1
    chapterStats.set(chapter, current)
  }

  const chapterRows = Array.from(chapterStats.entries()).map(([name, stat]) => {
    const percent = clampPercent((stat.correct / Math.max(1, stat.total)) * 100)
    const level = percent < 50 ? "weak" : percent < 80 ? "medium" : "strong"
    return { name, percent, level }
  })

  const weakTopics = chapterRows.filter((row) => row.level === "weak").map((row) => row.name)
  const mediumTopics = chapterRows.filter((row) => row.level === "medium").map((row) => row.name)
  const strongTopics = chapterRows.filter((row) => row.level === "strong").map((row) => row.name)

  const recommendations = [
    ...weakTopics.map((name) => ({ name, reason: "Bạn đang yếu ở chủ đề này, cần luyện ngay.", priority: "high" as const })),
    ...mediumTopics.map((name) => ({ name, reason: "Cần tăng độ chính xác và tốc độ làm bài.", priority: "medium" as const })),
  ].slice(0, 3)

  const ringValue = clampPercent((score / 10) * 100)

  return (
    <div className="min-h-screen bg-[#f5f8f7] text-[#0d1c17]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Post-Exam Analysis</h1>
          <p className="text-slate-500 mt-1">Chi tiết kết quả bài thi: {attempt.exam.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#cee9e0] p-8 flex flex-col items-center">
            <div className="relative w-44 h-44">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * ringValue) / 100}
                  strokeLinecap="round"
                  className="text-[#059467]"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{score.toFixed(1)}</span>
                <span className="text-sm text-slate-400">/ 10</span>
              </div>
            </div>
            <p className="mt-4 text-lg font-semibold text-[#059467]">{statusText(accuracy)}</p>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-[#e6f4f1] rounded-2xl p-6 border border-[#059467]/20 flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#059467] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-[#059467] text-lg">AI Insight</h3>
                <p className="text-sm leading-relaxed mt-1">{insightText(strongTopics, weakTopics)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-[#cee9e0] text-center">
                <div className="inline-flex p-2 rounded-full bg-blue-50 mb-2"><Clock3 className="w-5 h-5 text-blue-500" /></div>
                <p className="text-sm text-slate-500">Thời gian</p>
                <p className="text-xl font-bold">{formatDuration(attempt.startedAt, attempt.submittedAt)}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#cee9e0] text-center">
                <div className="inline-flex p-2 rounded-full bg-purple-50 mb-2"><Target className="w-5 h-5 text-purple-500" /></div>
                <p className="text-sm text-slate-500">Độ chính xác</p>
                <p className="text-xl font-bold">{accuracy}%</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-[#cee9e0] text-center">
                <div className="inline-flex p-2 rounded-full bg-orange-50 mb-2"><Trophy className="w-5 h-5 text-orange-500" /></div>
                <p className="text-sm text-slate-500">Xếp hạng</p>
                <p className="text-xl font-bold">{ranking}/{submittedAttempts.length}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#059467]" />
            Kết quả theo từng chương
          </h3>
          <div className="overflow-hidden rounded-xl border border-[#cee9e0] bg-white">
            <table className="w-full text-left">
              <thead className="bg-[#f5f8f7] border-b border-[#cee9e0]">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-500">Topic</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-500">Performance</th>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-500 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cee9e0]">
                {chapterRows.map((row) => {
                  const color = row.level === "weak" ? "bg-red-500" : row.level === "medium" ? "bg-yellow-500" : "bg-[#059467]"
                  const text = row.level === "weak" ? "Cần cải thiện nhiều" : row.level === "medium" ? "Mức độ khá" : "Làm rất tốt"
                  return (
                    <tr key={row.name}>
                      <td className="px-6 py-4">
                        <div className="font-medium">{row.name}</div>
                        <div className={row.level === "weak" ? "text-xs text-red-500" : row.level === "medium" ? "text-xs text-yellow-600" : "text-xs text-[#059467]"}>{text}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${color}`} style={{ width: `${row.percent}%` }} />
                          </div>
                          <span className="text-sm font-bold w-10">{row.percent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm">{row.level === "weak" ? "Xem lại" : "Chi tiết"}</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xl font-bold mb-4">Lộ trình cải thiện</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.length > 0 ? recommendations.map((item) => (
              <div key={item.name} className="bg-white rounded-xl border border-[#cee9e0] p-5 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.priority === "high" ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"}`}>
                    {item.priority === "high" ? "Ưu tiên cao" : "Ưu tiên trung bình"}
                  </span>
                </div>
                <h4 className="text-lg font-bold">{item.name}</h4>
                <p className="text-sm text-slate-500 mt-1">{item.reason}</p>
                <Button className="mt-4 bg-[#059467] hover:bg-[#047854]">Luyện tập ngay</Button>
              </div>
            )) : (
              <div className="bg-white rounded-xl border border-[#cee9e0] p-6 text-slate-600">
                Bạn đang có kết quả tốt ở hầu hết chủ đề. Hãy bắt đầu một đề mới để duy trì phong độ.
              </div>
            )}
          </div>
        </section>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-[#cee9e0]">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href={`/exam/${examId}/review`}>Xem lại bài làm chi tiết</Link>
          </Button>
          <Button asChild className="w-full sm:w-auto bg-[#059467] hover:bg-[#047854] text-white">
            <Link href="/dashboard">Quay về Dashboard chính</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
