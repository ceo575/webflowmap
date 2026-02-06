import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isLegacySchemaError } from '@/lib/prisma-compat'
import { auth } from '@/auth'
import { QuestionType } from '@prisma/client'
import { z } from 'zod'

const questionSchema = z.object({
    content: z.string().trim().min(1, 'Question content is required'),
    type: z.nativeEnum(QuestionType),
    options: z.array(z.string().trim().min(1)).optional(),
    correctOptionIndex: z.number().int().min(0).max(3).optional(),
    correctAnswer: z.string().optional().default(''),
    explanation: z.string().optional().nullable(),
    solution: z.string().optional().nullable(),
    videoUrl: z.string().url('Invalid video link format').optional().or(z.literal('')).nullable(),
    chapter: z.string().optional().nullable(),
    lesson: z.string().optional().nullable(),
    problemType: z.string().optional().nullable(),
    level: z.string().optional().nullable(),
    flowThinking: z
        .object({
            identify: z.string(),
            method: z.string(),
            execution: z.string(),
            conclusion: z.string(),
        })
        .optional()
        .nullable(),
    tags: z.array(z.string()).optional().nullable(),
    imageBase64: z.string().optional().nullable(),
})

const payloadSchema = z.object({
    examInfo: z
        .object({
            title: z.string().trim().min(1, 'Title is required'),
            duration: z.number().int().min(1, 'Duration must be greater than 0'),
            subject: z.string().trim().optional().nullable(),
            grade: z.string().trim().optional().nullable(),
            tags: z.array(z.string()).optional().default([]),
            classes: z.array(z.string()).optional().default([]),
            fullVideoUrl: z.string().url('Invalid full exam video URL').optional().or(z.literal('')).nullable(),
            pdfUrl: z.string().url('Invalid PDF URL').optional().or(z.literal('')).nullable(),
            isPublished: z.boolean().optional(),
            isPublic: z.boolean().optional(),
        })
        .optional(),
    title: z.string().trim().optional(),
    duration: z.number().int().optional(),
    subject: z.string().trim().optional().nullable(),
    grade: z.string().trim().optional().nullable(),
    tags: z.array(z.string()).optional(),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
})

function normalizePayload(body: unknown) {
    const parsed = payloadSchema.safeParse(body)
    if (!parsed.success) {
        return {
            ok: false as const,
            error: parsed.error.issues[0]?.message || 'Invalid payload',
        }
    }

    const data = parsed.data
    const normalizedExamInfo = data.examInfo
        ? data.examInfo
        : {
            title: data.title || '',
            duration: data.duration || 0,
            subject: data.subject,
            grade: data.grade,
            tags: data.tags || [],
            classes: [],
            fullVideoUrl: null,
            pdfUrl: null,
            isPublished: false,
            isPublic: false,
        }

    return {
        ok: true as const,
        examInfo: normalizedExamInfo,
        questions: data.questions,
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session || (session.user as any)?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const normalized = normalizePayload(await req.json())
        if (!normalized.ok) {
            return NextResponse.json({ error: normalized.error }, { status: 400 })
        }

        const { examInfo, questions } = normalized

        for (const question of questions) {
            if (question.type === 'MCQ') {
                if (!question.options || question.options.length !== 4) {
                    return NextResponse.json({ error: 'MCQ questions must include exactly 4 options' }, { status: 400 })
                }
                if (typeof question.correctOptionIndex !== 'number' || question.correctOptionIndex < 0 || question.correctOptionIndex > 3) {
                    return NextResponse.json({ error: 'MCQ questions must include a valid correctOptionIndex from 0 to 3' }, { status: 400 })
                }
            }
        }

        const teacherId = (session.user as any).id

        const isPublished = Boolean(examInfo.isPublished ?? examInfo.isPublic)

        let result
        try {
            result = await prisma.$transaction(async (tx) => {
                const exam = await tx.exam.create({
                    data: {
                        title: examInfo.title,
                        duration: examInfo.duration,
                        grade: examInfo.grade || null,
                        subject: examInfo.subject || null,
                        teacherId,
                        fullVideoUrl: examInfo.fullVideoUrl || null,
                        pdfUrl: examInfo.pdfUrl || null,
                        tags: examInfo.tags?.length ? JSON.stringify(examInfo.tags) : null,
                        classes: examInfo.classes?.length ? JSON.stringify(examInfo.classes) : null,
                        isPublic: isPublished,
                    },
                })

                const createManyResult = await tx.question.createMany({
                    data: questions.map((q) => ({
                        examId: exam.id,
                        content: q.content,
                        type: q.type,
                        options: q.options ? JSON.stringify(q.options) : null,
                        correctAnswer:
                            typeof q.correctOptionIndex === 'number'
                                ? String.fromCharCode(65 + q.correctOptionIndex)
                                : q.correctAnswer || '',
                        explanation: q.explanation || q.solution || null,
                        videoUrl: q.videoUrl || null,
                        flowThinking: q.flowThinking ? JSON.stringify(q.flowThinking) : null,
                        chapter: q.chapter || null,
                        lesson: q.lesson || null,
                        problemType: q.problemType || null,
                        level: q.level || null,
                        tags: q.tags?.length ? JSON.stringify(q.tags) : null,
                        imageBase64: q.imageBase64 || null,
                    })),
                })

                return {
                    examId: exam.id,
                    isPublished: exam.isPublic,
                    summary: {
                        title: exam.title,
                        duration: exam.duration,
                        subject: exam.subject,
                        grade: exam.grade,
                        tags: exam.tags ? (JSON.parse(exam.tags) as string[]) : [],
                        questionCount: createManyResult.count,
                    },
                }
            })
        } catch (error) {
            if (!isLegacySchemaError(error)) throw error

            result = await prisma.$transaction(async (tx) => {
                const exam = await tx.exam.create({
                    data: {
                        title: examInfo.title,
                        duration: examInfo.duration,
                        grade: examInfo.grade || null,
                        subject: examInfo.subject || null,
                        teacherId,
                    },
                })

                const createManyResult = await tx.question.createMany({
                    data: questions.map((q) => ({
                        examId: exam.id,
                        content: q.content,
                        type: q.type,
                        options: q.options ? JSON.stringify(q.options) : null,
                        correctAnswer:
                            typeof q.correctOptionIndex === 'number'
                                ? String.fromCharCode(65 + q.correctOptionIndex)
                                : q.correctAnswer || '',
                        explanation: q.explanation || q.solution || null,
                    })),
                })

                return {
                    examId: exam.id,
                    isPublished,
                    summary: {
                        title: exam.title,
                        duration: exam.duration,
                        subject: exam.subject,
                        grade: exam.grade,
                        tags: examInfo.tags || [],
                        questionCount: createManyResult.count,
                    },
                }
            })
        }

        return NextResponse.json({ ok: true, ...result })
    } catch (error: any) {
        console.error('Error saving exam:', error)
        return NextResponse.json({ error: error.message || 'Failed to save exam' }, { status: 500 })
    }
}
