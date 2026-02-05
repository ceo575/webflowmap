import { PracticeQuestion } from "./types";

export const mockPracticeQuestions: PracticeQuestion[] = [
    {
        id: 1,
        content: "Cho hàm số $y = f(x)$ liên tục trên $\\mathbb{R}$ và có bảng xét dấu $f'(x)$. Số điểm cực trị của hàm số $y = f(x^2 - 2x)$ là:",
        type: 'MCQ',
        difficulty: 'Vận dụng',
        options: [
            { id: 'A', content: '3' },
            { id: 'B', content: '1' },
            { id: 'C', content: '2' },
            { id: 'D', content: '4' }
        ],
        correctAnswer: 'C',
        hint: "Hãy tính đạo hàm của hàm hợp g(x) = f(x² - 2x) và tìm nghiệm của g'(x) = 0.",
        explanation: "Xét hàm số $g(x) = f(x^2 - 2x)$.\nTa có $g'(x) = (2x - 2)f'(x^2 - 2x)$.\n$g'(x) = 0 \\Leftrightarrow \\left[ \\begin{matrix} 2x - 2 = 0 \\\\ f'(x^2 - 2x) = 0 \\end{matrix} \\right.$.\nDựa vào bảng xét dấu của $f'(x)$, ta tìm được các nghiệm và sự đổi dấu, từ đó suy ra có 2 điểm cực trị.",
        videoUrl: "https://www.youtube.com/watch?v=example",
        videoStartTime: 330 // 5:30
    },
    {
        id: 2,
        content: "Tìm tập xác định $D$ của hàm số $y = (x^2 - 1)^{-3}$.",
        type: 'MCQ',
        difficulty: 'Thông hiểu',
        options: [
            { id: 'A', content: '$D = \\mathbb{R} \\setminus \\{\\pm 1\\}$' },
            { id: 'B', content: '$D = (-\\infty; -1) \\cup (1; +\\infty)$' },
            { id: 'C', content: '$D = \\mathbb{R}$' },
            { id: 'D', content: '$D = (-1; 1)$' }
        ],
        correctAnswer: 'A',
        explanation: "Hàm số lũy thừa $y = u^\\alpha$ với $\\alpha$ là số nguyên âm thì điều kiện là $u \\ne 0$.\nVậy $x^2 - 1 \\ne 0 \\Leftrightarrow x \\ne \\pm 1$.",
        videoUrl: "https://www.youtube.com/watch?v=example2",
        videoStartTime: 120
    }
];
