import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const savePracticePayload = z.object({
  topicId: z.string().min(1),
  questionId: z.string().min(1),
  selectedAnswer: z.string().min(1),
  isCorrect: z.boolean(),
  totalQuestions: z.number().int().positive(),
  sessionId: z.string().min(1).optional().nullable(),
});

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const parsedPayload = savePracticePayload.safeParse(await request.json());

  if (!parsedPayload.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { topicId, questionId, selectedAnswer, isCorrect, totalQuestions, sessionId } = parsedPayload.data;

  const result = await prisma.$transaction(async (tx: any) => {
    let activeSessionId = sessionId ?? null;

    if (activeSessionId) {
      const existing = await tx.practiceSession.findFirst({
        where: { id: activeSessionId, studentId: userId, topicId },
        select: { id: true },
      });
      if (!existing) activeSessionId = null;
    }

    if (!activeSessionId) {
      const newSession = await tx.practiceSession.create({
        data: {
          studentId: userId,
          topicId,
          totalQuestions,
        },
        select: { id: true },
      });
      activeSessionId = newSession.id;
    }

    await tx.practiceAttempt.upsert({
      where: {
        sessionId_questionId: {
          sessionId: activeSessionId,
          questionId,
        },
      },
      create: {
        sessionId: activeSessionId,
        questionId,
        selectedAnswer,
        isCorrect,
      },
      update: {
        selectedAnswer,
        isCorrect,
        answeredAt: new Date(),
      },
    });

    const [correctCount, attemptCount] = await Promise.all([
      tx.practiceAttempt.count({ where: { sessionId: activeSessionId, isCorrect: true } }),
      tx.practiceAttempt.count({ where: { sessionId: activeSessionId } }),
    ]);

    await tx.practiceSession.update({
      where: { id: activeSessionId },
      data: {
        correctCount,
        completedAt: attemptCount >= totalQuestions ? new Date() : null,
      },
    });

    return { sessionId: activeSessionId, correctCount, attemptCount };
  });

  return NextResponse.json(result);
}
