'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { useDisclosure } from '@/hooks/use-disclosure'
import {
    Upload,
    Image as ImageIcon,
    Edit2,
    Trash2,
    Copy,
    Check,
    Grid,
    List,
} from 'lucide-react'
import { database } from '@/lib/firebase/firebase.config'
import { ref, push, get, set, remove } from 'firebase/database'
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

interface UploadImageModalProps {
    onImageUploaded: () => void
}

function UploadImageModal({ onImageUploaded }: UploadImageModalProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        description: '',
        tags: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUploading(true)

        try {
            const imageData: Omit<BankImage, 'id'> = {
                name: formData.name,
                url: formData.url,
                description: formData.description,
                tags: formData.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                uploadedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }

            const bankImageRef = ref(database, 'bank-images')
            await push(bankImageRef, imageData)

            toast.success('Image berhasil ditambahkan ke bank image')
            setFormData({ name: '', url: '', description: '', tags: '' })
            setIsOpen(false)
            onImageUploaded()
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Gagal menambahkan image')
        } finally {
            setUploading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Upload Image ke Bank</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Nama Image</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            placeholder="Nama descriptive untuk image"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="url">URL Image</Label>
                        <Input
                            id="url"
                            type="url"
                            value={formData.url}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    url: e.target.value,
                                }))
                            }
                            placeholder="https://example.com/image.jpg"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">
                            Deskripsi (Optional)
                        </Label>
                        <Input
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                            placeholder="Deskripsi singkat tentang image"
                        />
                    </div>

                    <div>
                        <Label htmlFor="tags">Tags (Optional)</Label>
                        <Input
                            id="tags"
                            value={formData.tags}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    tags: e.target.value,
                                }))
                            }
                            placeholder="gedung, kelas, furniture (pisahkan dengan koma)"
                        />
                    </div>

                    {formData.url && (
                        <div>
                            <Label>Preview:</Label>
                            <img
                                src={formData.url}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded border mt-2"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={uploading}>
                            {uploading ? 'Menyimpan...' : 'Simpan Image'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface EditImageModalProps {
    image: BankImage
    onImageUpdated: () => void
}

function EditImageModal({ image, onImageUpdated }: EditImageModalProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [updating, setUpdating] = useState(false)
    const [formData, setFormData] = useState({
        name: image.name,
        url: image.url,
        description: image.description || '',
        tags: image.tags?.join(', ') || '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)

        try {
            const updatedData = {
                ...image,
                name: formData.name,
                url: formData.url,
                description: formData.description,
                tags: formData.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                updatedAt: new Date().toISOString(),
            }

            const imageRef = ref(database, `bank-images/${image.id}`)
            await set(imageRef, updatedData)

            toast.success('Image berhasil diupdate')
            setIsOpen(false)
            onImageUpdated()
        } catch (error) {
            console.error('Error updating image:', error)
            toast.error('Gagal mengupdate image')
        } finally {
            setUpdating(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                    <Edit2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-full h-screen max-w-full max-h-screen p-6 overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Image</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="edit-name">Nama Image</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-url">URL Image</Label>
                        <Input
                            id="edit-url"
                            type="url"
                            value={formData.url}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    url: e.target.value,
                                }))
                            }
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-description">Deskripsi</Label>
                        <Input
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />
                    </div>

                    <div>
                        <Label htmlFor="edit-tags">Tags</Label>
                        <Input
                            id="edit-tags"
                            value={formData.tags}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    tags: e.target.value,
                                }))
                            }
                        />
                    </div>

                    {formData.url && (
                        <div>
                            <Label>Preview:</Label>
                            <img
                                src={formData.url}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded border mt-2"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                }}
                            />
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={updating}>
                            {updating ? 'Menyimpan...' : 'Update Image'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

interface DeleteImageModalProps {
    image: BankImage
    onImageDeleted: () => void
}

function DeleteImageModal({ image, onImageDeleted }: DeleteImageModalProps) {
    const { isOpen, setIsOpen } = useDisclosure()
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        setDeleting(true)

        try {
            const imageRef = ref(database, `bank-images/${image.id}`)
            await remove(imageRef)

            toast.success('Image berhasil dihapus')
            setIsOpen(false)
            onImageDeleted()
        } catch (error) {
            console.error('Error deleting image:', error)
            toast.error('Gagal menghapus image')
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Hapus Image</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p>
                        Apakah Anda yakin ingin menghapus image "{image.name}"?
                    </p>
                    <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-32 object-cover rounded border"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? 'Menghapus...' : 'Hapus'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function BankImageManager() {
    const [images, setImages] = useState<BankImage[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchTerm, setSearchTerm] = useState('')
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const fetchImages = async () => {
        try {
            setLoading(true)
            const bankImageRef = ref(database, 'bank-images')
            const snapshot = await get(bankImageRef)

            if (snapshot.exists()) {
                const data = snapshot.val()
                const imageList = Object.entries(data)
                    .map(([id, value]: [string, any]) => ({
                        id,
                        ...value,
                    }))
                    .sort(
                        (a, b) =>
                            new Date(b.uploadedAt).getTime() -
                            new Date(a.uploadedAt).getTime()
                    )

                setImages(imageList)
            } else {
                setImages([])
            }
        } catch (error) {
            console.error('Error fetching images:', error)
            toast.error('Gagal memuat bank image')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchImages()
    }, [])

    const copyToClipboard = async (url: string, id: string) => {
        try {
            await navigator.clipboard.writeText(url)
            setCopiedId(id)
            toast.success('URL berhasil disalin')
            setTimeout(() => setCopiedId(null), 2000)
        } catch (error) {
            toast.error('Gagal menyalin URL')
        }
    }

    const filteredImages = images.filter(
        (image) =>
            image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            image.description
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
            image.tags?.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            )
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            </div>
        )
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5" />
                        Bank Image Manager
                    </CardTitle>
                    <div className="flex gap-2">
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
                        <UploadImageModal onImageUploaded={fetchImages} />
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <Input
                        placeholder="Cari image berdasarkan nama, deskripsi, atau tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />
                    <span className="text-sm text-gray-500">
                        {filteredImages.length} dari {images.length} image
                    </span>
                </div>
            </CardHeader>

            <CardContent>
                {filteredImages.length === 0 ? (
                    <div className="text-center py-8">
                        <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">
                            {searchTerm
                                ? 'Tidak ada image yang cocok dengan pencarian'
                                : 'Belum ada image di bank'}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredImages.map((image) => (
                            <div
                                key={image.id}
                                className="border rounded-lg overflow-hidden"
                            >
                                <img
                                    src={image.url}
                                    alt={image.name}
                                    className="w-full h-32 object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            '/placeholder-image.png'
                                    }}
                                />
                                <div className="p-3 space-y-2">
                                    <h4 className="font-medium text-sm truncate">
                                        {image.name}
                                    </h4>
                                    {image.description && (
                                        <p className="text-xs text-gray-600 line-clamp-2">
                                            {image.description}
                                        </p>
                                    )}
                                    {image.tags && image.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {image.tags
                                                .slice(0, 2)
                                                .map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            {image.tags.length > 2 && (
                                                <span className="text-xs text-gray-500">
                                                    +{image.tags.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <div className="flex gap-1 justify-between">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                copyToClipboard(
                                                    image.url,
                                                    image.id
                                                )
                                            }
                                            className="flex-1"
                                        >
                                            {copiedId === image.id ? (
                                                <Check className="h-3 w-3" />
                                            ) : (
                                                <Copy className="h-3 w-3" />
                                            )}
                                        </Button>
                                        <EditImageModal
                                            image={image}
                                            onImageUpdated={fetchImages}
                                        />
                                        <DeleteImageModal
                                            image={image}
                                            onImageDeleted={fetchImages}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredImages.map((image) => (
                            <div
                                key={image.id}
                                className="flex items-center gap-4 p-3 border rounded-lg"
                            >
                                <img
                                    src={image.url}
                                    alt={image.name}
                                    className="w-16 h-16 object-cover rounded"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            '/placeholder-image.png'
                                    }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">
                                        {image.name}
                                    </h4>
                                    {image.description && (
                                        <p className="text-sm text-gray-600 truncate">
                                            {image.description}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        {new Date(
                                            image.uploadedAt
                                        ).toLocaleDateString('id-ID')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                            copyToClipboard(image.url, image.id)
                                        }
                                    >
                                        {copiedId === image.id ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <EditImageModal
                                        image={image}
                                        onImageUpdated={fetchImages}
                                    />
                                    <DeleteImageModal
                                        image={image}
                                        onImageDeleted={fetchImages}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
