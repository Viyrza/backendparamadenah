'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { BankImage } from './image-form'
import { toast } from 'react-hot-toast'
import { Textarea } from '@/components/ui/textarea'
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

interface EditImageDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    image: BankImage | null
    onEdit: () => void
}

export function EditImageDialog({
    open,
    onOpenChange,
    image,
    onEdit,
}: EditImageDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        tags: '',
    })
    const [newImageFile, setNewImageFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string>('')
    const [isUploading, setIsUploading] = useState(false)

    // Reset form when image changes
    useEffect(() => {
        if (image) {
            setFormData({
                name: image.name || '',
                description: image.description || '',
                tags: image.tags?.join(', ') || '',
            })
            setPreviewUrl(image.url)
            setNewImageFile(null)
        }
    }, [image])

    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            setNewImageFile(file)
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        },
        maxFiles: 1,
    })

    const handleRemoveImage = () => {
        setNewImageFile(null)
        setPreviewUrl(image?.url || '')
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!image) return

        setIsUploading(true)

        try {
            let imageUrl = image.url
            let publicId = image.id

            // If a new image is selected, upload it first
            if (newImageFile) {
                const uploadFormData = new FormData()
                uploadFormData.append('file', newImageFile)
                uploadFormData.append('folder', 'bank-image')

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: uploadFormData,
                })

                if (!uploadResponse.ok) {
                    throw new Error('Gagal mengupload gambar baru')
                }

                const uploadResult = await uploadResponse.json()
                if (!uploadResult.success) {
                    throw new Error(
                        uploadResult.error || 'Gagal mengupload gambar'
                    )
                }

                imageUrl =
                    uploadResult.data.secured_url ||
                    uploadResult.data.secure_url
                publicId = uploadResult.data.public_id

                // Delete old image if different
                if (image.id !== publicId) {
                    try {
                        await fetch(
                            `/api/upload/${encodeURIComponent(image.id)}`,
                            {
                                method: 'DELETE',
                            }
                        )
                    } catch (error) {
                        console.warn('Failed to delete old image:', error)
                    }
                }
            }

            // Update image metadata in Cloudinary
            const updateResponse = await fetch(
                `/api/upload/${encodeURIComponent(publicId)}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        description: formData.description,
                        tags: formData.tags
                            .split(',')
                            .map((tag) => tag.trim())
                            .filter(Boolean),
                    }),
                }
            )

            if (!updateResponse.ok) {
                throw new Error('Gagal mengupdate metadata gambar')
            }

            const result = await updateResponse.json()
            if (!result.success) {
                throw new Error(result.error || 'Gagal mengupdate gambar')
            }

            toast.success('Gambar berhasil diupdate')
            onEdit()
            onOpenChange(false)
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Gagal mengupdate gambar'
            )
            console.error('Edit error:', error)
        } finally {
            setIsUploading(false)
        }
    }

    const handleClose = () => {
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl)
        }
        setNewImageFile(null)
        onOpenChange(false)
    }

    if (!image) return null

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Gambar</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Preview and Upload */}
                    <div className="space-y-4">
                        <Label>Gambar</Label>

                        {/* Current/Preview Image */}
                        {previewUrl && (
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg border"
                                />
                                {newImageFile && (
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={handleRemoveImage}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Upload Zone */}
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                isDragActive
                                    ? 'border-blue-400 bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600 mb-2">
                                {isDragActive
                                    ? 'Lepaskan file di sini'
                                    : 'Klik atau drag & drop untuk mengganti gambar'}
                            </p>
                            <p className="text-sm text-gray-500">
                                PNG, JPG, GIF hingga 10MB
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Nama Gambar</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="Masukkan nama gambar"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Deskripsi</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Masukkan deskripsi gambar"
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="tags">
                                Tags (pisahkan dengan koma)
                            </Label>
                            <Input
                                id="tags"
                                value={formData.tags}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        tags: e.target.value,
                                    })
                                }
                                placeholder="contoh: kampus, gedung, ruangan"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isUploading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
