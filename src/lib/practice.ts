export type PracticeStatus = "NEEDS_IMPROVEMENT" | "IMPROVING" | "STRONG";

export interface PracticeTopicCard {
  id: string;
  title: string;
  subject: string;
  gradeLabel: string;
  mastery: number;
  status: PracticeStatus;
  questionCount: number;
}

export interface PracticeQuestionOption {
  id: string;
  content: string;
}

export interface PracticeQuestionItem {
  id: string;
  content: string;
  options: PracticeQuestionOption[];
  correctAnswer: string;
  explanation: string | null;
}

export function parseOptions(options: string | null): PracticeQuestionOption[] {
  if (!options) return [];

  try {
    const parsed = JSON.parse(options);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((value, index) => {
        if (typeof value === "string") {
          return { id: String.fromCharCode(65 + index), content: value };
        }

        if (
          value &&
          typeof value === "object" &&
          typeof value.id === "string" &&
          typeof value.content === "string"
        ) {
          return { id: value.id, content: value.content };
        }

        return null;
      })
      .filter((value): value is PracticeQuestionOption => value !== null);
  } catch {
    return [];
  }
}

export function getPracticeStatus(mastery: number): PracticeStatus {
  if (mastery < 50) return "NEEDS_IMPROVEMENT";
  if (mastery < 75) return "IMPROVING";
  return "STRONG";
}
