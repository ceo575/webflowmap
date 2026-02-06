import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExamSuccessActions } from './_components/ExamSuccessActions'

const parseTags = (value: string | null) => {
    if (!value) return [] as string[]
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export default async function ExamSuccessPage({ searchParams }: { searchParams: Promise<{ examId?: string }> }) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== 'ADMIN') {
        redirect('/login')
    }

    const { examId } = await searchParams
    if (!examId) {
        redirect('/admin/exam')
    }

    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        select: {
            id: true,
            title: true,
            duration: true,
            subject: true,
            grade: true,
            tags: true,
            isPublic: true,
            updatedAt: true,
            _count: { select: { questions: true } },
        },
    })

    if (!exam) {
        redirect('/admin/exam')
    }

    const tags = parseTags(exam.tags)

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Thành công</h1>
                <p className="text-slate-500 mt-1">Đề thi đã được lưu thành công vào hệ thống.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>{exam.title}</span>
                        <Badge className={exam.isPublic ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}>
                            {exam.isPublic ? 'Đã publish' : 'Chưa publish'}
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-700">
                    <p><strong>Thời lượng:</strong> {exam.duration} phút</p>
                    <p><strong>Môn học:</strong> {exam.subject || 'Chưa gán môn'}</p>
                    <p><strong>Khối lớp:</strong> {exam.grade || 'Chưa gán lớp'}</p>
                    <p><strong>Số câu hỏi:</strong> {exam._count.questions}</p>
                    <div className="flex flex-wrap gap-2">
                        {tags.length > 0 ? tags.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        )) : <span className="text-slate-400">Chưa có tags</span>}
                    </div>
                    {exam.isPublic && <p><strong>Thời điểm publish:</strong> {exam.updatedAt.toLocaleString('vi-VN')}</p>}
                </CardContent>
            </Card>

            <ExamSuccessActions examId={exam.id} isPublished={exam.isPublic} />
        </div>
    )
}
