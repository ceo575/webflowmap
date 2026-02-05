import { ReviewQuestion } from "./types";

export const mockReviewData: ReviewQuestion[] = [
    {
        id: 15,
        questionNumber: 15,
        type: 'MCQ',
        content: "Cho trường vectơ $F(x, y) = (x^2 + y, 3x - y^2)$. Tính tích phân đường của trường vectơ F dọc theo đoạn thẳng nối từ điểm $A(0, 0)$ đến điểm $B(2, 4)$.",
        topic: "Tích phân đường loại 2",
        difficulty: "Vận dụng cao",
        userAnswer: "B",
        correctAnswer: "C",
        isCorrect: false,
        answers: [
            { id: "A", label: "A", content: "10" },
            { id: "B", label: "B", content: "12" },
            { id: "C", label: "C", content: "14" },
            { id: "D", label: "D", content: "16" }
        ],
        solutionMethod: "Sử dụng phương pháp tham số hóa đoạn thẳng. Đoạn thẳng AB nối A(0,0) và B(2,4) có phương trình tham số: $x = t, y = 2t$ với $0 \\le t \\le 2$.",
        explanationSteps: [
            "Tính vi phân: $dx = dt, dy = 2dt$",
            "Thay vào biểu thức dưới dấu tích phân: $I = \\int_0^2 [(t^2 + 2t)dt + (3t - (2t)^2)(2dt)]$",
            "Rút gọn và tính tích phân xác định để ra kết quả **14**."
        ],
        aiAnalysis: {
            step1_identify: "Đây là bài toán tích phân đường loại 2. Cần xác định đường cong C và trường vectơ F.",
            step2_method: "Sử dụng phương pháp tham số hóa đoạn thẳng.",
            step3_execution: "Bạn đã tính sai đạo hàm của $y^2$ khi thay vào biểu thức.",
            step4_conclusion: "Tính tích phân xác định để ra kết quả cuối cùng.",
            mistakeHighlight: "Bạn tính: $3t - 2t$. Đúng là: $3t - (2t)^2 = 3t - 4t^2$",
            mistakeDetail: "Lỗi sai ở bước thay thế y²"
        }
    },
    {
        id: 16,
        questionNumber: 16,
        type: 'MCQ',
        content: "Tìm nguyên hàm của hàm số $f(x) = \\cos 3x$.",
        topic: "Nguyên hàm cơ bản",
        difficulty: "Thông hiểu",
        userAnswer: "A",
        correctAnswer: "A",
        isCorrect: true,
        answers: [
            { id: "A", label: "A", content: "$\\frac{1}{3}\\sin 3x + C$" },
            { id: "B", label: "B", content: "$\\sin 3x + C$" },
            { id: "C", label: "C", content: "$-\\frac{1}{3}\\sin 3x + C$" },
            { id: "D", label: "D", content: "$3\\sin 3x + C$" }
        ],
        solutionMethod: "Sử dụng công thức nguyên hàm cơ bản $\\int \\cos(ax+b)dx = \\frac{1}{a}\\sin(ax+b) + C$.",
        explanationSteps: [
            "Áp dụng công thức với $a=3$.",
            "Kết quả là $\\frac{1}{3}\\sin 3x + C$."
        ],
        aiAnalysis: {
            step1_identify: "Tìm nguyên hàm của hàm lượng giác.",
            step2_method: "Sử dụng bảng nguyên hàm cơ bản.",
            step3_execution: "Áp dụng đúng công thức.",
            step4_conclusion: "Kiểm tra lại bằng cách đạo hàm kết quả.",
        }
    }
];
