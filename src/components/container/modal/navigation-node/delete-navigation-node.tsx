'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'
import { deleteNavigationNode } from '@/actions/admin/navigation-node'
import toast from 'react-hot-toast'

type DeleteNavigationNodeModalProps = {
    nodeId: string
    nodeName: string
    refetch: () => void
}

export default function DeleteNavigationNodeModal({
    nodeId,
    nodeName,
    refetch,
}: DeleteNavigationNodeModalProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteNavigationNode(nodeId)

            if (result.success) {
                toast.success('Lokasi navigasi berhasil dihapus!')
                refetch()
                setIsOpen(false)
            } else {
                toast.error(result.error || 'Gagal menghapus lokasi navigasi')
            }
        } catch (error) {
            console.error('Error deleting navigation node:', error)
            toast.error('Terjadi kesalahan saat menghapus lokasi navigasi')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    size="sm"
                    disabled={isDeleting}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Hapus Lokasi Navigasi</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-gray-600">
                        Apakah Anda yakin ingin menghapus lokasi &quot;{nodeName}&quot;? Tindakan ini tidak dapat dibatalkan.
                    </p>
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
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
