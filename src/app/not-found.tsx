import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Map, ArrowLeft, SearchX } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 px-4 text-center">
            <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/50 max-w-md w-full">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                    <SearchX className="w-10 h-10 text-slate-400" />
                </div>

                <h1 className="text-4xl font-extrabold text-slate-900 mb-2">404</h1>
                <h2 className="text-xl font-bold text-slate-800 mb-3">Không tìm thấy trang</h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                    Đường dẫn bạn truy cập không tồn tại hoặc đã bị di chuyển. Hãy quay lại trang chủ để tiếp tục nhé.
                </p>

                <Link href="/dashboard" className="w-full">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 shadow-lg shadow-emerald-600/20 transition-all">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay về Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
}
