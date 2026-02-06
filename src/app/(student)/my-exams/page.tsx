import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, FileText, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ExamListItem {
  id: string
  title: string
  duration: number
  subject: string | null
  grade: string | null
  tags: string[]
  questionCount: number
}

const parseTags = (value: string | null) => {
  if (!value) return [] as string[]
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map((tag) => String(tag)) : []
  } catch {
    return []
  }
}

export default async function MyExamsPage() {
  const session = await auth()

  if (!session?.user || !(session.user as any).id) {
    redirect("/login")
  }

  const studentName = session.user.name || ""
  const studentGrade = (session.user as any).grade as string | undefined

  let exams: ExamListItem[] = []
  let loadError = ""

  try {
    const rows = await prisma.exam.findMany({
      where: {
        isPublic: true,
        ...(studentGrade
          ? {
              OR: [{ grade: studentGrade }, { grade: null }],
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
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    exams = rows.map((exam) => ({
      id: exam.id,
      title: exam.title,
      duration: exam.duration,
      subject: exam.subject,
      grade: exam.grade,
      tags: parseTags(exam.tags),
      questionCount: exam._count.questions,
    }))
  } catch (error) {
    console.error("[my-exams] failed to load exams", error)
    loadError = "Không thể tải danh sách đề thi lúc này. Vui lòng thử lại sau."
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bài thi của tôi</h1>
        <p className="text-slate-500 mt-1">
          {studentName ? `Xin chào ${studentName}, ` : ""}
          danh sách đề thi đã xuất bản phù hợp với lớp của bạn.
        </p>
        {studentGrade ? (
          <p className="text-sm text-emerald-700 mt-2">Đang lọc theo lớp: {studentGrade}</p>
        ) : (
          <p className="text-sm text-amber-600 mt-2">Tài khoản chưa có thông tin lớp, đang hiển thị tất cả đề thi công khai.</p>
        )}
      </div>

      {loadError && (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="py-4 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {loadError}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {exams.map((exam) => (
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
                {exam.tags.length > 0 ? (
                  exam.tags.map((tag: string) => (
                    <Badge key={`${exam.id}-${tag}`} variant="secondary">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Chưa có nhãn</span>
                )}
              </div>
              <div className="pt-2">
                <Button asChild className="w-full bg-[#059669] hover:bg-emerald-700 text-white">
                  <Link href={`/exam/${exam.id}/take`}>Làm đề thi</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loadError && exams.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-slate-500">Chưa có đề thi công khai phù hợp.</CardContent>
        </Card>
      )}
    </div>
  )
}
