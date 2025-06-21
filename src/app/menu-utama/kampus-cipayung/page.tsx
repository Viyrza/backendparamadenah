'use client'

import DataTable from '@/components/container/sadchn-table'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Eye, Pencil, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AddModalGedung from '@/components/container/modal/gedung/add-gedung'
import { getKampusPaginated } from '@/actions/admin/gedung'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GedungOverview from '@/components/container/gedung-overview'
import EditModalGedung from '@/components/container/modal/gedung/edit-gedung'
import DeleteModalGedung from '@/components/container/modal/gedung/delete-gedung'

type Gedung = {
    id: string
    firebaseId: string
    name: string
    image?: string
    kode_gedung?: string
    slug: string
}

export default function Page() {
    const router = useRouter()
    const [gedungList, setGedungList] = useState<Gedung[]>([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [total, setTotal] = useState(0)
    const [, setHasNextPage] = useState(false)
    const [, setHasPrevPage] = useState(false)

    const fetchData = async (page: number = 1) => {
        try {
            setLoading(true)
            const response = await getKampusPaginated(page, 5)
            setGedungList(response.data)
            setCurrentPage(response.currentPage)
            setTotalPages(response.totalPages)
            setTotal(response.total)
            setHasNextPage(response.hasNextPage ?? false)
            setHasPrevPage(response.hasPrevPage ?? false)
        } catch (error) {
            console.error('Error fetching gedung data:', error)
        } finally {
            setLoading(false)
        }
    }

    const refetch = () => {
        fetchData(currentPage)
    }

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <div className="space-y-6 mx-auto pt-8">
            <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-between">
                    <Button variant="outline">
                        <ArrowLeft />
                        <span className="ml-2" onClick={() => router.back()}>
                            Kembali
                        </span>
                    </Button>
                    <AddModalGedung refetch={refetch} />
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="overview">
                            Overview Gedung & Kelas
                        </TabsTrigger>
                        <TabsTrigger value="table">Tabel Gedung</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        <GedungOverview />
                    </TabsContent>

                    <TabsContent value="table" className="space-y-4">
                        <DataTable
                            className="px-5"
                            columns={[
                                { key: 'id', title: 'ID' },
                                { key: 'name', title: 'Name' },
                                { key: 'image', title: 'Image' },
                                { key: 'kode_gedung', title: 'Kode Gedung' },
                                { key: 'action', title: 'Action' },
                            ]}
                            rows={gedungList.map((item: Gedung) => ({
                                id: Number(item.id),
                                name: item.name,
                                image: (
                                    <img
                                        src={
                                            item.image ||
                                            'https://via.placeholder.com/80x40'
                                        }
                                        alt={item.name}
                                        className="w-20 h-12 object-cover rounded-md"
                                    />
                                ),
                                kode_gedung: item.kode_gedung,
                                action: (
                                    <div className="flex items-center gap-2">
                                        <EditModalGedung
                                            gedungId={item.firebaseId}
                                            refetch={refetch}
                                        />
                                        <DeleteModalGedung
                                            gedungId={item.firebaseId}
                                            gedungName={item.name}
                                            refetch={refetch}
                                        />
                                    </div>
                                ),
                            }))}
                            isLoading={loading}
                            pagination={{
                                currentPage,
                                totalPages,
                                pageSize: 5,
                                total,
                                onPageChange: fetchData,
                            }}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
