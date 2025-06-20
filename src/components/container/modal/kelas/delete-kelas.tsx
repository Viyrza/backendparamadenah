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
import { useDisclosure } from '@/hooks/use-disclosure'
import { Trash2, AlertTriangle } from 'lucide-react'
import { deleteKelas } from '@/actions/admin/kelas'

type DeleteModalKelasProps = {
    kelasId: string
    gedungId: string
    lantai: string
    kelasName: string
    refetch: (page?: number) => void
}

export default function DeleteModalKelas(props: DeleteModalKelasProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [isDeleting, setIsDeleting] = useState(false)
    const [result, setResult] = useState<{
        success: boolean
        error?: string
    } | null>(null)

    const handleDelete = async () => {
        setIsDeleting(true)
        setResult(null)

        try {
            const deleteResult = await deleteKelas(
                props.kelasId,
                props.gedungId,
                props.lantai
            )
            setResult(deleteResult)

            if (deleteResult.success) {
                setTimeout(() => {
                    props.refetch?.()
                    setIsOpen(false)
                    setResult(null)
                }, 2000)
            }
        } catch (error) {
            setResult({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <Button
                onClick={() => setIsOpen(true)}
                className="bg-red-600 hover:bg-red-500"
                size="sm"
            >
                <Trash2 className="h-4 w-4" />
            </Button>

            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Hapus Kelas
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">
                            Apakah Anda yakin ingin menghapus kelas "
                            {props.kelasName}"?
                        </p>
                        <p className="text-red-700 text-sm mt-2">
                            ⚠️ Tindakan ini akan:
                        </p>
                        <ul className="text-red-700 text-sm mt-1 ml-4 list-disc">
                            <li>Menghapus kelas secara permanen</li>
                            <li>Menghapus relasi kelas dengan gedung</li>
                            <li>Tidak dapat dibatalkan</li>
                        </ul>
                    </div>

                    {result && (
                        <div
                            className={`p-4 rounded-lg border ${
                                result.success
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-red-50 border-red-200'
                            }`}
                        >
                            {result.success ? (
                                <div className="text-green-800">
                                    <p className="font-medium">
                                        ✅ Kelas berhasil dihapus!
                                    </p>
                                    <p className="text-sm mt-1">
                                        Relasi dengan gedung juga telah dihapus.
                                    </p>
                                </div>
                            ) : (
                                <div className="text-red-800">
                                    <p className="font-medium">
                                        ❌ Gagal menghapus kelas
                                    </p>
                                    <p className="text-sm mt-1">
                                        {result.error}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {isDeleting && (
                        <div className="flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                            <span className="ml-2 text-red-700">
                                Menghapus kelas...
                            </span>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                        disabled={isDeleting}
                    >
                        Batal
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting || result?.success}
                        className="bg-red-600 hover:bg-red-500"
                    >
                        {isDeleting ? 'Menghapus...' : 'Ya, Hapus Kelas'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
