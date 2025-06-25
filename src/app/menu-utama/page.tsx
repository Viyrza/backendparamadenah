'use client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
    const router = useRouter()

    const menuItems = [
        { name: 'Cipayung', icon: '', path: '/menu-utama/kampus-cipayung' },
        {
            name: 'Cikarang',
            icon: '/kampus_cikarang.svg',
            path: '/menu_utama/kampus_cikarang',
        },
        {
            name: 'Trinity',
            icon: '/kampus_trinity.svg',
            path: '/menu_utama/kampus_trinity',
        },
    ]

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <h1 className="pt-6 text-4xl font-bold text-background_primary  ">
                Selamat Datang di Dashboard Admin Paramadenah!
            </h1>
            <div className="pt-8 grid grid-cols-1 gap-6">
                {menuItems.map((campus) => (
                    <div
                        key={campus.name}
                        className="rounded-xl overflow-hidden shadow-xl transform hover:scale-105 transition-transform duration-300 cursor-pointer"
                        onClick={() => router.push(campus.path)}
                    >
                        <div className="p-4">
                            <h3 className="text-xl font-semibold text-black">
                                {campus.name}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
           
        </div>
    )
}
