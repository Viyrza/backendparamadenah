'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useDisclosure } from '@/hooks/use-disclosure'
import { Plus } from 'lucide-react'
import { createFasilitas } from '@/actions/admin/fasilitas'
import { FASILITAS_CATEGORIES } from '@/lib/constants/fasilitas'
import BankImageSelector from '../../bank-image-selector'

const initialState:
    | { success: true; id: string }
    | {
          success: false
          error: {
              fieldErrors?: {
                  name?: string[]
                  description?: string[]
                  category?: string[]
                  image?: string[]
                  denah_lokasi?: string[]
              }
              formError?: string
          }
      } = {
    success: false,
    error: {
        fieldErrors: {},
    },
}

type AddFasilitasProps = {
    refetch?: () => void
}

export default function AddFasilitasModal({ refetch }: AddFasilitasProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [state, formAction, isPending] = useActionState(
        createFasilitas,
        initialState
    )
    const formRef = useRef<HTMLFormElement>(null)
    const hasRefetched = useRef<boolean>(false)
    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')
    const [imageInputValue, setImageInputValue] = useState<string>('')
    const [denahImage, setDenahImage] = useState<string>('')

    const handleImageSelect = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl)
        setImageInputValue(imageUrl)
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            if (formRef.current) {
                formRef.current.reset()
            }
            setSelectedImageUrl('')
            setImageInputValue('')
            setDenahImage('')
            hasRefetched.current = false
        }
    }

    useEffect(() => {
        if (state.success && refetch && !hasRefetched.current) {
            hasRefetched.current = true
            refetch()
            setTimeout(() => {
                setIsOpen(false)
            }, 1500)
        }
    }, [state.success, refetch, setIsOpen])
    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="lg"
                    className="bg-background_primary hover:bg-slate-700"
                >
                    <p className="hidden md:block">Add Fasilitas</p>
                    <Plus />
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Tambah Fasilitas</DialogTitle>
                </DialogHeader>

                <form
                    id="add-fasilitas-form"
                    ref={formRef}
                    action={formAction}
                    className="space-y-3 max-h-96 overflow-y-auto p-2"
                >
                    <input type="hidden" name="image" value={imageInputValue} />
                    <input type="hidden" name="denah_lokasi" value={denahImage} />

                    <Label htmlFor="category">Kategori Fasilitas</Label>
                    <select
                        id="category"
                        name="category"
                        required
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
                    <Label htmlFor="name">Nama Fasilitas</Label>
                    <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Masukkan nama fasilitas"
                        required
                    />
                    {!state.success && state.error?.fieldErrors?.name && (
                        <p className="text-sm text-red-500 mt-1">
                            {state.error.fieldErrors.name[0]}
                        </p>
                    )}
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                        id="description"
                        name="description"
                        placeholder="Masukkan deskripsi fasilitas"
                        className="min-h-[100px]"
                        required
                    />
                    {!state.success && state.error?.fieldErrors?.description && (
                        <p className="text-sm text-red-500 mt-1">
                            {state.error.fieldErrors.description[0]}
                        </p>
                    )}

                    {!state.success && state.error?.formError && (
                        <p className="text-sm text-red-500">
                            {state.error.formError}
                        </p>
                    )}

                    {/* Preview Fasilitas */}
                    {selectedImageUrl && (
                        <div className="mt-3">
                            <Label className="text-sm text-gray-600 mb-2 block">
                                Preview Fasilitas
                            </Label>
                            <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                                <img
                                    src={selectedImageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        console.error('Image load error:', selectedImageUrl)
                                        e.currentTarget.src = '/placeholder-image.png'
                                        e.currentTarget.alt = 'Error loading image'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                    <BankImageSelector
                        onImageSelect={handleImageSelect}
                        selectedImageUrl={selectedImageUrl}
                        triggerButton={
                            <Button type="button" variant="outline" className="w-full">
                                <Plus className="w-4 h-4 mr-2" /> Pilih Gambar Fasilitas
                            </Button>
                        }
                    />


                </form>
                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
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
                        {isPending ? 'Mengirim...' : 'Kirim'}
                    </Button>
                </DialogFooter>
                {state.success && (
                    <p className="text-sm text-green-600">
                        Fasilitas berhasil ditambahkan!
                    </p>
                )}
            </DialogContent>
        </Dialog>
    )
}
