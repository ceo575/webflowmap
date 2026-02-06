"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { PracticeQuestionItem } from "@/lib/practice";

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

export default function PracticeTopicClient({
  topicId,
  topicName,
  subject,
  questions,
}: {
  topicId: string;
  topicName: string;
  subject: string;
  questions: PracticeQuestionItem[];
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Record<string, string>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = submitted[currentQuestion?.id ?? ""];
  const isSubmitted = Boolean(selectedAnswer);

  const score = useMemo(
    () =>
      questions.reduce((sum, question) => {
        if (submitted[question.id] && submitted[question.id] === question.correctAnswer) return sum + 1;
        return sum;
      }, 0),
    [questions, submitted],
  );

  if (!currentQuestion) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Chưa có dữ liệu luyện tập</h1>
        <p className="mt-2 text-slate-500">Chủ đề này chưa có câu hỏi trắc nghiệm phù hợp để luyện tập.</p>
        <Link href="/practice" className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">
          Quay lại danh sách luyện tập
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedOption || isSaving) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/practice/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId,
          sessionId,
          questionId: currentQuestion.id,
          selectedAnswer: selectedOption,
          isCorrect: selectedOption === currentQuestion.correctAnswer,
          totalQuestions: questions.length,
        }),
      });

      if (!response.ok) {
        throw new Error("Không thể lưu kết quả luyện tập.");
      }

      const data = (await response.json()) as { sessionId: string };
      setSessionId(data.sessionId);
      setSubmitted((prev) => ({ ...prev, [currentQuestion.id]: selectedOption }));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Có lỗi xảy ra.");
    } finally {
      setIsSaving(false);
    }
  };

  const goNext = () => {
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/practice" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Quay lại
        </Link>
        <p className="text-sm text-slate-500">
          {subject} • Câu {currentIndex + 1}/{questions.length}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{topicName}</h1>
        <p className="mt-4 text-lg text-slate-800">
          <LatexContent content={currentQuestion.content} />
        </p>

        <div className="mt-6 space-y-3">
          {currentQuestion.options.map((option) => {
            const isChosen = (isSubmitted ? selectedAnswer : selectedOption) === option.id;
            const isCorrect = option.id === currentQuestion.correctAnswer;

            return (
              <button
                key={option.id}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(option.id)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  isSubmitted
                    ? isCorrect
                      ? "border-emerald-500 bg-emerald-50"
                      : isChosen
                        ? "border-red-500 bg-red-50"
                        : "border-slate-200 bg-slate-50"
                    : isChosen
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-slate-200 hover:border-emerald-300"
                }`}
              >
                <span className="font-semibold">{option.id}. </span>
                <LatexContent content={option.content} />
              </button>
            );
          })}
        </div>

        {isSubmitted && (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <p className="flex items-center gap-2 font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" /> Chính xác!
              </p>
            ) : (
              <p className="flex items-center gap-2 font-semibold text-red-700">
                <XCircle className="h-4 w-4" /> Chưa đúng. Đáp án đúng là {currentQuestion.correctAnswer}.
              </p>
            )}
            {currentQuestion.explanation && <p className="mt-2 whitespace-pre-line">{currentQuestion.explanation}</p>}
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Điểm hiện tại: {score}/{questions.length}
          </p>
          {!isSubmitted ? (
            <button
              disabled={!selectedOption || isSaving}
              onClick={handleSubmit}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Đang lưu..." : "Nộp đáp án"}
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={currentIndex === questions.length - 1}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Câu tiếp theo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
