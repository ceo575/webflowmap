import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getSessionSnapshot } from "@/lib/practice-focus";

export async function POST(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const session = await auth();
  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const { sessionId } = await params;

  const snapshot = await getSessionSnapshot(userId, sessionId);
  if (!snapshot) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (snapshot.completed) {
    return NextResponse.json(snapshot);
  }

  const nextIndex = snapshot.currentIndex + 1;
  const isDone = nextIndex >= snapshot.totalQuestions;

  await prisma.practiceSession.update({
    where: { id: sessionId },
    data: {
      currentIndex: Math.min(nextIndex, snapshot.totalQuestions),
      ...(isDone ? { completedAt: new Date(), endedAt: new Date() } : {}),
    },
  });

  const updated = await getSessionSnapshot(userId, sessionId);
  return NextResponse.json(updated);
}
