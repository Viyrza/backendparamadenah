'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import AddFasilitasModal from '@/components/container/modal/fasilitas/add-fasilitas'
import EditFasilitasModal from '@/components/container/modal/fasilitas/edit-fasilitas'
import DeleteFasilitasModal from '@/components/container/modal/fasilitas/delete-fasilitas'
import {
    getAllFasilitasGrouped,
    deleteFasilitas,
} from '@/actions/admin/fasilitas'
import {
    FASILITAS_CATEGORIES,
    type FasilitasCategory,
} from '@/lib/constants/fasilitas'
import Image from 'next/image'
import AddFasilitasItemModal from '@/components/container/modal/fasilitas/add-fasilitas-item'

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

export default function Page() {
    const [fasilitasGrouped, setFasilitasGrouped] = useState<
        Record<string, Fasilitas[]>
    >({})
    const [loading, setLoading] = useState<boolean>(true)
    const [activeTab, setActiveTab] = useState<string>('all')
    const [selectedFasilitas, setSelectedFasilitas] =
        useState<Fasilitas | null>(null)
    const [editModalOpen, setEditModalOpen] = useState<boolean>(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
    const router = useRouter();

    const fetchFasilitas = async () => {
        try {
            setLoading(true)
            const grouped = await getAllFasilitasGrouped()
            setFasilitasGrouped(grouped)
        } catch (error) {
            console.error('Error fetching fasilitas:', error)
        } finally {
            setLoading(false)
        }
    }

    const refetch = async () => {
        await fetchFasilitas()
    }

    const handleEdit = (fasilitas: Fasilitas) => {
        setSelectedFasilitas(fasilitas)
        setEditModalOpen(true)
    }

    const handleDelete = (fasilitas: Fasilitas) => {
        setSelectedFasilitas(fasilitas)
        setDeleteModalOpen(true)
    }

    useEffect(() => {
        fetchFasilitas()
    }, [])

    const allFasilitas = Object.values(fasilitasGrouped).flat()

    const renderFasilitasGrid = (fasilitasList: Fasilitas[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardHeader>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="h-3 bg-gray-200 rounded"></div>
                                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : fasilitasList.length === 0 ? (
                <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">
                        Belum ada fasilitas yang ditambahkan
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                        Klik tombol "Add Fasilitas" untuk menambahkan fasilitas
                        baru
                    </p>
                </div>
            ) : (
                fasilitasList.map((fasilitas) => (
                    
                    <Card
                        key={`${fasilitas.category}-${fasilitas.slug}`}
                        className="hover:shadow-lg transition-shadow overflow-hidden"
                    >
                        {fasilitas.imageUrl && (
                            <div className="relative h-48 w-full overflow-hidden">
                                <Image
                                    src={fasilitas.imageUrl}
                                    alt={fasilitas.name}
                                    className="w-full h-full aspect-video"
                                    width={0}
                                    height={0}
                                    sizes="100%"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none'
                                    }}
                                />
                            </div>
                        )}

                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">
                                    {fasilitas.name}
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                    {
                                        FASILITAS_CATEGORIES[
                                            fasilitas.category as FasilitasCategory
                                        ]
                                    }
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                                {fasilitas.description}
                            </p>
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(fasilitas)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleDelete(fasilitas)}
                                >
                                    Hapus
                                </Button>
                                
                                 <AddFasilitasItemModal />
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
        </div>
    )

    return (
        <div className="space-y-6 mx-auto pt-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Manajemen Fasilitas</h1>
                    <p className="text-gray-600">
                        Kelola fasilitas kampus berdasarkan kategori
                    </p>
                </div>
                <AddFasilitasModal refetch={refetch} />
            </div>{' '}
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <div className="block md:hidden">
                    <TabsList className="flex w-max min-w-full h-auto p-1 gap-1 overflow-x-auto">
                        <TabsTrigger
                            value="all"
                            className="text-xs px-3 py-2 whitespace-nowrap flex-shrink-0"
                        >
                            Semua
                        </TabsTrigger>
                        {Object.entries(FASILITAS_CATEGORIES).map(
                            ([key, label]) => (
                                <TabsTrigger
                                    key={key}
                                    value={key}
                                    className="text-xs px-3 py-2 whitespace-nowrap flex-shrink-0"
                                >
                                    {label.split(' ')[0]}
                                </TabsTrigger>
                            )
                        )}
                    </TabsList>
                </div>

                {/* Desktop: Grid layout */}
                <div className="hidden md:block">
                    <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                        <TabsTrigger value="all" className="text-sm px-2 py-2">
                            Semua
                        </TabsTrigger>
                        {Object.entries(FASILITAS_CATEGORIES).map(
                            ([key, label]) => (
                                <TabsTrigger
                                    key={key}
                                    value={key}
                                    className="text-sm px-2 py-2"
                                >
                                    {label}
                                </TabsTrigger>
                            )
                        )}
                    </TabsList>
                </div>

                <TabsContent value="all" className="space-y-4">
                    {renderFasilitasGrid(allFasilitas)}
                </TabsContent>

                {Object.entries(FASILITAS_CATEGORIES).map(([categoryKey]) => (
                    <TabsContent
                        key={categoryKey}
                        value={categoryKey}
                        className="space-y-4"
                    >
                        {renderFasilitasGrid(
                            fasilitasGrouped[categoryKey] || []
                        )}
                    </TabsContent>
                ))}
            </Tabs>
            {selectedFasilitas && (
                <EditFasilitasModal
                    fasilitas={selectedFasilitas}
                    isOpen={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    onSuccess={refetch}
                />
            )}
            {selectedFasilitas && (
                <DeleteFasilitasModal
                    fasilitas={selectedFasilitas}
                    isOpen={deleteModalOpen}
                    onOpenChange={setDeleteModalOpen}
                    onSuccess={() => {
                        refetch()
                        setDeleteModalOpen(false)
                        setSelectedFasilitas(null)
                    }}
                />
            )}

         
        </div>
    )
}
