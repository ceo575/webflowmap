'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

export function ExamSuccessActions({ examId, isPublished }: { examId: string; isPublished: boolean }) {
    const router = useRouter()
    const [publishing, setPublishing] = useState(false)

    const publishExam = async () => {
        setPublishing(true)
        try {
            const response = await fetch('/api/exam/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error || 'Publish failed')
            }
            toast.success('Đã publish đề thi thành công')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Không thể publish đề thi')
        } finally {
            setPublishing(false)
        }
    }

    return (
        <div className="flex flex-wrap gap-3">
            <Button asChild>
                <Link href="/admin/exam">Xem trong kho đề</Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href="/admin/exam/create">Tạo đề mới</Link>
            </Button>
            {!isPublished && (
                <Button variant="secondary" onClick={publishExam} disabled={publishing}>
                    {publishing ? 'Đang publish...' : 'Publish đề'}
                </Button>
            )}
        </div>
    )
}
