import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AlertTriangle, PlayCircle, TrendingUp, Trophy } from "lucide-react";
import { getPracticeStatus, PracticeTopicCard } from "@/lib/practice";
import type { Prisma } from "@prisma/client";

const SUBJECT_FILTERS = ["Tất cả", "Toán", "Lý", "Hóa", "Tiếng Anh"];

function normalizeSubject(subject: string | null | undefined): string {
  if (!subject) return "Chưa gán môn";
  return subject;
}

export default async function PracticePage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const session = await auth();

  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { grade: true, name: true },
  });

  let weaknesses: Prisma.UserWeaknessGetPayload<{
    include: {
      topic: {
        select: {
          id: true;
          name: true;
          exams: {
            select: {
              subject: true;
              grade: true;
              _count: { select: { questions: true } };
            };
          };
        };
      };
    };
  }>[] = [];

  try {
    weaknesses = await prisma.userWeakness.findMany({
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
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
      orderBy: { score: "asc" },
    });
  } catch (error) {
    console.error("[PracticePage] Failed to load practice topics", error);
  }

  const cards: PracticeTopicCard[] = weaknesses
    .map((item) => {
      const latestExam = item.topic.exams.find((exam) => Boolean(exam.subject)) ?? item.topic.exams[0];
      const subject = normalizeSubject(latestExam?.subject);
      const gradeLabel = latestExam?.grade ?? user?.grade ?? "--";
      const questionCount = item.topic.exams.reduce((sum, exam) => sum + exam._count.questions, 0);

      return {
        id: item.topicId,
        title: item.topic.name,
        subject,
        gradeLabel,
        mastery: Math.max(0, Math.min(100, Math.round(item.score))),
        status: getPracticeStatus(item.score),
        questionCount,
      };
    })
    .filter((item) => item.questionCount > 0);

  const params = await searchParams;
  const selectedSubject = params.subject || "Tất cả";
  const filteredCards =
    selectedSubject === "Tất cả"
      ? cards
      : cards.filter((item) => item.subject.toLowerCase() === selectedSubject.toLowerCase());

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Các chủ đề cần cải thiện</h1>
        <p className="text-slate-500">Tập trung vào các điểm yếu để nâng cao kết quả học tập nhanh chóng.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        {SUBJECT_FILTERS.map((subject) => {
          const active = selectedSubject === subject;
          return (
            <Link
              key={subject}
              href={subject === "Tất cả" ? "/practice" : `/practice?subject=${encodeURIComponent(subject)}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-[#00c224] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-[#00c224]/40 hover:text-[#00c224]"
              }`}
            >
              {subject}
            </Link>
          );
        })}
      </div>

      <div className="space-y-4">
        {filteredCards.map((topic) => {
          const statusMeta =
            topic.status === "NEEDS_IMPROVEMENT"
              ? {
                  icon: AlertTriangle,
                  text: "Cần cải thiện",
                  chip: "bg-orange-100 text-orange-700",
                  progress: "bg-orange-500",
                }
              : topic.status === "IMPROVING"
                ? {
                    icon: TrendingUp,
                    text: "Đang tiến bộ",
                    chip: "bg-yellow-100 text-yellow-700",
                    progress: "bg-yellow-500",
                  }
                : {
                    icon: Trophy,
                    text: "Thành thạo",
                    chip: "bg-emerald-100 text-emerald-700",
                    progress: "bg-emerald-500",
                  };

          return (
            <div key={topic.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
                    <span className="rounded-md bg-blue-100 px-2.5 py-1 text-blue-700">
                      {topic.subject} • Lớp {topic.gradeLabel}
                    </span>
                    <span className={`flex items-center gap-1 ${statusMeta.chip} rounded-md px-2.5 py-1`}>
                      <statusMeta.icon className="h-3.5 w-3.5" />
                      {statusMeta.text}
                    </span>
                    <span className="text-slate-400">{topic.questionCount} câu hỏi</span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900">{topic.title}</h2>

                  <div className="max-w-md space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Mức độ thành thạo</span>
                      <span className="font-bold text-slate-800">{topic.mastery}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full ${statusMeta.progress}`} style={{ width: `${topic.mastery}%` }} />
                    </div>
                  </div>
                </div>

                <Link
                  href={`/practice/topic/${topic.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00c224] px-5 py-3 font-semibold text-white shadow-lg shadow-green-500/20 transition hover:bg-green-600"
                >
                  <PlayCircle className="h-5 w-5" />
                  Luyện tập ngay
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          Không có chủ đề luyện tập phù hợp bộ lọc hiện tại.
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-8 py-10 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-[#00c224]">
          <Trophy className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Cố gắng lên!</h3>
        <p className="mx-auto mt-1 max-w-xl text-sm text-slate-500">
          {user?.name ? `${user.name}, ` : ""}hoàn thành các bài luyện tập trên để cải thiện điểm số trung bình của bạn lên trên 8.0.
        </p>
      </div>
    </div>
  );
}
