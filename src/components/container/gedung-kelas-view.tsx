'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    GedungKelasRelation,
    type Gedung,
    type Kelas,
} from '@/lib/gedung-kelas-relation'
import { getGedungBySlug } from '@/actions/admin/gedung'
import AddKelasToGedungModal from '@/components/container/modal/kelas/add-kelas-to-gedung'
import EditModalKelas from '@/components/container/modal/kelas/edit-kelas'
import DeleteModalKelas from '@/components/container/modal/kelas/delete-kelas'
import { Building, Users, Tv, BookOpen, Plus } from 'lucide-react'
import { Pagination } from '@/components/ui/pagination'

interface GedungKelasViewProps {
    gedungSlug: string
}

export default function GedungKelasView({ gedungSlug }: GedungKelasViewProps) {
    const [gedung, setGedung] = useState<any>(null)
    const [kelasList, setKelasList] = useState<Kelas[]>([])
    const [statistics, setStatistics] = useState({
        totalKelas: 0,
        totalKapasitas: 0,
        totalPapanTulis: 0,
        totalTelevisi: 0,
    })
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)
    const [total, setTotal] = useState(0)
    const [hasNextPage, setHasNextPage] = useState(false)
    const [hasPrevPage, setHasPrevPage] = useState(false)

    const fetchData = async (page: number = 1) => {
        try {
            setLoading(true)

            // Fetch gedung details by slug
            const gedungData = await getGedungBySlug(gedungSlug)

            if (!gedungData) {
                console.error('Gedung not found')
                setLoading(false)
                return
            }

            setGedung(gedungData)

            // Fetch kelas details using firebaseId with pagination
            const kelasResponse =
                await GedungKelasRelation.getDetailedKelasByGedung(
                    gedungData.firebaseId,
                    page,
                    5
                )

            setKelasList(kelasResponse.data)
            setTotalPages(kelasResponse.totalPages)
            setTotal(kelasResponse.total)
            setHasNextPage(kelasResponse.hasNextPage ?? false)
            setHasPrevPage(kelasResponse.hasPrevPage ?? false)
            setCurrentPage(kelasResponse.currentPage)

            // Fetch statistics
            const stats = await GedungKelasRelation.getGedungStatistics(
                gedungData.firebaseId
            )
            setStatistics(stats)
        } catch (error) {
            console.error('Error fetching gedung-kelas data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (gedungSlug) {
            fetchData()
        }
    }, [gedungSlug])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            </div>
        )
    }

    if (!gedung) {
        return (
            <div className="text-center p-8">
                <p className="text-gray-500">Gedung tidak ditemukan</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Gedung Information */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                {gedung.name}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                                Kode Gedung: {gedung.kode_gedung}
                            </p>
                        </div>{' '}
                        <AddKelasToGedungModal
                            gedungId={gedung.firebaseId}
                            gedungName={gedung.name}
                            refetch={() => fetchData()}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {gedung.image && (
                        <img
                            src={gedung.image}
                            alt={gedung.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                    )}
                </CardContent>
            </Card>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Kelas
                                </p>
                                <p className="text-2xl font-bold">
                                    {statistics.totalKelas}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Kapasitas
                                </p>
                                <p className="text-2xl font-bold">
                                    {statistics.totalKapasitas}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-yellow-500" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Papan Tulis
                                </p>
                                <p className="text-2xl font-bold">
                                    {statistics.totalPapanTulis}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Tv className="h-4 w-4 text-purple-500" />
                            <div>
                                <p className="text-sm text-gray-600">
                                    Televisi
                                </p>
                                <p className="text-2xl font-bold">
                                    {statistics.totalTelevisi}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
            {/* Kelas List */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Kelas di Gedung Ini</CardTitle>
                </CardHeader>
                <CardContent>
                    {kelasList.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            Belum ada kelas di gedung ini
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {kelasList.map((kelas) => (
                                <Card
                                    key={kelas.firebaseId}
                                    className="border border-gray-200"
                                >
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold text-lg">
                                                    {kelas.code_kelas}
                                                </h4>{' '}
                                                <div className="flex gap-1">                                                    <EditModalKelas
                                                        kelasId={
                                                            kelas.firebaseId ||
                                                            ''
                                                        }
                                                        gedungId={
                                                            gedung.firebaseId
                                                        }
                                                        gedungName={gedung.name}
                                                        lantai={kelas.lantai}
                                                        refetch={() =>
                                                            fetchData()
                                                        }
                                                    />
                                                    <DeleteModalKelas
                                                        kelasId={
                                                            kelas.firebaseId ||
                                                            ''
                                                        }
                                                        gedungId={
                                                            gedung.firebaseId
                                                        }
                                                        lantai={kelas.lantai}
                                                        kelasName={
                                                            kelas.code_kelas
                                                        }
                                                        refetch={() =>
                                                            fetchData()
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                Lantai:{' '}
                                                {kelas.lantai.replace(
                                                    'lantai_',
                                                    ''
                                                )}
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3 w-3" />
                                                    <span>
                                                        {kelas.kapasitas_orang}{' '}
                                                        orang
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <BookOpen className="h-3 w-3" />
                                                    <span>
                                                        {
                                                            kelas.total_papan_tulis
                                                        }{' '}
                                                        papan
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Tv className="h-3 w-3" />
                                                    <span>
                                                        {kelas.total_televisi}{' '}
                                                        TV
                                                    </span>
                                                </div>
                                            </div>
                                            {kelas.image && (
                                                <img
                                                    src={kelas.image}
                                                    alt={kelas.code_kelas}
                                                    className="w-full h-24 object-cover rounded mt-2"
                                                />
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>{' '}
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={5}
                    total={total}
                    onPageChange={fetchData}
                />
            )}
        </div>
    )
}
