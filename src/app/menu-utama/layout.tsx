// app/menu_utama/layout.js
'use client'

import { useState } from 'react'
import Sidebar from './sidebar'
import AppHeader from '../../components/container/header'

export default function MenuUtamaLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Header */}
            <AppHeader
                onMobileMenuToggle={toggleMobileMenu}
                isMobileMenuOpen={isMobileMenuOpen}
            />

            {/* Sidebar */}
            <Sidebar
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col md:ml-64">
                {/* Content Area with proper spacing for header */}
                <div className="flex-1 overflow-y-auto pt-16 md:pt-16">
                    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
