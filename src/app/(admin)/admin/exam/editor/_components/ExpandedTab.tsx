"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Upload, Link as LinkIcon } from "lucide-react"
import { useExamStore } from "@/stores/exam-store"

export function ExpandedTab() {
    const { fullVideoUrl, pdfUrl, setFullVideoUrl, setPdfUrl } = useExamStore()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Tài liệu mở rộng</h3>
                <p className="text-sm text-slate-500 mb-6">
                    Thêm video lời giải toàn bộ đề thi và tài liệu đính kèm
                </p>
            </div>

            {/* Full Video URL */}
            <div className="space-y-2">
                <Label htmlFor="fullVideoUrl" className="text-sm font-medium">
                    Lời giải toàn bài (Video)
                    <span className="text-slate-400 font-normal ml-1">- Tùy chọn</span>
                </Label>
                <div className="relative">
                    <Input
                        id="fullVideoUrl"
                        type="url"
                        placeholder="https://youtube.com/... hoặc https://drive.google.com/..."
                        value={fullVideoUrl || ''}
                        onChange={(e) => setFullVideoUrl(e.target.value)}
                        className="pl-10"
                    />
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                    Link video giải chi tiết toàn bộ đề thi (Google Drive, YouTube, v.v.)
                </p>
            </div>

            {/* PDF URL */}
            <div className="space-y-2">
                <Label htmlFor="pdfUrl" className="text-sm font-medium">
                    File nghe / Tài liệu PDF
                    <span className="text-slate-400 font-normal ml-1">- Tùy chọn</span>
                </Label>
                <div className="relative">
                    <Input
                        id="pdfUrl"
                        type="url"
                        placeholder="https://drive.google.com/file/..."
                        value={pdfUrl || ''}
                        onChange={(e) => setPdfUrl(e.target.value)}
                        className="pl-10"
                    />
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-500">
                    Link file PDF hoặc file nghe (nếu có)
                </p>
            </div>

            {/* Preview Section */}
            {(fullVideoUrl || pdfUrl) && (
                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-emerald-900 mb-3">Xem trước tài liệu</h4>
                    <div className="space-y-2 text-sm">
                        {fullVideoUrl && (
                            <div className="flex items-center gap-2">
                                <LinkIcon className="w-4 h-4 text-emerald-600" />
                                <a
                                    href={fullVideoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:underline truncate"
                                >
                                    Video lời giải toàn bài
                                </a>
                            </div>
                        )}
                        {pdfUrl && (
                            <div className="flex items-center gap-2">
                                <Upload className="w-4 h-4 text-emerald-600" />
                                <a
                                    href={pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-emerald-600 hover:underline truncate"
                                >
                                    Tài liệu PDF
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
