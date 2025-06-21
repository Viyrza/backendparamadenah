'use client'

export interface BankImage {
    id: string
    name: string
    url: string
    description?: string
    tags?: string[]
    uploadedAt: string
    updatedAt: string
}

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import ImageUploader from '../../uploder-image'

interface ImageFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function ImageFormDialog({
    open,
    onOpenChange,
}: ImageFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Gambar</DialogTitle>
                </DialogHeader>

                <div>
                    <ImageUploader />
                </div>
            </DialogContent>
        </Dialog>
    )
}
