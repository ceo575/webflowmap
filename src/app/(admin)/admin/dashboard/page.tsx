import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react";

export default function AdminDashboard() {
    const stats = [
        { label: "Tổng số học sinh", value: "1,234", icon: Users, color: "text-blue-600" },
        { label: "Kỳ thi đang diễn ra", value: "12", icon: FileText, color: "text-emerald-600" },
        { label: "Báo cáo mới", value: "5", icon: LayoutDashboard, color: "text-purple-600" },
    ];

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Tổng quan quản trị</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.label}
                            </CardTitle>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Thông báo hệ thống</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
                                <p className="text-emerald-800 font-medium">Hệ thống hoạt động bình thường</p>
                                <p className="text-emerald-600 text-sm">Tất cả dịch vụ đang chạy ổn định.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
