"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flame, Flag, LogOut, Send, Sparkles } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { FocusSessionSnapshot } from "@/lib/practice-focus";

function LatexContent({ content }: { content: string }) {
  const parts = content.split(/(\$[^$]+\$)/g);
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const math = part.slice(1, -1);
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(math, { throwOnError: false, displayMode: false }),
              }}
            />
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}

interface SubmitResult {
  isCorrect: boolean;
  earnedScore: number;
  selectedOptionIndex: number;
  correctOptionIndex: number;
  solution: string | null;
  videoUrl: string | null;
  updatedScore: number;
  updatedStreak: number;
}

export default function PracticeFocusClient({ initialSnapshot }: { initialSnapshot: FocusSessionSnapshot }) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [activeTab, setActiveTab] = useState<"solution" | "video">("solution");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question = snapshot.question;

  const isDone = snapshot.completed || !question;

  const title = useMemo(() => `Luyện tập: ${snapshot.topicName}`, [snapshot.topicName]);

  const handleSubmit = async () => {
    if (selectedOptionIndex === null || !question || loading || submitResult) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/practice/focus/${snapshot.sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionIndex }),
      });

      if (!response.ok) throw new Error("Không thể nộp đáp án.");
      const result = (await response.json()) as SubmitResult;
      setSubmitResult(result);
      setSnapshot((prev) => ({ ...prev, score: result.updatedScore, streak: result.updatedStreak }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/practice/focus/${snapshot.sessionId}/next`, { method: "POST" });
      if (!response.ok) throw new Error("Không thể tải câu tiếp theo.");
      const nextSnapshot = (await response.json()) as FocusSessionSnapshot;
      setSnapshot(nextSnapshot);
      setSelectedOptionIndex(null);
      setSubmitResult(null);
      setActiveTab("solution");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnd = async () => {
    await fetch(`/api/practice/focus/${snapshot.sessionId}/end`, { method: "POST" });
    window.location.href = "/practice";
  };

  const activeCorrectIndex = submitResult?.correctOptionIndex ?? question?.correctOptionIndex ?? 0;

  return (
    <div className="fixed inset-0 top-16 flex bg-[#f5f8f7]">
      <main className="flex w-[65%] flex-col border-r border-slate-200 bg-slate-50/60">
        <header className="border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Link href="/practice" className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="text-center">
              <h1 className="text-base font-bold text-slate-900">{title}</h1>
              <div className="mt-0.5 flex items-center justify-center gap-3 text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1 text-orange-500"><Flame className="h-3.5 w-3.5" />Streak {snapshot.streak}</span>
                <span>•</span>
                <span>
                  Câu {Math.min(snapshot.currentIndex + 1, snapshot.totalQuestions || 1)}/{Math.max(snapshot.totalQuestions, 1)}
                </span>
              </div>
            </div>
            <button onClick={handleEnd} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100">
              <LogOut className="h-4 w-4" /> Kết thúc
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl space-y-5 pb-24">
            <div className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                  Mức độ: {question?.level ?? "TH"}
                </span>
                <button className="text-slate-400"><Flag className="h-4 w-4" /></button>
              </div>
              {isDone ? (
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-slate-900">Hoàn thành phiên luyện tập</h2>
                  <p className="text-slate-600">Điểm của bạn: {snapshot.score}</p>
                </div>
              ) : (
                <p className="text-2xl leading-relaxed text-slate-800"><LatexContent content={question.content} /></p>
              )}
            </div>

            {!isDone && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {question.options.map((option, index) => {
                    const submitted = Boolean(submitResult);
                    const isSelected = selectedOptionIndex === index;
                    const isCorrect = index === activeCorrectIndex;
                    const isWrongSelection = submitted && isSelected && !isCorrect;

                    return (
                      <button
                        key={option.id}
                        disabled={submitted}
                        onClick={() => setSelectedOptionIndex(index)}
                        className={`relative flex items-center gap-4 rounded-xl border p-5 text-left transition ${
                          isCorrect && submitted
                            ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20"
                            : isWrongSelection
                              ? "border-red-400 bg-red-50"
                              : isSelected
                                ? "border-emerald-400 bg-emerald-50/60"
                                : "border-slate-200 bg-white hover:border-slate-300"
                        } ${submitted && !isCorrect && !isWrongSelection ? "opacity-70" : ""}`}
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">{option.id}</span>
                        <span className="text-xl font-medium text-slate-800"><LatexContent content={option.content} /></span>
                        {isCorrect && submitted && (
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">Đáp án đúng</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {submitResult && (
                  <div className={`rounded-xl border p-4 text-lg font-bold ${submitResult.isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {submitResult.isCorrect ? `Chính xác! +${submitResult.earnedScore} điểm` : "Chưa chính xác. Hãy xem lời giải chi tiết."}
                  </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
                  <div className="flex border-b border-slate-100">
                    <button
                      onClick={() => setActiveTab("solution")}
                      className={`flex-1 py-4 text-base font-semibold ${activeTab === "solution" ? "border-b-2 border-emerald-600 bg-emerald-50/60 text-emerald-700" : "text-slate-500"}`}
                    >
                      Lời giải chi tiết
                    </button>
                    <button
                      onClick={() => setActiveTab("video")}
                      className={`flex-1 py-4 text-base font-semibold ${activeTab === "video" ? "border-b-2 border-emerald-600 bg-emerald-50/60 text-emerald-700" : "text-slate-500"}`}
                    >
                      Video bài giảng
                    </button>
                  </div>

                  <div className="p-6 text-slate-700">
                    {activeTab === "solution" ? (
                      <div className="whitespace-pre-line">
                        {submitResult?.solution || question.solution || "Lời giải sẽ hiển thị sau khi nộp đáp án."}
                      </div>
                    ) : submitResult?.videoUrl || question.videoUrl ? (
                      <a
                        href={submitResult?.videoUrl || question.videoUrl || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-700 underline"
                      >
                        Mở video bài giảng
                      </a>
                    ) : (
                      <p>Chưa có video bài giảng cho câu hỏi này.</p>
                    )}
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </div>

        {!isDone && (
          <div className="sticky bottom-0 border-t border-slate-200 bg-white p-4">
            <div className="mx-auto flex max-w-4xl justify-end gap-3">
              {!submitResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedOptionIndex === null || loading}
                  className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
                >
                  {loading ? "Đang xử lý..." : "Kiểm tra đáp án"}
                </button>
              ) : (
                <button onClick={handleNext} disabled={loading} className="rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white">
                  Câu tiếp theo
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <aside className="flex w-[35%] flex-col bg-white">
        <div className="flex h-14 items-center justify-between border-b border-slate-100 px-5">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-emerald-600" /><span className="font-bold text-slate-900">FlowAI Tutor</span></div>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/40 p-5">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-slate-700">
            <p className="mb-1 font-semibold text-emerald-600">Tuyệt vời!</p>
            <p>Bạn đã nắm vững kiến thức này. Bạn muốn thử câu khó hơn không?</p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">Thử câu khó hơn</button>
            <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">Giải thích thêm</button>
          </div>
        </div>
        <div className="border-t border-slate-100 p-5">
          <div className="relative">
            <input placeholder="Hỏi FlowAI..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-11 text-sm" />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-emerald-600"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      </aside>
    </div>
  );
}
