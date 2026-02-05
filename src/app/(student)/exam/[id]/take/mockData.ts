export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';

export interface Answer {
    id: string;
    label: string; // A, B, C, D
    content: string; // LaTeX supported
}

export interface Proposition {
    id: string;
    label: string; // a), b), c)...
    content: string;
}

export interface Question {
    id: number; // Numeric ID for quick navigation
    type: QuestionType;
    title: string; // e.g., "Câu 1"
    content: string; // LaTeX supported html string
    answers?: Answer[];
    propositions?: Proposition[];
    points: number;
}

export const mockExamData: Question[] = [
    {
        id: 1,
        type: 'multiple_choice',
        title: "Câu 1",
        content: "Cho hàm số $f(x)$ liên tục trên đoạn $[0; \\pi]$ thỏa mãn $f(x) + f(\\pi - x) = \\sin x$. Tính giá trị của tích phân $I = \\int_0^\\pi f(x)dx$.",
        answers: [
            { id: "A", label: "A", content: "$I = 1$" },
            { id: "B", label: "B", content: "$I = 2$" },
            { id: "C", label: "C", content: "$I = \\frac{\\pi}{2}$" },
            { id: "D", label: "D", content: "$I = \\pi$" },
        ],
        points: 0.25,
    },
    {
        id: 2,
        type: 'true_false',
        title: "Câu 2",
        content: "Cho số phức $z = 1 + 2i$. Xét tính đúng sai của các mệnh đề sau:",
        propositions: [
            { id: "a", label: "a)", content: "Môđun của $z$ bằng $\\sqrt{5}$" },
            { id: "b", label: "b)", content: "Số phức liên hợp $\\bar{z} = 1 + 2i$" },
            { id: "c", label: "c)", content: "Điểm biểu diễn của $z$ là $M(1; 2)$" },
            { id: "d", label: "d)", content: "Phần thực của $z^2$ là $-3$" },
        ],
        points: 1.0,
    },
    {
        id: 3,
        type: 'short_answer',
        title: "Câu 3",
        content: "Biết $\\int_1^2 \\frac{dx}{x(x+1)} = a \\ln 2 + b \\ln 3$. Tính giá trị biểu thức $S = a + 2b$.",
        points: 0.5,
    },
    {
        id: 4,
        type: 'multiple_choice',
        title: "Câu 4",
        content: "Trong không gian $Oxyz$, cho mặt cầu $(S): (x-1)^2 + (y+2)^2 + z^2 = 25$. Tìm tọa độ tâm $I$ và bán kính $R$ của mặt cầu $(S)$.",
        answers: [
            { id: "A", label: "A", content: "$I(1; -2; 0), R = 25$" },
            { id: "B", label: "B", content: "$I(-1; 2; 0), R = 5$" },
            { id: "C", label: "C", content: "$I(1; -2; 0), R = 5$" },
            { id: "D", label: "D", content: "$I(-1; 2; 0), R = 25$" },
        ],
        points: 0.25,
    },
    {
        id: 5,
        type: 'short_answer',
        title: "Câu 5",
        content: "Có bao nhiêu số nguyên $m$ để hàm số $y = x^3 - 3mx^2 + 3(m^2-1)x + m$ có cực trị?",
        points: 0.5,
    },
];
