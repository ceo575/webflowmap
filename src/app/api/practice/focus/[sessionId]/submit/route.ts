import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSessionSnapshot } from "@/lib/practice-focus";
import { z } from "zod";

const submitSchema = z.object({
  selectedOptionIndex: z.number().int().min(0).max(3),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await auth();
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId } = await params;
  const userId = (session.user as any).id as string;
  const parsed = submitSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const snapshot = await getSessionSnapshot(userId, sessionId);
  if (!snapshot || snapshot.completed || !snapshot.question) {
    return NextResponse.json({ error: "No active question" }, { status: 400 });
  }

  const selectedOption = snapshot.question.options[parsed.data.selectedOptionIndex];
  if (!selectedOption) {
    return NextResponse.json({ error: "Selected option out of range" }, { status: 400 });
  }

  const existing = await prisma.practiceAttempt.findFirst({
    where: { sessionId, questionId: snapshot.question.questionId },
    select: { id: true, isCorrect: true },
  });

  let isCorrect = selectedOption.id === snapshot.question.correctOptionId;
  let earnedScore = isCorrect ? 10 : 0;

  if (existing) {
    isCorrect = existing.isCorrect;
    earnedScore = existing.isCorrect ? 10 : 0;
  } else {
    await prisma.$transaction(async (tx: any) => {
      await tx.practiceAttempt.create({
        data: {
          sessionId,
          questionId: snapshot.question!.questionId,
          selectedAnswer: selectedOption.id,
          isCorrect,
        },
      });

      await tx.practiceSession.update({
        where: { id: sessionId },
        data: {
          correctCount: { increment: isCorrect ? 1 : 0 },
          score: { increment: earnedScore },
          streak: isCorrect ? { increment: 1 } : 0,
        },
      });
    });
  }

  const updated = await getSessionSnapshot(userId, sessionId);

  return NextResponse.json({
    isCorrect,
    earnedScore,
    selectedOptionIndex: parsed.data.selectedOptionIndex,
    correctOptionIndex: snapshot.question.correctOptionIndex,
    correctOptionId: snapshot.question.correctOptionId,
    solution: snapshot.question.solution,
    videoUrl: snapshot.question.videoUrl,
    updatedScore: updated?.score ?? snapshot.score,
    updatedStreak: updated?.streak ?? snapshot.streak,
  });
}
