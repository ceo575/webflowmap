import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText } from "lucide-react"

export default async function MyExamsPage() {
    const session = await auth()

    if (!session?.user || !(session.user as any).id) {
        redirect("/login")
    }

    const student = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { grade: true, name: true },
    })

    const exams = await prisma.exam.findMany({
        where: {
            isPublic: true,
            ...(student?.grade
                ? {
                    OR: [
                        { grade: student.grade },
                        { grade: null },
                    ],
                }
                : {}),
        },
        select: {
            id: true,
            title: true,
            duration: true,
            subject: true,
            grade: true,
            tags: true,
            isPublic: true,
            _count: {
                select: {
                    questions: true,
                },
            },
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    })

    const parseTags = (value: string | null) => {
        if (!value) return [] as string[]
        try {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }

    const mappedExams = exams.map((exam) => ({
        id: exam.id,
        title: exam.title,
        duration: exam.duration,
        subject: exam.subject,
        grade: exam.grade,
        tags: parseTags(exam.tags),
        isPublished: exam.isPublic,
        questionCount: exam._count.questions,
    }))

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Bài thi của tôi</h1>
                <p className="text-slate-500 mt-1">
                    {student?.name ? `Xin chào ${student.name},` : ""} danh sách đề thi đã xuất bản phù hợp với lớp của bạn.
                </p>
                {student?.grade ? (
                    <p className="text-sm text-emerald-700 mt-2">Đang lọc theo lớp: {student.grade}</p>
                ) : (
                    <p className="text-sm text-amber-600 mt-2">Tài khoản chưa có thông tin lớp, đang hiển thị tất cả đề thi công khai.</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mappedExams.map((exam) => (
                    <Card key={exam.id} className="border-slate-200">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                                <CardTitle className="text-lg leading-tight">{exam.title}</CardTitle>
                                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Published</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center text-sm text-slate-600 gap-2">
                                <Clock className="w-4 h-4" />
                                {exam.duration} phút
                            </div>
                            <div className="flex items-center text-sm text-slate-600 gap-2">
                                <FileText className="w-4 h-4" />
                                {exam.questionCount} câu hỏi
                            </div>
                            <div className="text-sm text-slate-600">
                                {exam.subject || "Chưa gán môn"} {exam.grade ? `• Lớp ${exam.grade}` : ""}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {exam.tags.length > 0 ? exam.tags.map((tag: string) => (
                                    <Badge key={`${exam.id}-${tag}`} variant="secondary">{tag}</Badge>
                                )) : (
                                    <span className="text-xs text-slate-400">Chưa có nhãn</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {mappedExams.length === 0 && (
                <Card>
                    <CardContent className="py-10 text-center text-slate-500">
                        Chưa có đề thi công khai phù hợp.
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
