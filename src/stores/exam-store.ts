import { create } from 'zustand'

export interface Question {
    id: string
    content: string
    type: 'MCQ' | 'TRUE_FALSE' | 'SHORT_ANSWER'
    options?: string[] // For MCQ
    correctOptionIndex?: number // For MCQ (UI state)
    images?: string[] // For placeholders [IMG_0], [IMG_1], etc.
    correctAnswer: string
    explanation?: string
    solution?: string
    videoUrl?: string
    imageBase64?: string
    chapter?: string
    lesson?: string
    problemType?: string
    flowThinking?: {
        identify: string
        method: string
        execution: string
        conclusion: string
    }
    level?: string
    tags?: string[]
}

export interface ExamInfo {
    title: string
    duration: number // minutes
    tags: string[]
    classes: string[]
    isPublic: boolean
    subject?: string
    grade?: string
}

interface ExamStore {
    // Current step in workflow
    step: 'upload' | 'edit' | 'complete'

    // Upload progress
    uploadProgress: number

    // Exam data
    examId?: string
    examInfo: ExamInfo
    questions: Question[]
    fullVideoUrl?: string
    pdfUrl?: string

    // Actions
    setStep: (step: 'upload' | 'edit' | 'complete') => void
    setUploadProgress: (progress: number | ((prev: number) => number)) => void
    setExamId: (id: string) => void
    setExamInfo: (info: Partial<ExamInfo>) => void
    setQuestions: (questions: Question[]) => void
    updateQuestion: (id: string, data: Partial<Question>) => void
    setFullVideoUrl: (url: string) => void
    setPdfUrl: (url: string) => void
    reset: () => void
}

const initialState = {
    step: 'upload' as const,
    uploadProgress: 0,
    examInfo: {
        title: '',
        duration: 45,
        tags: [],
        classes: [],
        isPublic: false,
    },
    questions: [],
}

export const useExamStore = create<ExamStore>((set) => ({
    ...initialState,

    setStep: (step) => set({ step }),

    setUploadProgress: (progress) => set((state) => ({
        uploadProgress: typeof progress === 'function' ? progress(state.uploadProgress) : progress
    })),

    setExamId: (examId) => set({ examId }),

    setExamInfo: (info) => set((state) => ({
        examInfo: { ...state.examInfo, ...info }
    })),

    setQuestions: (questions) => set({ questions }),

    updateQuestion: (id, data) => set((state) => ({
        questions: state.questions.map(q =>
            q.id === id ? { ...q, ...data } : q
        )
    })),

    setFullVideoUrl: (fullVideoUrl) => set({ fullVideoUrl }),

    setPdfUrl: (pdfUrl) => set({ pdfUrl }),

    reset: () => set(initialState),
}))
