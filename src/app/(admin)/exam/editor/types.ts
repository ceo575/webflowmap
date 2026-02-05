export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Answer {
    id: string;
    label: string; // A, B, C, D
    content: string; // LaTeX supported
    isCorrect: boolean;
}

export interface Proposition {
    id: string;
    label: string; // a), b), c)...
    content: string;
    isCorrect: boolean; // True if the proposition itself is True
}

export interface Question {
    id: number;
    type: QuestionType;
    title: string; // e.g., "Câu 1"
    content: string; // LaTeX supported html string
    answers?: Answer[];
    propositions?: Proposition[];
    correctAnswer?: string; // For short answer
    explanation?: string;
    points: number;
    level?: string;
    classification?: string;
}
