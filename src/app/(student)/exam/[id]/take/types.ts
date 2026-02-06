export type TakeQuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER"

export interface TakeQuestion {
  id: string
  index: number
  type: TakeQuestionType
  content: string
  options: string[]
  points: number
}

export interface TakeExamPayload {
  attemptId: string
  examId: string
  title: string
  subject: string | null
  grade: string | null
  durationMinutes: number
  startedAt: string
  submittedAt: string | null
  status: "IN_PROGRESS" | "SUBMITTED" | "EXPIRED"
  questions: TakeQuestion[]
  initialAnswers: Record<string, unknown>
}
