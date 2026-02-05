"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, X, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useExamStore } from "@/stores/exam-store"
import { toast } from "sonner"

export function UploadSection() {
    const router = useRouter()
    const [isDragging, setIsDragging] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    const { setQuestions, setUploadProgress, uploadProgress } = useExamStore()

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile && droppedFile.name.endsWith('.docx')) {
            setFile(droppedFile)
            setUploadStatus('idle')
            setErrorMessage('')
        } else {
            toast.error('Vui lòng chọn file .docx')
        }
    }, [])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setUploadStatus('idle')
            setErrorMessage('')
        }
    }, [])

    const handleUpload = async () => {
        if (!file) return

        setIsUploading(true)
        setUploadStatus('processing')
        setUploadProgress(0)

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval)
                        return 90
                    }
                    return prev + 10
                })
            }, 200)

            // Upload file to API
            const formData = new FormData()
            formData.append('file', file)

            const response = await fetch('/api/exam/parse-word', {
                method: 'POST',
                body: formData,
            })

            clearInterval(progressInterval)
            setUploadProgress(100)

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to parse file')
            }

            // Store questions in Zustand
            setQuestions(data.questions)
            setUploadStatus('success')

            toast.success(`Đã tải lên ${data.count} câu hỏi!`)

            // Navigate to editor after short delay
            setTimeout(() => {
                router.push('/admin/exam/editor')
            }, 1000)

        } catch (error: any) {
            console.error('Upload error:', error)
            setUploadStatus('error')
            setErrorMessage(error.message || 'Có lỗi xảy ra khi xử lý file')
            toast.error(error.message || 'Có lỗi xảy ra khi xử lý file')
            setUploadProgress(0)
        } finally {
            setIsUploading(false)
        }
    }

    const handleRemoveFile = () => {
        setFile(null)
        setUploadStatus('idle')
        setErrorMessage('')
        setUploadProgress(0)
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg shrink-0">
                    1
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Tải lên đề thi gốc</h2>
            </div>

            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
                <CardContent className="p-8">
                    {!file ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`relative flex flex-col items-center justify-center py-12 transition-colors ${isDragging ? 'bg-emerald-50 border-emerald-300' : ''
                                }`}
                        >
                            <Upload className={`w-16 h-16 mb-4 ${isDragging ? 'text-emerald-500' : 'text-slate-400'}`} />

                            <h3 className="text-lg font-semibold text-slate-700 mb-2">
                                Kéo thả file Word (.docx) chuẩn Bộ Giáo dục vào đây
                            </h3>
                            <p className="text-sm text-slate-500 mb-4">
                                Hoặc bấm để chọn file từ máy tính
                            </p>

                            <input
                                type="file"
                                accept=".docx"
                                onChange={handleFileInput}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            <Button
                                variant="outline"
                                className="pointer-events-none"
                            >
                                Chọn file
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* File Info */}
                            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-blue-500" />
                                    <div>
                                        <p className="font-medium text-slate-900">{file.name}</p>
                                        <p className="text-sm text-slate-500">
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                </div>

                                {uploadStatus === 'idle' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleRemoveFile}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}

                                {uploadStatus === 'success' && (
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                )}

                                {uploadStatus === 'error' && (
                                    <AlertCircle className="w-6 h-6 text-red-500" />
                                )}
                            </div>

                            {/* Progress Bar */}
                            {(uploadStatus === 'processing' || uploadProgress > 0) && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Đang xử lý...</span>
                                        <span className="font-medium text-emerald-600">{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2" />
                                </div>
                            )}

                            {/* Error Message */}
                            {uploadStatus === 'error' && errorMessage && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{errorMessage}</p>
                                </div>
                            )}

                            {/* Actions */}
                            {uploadStatus === 'idle' && (
                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" onClick={handleRemoveFile}>
                                        Hủy
                                    </Button>
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                    >
                                        {isUploading ? 'Đang xử lý...' : 'Xem trước & Chỉnh sửa'}
                                    </Button>
                                </div>
                            )}

                            {uploadStatus === 'error' && (
                                <div className="flex justify-end">
                                    <Button
                                        className="bg-emerald-600 hover:bg-emerald-700"
                                        onClick={handleUpload}
                                        disabled={isUploading}
                                    >
                                        Thử lại
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    )
}
