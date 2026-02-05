"use client"

import { TopNavigation } from "./_components/TopNavigation"
import { UploadSection } from "./_components/UploadSection"

export default function ExamCreatePage() {
    return (
        <>
            <TopNavigation />

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-20">
                    <UploadSection />

                    <div className="text-center text-slate-500 text-sm">
                        <p>Sau khi upload, bạn sẽ được chuyển đến trang chỉnh sửa câu hỏi</p>
                    </div>
                </div>
            </div>
        </>
    )
}
