import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPracticeStatus } from "@/lib/practice";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string;
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject");

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { grade: true } });
  const weaknesses = await prisma.userWeakness.findMany({
    where: { userId },
    include: {
      topic: {
        select: {
          id: true,
          name: true,
          exams: {
            where: {
              isPublic: true,
              ...(user?.grade ? { OR: [{ grade: user.grade }, { grade: null }] } : {}),
            },
            select: {
              subject: true,
              grade: true,
              _count: { select: { questions: true } },
            },
          },
        },
      },
    },
    orderBy: { score: "asc" },
  });

  const topics = weaknesses
    .map((entry) => {
      const latestExam = entry.topic.exams.find((exam) => Boolean(exam.subject)) ?? entry.topic.exams[0];
      const normalizedSubject = latestExam?.subject ?? "Chưa gán môn";
      return {
        id: entry.topicId,
        title: entry.topic.name,
        subject: normalizedSubject,
        grade: latestExam?.grade ?? user?.grade ?? "--",
        mastery: Math.round(entry.score),
        status: getPracticeStatus(entry.score),
        questionCount: entry.topic.exams.reduce((sum, exam) => sum + exam._count.questions, 0),
      };
    })
    .filter((topic) => topic.questionCount > 0)
    .filter((topic) => (subject ? topic.subject.toLowerCase() === subject.toLowerCase() : true));

  return NextResponse.json({ topics });
}
