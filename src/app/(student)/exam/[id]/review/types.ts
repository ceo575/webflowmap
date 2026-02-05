export interface ReviewQuestion {
    id: number;
    questionNumber: number;
    type: 'MCQ' | 'TrueFalse' | 'ShortAnswer';
    content: string; // LaTeX supported
    topic: string;
    difficulty: 'Vận dụng cao' | 'Vận dụng' | 'Thông hiểu' | 'Nhận biết';

    // Logic So sánh Đáp án
    userAnswer: string; // id of answer or text
    correctAnswer: string; // id of answer or text
    isCorrect: boolean;

    // Choices for MCQ
    answers?: {
        id: string;
        label: string;
        content: string; // number or text
    }[];

    // Dữ liệu Giải thích
    solutionMethod: string;
    explanationSteps: string[];
    videoUrl?: string;

    // Dữ liệu AI Flow Tutor (Trọng tâm)
    aiAnalysis: {
        step1_identify: string;  // Nhận diện bài toán
        step2_method: string;    // Phương pháp giải
        step3_execution: string; // Thực hiện tính toán
        step4_conclusion: string;// Kết luận/Kiểm tra

        mistakeHighlight?: string; // Ví dụ: "Bạn đã quên đổi dấu khi chuyển vế..."
        mistakeDetail?: string;
    };
}
