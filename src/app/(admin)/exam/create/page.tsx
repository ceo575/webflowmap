"use client"

import { TopNavigation } from "./_components/TopNavigation"
import { UploadSection } from "./_components/UploadSection"
import { QuestionList } from "./_components/QuestionList"

export default function ExamCreatePage() {
    return (
        <>
            <TopNavigation />

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-5xl mx-auto flex flex-col gap-10 pb-20">
                    <UploadSection />
                    <QuestionList />
                </div>
            </div>
        </>
    )
}
