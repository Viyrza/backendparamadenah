// app/menu_utama/Sidebar.js
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Home, Bell, ImageIcon, LogOutIcon, Proportions, Map } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase/firebase.config'
import { logoutAction } from '@/actions/admin/auth'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'

interface SidebarProps {
    isMobileMenuOpen?: boolean
    setIsMobileMenuOpen?: (open: boolean) => void
}

type MenuItems = {
    name: string
    href: string
    lucideIcon?: React.ComponentType<any>
}

const menuItems: MenuItems[] = [
    {
        name: 'Dashboard',
        href: '/menu-utama',
        lucideIcon: Home,
    },
    {
        name: 'Bank Image',
        href: '/menu-utama/bank-image',
        lucideIcon: ImageIcon,
    },
    {
        name: 'Fasilitias Managament',
        href: '/menu-utama/fasilitas',
        lucideIcon: Proportions,
    },
    {
        name: 'Navigation Nodes',
        href: '/menu-utama/navigation-node',
        lucideIcon: Map,
    },
    {
        name: 'Notification',
        href: '/menu-utama/notification',
        lucideIcon: Bell,
    },
    {
        name : 'User Management',
        href: '/menu-utama/user',
        lucideIcon: Home,
    }
]

export default function Sidebar({
    isMobileMenuOpen,
    setIsMobileMenuOpen,
}: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isMobile, setIsMobile] = useState<boolean>(false)

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)

        return () => window.removeEventListener('resize', checkScreenSize)
    }, [])

    useEffect(() => {
        if (setIsMobileMenuOpen) {
            setIsMobileMenuOpen(false)
        }
    }, [pathname, setIsMobileMenuOpen])

    useEffect(() => {
        if (isMobileMenuOpen && isMobile) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }

        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen, isMobile])

    const handleLogout = async () => {
        try {
            await signOut(auth)
            await logoutAction()
            router.push('/auth')
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Logout gagal. Silakan coba lagi.'
            toast.error(errorMessage)
        }
    }

    const SidebarContent = () => (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                <div className={`mb-8 px-4 ${isMobile ? 'pt-20' : 'pt-4'}`}>
                    <Image
                        src="/paramadenahlogo.svg"
                        alt="Logo Paramadenah"
                        width={isMobile ? 150 : 200}
                        height={isMobile ? 75 : 100}
                        className="w-auto h-auto"
                    />
                </div>

                <div className="space-y-2 px-4 pb-4">
                    <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                        MAIN MENU
                    </h2>
                    {menuItems.map((item) => {
                        const IconComponent = item.lucideIcon
                        const isActive = pathname === item.href

                        return (
                            <Link key={item.name} href={item.href}>
                                <div
                                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'hover:bg-gray-700 hover:bg-opacity-50 text-gray-300 hover:text-white'
                                    }`}
                                >
                                    {IconComponent && (
                                        <IconComponent
                                            className={`w-5 h-5 transition-colors duration-200 ${
                                                isActive
                                                    ? 'text-white'
                                                    : 'text-gray-400 group-hover:text-white'
                                            }`}
                                        />
                                    )}

                                    <span className="font-medium transition-colors duration-200">
                                        {item.name}
                                    </span>
                                    {isActive && (
                                        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div className="flex-shrink-0 p-4 border-t border-gray-700">
                <div className="text-center"></div>
            </div>

            <div className="flex flex-col gap-3 px-4 justify-center items-ce">
                <span className="text-xs text-gray-400">
                    <p className="flex justify-center">© 2025 Paramadenah</p>
                </span>
                <Button onClick={handleLogout} variant="destructive">
                    <LogOutIcon />
                    <p>Logout</p>
                </Button>
            </div>
        </div>
    )

    return (
        <>
            <div
                className={`${
                    isMobile ? 'hidden' : 'block'
                } w-64 h-full bg-background_primary text-white shadow-xl transition-all duration-300 ease-in-out fixed left-0 top-0 z-20`}
            >
                <SidebarContent />
            </div>

            {isMobile && (
                <div
                    className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
                        isMobileMenuOpen
                            ? 'opacity-100 visible'
                            : 'opacity-0 invisible'
                    }`}
                >
                    <div
                        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
                            isMobileMenuOpen ? 'bg-opacity-60' : 'bg-opacity-0'
                        }`}
                        onClick={() =>
                            setIsMobileMenuOpen && setIsMobileMenuOpen(false)
                        }
                    ></div>
                    <div
                        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out ${
                            isMobileMenuOpen
                                ? 'translate-x-0'
                                : '-translate-x-full'
                        }`}
                    >
                        <SidebarContent />
                    </div>
                </div>
            )}
        </>
    )
}
