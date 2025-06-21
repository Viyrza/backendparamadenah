'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { toast } from 'react-hot-toast'
import ImageFormDialog, {
    BankImage,
} from '@/components/container/modal/bank-image/image-form'
import { useDisclosure } from '@/hooks/use-disclosure'
import { DeleteImageDialog } from '@/components/container/modal/bank-image/delete-image'
import { EditImageDialog } from '@/components/container/modal/bank-image/edit-image'

export default function BankImageManagementPage() {
    const [images, setImages] = useState<BankImage[]>([])
    const [selectedImage, setSelectedImage] = useState<BankImage | null>(null)
    const { isOpen: openForm, setIsOpen: setOpenForm } = useDisclosure()
    const { isOpen: openDelete, setIsOpen: setOpenDelete } = useDisclosure()
    const { isOpen: openEdit, setIsOpen: setOpenEdit } = useDisclosure()

    const fetchImages = async () => {
        try {
            const res = await fetch('/api/upload')
            const result = await res.json()
            if (result.success) {
                const mappedImages = result.data.map(
                    (image: any, index: number) => ({
                        id: image.public_id || `image-${index}`,
                        name:
                            image.display_name ||
                            image.public_id ||
                            `Image ${index + 1}`,
                        url: image.secured_url || image.secure_url || image.url, // Use secured_url primarily
                        description:
                            image.context?.alt || image.context?.caption || '',
                        tags: image.tags || [],
                        uploadedAt:
                            image.created_at || new Date().toISOString(),
                        updatedAt: image.updated_at || new Date().toISOString(),
                    })
                )
                setImages(mappedImages)
            } else {
                toast.error('Gagal memuat bank image')
            }
        } catch (err) {
            toast.error('Terjadi kesalahan saat memuat gambar')
            console.error(err)
        }
    }

    const handleDeleteImage = async (id: string) => {
        try {
            console.log('Attempting to delete image with ID:', id) // Debug log

            // ID already contains the full path from Cloudinary (e.g., "bank-image/fw5ovtqok1nsjmjrdny5")
            // We need to encode it properly for URL
            const encodedId = encodeURIComponent(id)
            console.log('Encoded ID:', encodedId) // Debug log

            const response = await fetch(`/api/upload/${encodedId}`, {
                method: 'DELETE',
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                toast.success('Image berhasil dihapus')
                // Refresh the images list
                fetchImages()
            } else {
                throw new Error(result.error || 'Gagal menghapus image')
            }
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Gagal menghapus image'
            )
            console.error('Delete error:', error)
        }
    }

    useEffect(() => {
        fetchImages()
    }, [])

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex flex-col gap-4">
                    <h1 className="text-2xl font-semibold">
                        Manajemen Bank Image
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Total {images.length} gambar tersimpan
                    </p>
                </div>
                <Button
                    onClick={() => setOpenForm(true)}
                    size="lg"
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden md:inline">Tambah Image</span>
                </Button>
            </div>
            {images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <p className="text-muted-foreground">Belum ada gambar</p>
                    <Button onClick={() => setOpenForm(true)}>
                        Tambah Gambar Pertama
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                        >
                            {' '}
                            <div className="relative aspect-square overflow-hidden">
                                <img
                                    src={img.url}
                                    alt={img.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                    loading="lazy"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            '/placeholder-image.png'
                                    }}
                                />
                                <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2"></div>
                                </div>
                            </div>{' '}
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                                    {img.name}
                                </h3>
                                {img.description && (
                                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                        {img.description}
                                    </p>
                                )}
                                {img.tags && img.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                        {img.tags
                                            .slice(0, 2)
                                            .map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        {img.tags.length > 2 && (
                                            <span className="text-xs text-gray-500">
                                                +{img.tags.length - 2}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>
                                        {new Date(
                                            img.uploadedAt
                                        ).toLocaleDateString('id-ID')}
                                    </span>
                                </div>
                                <div className='flex gap-2 py-3'>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedImage(img)
                                            setOpenEdit(true)
                                        }}
                                    >
                                        <Pencil className="w-3 h-3 mr-1" />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            setSelectedImage(img)
                                            setOpenDelete(true)
                                        }}
                                    >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Hapus
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <ImageFormDialog
                open={openForm}
                onOpenChange={(open) => {
                    setOpenForm(open)
                    if (!open) fetchImages()
                }}
            />{' '}
            {selectedImage && (
                <DeleteImageDialog
                    open={openDelete}
                    onOpenChange={setOpenDelete}
                    image={selectedImage}
                    onDelete={handleDeleteImage}
                />
            )}
            {selectedImage && (
                <EditImageDialog
                    open={openEdit}
                    onOpenChange={setOpenEdit}
                    image={selectedImage}
                    onEdit={fetchImages}
                />
            )}
        </div>
    )
}
