import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { withLegacyFallback } from "@/lib/prisma-compat";
import { parseOptions, PracticeQuestionItem } from "@/lib/practice";
import { notFound, redirect } from "next/navigation";
import PracticeTopicClient from "./PracticeTopicClient";

export default async function PracticeTopicPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();

  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { grade: true },
  });

  const examFilter = user?.grade ? { OR: [{ grade: user.grade }, { grade: null }] } : {};

  const topic = await withLegacyFallback(
    () =>
      prisma.topic.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          exams: {
            where: {
              isPublic: true,
              ...examFilter,
            },
            select: {
              subject: true,
              questions: {
                where: { type: "MCQ" },
                select: {
                  id: true,
                  content: true,
                  options: true,
                  correctAnswer: true,
                  explanation: true,
                },
              },
            },
          },
        },
      }),
    () =>
      prisma.topic.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          exams: {
            where: examFilter,
            select: {
              subject: true,
              questions: {
                where: { type: "MCQ" },
                select: {
                  id: true,
                  content: true,
                  options: true,
                  correctAnswer: true,
                  explanation: true,
                },
              },
            },
          },
        },
      })
  );

  if (!topic) {
    notFound();
  }

  const subject = topic.exams.find((exam) => exam.subject)?.subject ?? "Chưa gán môn";

  const questions: PracticeQuestionItem[] = topic.exams
    .flatMap((exam) => exam.questions)
    .map((question) => ({
      id: question.id,
      content: question.content,
      options: parseOptions(question.options),
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    }))
    .filter((question) => question.options.length > 0)
    .slice(0, 10);

  return <PracticeTopicClient topicId={topic.id} topicName={topic.name} subject={subject} questions={questions} />;
}
