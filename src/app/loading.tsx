import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-50">
            <div className="flex flex-col items-center gap-4">
                {/* Animated Logo/Spinner */}
                <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-200 animate-pulse">
                        <span className="text-white font-bold text-3xl font-sans">F</span>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">Đang tải dữ liệu...</h3>
                    <p className="text-sm text-slate-500">Vui lòng chờ trong giây lát</p>
                </div>
            </div>
        </div>
    );
}
