import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Award, BadgeCheck, Bolt, Flame, Trophy } from "lucide-react";

function getBadgeLabel(score: number, accuracy: number) {
  if (accuracy >= 90) return "Học giả chuyên cần";
  if (score >= 60) return "Bứt phá mục tiêu";
  return "Kiên trì tiến bộ";
}

export default async function PracticeCompletedPage({
  params,
  searchParams,
}: {
  params: Promise<{ topicId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const session = await auth();
  if (!session?.user || !(session.user as any).id) {
    redirect("/login");
  }

  const userId = (session.user as any).id as string;
  const { topicId } = await params;
  const { sessionId } = await searchParams;

  if (!sessionId) {
    redirect(`/practice/focus/${topicId}`);
  }

  const practice = await prisma.practiceSession.findFirst({
    where: {
      id: sessionId,
      studentId: userId,
      topicId,
    },
    include: {
      topic: { select: { name: true } },
    },
  });

  if (!practice) {
    redirect(`/practice/focus/${topicId}`);
  }

  const total = Math.max(practice.totalQuestions, 1);
  const accuracy = Math.round((practice.correctCount / total) * 100);
  const badge = getBadgeLabel(practice.score, accuracy);

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#f8fbfa] px-6 py-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-emerald-100 bg-white p-10 shadow-xl shadow-emerald-100/50">
        <div className="mb-8 flex justify-center text-amber-500">
          <Trophy className="h-14 w-14" />
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">Chúc mừng bạn đã hoàn thành mục tiêu!</h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-600">
            Bạn đã hoàn thành chủ đề <span className="font-bold text-emerald-700">{practice.topic.name}</span>. Tiếp tục phát huy nhé!
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-emerald-50 p-5 text-center">
            <Bolt className="mx-auto mb-2 h-6 w-6 text-emerald-600" />
            <p className="text-sm text-slate-500">Điểm tích lũy</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">+{practice.score}</p>
          </div>
          <div className="rounded-2xl bg-sky-50 p-5 text-center">
            <BadgeCheck className="mx-auto mb-2 h-6 w-6 text-sky-600" />
            <p className="text-sm text-slate-500">Độ chính xác</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{accuracy}%</p>
          </div>
          <div className="rounded-2xl bg-orange-50 p-5 text-center">
            <Flame className="mx-auto mb-2 h-6 w-6 text-orange-500" />
            <p className="text-sm text-slate-500">Chuỗi ngày</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{practice.streak} ngày</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
            <Award className="h-4 w-4" /> Huy hiệu mới: {badge}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/practice" className="rounded-xl border border-emerald-200 px-5 py-3 font-semibold text-emerald-700 hover:bg-emerald-50">
            Xem lịch sử luyện tập
          </Link>
          <Link href="/dashboard" className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700">
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
