import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth()
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { examInfo, questions } = await req.json()

        // Validation
        if (!examInfo?.title || !questions || questions.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const teacherId = (session.user as any).id

        // Use Prisma transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create Exam
            const isPublished = Boolean(examInfo.isPublished ?? examInfo.isPublic)

            const exam = await tx.exam.create({
                data: {
                    title: examInfo.title,
                    duration: examInfo.duration || 45,
                    grade: examInfo.grade || null,
                    subject: examInfo.subject || null,
                    teacherId,
                    fullVideoUrl: examInfo.fullVideoUrl || null,
                    pdfUrl: examInfo.pdfUrl || null,
                    tags: examInfo.tags ? JSON.stringify(examInfo.tags) : null,
                    classes: examInfo.classes ? JSON.stringify(examInfo.classes) : null,
                    isPublic: isPublished,
                },
            })

            // 2. Create Questions
            const questionData = questions.map((q: any) => {
                const hasCorrectAnswer = typeof q.correctAnswer === 'string' && q.correctAnswer.trim().length > 0
                const fallbackCorrectAnswer =
                    typeof q.correctOptionIndex === 'number'
                        ? String.fromCharCode(65 + q.correctOptionIndex)
                        : null

                return {
                    examId: exam.id,
                    content: q.content,
                    type: q.type,
                    options: q.options ? JSON.stringify(q.options) : null,
                    correctAnswer: hasCorrectAnswer ? q.correctAnswer : (fallbackCorrectAnswer || ''),
                    explanation: q.explanation || q.solution || null,
                    videoUrl: q.videoUrl || null,
                    flowThinking: q.flowThinking ? JSON.stringify(q.flowThinking) : null,
                    chapter: q.chapter || null,
                    lesson: q.lesson || null,
                    problemType: q.problemType || null,
                    level: q.level || null,
                    tags: q.tags ? JSON.stringify(q.tags) : null,
                    imageBase64: q.imageBase64 || null,
                }
            })

            const createManyResult = await tx.question.createMany({
                data: questionData,
            })

            return {
                examId: exam.id,
                summary: {
                    title: exam.title,
                    duration: exam.duration,
                    questionCount: createManyResult.count,
                    isPublished: exam.isPublic,
                },
            }
        })

        return NextResponse.json({
            success: true,
            examId: result.examId,
            summary: result.summary,
            message: 'Exam created successfully',
        })

    } catch (error: any) {
        console.error('Error saving exam:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to save exam' },
            { status: 500 }
        )
    }
}
