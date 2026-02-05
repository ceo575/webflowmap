"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft, Flame, LogOut, Flag, Lightbulb, X, Check,
    AlertCircle, Play, Film, RotateCcw, ArrowRight, MonitorPlay
} from "lucide-react";
import { cn } from "@/lib/utils";
import "katex/dist/katex.min.css";
import katex from "katex";
import { mockPracticeQuestions } from "./mockData";
import { PracticeQuestion } from "./types";

// Helper to render latex (reused)
const LatexContent = ({ content }: { content: string }) => {
    const parts = content.split(/(\$[^$]+\$)/g);
    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    const math = part.slice(1, -1);
                    try {
                        const html = katex.renderToString(math, {
                            throwOnError: false,
                            displayMode: false,
                        });
                        return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
                    } catch (e) {
                        return <span key={index} className="text-red-500">{part}</span>;
                    }
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

export default function PracticeTopicPage() {
    const router = useRouter();
    const params = useParams();

    // Logic State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [activeTab, setActiveTab] = useState<'solution' | 'video'>('solution');

    // Derived State
    const currentQuestion = mockPracticeQuestions[currentQuestionIndex];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const totalQuestions = mockPracticeQuestions.length;

    // Reset state when question changes
    useEffect(() => {
        setSelectedOption(null);
        setIsSubmitted(false);
        setShowHint(false);
        setActiveTab('solution');
    }, [currentQuestionIndex]);

    const handleOptionSelect = (optionId: string) => {
        if (isSubmitted) return;
        setSelectedOption(optionId);
    };

    const handleSubmit = () => {
        if (!selectedOption) return;
        setIsSubmitted(true);
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // End of practice
            router.push('/dashboard');
        }
    };

    const handleRetry = () => {
        setSelectedOption(null);
        setIsSubmitted(false);
        setShowHint(false);
    };

    // Video Time Formatting
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f5f8f7] text-slate-900 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 h-16">
                <div className="max-w-[1200px] mx-auto px-4 h-full flex items-center justify-between">
                    {/* Left: Back */}
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>

                    {/* Center: Title & Progress */}
                    <div className="flex flex-col items-center justify-center gap-0.5">
                        <h1 className="text-sm md:text-base font-bold text-slate-900 leading-tight">
                            Luyện tập: Cực trị hàm hợp
                        </h1>
                        <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                            <div className="flex items-center gap-1 text-orange-500">
                                <Flame className="w-4 h-4 fill-orange-500" />
                                <span>Streak 12</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-slate-600">Câu {currentQuestionIndex + 1}/{totalQuestions}</span>
                        </div>
                    </div>

                    {/* Right: End Session */}
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="hidden sm:flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-1" />
                        Kết thúc
                    </button>
                    <button className="sm:hidden p-2 text-slate-500">
                        <LogOut className="w-6 h-6" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-[800px] mx-auto p-4 md:p-6 pb-32">
                {/* Question Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                    <div className="flex justify-between items-start mb-4">
                        <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Mức độ: {currentQuestion.difficulty}
                        </span>
                        <button className="text-slate-400 hover:text-emerald-600 transition-colors" title="Báo cáo lỗi">
                            <Flag className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="text-base md:text-lg font-medium leading-relaxed text-slate-800">
                        <LatexContent content={currentQuestion.content} />
                    </div>

                    {/* Hint Toggle */}
                    <div className="mt-4 flex justify-start">
                        <button
                            onClick={() => setShowHint(!showHint)}
                            className="flex items-center gap-2 text-sm font-semibold text-emerald-600/80 hover:text-emerald-600 transition-colors"
                        >
                            <Lightbulb className="w-[18px] h-[18px]" />
                            <span>{showHint ? "Ẩn gợi ý" : "Gợi ý"}</span>
                        </button>
                    </div>
                    {showHint && currentQuestion.hint && (
                        <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-100 animate-in fade-in slide-in-from-top-2">
                            <LatexContent content={currentQuestion.hint} />
                        </div>
                    )}
                </div>

                {/* Answers Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {currentQuestion.options?.map((option) => {
                        const isSelected = selectedOption === option.id;
                        const isCorrectOption = currentQuestion.correctAnswer === option.id;

                        // Default styles
                        let wrapperClass = "border-slate-200 bg-white hover:border-emerald-600/50 hover:bg-slate-50";
                        let circleClass = "bg-slate-100 text-slate-500 group-hover:bg-emerald-600/10 group-hover:text-emerald-600";
                        let statusElement = null;

                        if (isSubmitted) {
                            if (isSelected) {
                                if (isCorrectOption) {
                                    // Submit -> Selected & Correct
                                    wrapperClass = "border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/20";
                                    circleClass = "bg-emerald-500 text-white";
                                    statusElement = (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                            <span className="text-xs font-bold">Đáp án đúng</span>
                                        </div>
                                    );
                                } else {
                                    // Submit -> Selected & Wrong
                                    wrapperClass = "border-red-500 bg-red-50";
                                    circleClass = "bg-red-100 text-red-600 border border-red-200";
                                    statusElement = (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                                            <span className="text-xs font-bold">Bạn chọn</span>
                                        </div>
                                    );
                                }
                            } else if (isCorrectOption) {
                                // Submit -> Not Selected but Correct (Show answer)
                                wrapperClass = "border-emerald-500 bg-emerald-50/20";
                                circleClass = "bg-emerald-500 text-white shadow-sm";
                                statusElement = (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                                        <span className="text-xs font-bold">Đáp án đúng</span>
                                    </div>
                                );
                            } else {
                                // Submit -> Not Selected & Check
                                wrapperClass += " opacity-50";
                            }
                        } else {
                            if (isSelected) {
                                // Not Submitted -> Selected
                                wrapperClass = "border-emerald-600 bg-emerald-50/10 ring-2 ring-emerald-600/20";
                                circleClass = "bg-emerald-600 text-white shadow-sm";
                            }
                        }

                        // Icon handling for submitted state logic
                        let IconContent = <span>{option.id}</span>;
                        if (isSubmitted) {
                            if (isSelected && !isCorrectOption) IconContent = <X className="w-5 h-5" />;
                            if (isCorrectOption) IconContent = <Check className="w-5 h-5" />;
                        }

                        return (
                            <button
                                key={option.id}
                                disabled={isSubmitted}
                                onClick={() => handleOptionSelect(option.id)}
                                className={cn(
                                    "group relative flex items-center p-4 rounded-xl border transition-all text-left w-full",
                                    wrapperClass
                                )}
                            >
                                <div className={cn(
                                    "flex items-center justify-center w-8 h-8 rounded-full font-bold mr-4 shrink-0 transition-colors",
                                    circleClass
                                )}>
                                    {IconContent}
                                </div>
                                <span className="text-lg font-medium text-slate-800 font-serif">
                                    <LatexContent content={option.content} />
                                </span>
                                {statusElement}
                            </button>
                        );
                    })}
                </div>

                {/* Feedback & Solution Section */}
                {isSubmitted && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                        {/* Feedback Banner */}
                        <div className={cn(
                            "flex items-start gap-3 p-4 border rounded-lg mb-6",
                            isCorrect
                                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                                : "bg-red-50 border-red-100 text-red-800"
                        )}>
                            {isCorrect ? (
                                <Check className="w-6 h-6 mt-0.5 text-emerald-600" />
                            ) : (
                                <AlertCircle className="w-6 h-6 mt-0.5 text-red-600" />
                            )}
                            <div>
                                <p className="font-bold">{isCorrect ? "Chính xác!" : "Chưa đúng rồi!"}</p>
                                <p className="text-sm mt-1">
                                    {isCorrect
                                        ? "Làm tốt lắm. Hãy xem lời giải chi tiết để hiểu sâu hơn nhé."
                                        : <span>Đáp án chính xác là <span className="font-bold">{currentQuestion.correctAnswer}</span>. Hãy xem lời giải chi tiết bên dưới nhé.</span>
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Solution Accordion / Tabs */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            {/* Tabs Header */}
                            <div className="flex border-b border-slate-100">
                                <button
                                    onClick={() => setActiveTab('solution')}
                                    className={cn(
                                        "flex-1 py-4 text-sm font-medium transition-colors border-b-2",
                                        activeTab === 'solution'
                                            ? "text-emerald-600 border-emerald-600 bg-emerald-50/30 font-bold"
                                            : "text-slate-500 border-transparent hover:text-slate-700"
                                    )}
                                >
                                    Lời giải chi tiết
                                </button>
                                <button
                                    onClick={() => setActiveTab('video')}
                                    className={cn(
                                        "flex-1 py-4 text-sm font-medium transition-colors border-b-2",
                                        activeTab === 'video'
                                            ? "text-emerald-600 border-emerald-600 bg-emerald-50/30 font-bold"
                                            : "text-slate-500 border-transparent hover:text-slate-700"
                                    )}
                                >
                                    Video bài giảng
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'solution' ? (
                                    <div className="text-slate-800 leading-relaxed space-y-2">
                                        <h3 className="font-bold text-sm text-slate-900 mb-2">Hướng dẫn giải:</h3>
                                        <p className="whitespace-pre-line text-sm">
                                            <LatexContent content={currentQuestion.explanation} />
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        {currentQuestion.videoUrl ? (
                                            <>
                                                <div className="relative w-full aspect-video bg-slate-900 rounded-xl overflow-hidden shadow-lg group cursor-pointer mb-3">
                                                    {/* Placeholder for Video Player */}
                                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center flex-col gap-2">
                                                        <Film className="w-16 h-16 text-slate-700" />
                                                        <p className="text-slate-500 text-sm">Video Demo Player</p>
                                                    </div>

                                                    {/* Play Button Overlay */}
                                                    <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:scale-105 transition-transform duration-300">
                                                        <div className="w-16 h-16 bg-emerald-600/90 rounded-full flex items-center justify-center pl-1 backdrop-blur-sm shadow-xl">
                                                            <Play className="w-8 h-8 text-white fill-current" />
                                                        </div>
                                                    </div>

                                                    {/* Time Indicator if available */}
                                                    {currentQuestion.videoStartTime && (
                                                        <div className="absolute bottom-4 left-4 z-20 bg-black/60 px-2 py-1 rounded text-white font-mono text-xs">
                                                            Phát từ: {formatTime(currentQuestion.videoStartTime)}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
                                                    <MonitorPlay className="w-5 h-5" />
                                                    Video tự động phát tại đoạn liên quan ({currentQuestion.videoStartTime ? formatTime(currentQuestion.videoStartTime) : '00:00'})
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8 text-slate-500">
                                                Không có video bài giảng cho câu hỏi này.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Sticky Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40 shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.05)]">
                <div className="max-w-[800px] mx-auto flex items-center justify-between gap-4">
                    {/* Secondary Action */}
                    {isSubmitted && (
                        <button
                            onClick={handleRetry}
                            className="flex-1 md:flex-none md:w-40 h-12 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <RotateCcw className="w-5 h-5" />
                            Làm lại
                        </button>
                    )}

                    {/* Primary Action */}
                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className="flex-1 md:w-auto h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 px-8 w-full"
                        >
                            <span>Kiểm tra</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            className="flex-1 md:w-auto h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 px-8"
                        >
                            <span>Câu tiếp theo</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
