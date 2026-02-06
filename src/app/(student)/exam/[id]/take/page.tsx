import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TakeExamClient } from "./take-exam-client"
import { TakeExamPayload } from "./types"

const parseOptions = (raw: string | null) => {
  if (!raw) return [] as string[]
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : []
  } catch {
    return []
  }
}

export default async function ExamTakePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    redirect("/login")
  }

  const { id } = await params

  const exam = await prisma.exam.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      subject: true,
      grade: true,
      duration: true,
      isPublic: true,
      questions: {
        select: {
          id: true,
          type: true,
          content: true,
          options: true,
        },
        orderBy: { id: "asc" },
      },
    },
  })

  if (!exam || !exam.isPublic) {
    redirect("/my-exams")
  }

  const studentGrade = (session?.user as any)?.grade as string | undefined
  if (exam.grade && studentGrade && exam.grade !== studentGrade) {
    redirect("/my-exams")
  }

  if (exam.grade && !studentGrade) {
    redirect("/my-exams")
  }

  const attempt = await prisma.$transaction(async (tx) => {
    const existing = await tx.examAttempt.findFirst({
      where: {
        examId: exam.id,
        userId,
        status: "IN_PROGRESS",
      },
      orderBy: { startedAt: "desc" },
      include: {
        answers: {
          select: {
            questionId: true,
            selected: true,
          },
        },
      },
    })

    if (existing) {
      return existing
    }

    return tx.examAttempt.create({
      data: {
        examId: exam.id,
        userId,
        durationSeconds: exam.duration * 60,
      },
      include: {
        answers: {
          select: {
            questionId: true,
            selected: true,
          },
        },
      },
    })
  })

  const initialAnswers = attempt.answers.reduce<Record<string, unknown>>((acc, answer) => {
    acc[answer.questionId] = answer.selected
    return acc
  }, {})

  const payload: TakeExamPayload = {
    attemptId: attempt.id,
    examId: exam.id,
    title: exam.title,
    subject: exam.subject,
    grade: exam.grade,
    durationMinutes: exam.duration,
    startedAt: attempt.startedAt.toISOString(),
    submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
    status: attempt.status,
    questions: exam.questions.map((question, index) => ({
      id: question.id,
      index: index + 1,
      type: question.type,
      content: question.content,
      options: parseOptions(question.options),
      points: 1,
    })),
    initialAnswers,
  }

  return <TakeExamClient payload={payload} />
}
