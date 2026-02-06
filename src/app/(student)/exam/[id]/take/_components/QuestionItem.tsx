"use client"

import katex from "katex"
import "katex/dist/katex.min.css"
import { cn } from "@/lib/utils"
import { TakeQuestion } from "../types"

const LatexContent = ({ content }: { content: string }) => {
  const parts = content.split(/(\$[^$]+\$)/g)
  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith("$") && part.endsWith("$")) {
          const math = part.slice(1, -1)
          const html = katex.renderToString(math, { throwOnError: false, displayMode: false })
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />
        }
        return <span key={index}>{part}</span>
      })}
    </span>
  )
}

interface QuestionItemProps {
  question: TakeQuestion
  answer: unknown
  active: boolean
  onAnswerChange: (value: unknown) => void
}

export function QuestionItem({ question, answer, active, onAnswerChange }: QuestionItemProps) {
  const typeLabel =
    question.type === "MCQ" ? "Trắc nghiệm" : question.type === "TRUE_FALSE" ? "Đúng/Sai" : "Điền số"

  return (
    <div
      id={`q-${question.id}`}
      className={cn(
        "bg-white rounded-xl border p-6 shadow-sm scroll-mt-24",
        active ? "border-emerald-500" : "border-slate-200"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-[#059669] font-bold text-lg">
          Câu {question.index} <span className="text-slate-400 font-normal text-sm">({typeLabel})</span>
        </h3>
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded">{question.points} điểm</span>
      </div>

      <div className="mb-5 text-slate-800 text-sm leading-relaxed font-medium">
        <LatexContent content={question.content} />
      </div>

      {question.type === "MCQ" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option, idx) => {
            const label = String.fromCharCode(65 + idx)
            const selected = answer === label
            return (
              <label
                key={label}
                className={cn(
                  "flex items-center gap-3 p-3 rounded border cursor-pointer",
                  selected ? "border-emerald-500 bg-emerald-50" : "border-slate-200"
                )}
              >
                <input
                  type="radio"
                  checked={selected}
                  onChange={() => onAnswerChange(label)}
                  className="w-4 h-4 text-emerald-600"
                />
                <span className="text-sm font-medium">
                  <span className="font-bold mr-1">{label}.</span>
                  <LatexContent content={option} />
                </span>
              </label>
            )
          })}
        </div>
      )}

      {question.type === "TRUE_FALSE" && (
        <div className="border rounded border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left p-3">Mệnh đề</th>
                <th className="text-center p-3 w-20 text-emerald-700">Đúng</th>
                <th className="text-center p-3 w-20 text-red-700">Sai</th>
              </tr>
            </thead>
            <tbody>
              {question.options.map((option, idx) => {
                const label = String.fromCharCode(97 + idx)
                const current = (answer as Record<string, string> | undefined)?.[String(idx)]
                return (
                  <tr key={label} className="border-t border-slate-100">
                    <td className="p-3">
                      <span className="font-semibold mr-1">{label})</span>
                      <LatexContent content={option} />
                    </td>
                    <td className="text-center p-3">
                      <input
                        type="radio"
                        checked={current === "Đ"}
                        onChange={() =>
                          onAnswerChange({
                            ...(typeof answer === "object" && answer ? (answer as Record<string, string>) : {}),
                            [String(idx)]: "Đ",
                          })
                        }
                        className="w-4 h-4 text-emerald-600"
                      />
                    </td>
                    <td className="text-center p-3">
                      <input
                        type="radio"
                        checked={current === "S"}
                        onChange={() =>
                          onAnswerChange({
                            ...(typeof answer === "object" && answer ? (answer as Record<string, string>) : {}),
                            [String(idx)]: "S",
                          })
                        }
                        className="w-4 h-4 text-red-600"
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {question.type === "SHORT_ANSWER" && (
        <div className="bg-emerald-50/50 p-4 rounded border border-emerald-100 max-w-md">
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nhập kết quả của bạn:</label>
          <input
            type="text"
            value={typeof answer === "string" ? answer : ""}
            onChange={(e) => onAnswerChange(e.target.value)}
            className="block w-full rounded border-slate-300 focus:border-emerald-500 focus:ring-emerald-500"
            placeholder="Ví dụ: -5"
          />
        </div>
      )}
    </div>
  )
}
