'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { deleteFasilitas } from '@/actions/admin/fasilitas'

interface Fasilitas {
    id: number
    name: string
    description: string
    category: string
    imageUrl?: string
    slug: string
    created_at: string
    updated_at: string
}

type DeleteFasilitasProps = {
    fasilitas: Fasilitas
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export default function DeleteFasilitasModal({
    fasilitas,
    isOpen,
    onOpenChange,
    onSuccess,
}: DeleteFasilitasProps) {
    const [isPending, setIsPending] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const handleDelete = async () => {
        setIsPending(true)
        setError(null)

        try {
            const result = await deleteFasilitas(
                fasilitas.category,
                fasilitas.slug
            )

            if (result.success) {
                onSuccess?.()
                onOpenChange(false)
            } else {
                setError(result.error || 'Gagal menghapus fasilitas')
            }
        } catch (error) {
            setError('Terjadi kesalahan saat menghapus fasilitas')
        } finally {
            setIsPending(false)
        }
    }

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open)
        if (!open) {
            setError(null)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent aria-describedby={undefined} className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        Konfirmasi Hapus
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                        <Trash2 className="w-8 h-8 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="font-medium text-red-900">
                                Hapus Fasilitas
                            </p>
                            <p className="text-sm text-red-700">
                                Aksi ini tidak dapat dibatalkan
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm text-gray-700">
                            Anda yakin ingin menghapus fasilitas berikut?
                        </p>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                            <p className="font-medium text-gray-900">
                                {fasilitas.name}
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2">
                                {fasilitas.description}
                            </p>
                            {fasilitas.imageUrl && (
                                <div className="mt-2">
                                    <img
                                        src={fasilitas.imageUrl}
                                        alt={fasilitas.name}
                                        className="w-full h-20 object-cover rounded"
                                        onError={(e) => {
                                            e.currentTarget.style.display =
                                                'none'
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isPending}
                        className="gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        {isPending ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
