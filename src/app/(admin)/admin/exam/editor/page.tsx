"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PreviewPanel } from "./_components/PreviewPanel"
import { EditPanel } from "./_components/EditPanel"
import { ExpandedTab } from "./_components/ExpandedTab"
import { InfoTab } from "./_components/InfoTab"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useExamStore } from "@/stores/exam-store"
import { toast } from "sonner"

export default function ExamEditorPage() {
    const router = useRouter()
    const { questions, examInfo } = useExamStore()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState("answers")
    const [isSaving, setIsSaving] = useState(false)

    // Set first question as selected on mount
    useEffect(() => {
        if (questions.length > 0 && !selectedId) {
            setSelectedId(questions[0].id)
        }
    }, [questions, selectedId])

    const selectedQuestion = questions.find(q => q.id === selectedId) || null

    const handleSave = async () => {
        // Validate required fields
        if (!examInfo.title) {
            toast.error("Vui lòng nhập tên bài tập")
            setActiveTab("info")
            return
        }

        if (questions.length === 0) {
            toast.error("Vui lòng thêm câu hỏi")
            return
        }

        setIsSaving(true)
        try {
            // Call save API
            const response = await fetch('/api/exam/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    examInfo,
                    questions,
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.ok) {
                throw new Error(data.error || 'Failed to save exam')
            }

            toast.success('Tạo đề thành công!')

            router.push(`/admin/exam/success?examId=${data.examId}`)

        } catch (error: any) {
            console.error('Save error:', error)
            toast.error(error.message || 'Có lỗi xảy ra khi lưu đề thi')
        } finally {
            setIsSaving(false)
        }
    }

    const handleNextStep = () => {
        if (activeTab === "answers") {
            setActiveTab("expanded")
        } else if (activeTab === "expanded") {
            setActiveTab("info")
        } else {
            handleSave()
        }
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">
            {/* Header */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
                <nav className="flex items-center text-sm">
                    <span className="text-slate-500 hover:text-[#059669] cursor-pointer transition">Kho đề thi</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />
                    <span className="text-slate-500 hover:text-[#059669] cursor-pointer transition">Tạo đề mới</span>
                    <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />
                    <span className="font-bold text-slate-900">Chỉnh sửa</span>
                </nav>
                <Button
                    className="bg-[#059669] hover:bg-emerald-700 text-white font-medium shadow-sm min-w-[100px]"
                    onClick={handleNextStep}
                    disabled={isSaving}
                >
                    {isSaving ? 'Đang lưu...' : (activeTab === "info" ? 'Hoàn tất' : 'Tiếp tục')}
                </Button>
            </header>

            {/* Main Content (Split Screen) */}
            <main className="flex-1 flex overflow-hidden">
                {/* Left Panel: Preview (60%) */}
                <section className="w-full lg:w-3/5 overflow-hidden flex flex-col">
                    <PreviewPanel
                        questions={questions}
                        selectedId={selectedId}
                        onSelect={setSelectedId}
                    />
                </section>

                {/* Right Panel: Edit Tabs (40%) */}
                <section className="w-full lg:w-2/5 bg-white border-l border-slate-200 flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <TabsList className="w-full justify-start rounded-none border-b bg-slate-50 h-12">
                            <TabsTrigger value="answers" className="data-[state=active]:bg-white">
                                1. Đáp án
                            </TabsTrigger>
                            <TabsTrigger value="expanded" className="data-[state=active]:bg-white">
                                2. Mở rộng
                            </TabsTrigger>
                            <TabsTrigger value="info" className="data-[state=active]:bg-white">
                                3. Thông tin bài tập
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="answers" className="flex-1 overflow-auto m-0 p-6">
                            <EditPanel question={selectedQuestion} />
                        </TabsContent>

                        <TabsContent value="expanded" className="flex-1 overflow-auto m-0 p-6">
                            <ExpandedTab />
                        </TabsContent>

                        <TabsContent value="info" className="flex-1 overflow-auto m-0 p-6">
                            <InfoTab />
                        </TabsContent>
                    </Tabs>
                </section>
            </main>
        </div>
    )
}
