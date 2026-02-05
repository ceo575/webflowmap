import { useSession } from "next-auth/react"

// ... types and mock data ...

export default function DashboardPage() {
    const { data: session } = useSession()
    const userName = session?.user?.name || "Bạn"

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Welcome Banner */}
            <Card className="bg-gradient-to-r from-emerald-500 to-emerald-400 border-none shadow-lg text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
                <div className="absolute bottom-0 right-20 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 blur-2xl"></div>

                <CardContent className="p-8 md:p-12 relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Chào {userName},</h1>
                    <p className="text-emerald-50 text-xl font-medium">Hôm nay bạn muốn chinh phục chủ đề nào?</p>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="shadow-sm border-slate-100 hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                                <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
                                {stat.trend && (
                                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        {stat.trend}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Column: Weakness Topics (60% -> col-span-3) */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-900">Vấn đề cần cải thiện</h2>
                    </div>

                    <div className="space-y-4">
                        {weaknessTopics.map((topic) => (
                            <Card key={topic.id} className={`border-slate-100 shadow-sm ${topic.priority === "High" ? "bg-red-50/50 border-red-100" : "bg-white"}`}>
                                <CardContent className="p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{topic.title}</h3>
                                            <p className="text-sm text-slate-500">{topic.subject}</p>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`
                        ${topic.priority === "High" ? "bg-white text-red-600 border-red-200" : ""}
                        ${topic.priority === "Medium" ? "bg-orange-50 text-orange-600 border-orange-200" : ""}
                        ${topic.priority === "Low" ? "bg-yellow-50 text-yellow-600 border-yellow-200" : ""}
                      `}
                                        >
                                            {topic.priority === "High" ? "Cần gấp" : topic.priority === "Medium" ? "Trung bình" : "Thấp"}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-slate-500">Tiến độ</span>
                                            <span className="text-slate-900">{topic.progress}%</span>
                                        </div>
                                        <Progress
                                            value={topic.progress}
                                            className={`
                            h-2 
                            ${topic.priority === "High" ? "[&>div]:bg-red-500 bg-red-200" : ""}
                            ${topic.priority === "Medium" ? "[&>div]:bg-orange-400 bg-orange-100" : ""}
                            ${topic.priority === "Low" ? "[&>div]:bg-yellow-400 bg-yellow-100" : ""}
                        `}
                                        />
                                    </div>

                                    {topic.priority === "High" && (
                                        <Button className="w-full sm:w-auto bg-[#059669] hover:bg-[#047857] text-white">
                                            Luyện tập ngay
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Right Column: Performance Analysis (40% -> col-span-2) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-[#059669] rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-900">Phân tích Năng lực</h2>
                    </div>

                    {/* Activity Chart Block (CSS Implementation) */}
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold text-slate-800">Hoạt động tuần này</CardTitle>
                                <select className="text-xs bg-slate-50 border-none rounded p-1 text-slate-600 cursor-pointer outline-none">
                                    <option>7 ngày qua</option>
                                    <option>30 ngày qua</option>
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-48 flex items-end justify-between gap-2 mt-4">
                                {/* Mock Bar Chart using Flexbox */}
                                {[40, 65, 85, 30, 95, 0, 0].map((height, i) => (
                                    <div key={i} className="flex flex-col items-center gap-2 w-full h-full justify-end group">
                                        <div
                                            className={`w-full max-w-[30px] rounded-t-sm transition-all duration-500 relative ${i === 4 ? "bg-[#059669] shadow-lg shadow-emerald-100" : "bg-emerald-100 hover:bg-emerald-400"}`}
                                            style={{ height: `${height || 5}%` }}
                                        >
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                                                {height}%
                                            </div>
                                        </div>
                                        <span className={`text-[10px] uppercase font-bold ${i === 4 ? "text-[#059669]" : "text-slate-400"}`}>
                                            {["T2", "T3", "T4", "T5", "T6", "T7", "CN"][i]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Strength Topics Block */}
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base font-bold text-slate-800">Chủ đề thế mạnh</CardTitle>
                                <Button variant="link" className="text-xs text-[#059669] h-auto p-0 font-bold">Xem tất cả</Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {strengths.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-[#059669]">
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                                        <p className="text-xs text-slate-500">Mastery Level: {item.mastery}%</p>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-[#059669]" />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
