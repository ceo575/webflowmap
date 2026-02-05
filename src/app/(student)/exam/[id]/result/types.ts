export interface ChapterPerformance {
    id: string;
    name: string;
    score: number; // 0-100
    status: 'critical' | 'warning' | 'good';
}

export interface RecommendedTopic {
    id: string;
    name: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
    url?: string;
}

export interface ExamResult {
    score: number; // 0-10
    maxScore: number;
    timeSpent: string; // e.g., "45p"
    accuracy: number; // percentage 0-100
    rank: string; // e.g., "12/40"
    aiComment: string;
    chapters: ChapterPerformance[];
    recommendations: RecommendedTopic[];
}
