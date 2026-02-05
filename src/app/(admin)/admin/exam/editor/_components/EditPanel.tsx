"use client"

import { Question, useExamStore } from "@/stores/exam-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Link as LinkIcon } from "lucide-react"

interface EditPanelProps {
    question: Question | null
}

export function EditPanel({ question }: EditPanelProps) {
    const { updateQuestion } = useExamStore()

    if (!question) {
        return (
            <div className="flex items-center justify-center h-full text-slate-400">
                <p>Chọn một câu hỏi để chỉnh sửa</p>
            </div>
        )
    }

    const handleContentChange = (value: string) => {
        updateQuestion(question.id, { content: value })
    }

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...(question.options || [])]
        newOptions[index] = value
        updateQuestion(question.id, { options: newOptions })
    }

    const handleCorrectAnswerChange = (value: string) => {
        updateQuestion(question.id, { correctAnswer: value })
    }

    const handleExplanationChange = (value: string) => {
        updateQuestion(question.id, { explanation: value })
    }

    const handleVideoUrlChange = (value: string) => {
        updateQuestion(question.id, { videoUrl: value })
    }

    const handleChapterChange = (value: string) => {
        updateQuestion(question.id, { chapter: value })
    }

    const handleLessonChange = (value: string) => {
        updateQuestion(question.id, { lesson: value })
    }

    const handleProblemTypeChange = (value: string) => {
        updateQuestion(question.id, { problemType: value })
    }

    return (
        <div className="space-y-6">
            {/* Question Content */}
            <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-medium">
                    Nội dung câu hỏi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="content"
                    value={question.content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Nhập nội dung câu hỏi (hỗ trợ LaTeX với $...$)"
                    className="min-h-[100px]"
                />
                <p className="text-xs text-slate-500">
                    Sử dụng $...$ cho công thức LaTeX inline, $$...$$ cho công thức block
                </p>
            </div>

            {/* MCQ Options */}
            {question.type === 'MCQ' && (
                <div className="space-y-4">
                    <Label className="text-sm font-medium">Các lựa chọn</Label>
                    {question.options?.map((option, index) => {
                        const label = String.fromCharCode(65 + index) // A, B, C, D
                        return (
                            <div key={index} className="flex items-start gap-3">
                                <div className="flex items-center gap-2 pt-2">
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        checked={question.correctAnswer === label}
                                        onChange={() => handleCorrectAnswerChange(label)}
                                        className="w-4 h-4 text-emerald-600"
                                    />
                                    <span className="font-bold text-sm w-4">{label}.</span>
                                </div>
                                <Textarea
                                    value={option}
                                    onChange={(e) => handleOptionChange(index, e.target.value)}
                                    placeholder={`Lựa chọn ${label}`}
                                    className="flex-1"
                                    rows={2}
                                />
                            </div>
                        )
                    })}
                    <p className="text-xs text-slate-500">
                        Chọn radio button bên trái để đánh dấu đáp án đúng
                    </p>
                </div>
            )}

            {/* Short Answer */}
            {question.type === 'SHORT_ANSWER' && (
                <div className="space-y-2">
                    <Label htmlFor="correctAnswer" className="text-sm font-medium">
                        Đáp án đúng <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="correctAnswer"
                        value={question.correctAnswer || ''}
                        onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                        placeholder="Nhập đáp án"
                    />
                </div>
            )}

            {/* Explanation */}
            <div className="space-y-2">
                <Label htmlFor="explanation" className="text-sm font-medium">
                    Lời giải
                    <span className="text-slate-400 font-normal ml-1">- Tùy chọn</span>
                </Label>
                <Textarea
                    id="explanation"
                    value={question.explanation || ''}
                    onChange={(e) => handleExplanationChange(e.target.value)}
                    placeholder="Nhập lời giải chi tiết (hỗ trợ LaTeX)"
                    className="min-h-[80px]"
                />
            </div>

            {/* Video URL */}
            <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-sm font-medium">
                    Link video giải
                    <span className="text-slate-400 font-normal ml-1">- Tùy chọn</span>
                </Label>
                <div className="relative">
                    <Input
                        id="videoUrl"
                        type="url"
                        value={question.videoUrl || ''}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                        placeholder="https://youtube.com/... hoặc https://drive.google.com/..."
                        className="pl-10"
                    />
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                    Link video giải riêng cho câu hỏi này (YouTube, Google Drive, v.v.)
                </p>
            </div>

            {/* Classification Section */}
            <div className="pt-4 border-t border-slate-200 space-y-4">
                <h4 className="text-sm font-semibold text-slate-700">Phân loại câu hỏi</h4>

                {/* Chapter */}
                <div className="space-y-2">
                    <Label htmlFor="chapter" className="text-sm font-medium">
                        Chương
                    </Label>
                    <Input
                        id="chapter"
                        value={question.chapter || ''}
                        onChange={(e) => handleChapterChange(e.target.value)}
                        placeholder="VD: Chương 1 - Hàm số lượng giác"
                    />
                </div>

                {/* Lesson */}
                <div className="space-y-2">
                    <Label htmlFor="lesson" className="text-sm font-medium">
                        Bài
                    </Label>
                    <Input
                        id="lesson"
                        value={question.lesson || ''}
                        onChange={(e) => handleLessonChange(e.target.value)}
                        placeholder="VD: Bài 1 - Công thức lượng giác"
                    />
                </div>

                {/* Problem Type */}
                <div className="space-y-2">
                    <Label htmlFor="problemType" className="text-sm font-medium">
                        Dạng toán
                    </Label>
                    <Input
                        id="problemType"
                        value={question.problemType || ''}
                        onChange={(e) => handleProblemTypeChange(e.target.value)}
                        placeholder="VD: Tìm giá trị lớn nhất"
                    />
                </div>
            </div>

            {/* Question Type Badge */}
            <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Loại câu hỏi:</span>
                    <span className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded">
                        {question.type === 'MCQ' ? 'Trắc nghiệm' :
                            question.type === 'SHORT_ANSWER' ? 'Tự luận ngắn' :
                                'Đúng/Sai'}
                    </span>
                </div>
            </div>
        </div>
    )
}
