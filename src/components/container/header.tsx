'use client'

import { useState, useEffect } from 'react'
import { Menu, Bell, User, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface AppHeaderProps {
    onMobileMenuToggle?: () => void
    isMobileMenuOpen?: boolean
}

export default function AppHeader({
    onMobileMenuToggle,
    isMobileMenuOpen,
}: AppHeaderProps) {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)

        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    return (
        <header className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm md:left-64">
            <div className="flex items-center justify-between h-16 px-4">
                {/* Left Side - Mobile Menu Button & Title */}
                <div className="flex items-center gap-4">
                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onMobileMenuToggle}
                            className={`p-2 hover:bg-gray-100 transition-all duration-300 transform ${
                                isMobileMenuOpen
                                    ? 'rotate-180 scale-110'
                                    : 'rotate-0 scale-100'
                            }`}
                        >
                            {isMobileMenuOpen ? (
                                <Menu className="w-6 h-6 rotate-90" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </Button>
                    )}

                    <div className="hidden md:block">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Paramadenah Admin
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 p-2 hover:bg-gray-100"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <span className="hidden md:block text-sm font-medium text-gray-700">
                            Admin
                        </span>
                    </Button>
                </div>
            </div>

            {isMobile && (
                <div className="px-4 pb-3 border-t border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input placeholder="Cari..." className="pl-10 w-full" />
                    </div>
                </div>
            )}
        </header>
    )
}
