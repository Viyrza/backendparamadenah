'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { useDisclosure } from '@/hooks/use-disclosure'
import { Image as ImageIcon, Search, Check, Grid, List } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface BankImage {
    id: string
    name: string
    url: string
    description?: string
    tags?: string[]
    uploadedAt: string
    updatedAt: string
}

interface BankImageSelectorProps {
    onImageSelect: (imageUrl: string) => void
    triggerButton?: React.ReactNode
    selectedImageUrl?: string
}

export default function BankImageSelector({
    onImageSelect,
    triggerButton,
    selectedImageUrl,
}: BankImageSelectorProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [images, setImages] = useState<BankImage[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedImage, setSelectedImage] = useState<string | null>(
        selectedImageUrl || null
    )
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

    const fetchImages = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/upload')
            const result = await res.json()

            if (result.success) {
                // Map the response to use secured_url and ensure proper structure
                const mappedImages = result.data.map(
                    (image: any, index: number) => {
                        const imageUrl =
                            image.secured_url || image.secure_url || image.url
                        console.log(`Image ${index + 1} URL:`, imageUrl) // Debug log
                        return {
                            id: image.public_id || `image-${index}`,
                            name:
                                image.display_name ||
                                image.public_id ||
                                `Image ${index + 1}`,
                            url: imageUrl, // Use secured_url primarily
                            description:
                                image.context?.alt ||
                                image.context?.caption ||
                                '',
                            tags: image.tags || [],
                            uploadedAt:
                                image.created_at || new Date().toISOString(),
                            updatedAt:
                                image.created_at || new Date().toISOString(),
                        }
                    }
                )
                setImages(mappedImages)
            } else {
                setImages([])
                toast.error('Gagal memuat image dari Cloudinary')
            }
        } catch (error) {
            console.error('Error fetching images:', error)
            toast.error('Gagal memuat bank image')
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {
        if (isOpen) {
            fetchImages()
        }
    }, [isOpen])

    useEffect(() => {
        setSelectedImage(selectedImageUrl || null)
    }, [selectedImageUrl])

    const handleImageSelect = (imageUrl: string) => {
        setSelectedImage(imageUrl)
    }

    const handleConfirmSelection = () => {
        if (selectedImage) {
            console.log('Selected image URL:', selectedImage) // Debug log
            onImageSelect(selectedImage)
            setIsOpen(false)
            toast.success('Image berhasil dipilih')
        }
    }

    const filteredImages = images.filter((image) => {
        const name = image.name || ''
        const description = image.description || ''
        const tags = image.tags || []

        return (
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            )
        )
    })

    const defaultTrigger = (
        <Button variant="outline" className="w-full">
            <ImageIcon className="h-4 w-4 mr-2" />
            Pilih dari Bank Image
        </Button>
    )

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {triggerButton || defaultTrigger}
            </DialogTrigger>

            <DialogContent className="max-w-full w-screen max-h-full h-screen flex flex-col p-0 m-0 rounded-none">
                {/* Header */}
                <div className="flex-shrink-0 p-6 border-b">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            Pilih Image dari Bank
                        </DialogTitle>
                    </DialogHeader>

                    {/* Search and Controls */}
                    <div className="flex gap-4 items-center mt-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Cari image berdasarkan nama, deskripsi, atau tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setViewMode(
                                    viewMode === 'grid' ? 'list' : 'grid'
                                )
                            }
                        >
                            {viewMode === 'grid' ? (
                                <List className="h-4 w-4" />
                            ) : (
                                <Grid className="h-4 w-4" />
                            )}
                        </Button>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                            {filteredImages.length} dari {images.length} image
                        </div>
                    </div>
                </div>

                {/* Selected Image Preview */}
                {selectedImage && (
                    <div className="flex-shrink-0 p-4 bg-blue-50 border-b">
                        <div className="flex items-center gap-4">
                            <img
                                src={selectedImage}
                                alt="Selected"
                                className="w-16 h-16 object-cover rounded border"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-800 mb-1">
                                    Image yang dipilih:
                                </p>
                                <p className="text-xs text-blue-600 truncate">
                                    {selectedImage}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-hidden p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-500">
                                    Memuat bank image...
                                </p>
                            </div>
                        </div>
                    ) : filteredImages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <ImageIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm
                                        ? 'Tidak ada hasil'
                                        : 'Bank image kosong'}
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm
                                        ? 'Tidak ada image yang cocok dengan pencarian Anda'
                                        : 'Belum ada image di bank. Upload image terlebih dahulu.'}
                                </p>
                            </div>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="h-full overflow-y-auto">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {filteredImages.map((image, index) => (
                                    <div
                                        key={
                                            image.id || `${image.url}-${index}`
                                        }
                                        className={`group border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                            selectedImage === image.url
                                                ? 'ring-2 ring-blue-500 border-blue-500 shadow-lg'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() =>
                                            handleImageSelect(image.url)
                                        }
                                    >
                                        <div className="relative aspect-square">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src =
                                                        '/placeholder-image.png'
                                                }}
                                            />
                                            {selectedImage === image.url && (
                                                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                                                    <div className="bg-blue-500 text-white rounded-full p-2">
                                                        <Check className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                                <h4 className="text-white text-sm font-medium truncate">
                                                    {image.name}
                                                </h4>
                                            </div>
                                        </div>
                                        {image.tags &&
                                            image.tags.length > 0 && (
                                                <div className="p-2 bg-gray-50">
                                                    <div className="flex flex-wrap gap-1">
                                                        {image.tags
                                                            .slice(0, 2)
                                                            .map(
                                                                (
                                                                    tag,
                                                                    tagIndex
                                                                ) => (
                                                                    <span
                                                                        key={`${image.id}-${tag}-${tagIndex}`}
                                                                        className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                                                                    >
                                                                        {tag}
                                                                    </span>
                                                                )
                                                            )}
                                                        {image.tags.length >
                                                            2 && (
                                                            <span className="text-xs text-gray-500">
                                                                +
                                                                {image.tags
                                                                    .length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-y-auto">
                            <div className="space-y-3">
                                {filteredImages.map((image, index) => (
                                    <div
                                        key={
                                            image.id || `${image.url}-${index}`
                                        }
                                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                                            selectedImage === image.url
                                                ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                                        }`}
                                        onClick={() =>
                                            handleImageSelect(image.url)
                                        }
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.name}
                                            className="w-16 h-16 object-cover rounded border"
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    '/placeholder-image.png'
                                            }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate mb-1">
                                                {image.name}
                                            </h4>
                                            {image.description && (
                                                <p className="text-sm text-gray-600 truncate mb-2">
                                                    {image.description}
                                                </p>
                                            )}
                                            {image.tags &&
                                                image.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {image.tags.map(
                                                            (tag, tagIndex) => (
                                                                <span
                                                                    key={`${image.id}-${tag}-${tagIndex}`}
                                                                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                        {selectedImage === image.url && (
                                            <div className="flex-shrink-0">
                                                <Check className="h-6 w-6 text-blue-500" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex-shrink-0 p-6 border-t bg-gray-50">
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="mr-2"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleConfirmSelection}
                            disabled={!selectedImage}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                        >
                            {selectedImage
                                ? 'Pilih Image'
                                : 'Pilih Image Terlebih Dahulu'}
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    )
}
