'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Edit, Plus } from 'lucide-react'
import { FASILITAS_CATEGORIES } from '@/lib/constants/fasilitas'
import { updateFasilitas } from '@/actions/admin/fasilitas'
import BankImageSelector from '../../bank-image-selector'

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

const initialState: any = {
    success: false,
    error: {
        fieldErrors: {},
    },
}

type EditFasilitasProps = {
    fasilitas: Fasilitas
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export default function EditFasilitasModal({
    fasilitas,
    isOpen,
    onOpenChange,
    onSuccess,
}: EditFasilitasProps) {
    const formRef = useRef<HTMLFormElement>(null)
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>(
        fasilitas.imageUrl || ''
    )
    const [imageInputValue, setImageInputValue] = useState<string>(
        fasilitas.imageUrl || ''
    )
    const [state, formAction, isPending] = useActionState(
        updateFasilitas,
        initialState
    )
    const hasRefetched = useRef<boolean>(false)

    const handleImageSelect = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl)
        setImageInputValue(imageUrl)
    }

    const handleOpenChange = (open: boolean) => {
        onOpenChange(open)
        if (!open) {
            setSelectedImageUrl(fasilitas.imageUrl || '')
            setImageInputValue(fasilitas.imageUrl || '')
            hasRefetched.current = false
        }
    }
    useEffect(() => {
        setSelectedImageUrl(fasilitas.imageUrl || '')
        setImageInputValue(fasilitas.imageUrl || '')
    }, [fasilitas])

    useEffect(() => {
        if (state.success && onSuccess && !hasRefetched.current) {
            hasRefetched.current = true
            onSuccess()
            setTimeout(() => {
                onOpenChange(false)
            }, 1500)
        }
    }, [state.success, onSuccess, onOpenChange])

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent aria-describedby={undefined} className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        Edit Fasilitas
                    </DialogTitle>
                </DialogHeader>{' '}
                <form
                    id="edit-fasilitas-form"
                    ref={formRef}
                    action={formAction}
                    className="space-y-3 max-h-96 overflow-y-auto px-2"
                >
                    <Input type="hidden" name="id" value={fasilitas.id} />
                    <Input
                        type="hidden"
                        name="oldCategory"
                        value={fasilitas.category}
                    />
                    <Input
                        type="hidden"
                        name="oldSlug"
                        value={fasilitas.slug}
                    />
                    <Input
                        type="hidden"
                        name="created_at"
                        value={fasilitas.created_at}
                    />
                    <Input
                        type="hidden"
                        name="imageUrl"
                        value={imageInputValue}
                    />

                    <Label htmlFor="edit-category">Kategori Fasilitas</Label>
                    <select
                        id="edit-category"
                        name="category"
                        required
                        defaultValue={fasilitas.category}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">Pilih Kategori</option>
                        {Object.entries(FASILITAS_CATEGORIES).map(
                            ([key, label]) => (
                                <option key={key} value={key}>
                                    {label}
                                </option>
                            )
                        )}
                    </select>
                    {!state.success && state.error?.fieldErrors?.category && (
                        <p className="text-sm text-red-500 mt-1">
                            {state.error.fieldErrors.category[0]}
                        </p>
                    )}

                    <Label htmlFor="edit-name">Nama Fasilitas</Label>
                    <Input
                        id="edit-name"
                        name="name"
                        type="text"
                        placeholder="Masukkan nama fasilitas"
                        defaultValue={fasilitas.name}
                        required
                    />
                    {!state.success && state.error?.fieldErrors?.name && (
                        <p className="text-sm text-red-500 mt-1">
                            {state.error.fieldErrors.name[0]}
                        </p>
                    )}

                    <Label htmlFor="edit-description">Deskripsi</Label>
                    <Textarea
                        id="edit-description"
                        name="description"
                        placeholder="Masukkan deskripsi fasilitas"
                        className="min-h-[100px]"
                        defaultValue={fasilitas.description}
                        required
                    />
                    {!state.success &&
                        state.error?.fieldErrors?.description && (
                            <p className="text-sm text-red-500 mt-1">
                                {state.error.fieldErrors.description[0]}
                            </p>
                        )}
                    {!state.success && state.error?.formError && (
                        <p className="text-sm text-red-500">
                            {state.error.formError}
                        </p>
                    )}

                    {selectedImageUrl && (
                        <div className="mt-3">
                            <Label className="text-sm text-gray-600 mb-2 block">
                                Preview:
                            </Label>
                            <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                <img
                                    src={selectedImageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error(
                                            'Image load error:',
                                            selectedImageUrl
                                        )
                                        e.currentTarget.src =
                                            '/placeholder-image.png'
                                        e.currentTarget.alt =
                                            'Error loading image'
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1 break-all">
                                URL: {selectedImageUrl}
                            </p>
                        </div>
                    )}

                    <div className="pt-2">
                        <BankImageSelector
                            onImageSelect={handleImageSelect}
                            selectedImageUrl={selectedImageUrl}
                            triggerButton={
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Pilih dari Bank Image
                                </Button>
                            }
                        />
                    </div>
                </form>
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
                        form="add-fasilitas-form"
                        type="submit"
                        disabled={isPending}
                        className="bg-slate-800 hover:bg-slate-700"
                    >
                        {isPending ? 'Mengupdate...' : 'Update'}
                    </Button>
                </DialogFooter>
                {state.success && (
                    <p className="text-sm text-green-600">
                        Fasilitas berhasil diupdate!
                    </p>
                )}
            </DialogContent>
        </Dialog>
    )
}
