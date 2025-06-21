'use client'

import { useActionState, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDisclosure } from '@/hooks/use-disclosure'
import { Plus } from 'lucide-react'
import { createGedung } from '@/actions/admin/gedung'
import BankImageSelector from '../../bank-image-selector'

const initialState:
    | { success: true; id: string | null }
    | {
          success: false
          error: {
              fieldErrors?: {
                  name?: string[]
                  image?: string[]
                  kode_gedung?: string[]
              }
          }
      } = {
    success: false,
    error: {
        fieldErrors: {},
    },
}

type AddModalGedungProps = {
    refetch: () => void
}

export default function AddModalGedung(props: AddModalGedungProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [selectedImageUrl, setSelectedImageUrl] = useState('')
    const [imageInputValue, setImageInputValue] = useState('')
    const [state, formAction, isPending] = useActionState(
        createGedung,
        initialState
    )

    // Update input value when image is selected from bank
    const handleImageSelect = (imageUrl: string) => {
        console.log('Received image URL in add-gedung:', imageUrl) // Debug log
        setSelectedImageUrl(imageUrl)
        setImageInputValue(imageUrl)
    }

    // Update selected image when input changes manually
    const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setImageInputValue(value)
        setSelectedImageUrl(value)
    }

    // Reset form when modal closes
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            setSelectedImageUrl('')
            setImageInputValue('')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="lg"
                    className="bg-slate-800 hover:bg-slate-700"
                >
                    <p className="hidden md:block">Add Gedung</p>
                    <Plus />
                </Button>
            </DialogTrigger>

            <DialogContent aria-describedby={undefined}>
                <form action={formAction} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>Add New Gedung</DialogTitle>
                    </DialogHeader>

                    <div>
                        <Label>Name</Label>
                        <Input name="name" type="text" required />
                        {!state.success && state.error?.fieldErrors?.name && (
                            <p className="text-sm text-red-500">
                                {state.error.fieldErrors.name[0]}
                            </p>
                        )}
                    </div>
                    <div>
                        <Label>Code Gedung (Gedung A)</Label>
                        <Input name="kode_gedung" type="text" required />
                        {!state.success &&
                            state.error?.fieldErrors?.kode_gedung && (
                                <p className="text-sm text-red-500">
                                    {state.error.fieldErrors.kode_gedung[0]}
                                </p>
                            )}
                    </div>

                    <div className="space-y-3">
                        <Label>Image URL</Label>
                        <Input
                            name="image"
                            type="url"
                            placeholder="Masukkan URL gambar atau pilih dari bank"
                            value={imageInputValue}
                            onChange={handleImageInputChange}
                        />
                        {!state.success && state.error?.fieldErrors?.image && (
                            <p className="text-sm text-red-500">
                                {state.error.fieldErrors.image[0]}
                            </p>
                        )}

                        {/* Image Preview */}
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
                                        onLoad={() => {
                                            console.log(
                                                'Image loaded successfully:',
                                                selectedImageUrl
                                            )
                                        }}
                                    />
                                    {/* Loading/Error fallback */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 opacity-0 transition-opacity">
                                        <span className="text-gray-500 text-sm">
                                            Loading image...
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 break-all">
                                    URL: {selectedImageUrl}
                                </p>
                            </div>
                        )}

                        {/* Bank Image Selector */}
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
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="mt-4 bg-slate-800 hover:bg-slate-700"
                        >
                            {isPending ? 'Submitting...' : 'Submit'}
                        </Button>
                    </DialogFooter>

                    {state.success && (
                        <p className="text-sm text-green-600">
                            Kampus berhasil ditambahkan!
                        </p>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    )
}
