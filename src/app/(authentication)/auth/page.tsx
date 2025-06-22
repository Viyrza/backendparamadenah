'use client'
import { loginAction } from '@/actions/admin/auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect } from 'react'
import { Lock, AlertCircle, Eye, EyeOff, Shield, User } from 'lucide-react'
import { useState } from 'react'

const initialState: { success: boolean; message: string } = {
    success: false,
    message: '',
}

export default function Page() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState<boolean>(false)

    const [state, formAction, isPending] = useActionState(
        loginAction,
        initialState
    )

    useEffect(() => {
        if (state.success) {
            router.push('/menu-utama')
        }
    }, [state.success, router])
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800 p-4 relative overflow-hidden">
            <Card className="w-full max-w-md relative z-10 shadow-2xl border border-gray-700/50 bg-gray-900/80 backdrop-blur-xl rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                    <form action={formAction} className="space-y-6">
                        {state.message && (
                            <Alert
                                variant="destructive"
                                className="border-red-500/50 bg-red-900/20 backdrop-blur-sm rounded-xl"
                            >
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <AlertDescription className="text-red-300">
                                    {state.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-3">
                            <Label
                                htmlFor="email"
                                className="text-sm font-semibold text-gray-300"
                            >
                                Email Administrator
                            </Label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Masukkan email admin"
                                    className="pl-12 h-14 border-2 border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-white placeholder:text-gray-500 transition-all duration-200 bg-gray-800/50 hover:bg-gray-800/70"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label
                                htmlFor="password"
                                className="text-sm font-semibold text-gray-300"
                            >
                                Kata Sandi
                            </Label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5 group-focus-within:text-blue-400 transition-colors" />
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan kata sandi"
                                    className="pl-12 pr-12 h-14 border-2 border-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl text-white placeholder:text-gray-500 transition-all duration-200 bg-gray-800/50 hover:bg-gray-800/70"
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-colors hover:bg-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isPending ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Memverifikasi...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Masuk ke Dashboard
                                </div>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-700"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-gray-900 text-gray-500">
                                    Akses Terbatas
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                                <AlertCircle className="w-4 h-4 text-yellow-500" />
                                <span className="text-xs text-gray-400">
                                    Hanya untuk administrator yang berwenang
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                © 2024 Paramadenah. Sistem Administrasi Terpadu
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
