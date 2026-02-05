"use client"

import { useState } from "react"
import { CloudUpload, FileText } from "lucide-react"

export function UploadSection() {
    const [isDragging, setIsDragging] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(45) // Mock progress

    return (
        <section className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#10b763] text-white flex items-center justify-center text-xs font-bold">1</div>
                    Tải lên đề thi gốc
                </h2>
            </div>

            {/* Dropzone */}
            <div
                className={`group relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl bg-slate-50 transition-all cursor-pointer ${isDragging ? 'border-[#10b763] bg-emerald-50' : 'border-slate-300 hover:bg-slate-100 hover:border-[#10b763]'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false) }}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <div className={`mb-4 p-4 rounded-full transition-all ${isDragging ? 'bg-[#10b763]/20 text-[#10b763]' : 'bg-slate-100 text-slate-400 group-hover:text-[#10b763] group-hover:bg-[#10b763]/10'}`}>
                        <CloudUpload className="w-10 h-10" />
                    </div>
                    <p className={`mb-2 text-lg font-semibold transition-colors ${isDragging ? 'text-[#10b763]' : 'text-slate-700 group-hover:text-[#10b763]'}`}>
                        Kéo thả file Word (.docx) chuẩn Bộ Giáo dục vào đây
                    </p>
                    <p className="text-sm text-slate-500">Hoặc bấm để chọn file từ máy tính</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden" />
            </div>

            {/* Progress Bar (Active State) */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col gap-3 shadow-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">De_thi_thu_tot_nghiep_2024.docx</span>
                            <span className="text-xs text-slate-500">2.4 MB • Đang tải lên...</span>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-[#10b763]">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#10b763] h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                </div>
            </div>
        </section>
    )
}
