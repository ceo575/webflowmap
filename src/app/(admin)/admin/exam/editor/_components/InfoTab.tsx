"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useExamStore } from "@/stores/exam-store"
import { useState } from "react"

export function InfoTab() {
    const { examInfo, setExamInfo } = useExamStore()
    const [tagInput, setTagInput] = useState("")

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            const newTags = [...(examInfo.tags || []), tagInput.trim()]
            setExamInfo({ tags: newTags })
            setTagInput("")
        }
    }

    const handleRemoveTag = (index: number) => {
        const newTags = examInfo.tags.filter((_, i) => i !== index)
        setExamInfo({ tags: newTags })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Thông tin bài tập</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Cấu hình cài đặt và quyền truy cập cho đề thi
                </p>
            </div>

            {/* Exam Title */}
            <div className="space-y-2">
                <Label htmlFor="examTitle" className="text-sm font-medium">
                    Tên bài tập <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="examTitle"
                    placeholder="VD: Đề thi thử THPT Quốc Gia 2024"
                    value={examInfo.title}
                    onChange={(e) => setExamInfo({ title: e.target.value })}
                    required
                />
            </div>

            {/* Duration */}
            <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                    Thời lượng làm bài (phút) <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="45"
                    value={examInfo.duration}
                    onChange={(e) => setExamInfo({ duration: parseInt(e.target.value) || 0 })}
                    required
                />
                <p className="text-xs text-slate-500">
                    Thời gian học sinh được phép làm bài
                </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                    Gán nhãn
                    <span className="text-slate-400 font-normal ml-1">- Tùy chọn</span>
                </Label>
                <Input
                    id="tags"
                    placeholder="Nhập nhãn và nhấn Enter (VD: Toán 12, Chương 1)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                />
                {examInfo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {examInfo.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="gap-1">
                                {tag}
                                <button
                                    onClick={() => handleRemoveTag(index)}
                                    className="ml-1 hover:bg-slate-200 rounded-full p-0.5"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Subject & Grade */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">
                        Môn học
                    </Label>
                    <Input
                        id="subject"
                        placeholder="VD: Toán"
                        value={examInfo.subject || ''}
                        onChange={(e) => setExamInfo({ subject: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium">
                        Lớp
                    </Label>
                    <Input
                        id="grade"
                        placeholder="VD: 12"
                        value={examInfo.grade || ''}
                        onChange={(e) => setExamInfo({ grade: e.target.value })}
                    />
                </div>
            </div>

            {/* Privacy Setting */}
            <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="isPublic" className="text-sm font-medium">
                            Công khai đề thi
                        </Label>
                        <p className="text-xs text-slate-500">
                            Cho phép tất cả học sinh truy cập
                        </p>
                    </div>
                    <Switch
                        id="isPublic"
                        checked={examInfo.isPublic}
                        onCheckedChange={(checked) => setExamInfo({ isPublic: checked })}
                    />
                </div>

                {!examInfo.isPublic && (
                    <div className="space-y-2 pl-4 border-l-2 border-slate-200">
                        <Label htmlFor="classes" className="text-sm font-medium text-slate-600">
                            Chỉ định lớp học cụ thể
                        </Label>
                        <Input
                            id="classes"
                            placeholder="Nhập tên lớp (VD: 12A1, 12A2)"
                            value={examInfo.classes.join(', ')}
                            onChange={(e) => setExamInfo({
                                classes: e.target.value.split(',').map(c => c.trim()).filter(Boolean)
                            })}
                        />
                        <p className="text-xs text-slate-500">
                            Chỉ học sinh trong các lớp này mới thấy đề thi
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
