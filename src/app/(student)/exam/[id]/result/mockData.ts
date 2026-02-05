import { ExamResult } from "./types";

export const mockResultData: ExamResult = {
    score: 7.5,
    maxScore: 10,
    timeSpent: "45p",
    accuracy: 75,
    rank: "12/40",
    aiComment: 'Bạn làm rất tốt phần <span class="font-bold text-[#059669]">Hình học</span>, nắm vững các kiến thức cơ bản và vận dụng. Tuy nhiên, hãy chú ý hơn ở phần <span class="font-bold text-red-500">Giải tích</span>, đặc biệt là các bài toán về cực trị nhé!',
    chapters: [
        {
            id: "c1",
            name: "Hàm số & Đồ thị",
            score: 30,
            status: "critical"
        },
        {
            id: "c2",
            name: "Hình học không gian",
            score: 95,
            status: "good"
        },
        {
            id: "c3",
            name: "Đại số",
            score: 70,
            status: "warning"
        }
    ],
    recommendations: [
        {
            id: "r1",
            name: "Cực trị hàm hợp",
            reason: "Bạn đã sai 3 câu trong phần này.",
            priority: "high",
            url: "/practice/topic/cuc-tri"
        },
        {
            id: "r2",
            name: "Phương trình Logarit",
            reason: "Cần cải thiện tốc độ làm bài.",
            priority: "medium",
            url: "/practice/topic/logarit"
        },
        {
            id: "r3",
            name: "Bài tập tổng hợp",
            reason: "Luyện đề ngẫu nhiên để củng cố kiến thức toàn diện.",
            priority: "low",
            url: "/practice/topic/general"
        }
    ]
};
