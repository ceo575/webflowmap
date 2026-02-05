export interface PracticeQuestion {
    id: number;
    content: string; // Supports LaTeX
    type: 'MCQ' | 'ShortAnswer';
    difficulty: 'Vận dụng' | 'Vận dụng cao' | 'Thông hiểu' | 'Nhận biết';
    options?: {
        id: string; // 'A', 'B', 'C', 'D'
        content: string;
    }[];
    correctAnswer: string; // 'A', 'B', etc. or exact text

    // Post-submission data
    explanation: string; // Detailed text solution
    videoUrl?: string; // Link to video
    videoStartTime?: number; // Seconds to start at
    hint?: string;
}
