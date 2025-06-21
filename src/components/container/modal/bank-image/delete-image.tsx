'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { BankImage } from './image-form'

interface DeleteDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    image: BankImage
    onDelete: (id: string) => Promise<void>
}

export function DeleteImageDialog({
    open,
    onOpenChange,
    image,
    onDelete,
}: DeleteDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await onDelete(image.id)
            onOpenChange(false)
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Gambar</DialogTitle>
                    <DialogDescription>
                        Apakah Anda yakin ingin menghapus gambar{' '}
                        <strong>{image.name}</strong>? Aksi ini tidak dapat
                        dibatalkan.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-md overflow-hidden">
                            <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <h4 className="font-medium">{image.name}</h4>
                            {image.description && (
                                <p className="text-sm text-muted-foreground">
                                    {image.description}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                    >
                        Batal
                    </Button>
                    <Button
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
