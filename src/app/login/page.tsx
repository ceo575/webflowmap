"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calculator, GraduationCap, Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [userType, setUserType] = useState<"student" | "teacher">("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email hoặc mật khẩu không chính xác")
      } else {
        // Fetch session to get user role
        const { getSession } = await import("next-auth/react")
        const session = await getSession()

        if (session?.user) {
          const role = (session.user as any)?.role

          // Redirect based on role
          if (role === "ADMIN") {
            router.push("/admin/dashboard")
          } else {
            router.push("/dashboard")
          }
          router.refresh()
        } else {
          // Fallback to root if session not available
          router.push("/")
          router.refresh()
        }
      }
    } catch (err) {
      setError("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Column - Branding Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex w-[55%] xl:w-[60%] bg-[#064E3B] flex-col items-center justify-center relative overflow-hidden p-12 text-center">
        {/* Background Pattern Overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 text-9xl font-mono text-white">∑</div>
          <div className="absolute bottom-20 right-20 text-9xl font-serif text-white">∫</div>
          <div className="absolute top-1/3 right-10 text-8xl font-sans text-white">π</div>
          <div className="absolute bottom-1/3 left-20 text-8xl font-mono text-white">√</div>
        </div>

        <div className="z-10 flex flex-col items-center max-w-lg">
          <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-sm mb-8 shadow-2xl border border-white/10">
            <Calculator className="w-16 h-16 text-emerald-400" />
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Làm chủ tư duy,<br />
            <span className="text-emerald-400">bứt phá điểm số</span>
          </h1>

          <p className="text-gray-300 text-lg leading-relaxed max-w-md">
            Hệ thống học tập thông minh giúp bạn chinh phục mọi thử thách toán học một cách dễ dàng.
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-[45%] xl:w-[40%] bg-white flex flex-col items-center justify-center p-8 sm:p-12 lg:p-16 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-[#059669] mb-2">
              <GraduationCap className="w-8 h-8" />
              <span className="text-2xl font-bold tracking-tight text-gray-900">FlowMAP</span>
            </div>
            <p className="text-gray-500">Đăng nhập để tiếp tục hành trình học tập</p>
          </div>

          {/* Tabs Switcher */}
          <Tabs
            defaultValue="student"
            value={userType}
            onValueChange={(v) => setUserType(v as "student" | "teacher")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
              <TabsTrigger value="student" className="text-base">Học sinh</TabsTrigger>
              <TabsTrigger value="teacher" className="text-base">Giáo viên</TabsTrigger>
            </TabsList>

            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-100 flex items-center gap-2 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Số điện thoại/Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="pl-10 h-11 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Link
                      href="#"
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-500 hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 h-11 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-semibold bg-[#059669] hover:bg-[#047857] text-white transition-colors duration-200 shadow-lg shadow-emerald-100 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  userType === "student" ? "Vào lớp học" : "Đăng nhập quản lý"
                )}
              </Button>
            </form>
          </Tabs>

          {/* Footer Form */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Hoặc</span>
            </div>
          </div>

          <div className="text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <Link href="#" className="font-semibold text-[#059669] hover:text-[#047857] hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="absolute bottom-6 text-xs text-gray-400">
          © 2024 FlowMAP. All rights reserved.
        </div>
      </div>
    </div>
  )
}
