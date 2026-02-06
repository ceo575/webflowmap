import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { Prisma, QuestionType } from "@prisma/client"

function normalize(value: unknown) {
  return String(value ?? "").trim().toLowerCase()
}

function isCorrectAnswer(question: { type: QuestionType; correctAnswer: string; options: string | null }, selected: unknown) {
  if (selected === undefined || selected === null) return false

  if (question.type === "MCQ" || question.type === "SHORT_ANSWER") {
    return normalize(selected) === normalize(question.correctAnswer)
  }

  if (question.type === "TRUE_FALSE") {
    const correctTokens = question.correctAnswer.split(",").map((token) => normalize(token))

    if (Array.isArray(selected)) {
      return selected.every((val, idx) => normalize(val) === (correctTokens[idx] || ""))
    }

    if (typeof selected === "object") {
      const values = Object.values(selected as Record<string, unknown>)
      return values.every((val, idx) => normalize(val) === (correctTokens[idx] || ""))
    }

    if (typeof selected === "string") {
      const tokens = selected.split(",").map((token) => normalize(token))
      return tokens.every((val, idx) => val === (correctTokens[idx] || ""))
    }
  }

  return false
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth()
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { attemptId } = await params

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        select: {
          id: true,
          questions: {
            select: {
              id: true,
              type: true,
              correctAnswer: true,
              options: true,
            },
          },
        },
      },
      answers: {
        select: {
          id: true,
          questionId: true,
          selected: true,
        },
      },
    },
  })

  if (!attempt || attempt.userId !== userId) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
  }

  if (attempt.status === "SUBMITTED") {
    return NextResponse.json({ success: true, attemptId: attempt.id, score: attempt.score ?? 0 })
  }

  const answerByQuestionId = new Map(attempt.answers.map((answer) => [answer.questionId, answer]))
  const total = attempt.exam.questions.length || 1
  let correctCount = 0

  const updates = attempt.exam.questions.map((question) => {
    const answer = answerByQuestionId.get(question.id)
    const correct = isCorrectAnswer(question, answer?.selected)
    if (correct) correctCount += 1

    if (!answer) {
      return prisma.examAnswer.create({
        data: {
          attemptId: attempt.id,
          questionId: question.id,
          selected: Prisma.JsonNull,
          isCorrect: false,
        },
      })
    }

    return prisma.examAnswer.update({
      where: { id: answer.id },
      data: { isCorrect: correct },
    })
  })

  const score = Number(((correctCount / total) * 10).toFixed(2))

  await prisma.$transaction([
    ...updates,
    prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        score,
      },
    }),
  ])

  return NextResponse.json({ success: true, attemptId: attempt.id, examId: attempt.exam.id, score })
}
