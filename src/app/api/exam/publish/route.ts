import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { z } from 'zod'

const publishPayloadSchema = z.object({
    examId: z.string().trim().min(1, 'examId is required'),
})

export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        const actorId = (session?.user as any)?.id as string | undefined
        const role = (session?.user as any)?.role as string | undefined

        if (!actorId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const parsed = publishPayloadSchema.safeParse(await req.json())
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid payload' }, { status: 400 })
        }

        const exam = await prisma.exam.findUnique({
            where: { id: parsed.data.examId },
            select: { id: true, teacherId: true },
        })

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 })
        }

        const canPublish = role === 'ADMIN' || exam.teacherId === actorId
        if (!canPublish) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const updatedExam = await prisma.exam.update({
            where: { id: parsed.data.examId },
            data: {
                isPublic: true,
            },
            select: {
                id: true,
                isPublic: true,
                updatedAt: true,
            },
        })

        return NextResponse.json({
            ok: true,
            examId: updatedExam.id,
            isPublished: updatedExam.isPublic,
            publishedAt: updatedExam.updatedAt.toISOString(),
        })
    } catch (error: any) {
        console.error('Error publishing exam:', error)
        return NextResponse.json({ error: error.message || 'Failed to publish exam' }, { status: 500 })
    }
}
