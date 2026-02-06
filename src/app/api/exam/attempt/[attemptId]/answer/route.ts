import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  const session = await auth()
  const userId = (session?.user as any)?.id as string | undefined

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { attemptId } = await params
  const body = await req.json()
  const questionId = body?.questionId as string | undefined
  const selected = body?.selected

  if (!questionId) {
    return NextResponse.json({ error: "questionId is required" }, { status: 400 })
  }

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      userId: true,
      status: true,
      startedAt: true,
      durationSeconds: true,
    },
  })

  if (!attempt || attempt.userId !== userId) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 })
  }

  if (attempt.status !== "IN_PROGRESS") {
    return NextResponse.json({ error: "Attempt is already submitted" }, { status: 409 })
  }

  const expireAt = attempt.startedAt.getTime() + attempt.durationSeconds * 1000
  if (Date.now() > expireAt) {
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: { status: "EXPIRED", submittedAt: new Date() },
    })
    return NextResponse.json({ error: "Attempt expired" }, { status: 409 })
  }

  await prisma.examAnswer.upsert({
    where: {
      attemptId_questionId: {
        attemptId,
        questionId,
      },
    },
    update: {
      selected,
      updatedAt: new Date(),
    },
    create: {
      attemptId,
      questionId,
      selected,
    },
  })

  return NextResponse.json({ success: true })
}
