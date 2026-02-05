import { Question } from "./types";

export const mockQuestions: Question[] = [
    {
        id: 1,
        type: 'multiple_choice',
        title: "Câu 1",
        content: "Tính thể tích $V$ của vật thể nằm giữa hai mặt phẳng $x=0$ và $x=\\pi$, biết rằng thiết diện của vật thể bị cắt bởi mặt phẳng vuông góc với trục $Ox$ tại điểm có hoành độ $x$ ($0 \\le x \\le \\pi$) là một tam giác đều cạnh $2\\sqrt{\\sin x}$.",
        answers: [
            { id: "A", label: "A", content: "$V = 3$", isCorrect: false },
            { id: "B", label: "B", content: "$V = 3\\pi$", isCorrect: false },
            { id: "C", label: "C", content: "$V = 2\\pi\\sqrt{3}$", isCorrect: false },
            { id: "D", label: "D", content: "$V = 2\\sqrt{3}$", isCorrect: true },
        ],
        points: 3.33,
        explanation: "Diện tích tam giác đều...",
        level: "Thông hiểu"
    },
    {
        id: 2,
        type: 'true_false',
        title: "Câu 2",
        content: "Cho $D$ là hình phẳng giới hạn bởi đường cong $y = \\frac{3+(x-2)e^x}{xe^x + 1}$, trục hoành và hai đường thẳng $x=0$, $x=1$. Thể tích khối tròn xoay khi quay $D$ quanh trục hoành là $V$. Xét tính đúng sai của các mệnh đề sau:",
        propositions: [
            { id: "a", label: "a)", content: "$V = \\pi \\int ...$", isCorrect: false },
            { id: "b", label: "b)", content: "$V = \\pi \\int dx + 2\\int ...$", isCorrect: true },
            { id: "c", label: "c)", content: "$... = -\\ln|...| + C$", isCorrect: false },
            { id: "d", label: "d)", content: "$V = \\pi[a + b \\ln(1 + 1/e)]...$", isCorrect: true },
        ],
        points: 3.33,
        level: "Vận dụng"
    },
    {
        id: 3,
        type: 'short_answer',
        title: "Câu 3",
        content: "Thể tích khối tròn xoay sinh bởi hình phẳng giới hạn bởi đồ thị hai hàm số $y = x^2 - 2x$, $y = 4 - x^2$ khi nó quay quanh trục hoành là bao nhiêu? (làm tròn đến số thập phân thứ nhất).",
        correctAnswer: "88,2",
        points: 3.33,
        explanation: "Xét phương trình hoành độ giao điểm...",
        level: "Vận dụng cao"
    }
];
