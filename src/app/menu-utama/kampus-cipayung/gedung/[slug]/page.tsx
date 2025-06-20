'use client'

import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import GedungKelasView from '@/components/container/gedung-kelas-view'

export default function GedungDetailPage() {
    const params = useParams()
    const router = useRouter()
    const gedungSlug = params.slug as string

    return (
        <div className="space-y-6 mx-auto pt-8 px-4">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.back()}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali
                </Button>
                <h1 className="text-2xl font-bold">Detail Gedung</h1>
            </div>

            <GedungKelasView gedungSlug={gedungSlug} />
        </div>
    )
}
