"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Plus, Search, FileText, Clock, Users, MoreVertical, Eye, Pencil, Trash2, Copy } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - replace with real data from API
const mockExams = [
    {
        id: "1",
        title: "Đề thi thử THPT Quốc Gia 2024",
        questionCount: 50,
        duration: 90,
        grade: "12",
        subject: "Toán",
        createdAt: "2024-02-01",
        isPublic: true,
        attemptCount: 45,
    },
    {
        id: "2",
        title: "Kiểm tra 15 phút - Chương 1",
        questionCount: 10,
        duration: 15,
        grade: "12",
        subject: "Toán",
        createdAt: "2024-02-03",
        isPublic: false,
        attemptCount: 12,
    },
]

export default function ExamListPage() {
    const [searchQuery, setSearchQuery] = useState("")

    const filteredExams = mockExams.filter(exam =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Kho đề thi</h1>
                    <p className="text-slate-500 mt-1">Quản lý và tổ chức đề thi của bạn</p>
                </div>
                <Link href="/admin/exam/create">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Tạo đề mới
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Tổng số đề</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">12</p>
                            </div>
                            <FileText className="w-8 h-8 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Công khai</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
                            </div>
                            <Eye className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Lượt làm bài</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">234</p>
                            </div>
                            <Users className="w-8 h-8 text-purple-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Trung bình</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">7.8 điểm</p>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 text-lg px-3 py-1">★</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Tìm kiếm đề thi..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tên đề thi</TableHead>
                                <TableHead>Số câu</TableHead>
                                <TableHead>Thời gian</TableHead>
                                <TableHead>Lớp/Môn</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Lượt làm</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExams.map((exam) => (
                                <TableRow key={exam.id}>
                                    <TableCell className="font-medium">{exam.title}</TableCell>
                                    <TableCell>{exam.questionCount} câu</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            {exam.duration} phút
                                        </div>
                                    </TableCell>
                                    <TableCell>{exam.grade} - {exam.subject}</TableCell>
                                    <TableCell>
                                        <Badge variant={exam.isPublic ? "default" : "secondary"}>
                                            {exam.isPublic ? "Công khai" : "Riêng tư"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{exam.attemptCount}</TableCell>
                                    <TableCell>{new Date(exam.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Xem trước
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Pencil className="w-4 h-4 mr-2" />
                                                    Chỉnh sửa
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    Sao chép
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Xóa
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {filteredExams.length === 0 && (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">Không tìm thấy đề thi nào</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
