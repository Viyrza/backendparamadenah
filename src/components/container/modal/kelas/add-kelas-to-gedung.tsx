'use client'

import { useEffect, useState } from 'react'
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
import BankImageSelector from '@/components/container/bank-image-selector'
import { Plus, X, Image as ImageIcon } from 'lucide-react'

type AddKelasToGedungModalProps = {
    gedungId: string
    gedungName: string
    refetch: (page?: number) => void
}

type KelasFormError = {
    fieldErrors?: {
        code_kelas?: string[]
        kapasitas_orang?: string[]
        total_papan_tulis?: string[]
        total_televisi?: string[]
        lantai?: string[]
        gedung_id?: string[]
        images?: string[]
        denah_images?: string[]
    }
}

export default function AddKelasToGedungModal({
    gedungId,
    gedungName,
    refetch,
}: AddKelasToGedungModalProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [imageUrls, setImageUrls] = useState<string[]>([''])
    const [denahUrls, setDenahUrls] = useState<string[]>([])
    const [showBankImage, setShowBankImage] = useState(false)
    const [showBankDenah, setShowBankDenah] = useState(false)
    const [formValues, setFormValues] = useState({
        code_kelas: '',
        lantai: '',
        kapasitas_orang: 1,
        total_papan_tulis: 1,
        total_televisi: 1,
    })
    const [errors, setErrors] = useState<KelasFormError>({})
    const [isPending, setIsPending] = useState(false)

    useEffect(() => {
        if (!isOpen) resetForm()
    }, [isOpen])

    const resetForm = () => {
        setImageUrls([''])
        setDenahUrls([])
        setFormValues({
            code_kelas: '',
            lantai: '',
            kapasitas_orang: 1,
            total_papan_tulis: 1,
            total_televisi: 1,
        })
        setErrors({})
    }

    const handleAddImage = () => setImageUrls(prev => [...prev, ''])
    const handleRemoveImage = (idx: number) =>
        setImageUrls(prev => prev.filter((_, i) => i !== idx))
    const handleChangeImage = (idx: number, value: string) =>
        setImageUrls(prev => prev.map((url, i) => (i === idx ? value : url)))

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target
        setFormValues(prev => ({
            ...prev,
            [name]: name.startsWith('kapasitas') || name.startsWith('total_')
                ? Number(value)
                : value,
        }))
    }

    const handleAddFromBankImage = (url: string) => {
        if (!imageUrls.includes(url)) {
            setImageUrls(prev => [...prev, url])
        }
        setShowBankImage(false)
    }

    const handleAddDenahFromBank = (url: string) => {
        if (!denahUrls.includes(url)) {
            setDenahUrls(prev => [...prev, url])
        }
        setShowBankDenah(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        setErrors({})

        const formData = new FormData()
        formData.append('gedung_id', gedungId)
        formData.append('code_kelas', formValues.code_kelas)
        formData.append('lantai', formValues.lantai)
        formData.append('kapasitas_orang', String(formValues.kapasitas_orang))
        formData.append('total_papan_tulis', String(formValues.total_papan_tulis))
        formData.append('total_televisi', String(formValues.total_televisi))

        imageUrls.filter(Boolean).forEach((img) =>
            formData.append('images[]', img)
        )

        denahUrls.filter(Boolean).forEach((img) =>
            formData.append('denah_images[]', img)
        )

        try {
            const res = await fetch('/api/kelas', {
                method: 'POST',
                body: formData,
            })

            const result = await res.json()

            if (result.success) {
                setIsOpen(false)
                refetch?.()
            } else {
                setErrors(result.error || {})
            }
        } catch (err) {
            console.error('❌ Error saat submit kelas:', err)
            setErrors({
                fieldErrors: {
                    code_kelas: ['Terjadi kesalahan pada sistem. Silakan coba lagi.'],
                },
            })
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Kelas
                </Button>
            </DialogTrigger>
            <DialogContent aria-describedby={undefined}>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Tambah Kelas ke {gedungName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 max-h-96 overflow-y-auto p-2">
                        <div>
                            <Label>Code Kelas</Label>
                            <Input
                                name="code_kelas"
                                type="text"
                                required
                                value={formValues.code_kelas}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>Lantai</Label>
                            <select
                                name="lantai"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                value={formValues.lantai}
                                onChange={handleChange}
                            >
                                <option value="">Pilih Lantai</option>
                                <option value="lantai_1">Lantai 1</option>
                                <option value="lantai_2">Lantai 2</option>
                                <option value="lantai_3">Lantai 3</option>
                                <option value="lantai_4">Lantai 4</option>
                                <option value="lantai_5">Lantai 5</option>
                            </select>
                        </div>
                        <div>
                            <Label>Kapasitas (orang)</Label>
                            <Input
                                name="kapasitas_orang"
                                type="number"
                                min="1"
                                required
                                value={formValues.kapasitas_orang}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>Jumlah Papan Tulis</Label>
                            <Input
                                name="total_papan_tulis"
                                type="number"
                                min="0"
                                required
                                value={formValues.total_papan_tulis}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <Label>Jumlah Televisi</Label>
                            <Input
                                name="total_televisi"
                                type="number"
                                min="0"
                                required
                                value={formValues.total_televisi}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Images */}
                        <div>
                            <Label>Image (bisa lebih dari satu)</Label>
                            {imageUrls.map((url, idx) => (
                                <div key={idx} className="flex items-center gap-2 mb-2">
                                    <Input
                                        type="url"
                                        value={url}
                                        placeholder="https://example.com/image.jpg"
                                        onChange={(e) => handleChangeImage(idx, e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleRemoveImage(idx)}
                                        disabled={imageUrls.length === 1}
                                        className="text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <div className="flex gap-2 mt-2">
                                <Button type="button" onClick={handleAddImage}>
                                    + Tambah Gambar Manual
                                </Button>
                                <Button type="button" onClick={() => setShowBankImage(true)}>
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Pilih dari Bank Image
                                </Button>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {imageUrls.filter(Boolean).map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt={`Image ${idx + 1}`}
                                        className="w-20 h-20 object-cover border rounded"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Denah (Hanya dari Bank Image) */}
                        <div>
                            <Label>Denah Kelas (pilih dari bank image)</Label>
                            <div className="flex gap-2 mt-2">
                                <Button type="button" onClick={() => setShowBankDenah(true)}>
                                    <ImageIcon className="w-4 h-4 mr-2" />
                                    Pilih Denah dari Bank Image
                                </Button>
                            </div>
                            <div className="flex gap-2 mt-2 flex-wrap">
                                {denahUrls.filter(Boolean).map((url, idx) => (
                                    <img
                                        key={idx}
                                        src={url}
                                        alt={`Denah ${idx + 1}`}
                                        className="w-20 h-20 object-cover border rounded"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                            Batal
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isPending}>
                            {isPending ? 'Menyimpan...' : 'Tambah Kelas'}
                        </Button>
                    </DialogFooter>
                </form>

                {/* Bank Image Selector untuk gambar biasa */}
                {showBankImage && (
                    <BankImageSelector
                        onImageSelect={handleAddFromBankImage}
                        triggerButton={null}
                        selectedImageUrl={null}
                    />
                )}

                {/* Bank Image Selector untuk denah */}
                {showBankDenah && (
                    <BankImageSelector
                        onImageSelect={handleAddDenahFromBank}
                        triggerButton={null}
                        selectedImageUrl={null}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}
