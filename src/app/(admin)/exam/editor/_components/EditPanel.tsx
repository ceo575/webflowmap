"use client"

import { useState } from "react"
import { Question } from "../types"
import { Check, Type, Image, FileText, Video, MessageSquare, Lightbulb, Headphones, Link as LinkIcon, Plus, X, Clock, Tag, Eye, ChevronDown } from "lucide-react"

interface EditPanelProps {
    question: Question | null
}

type Tab = 'answers' | 'expanded' | 'info';

export function EditPanel({ question }: EditPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('answers')
    const [videoLink, setVideoLink] = useState("")
    const [addedLinks, setAddedLinks] = useState<string[]>([])

    const addLink = () => {
        if (videoLink) {
            setAddedLinks([...addedLinks, videoLink])
            setVideoLink("")
        }
    }

    const removeLink = (index: number) => {
        setAddedLinks(addedLinks.filter((_, i) => i !== index))
    }

    if (!question) {
        return (
            <aside className="w-full lg:w-2/5 border-l border-slate-200 bg-slate-50 p-6 flex items-center justify-center text-slate-400">
                Chọn một câu hỏi để chỉnh sửa
            </aside>
        )
    }

    return (
        <aside className="w-full lg:w-2/5 flex flex-col border-l border-slate-200 bg-slate-100/50 h-full overflow-hidden">
            {/* Tabs */}
            <div className="flex bg-white border-b border-slate-200 shrink-0">
                <button
                    onClick={() => setActiveTab('answers')}
                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'answers' ? 'text-white bg-blue-500 border-blue-500' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
                >
                    1. Đáp án
                </button>
                <button
                    onClick={() => setActiveTab('expanded')}
                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'expanded' ? 'text-white bg-blue-500 border-blue-500' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
                >
                    2. Mở rộng
                </button>
                <button
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${activeTab === 'info' ? 'text-white bg-blue-500 border-blue-500' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
                >
                    3. Thông tin
                </button>
            </div>

            {/* Content per Tab */}
            {activeTab === 'answers' && (
                <>
                    {/* Toolbar */}
                    <div className="bg-blue-800 p-4 shadow-md z-10 shrink-0">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <label className="text-white text-xs font-semibold uppercase">Điểm số</label>
                                <input
                                    type="number"
                                    className="w-16 h-8 rounded text-center text-sm font-bold border-none focus:ring-2 focus:ring-blue-400 text-slate-900"
                                    defaultValue={question.points}
                                />
                            </div>
                            <div className="ml-auto flex gap-2">
                                <button className="bg-blue-700 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded shadow-sm border border-blue-600 transition">
                                    Lưu ý
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                            {question.title}: {question.type === 'multiple_choice' ? 'Trắc nghiệm' : question.type === 'true_false' ? 'Đúng/Sai' : 'Tự luận'}
                        </div>

                        <div className="bg-white border-l-4 border-l-blue-500 rounded border border-slate-200 p-3 shadow-sm">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-blue-600 font-bold text-sm">Chỉnh sửa chi tiết</span>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="text-xs font-medium text-slate-500">Loại câu hỏi</label>
                                    <select
                                        className="col-span-2 text-xs border-slate-200 rounded bg-slate-50 text-slate-800 py-1 pl-2 pr-6 focus:ring-blue-500 border-none ring-1 ring-slate-200"
                                        defaultValue={question.type}
                                    >
                                        <option value="multiple_choice">Trắc nghiệm</option>
                                        <option value="true_false">Đúng / Sai</option>
                                        <option value="short_answer">Điền khuyết</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="text-xs font-medium text-slate-500">Đáp án đúng</label>
                                    <input
                                        type="text"
                                        className="col-span-2 text-xs border-slate-200 rounded bg-white text-slate-800 py-1 px-2 focus:ring-blue-500 border-none ring-1 ring-slate-200"
                                        defaultValue={
                                            question.type === 'short_answer' ? question.correctAnswer :
                                                question.answers?.find(a => a.isCorrect)?.label || "Tùy chọn"
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-3 items-center gap-2">
                                    <label className="text-xs font-medium text-slate-500">Phân loại</label>
                                    <input
                                        type="text"
                                        className="col-span-2 text-xs border-slate-200 rounded bg-white text-slate-800 py-1 px-2 focus:ring-blue-500 border-none ring-1 ring-slate-200"
                                        placeholder="Chương, bài, dạng..."
                                        defaultValue={question.level}
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                                    <span className="text-xs text-slate-400">Công cụ</span>
                                    <div className="flex gap-2 ml-auto">
                                        <Type className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-pointer" />
                                        <Image className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-pointer" />
                                        <FileText className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-pointer" />
                                        <Video className="w-4 h-4 text-slate-400 hover:text-blue-600 cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'expanded' && (
                <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in fade-in duration-300">
                    {/* Solution Text Block */}
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Lightbulb className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-sm font-bold text-slate-800">Lời giải toàn bài</h3>
                                <div className="bg-slate-100 p-1.5 rounded-full hover:bg-slate-200 cursor-pointer">
                                    <CloudUploadIcon className="w-4 h-4 text-slate-600" />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Học sinh có thể xem lời giải sau khi làm bài.</p>
                        </div>
                    </div>

                    {/* Video Solution Block */}
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Video className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-800">Video lời giải toàn bài</h3>
                                    <p className="text-xs text-slate-500">Học sinh có thể xem video lời giải sau khi làm bài.</p>
                                </div>
                                <div className="bg-blue-50 p-1.5 rounded-full cursor-pointer hover:bg-blue-100">
                                    <LinkIcon className="w-4 h-4 text-blue-600" />
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <LinkIcon className="w-4 h-4 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400"
                                    placeholder="Đính kèm link Video tại đây ..."
                                    value={videoLink}
                                    onChange={(e) => setVideoLink(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addLink()}
                                />
                                {videoLink && (
                                    <button onClick={() => setVideoLink("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Added Links List */}
                            {addedLinks.length > 0 && (
                                <div className="space-y-2">
                                    {addedLinks.map((link, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded text-xs text-blue-700">
                                            <Video className="w-3 h-3" />
                                            <span className="truncate flex-1">{link}</span>
                                            <button onClick={() => removeLink(idx)} className="hover:text-red-500">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Link Button */}
                            <button
                                onClick={addLink}
                                className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors ml-auto"
                            >
                                <Plus className="w-3 h-3" /> Thêm link video
                            </button>
                        </div>
                    </div>

                    {/* Audio File Block */}
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Headphones className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h3 className="text-sm font-bold text-slate-800">Thêm file nghe cho toàn bài</h3>
                                <div className="bg-slate-100 p-1.5 rounded-full hover:bg-slate-200 cursor-pointer">
                                    <CloudUploadIcon className="w-4 h-4 text-slate-600" />
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Giáo viên có thể tải lên một hoặc nhiều file nghe.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'info' && (
                <div className="flex-1 overflow-y-auto p-6 animate-in fade-in duration-300">
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        {/* Exam Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                                Tên bài tập <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="w-full rounded-md border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm py-2.5 px-3 text-slate-700 placeholder:text-slate-400"
                                placeholder="Nhập tên bài tập..."
                                defaultValue="Bài tập ôn tập chương 1"
                            />
                        </div>

                        {/* Duration */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-slate-800">
                                    Thời lượng làm bài và nộp bài (phút)
                                </label>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#059669]"></div>
                                </div>
                            </div>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Clock className="w-5 h-5" />
                                </span>
                                <input
                                    type="number"
                                    className="w-full pl-10 rounded-md border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm py-2.5 px-3 text-slate-700"
                                    placeholder="45"
                                />
                            </div>
                        </div>

                        {/* Labels */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                                Gán nhãn
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Tag className="w-5 h-5" />
                                </span>
                                <input
                                    type="text"
                                    className="w-full pl-10 rounded-md border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm py-2.5 px-3 text-slate-700 placeholder:text-slate-400"
                                    placeholder="Ví dụ: Kiểm tra 15p, Học kỳ I..."
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    Toán 12
                                    <button className="hover:text-emerald-900 flex items-center"><X className="w-3 h-3" /></button>
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    Giải tích
                                    <button className="hover:text-emerald-900 flex items-center"><X className="w-3 h-3" /></button>
                                </span>
                            </div>
                        </div>

                        {/* Permissions */}
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">
                                Quyền của học sinh
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Eye className="w-5 h-5" />
                                </span>
                                <select className="w-full pl-10 pr-10 rounded-md border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm py-2.5 px-3 appearance-none text-slate-700">
                                    <option>Không xem điểm</option>
                                    <option>Chỉ xem điểm</option>
                                    <option selected>Xem điểm, đáp án và lời giải</option>
                                </select>
                                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </aside>
    )
}

function CloudUploadIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" /><path d="M12 12v9" /><path d="m16 16-4-4-4 4" /></svg>
    )
}

