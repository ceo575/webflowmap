"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Application Error:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-red-50/50 px-4 text-center">
            <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-xl shadow-red-100/50 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-xl font-bold text-slate-900 mb-2">Đã có lỗi xảy ra!</h2>
                <p className="text-slate-500 mb-6 text-sm">
                    Hệ thống gặp sự cố không mong muốn. Đội ngũ kỹ thuật đã được thông báo.
                </p>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={() => reset()}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-10"
                    >
                        <RotateCw className="w-4 h-4 mr-2" />
                        Thử lại
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => window.location.href = '/dashboard'}
                        className="w-full text-slate-500 hover:text-slate-700 font-medium"
                    >
                        Về trang chủ
                    </Button>
                </div>
            </div>
        </div>
    );
}
