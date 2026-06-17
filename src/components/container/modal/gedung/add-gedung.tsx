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
import { Plus } from 'lucide-react'
import { useDisclosure } from '@/hooks/use-disclosure'
import { createGedung } from '@/actions/admin/gedung'
import BankImageSelector from '../../bank-image-selector'

const initialState:
    | { success: true; id: string }
    | {
          success: false
          error: {
              fieldErrors?: {
                  name?: string[]
                  image?: string[]
                  kode_gedung?: string[]
                  latitude?: string[]
                  longitude?: string[]
              }
              formError?: string
          }
      } = {
    success: false,
    error: { fieldErrors: {} },
}

type AddGedungModalProps = {
    refetch?: () => void
}

export default function AddModalGedung({ refetch }: AddGedungModalProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [state, formAction, isPending] = useActionState(
        createGedung,
        initialState
    )

    const formRef = useRef<HTMLFormElement>(null)
    const hasRefetched = useRef<boolean>(false)

    const [selectedImageUrl, setSelectedImageUrl] = useState<string>('')
    const [imageInputValue, setImageInputValue] = useState<string>('')

    const handleImageSelect = (imageUrl: string) => {
        setSelectedImageUrl(imageUrl)
        setImageInputValue(imageUrl)
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) {
            if (formRef.current) formRef.current.reset()
            setSelectedImageUrl('')
            setImageInputValue('')
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
    }, [state.success])

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="lg"
                    className="bg-background_primary hover:bg-slate-700"
                >
                    <Plus className="w-4 h-4 mr-2" /> Tambah Gedung
                </Button>
            </DialogTrigger>

            <DialogContent aria-describedby={undefined}>
                <DialogHeader>
                    <DialogTitle>Tambah Gedung Baru</DialogTitle>
                </DialogHeader>

                <form
                    id="add-gedung-form"
                    ref={formRef}
                    action={formAction}
                    className="space-y-4 max-h-96 overflow-y-auto p-2"
                >
                    <input type="hidden" name="image" value={imageInputValue} />

                    <div>
                        <Label htmlFor="name">Nama Gedung</Label>
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            placeholder="Masukkan nama gedung"
                            required
                        />
                        {!state.success &&
                            state.error?.fieldErrors?.name?.map((error, idx) => (
                                <p key={idx} className="text-sm text-red-500">{error}</p>
                            ))}
                    </div>

                    <div>
                        <Label htmlFor="kode_gedung">Kode Gedung</Label>
                        <Input
                            id="kode_gedung"
                            name="kode_gedung"
                            type="text"
                            placeholder="Contoh: A, B, JK, TPR"
                            required
                        />
                        {!state.success &&
                            state.error?.fieldErrors?.kode_gedung?.map((error, idx) => (
                                <p key={idx} className="text-sm text-red-500">{error}</p>
                            ))}
                    </div>

                    <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input
                            id="latitude"
                            name="latitude"
                            type="number"
                            step="any"
                            placeholder="Contoh: -6.348201"
                            required
                        />
                        {!state.success &&
                            state.error?.fieldErrors?.latitude?.map((error, idx) => (
                                <p key={idx} className="text-sm text-red-500">{error}</p>
                            ))}
                    </div>

                    <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input
                            id="longitude"
                            name="longitude"
                            type="number"
                            step="any"
                            placeholder="Contoh: 106.841912"
                            required
                        />
                        {!state.success &&
                            state.error?.fieldErrors?.longitude?.map((error, idx) => (
                                <p key={idx} className="text-sm text-red-500">{error}</p>
                            ))}
                    </div>
                        <div>
                            <Label>Preview Gambar</Label>
                            <div className="w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
                                <img
                                    src={selectedImageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = '/placeholder-image.png'
                                    }}
                                />
                            </div>
                        </div>
                

                    <BankImageSelector
                        onImageSelect={handleImageSelect}
                        selectedImageUrl={selectedImageUrl}
                        triggerButton={
                            <Button type="button" variant="outline" className="w-full">
                                <Plus className="w-4 h-4 mr-2" /> Pilih Gambar Gedung
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
                        form="add-gedung-form"
                        type="submit"
                        disabled={isPending}
                        className="bg-background_primary hover:bg-slate-700"
                    >
                        {isPending ? 'Mengirim...' : 'Tambah Gedung'}
                    </Button>
                </DialogFooter>

                {state.success && (
                    <p className="text-sm text-green-600">
                        Gedung berhasil ditambahkan!
                    </p>
                )}
            </DialogContent>
        </Dialog>
    )
}
