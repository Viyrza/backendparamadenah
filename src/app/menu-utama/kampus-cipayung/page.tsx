'use client'

import DataTable from '@/components/container/sadchn-table'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Pencil, Trash } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AddModalGedung from '@/components/container/modal/gedung/add-gedung'
import EditModalGedung from '@/components/container/modal/gedung/edit-gedung'
import DeleteModalGedung from '@/components/container/modal/gedung/delete-gedung'
import GedungOverview from '@/components/container/gedung-overview'
import { getKampusPaginated } from '@/actions/admin/gedung'

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

    console.log(gedungList)

    return (
        <div className="space-y-6 mx-auto pt-8">
            <div className="grid grid-cols-1 gap-6">
                <div className="flex justify-end">
                    <AddModalGedung refetch={refetch} />
                </div>

        <DataTable
          className="px-5"
          columns={[
            {key: "id", title:"ID"},
            { key: "name", title: "Name" },
            { key: "image", title: "Image" },
            { key: "action", title: "Action" },
          ]}
          rows={gedungList.map((item, index) => ({
            id: Number(item.id),
            name: item.name,
            image: (
              <img
                src={item.image || "https://via.placeholder.com/80x40"}
                alt={item.name}
                className="w-20 h-12 object-cover rounded-md"
              />
            ),
            action: (
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    console.log("Lihat detail:", item.id);
                  }}
                  className="bg-slate-800 hover:bg-slate-700"
                  size="sm"
                >
                  <Eye />
                </Button>
                <Button
                  onClick={() => {
                    console.log("Edit kampus:", item.id);
                  }}
                  className="bg-slate-800 hover:bg-slate-700"
                  size="sm"
                >
                  <Pencil />
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-500"
                  size="sm"
                  onClick={() => {
                    console.log("Hapus kampus:", item.id);
                  }}
                >
                  <Trash />
                </Button>
              </div>
            ),
          }))}
          isLoading={loading}
          refreshCb={refetch}
        />
      </div>
    </div>
  );
}
