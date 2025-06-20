'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getKampus } from '@/actions/admin/gedung'
import { GedungKelasRelation, type Gedung } from '@/lib/gedung-kelas-relation'
import { Building, Users, Tv, BookOpen, Eye } from 'lucide-react'
import Link from 'next/link'

interface GedungWithStats extends Gedung {
    stats: {
        totalKelas: number
        totalKapasitas: number
        totalPapanTulis: number
        totalTelevisi: number
    }
}

export default function GedungOverview() {
    const [gedungList, setGedungList] = useState<GedungWithStats[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch all gedung
                const allGedung = await getKampus()
                console.log('All gedung data:', allGedung) // Debug log

                // Fetch statistics for each gedung
                const gedungWithStats = await Promise.all(
                    allGedung.map(async (gedung: Gedung) => {
                        try {
                            console.log(
                                `Fetching stats for gedung ${gedung.id}...`
                            ) // Debug log
                            const stats =
                                await GedungKelasRelation.getGedungStatistics(
                                    gedung.id // This is the Firebase ID from getKampus()
                                )
                            console.log(`Stats for ${gedung.name}:`, stats) // Debug log
                            return {
                                ...gedung,
                                firebaseId: gedung.id, // Add firebaseId for consistency
                                stats,
                            }
                        } catch (error) {
                            console.error(
                                `Error fetching stats for gedung ${gedung.id}:`,
                                error
                            )
                            return {
                                ...gedung,
                                stats: {
                                    totalKelas: 0,
                                    totalKapasitas: 0,
                                    totalPapanTulis: 0,
                                    totalTelevisi: 0,
                                },
                            }
                        }
                    })
                )

                console.log('Final gedung with stats:', gedungWithStats) // Debug log
                setGedungList(gedungWithStats)
            } catch (error) {
                console.error('Error fetching gedung overview:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Overview Gedung & Kelas</h1>
                <div className="text-sm text-gray-600">
                    Total: {gedungList.length} gedung
                </div>
            </div>

            {gedungList.length === 0 ? (
                <Card>
                    <CardContent className="p-8 text-center">
                        <p className="text-gray-500">
                            Belum ada gedung yang terdaftar
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gedungList.map((gedung) => (
                        <Card
                            key={gedung.id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            {gedung.name}
                                        </CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Kode: {gedung.kode_gedung}
                                        </p>{' '}
                                    </div>{' '}
                                    <Link
                                        href={`/menu-utama/kampus-cipayung/gedung/${gedung.slug}`}
                                    >
                                        <Button size="sm" variant="outline">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {gedung.image && (
                                    <img
                                        src={gedung.image}
                                        alt={gedung.name}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                )}

                                {/* Statistics Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-blue-500" />
                                            <div>
                                                <p className="text-xs text-gray-600">
                                                    Kelas
                                                </p>
                                                <p className="text-lg font-semibold text-blue-700">
                                                    {gedung.stats.totalKelas}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-green-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4 text-green-500" />
                                            <div>
                                                <p className="text-xs text-gray-600">
                                                    Kapasitas
                                                </p>
                                                <p className="text-lg font-semibold text-green-700">
                                                    {
                                                        gedung.stats
                                                            .totalKapasitas
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-yellow-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-yellow-500" />
                                            <div>
                                                <p className="text-xs text-gray-600">
                                                    Papan
                                                </p>
                                                <p className="text-lg font-semibold text-yellow-700">
                                                    {
                                                        gedung.stats
                                                            .totalPapanTulis
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Tv className="h-4 w-4 text-purple-500" />
                                            <div>
                                                <p className="text-xs text-gray-600">
                                                    TV
                                                </p>
                                                <p className="text-lg font-semibold text-purple-700">
                                                    {gedung.stats.totalTelevisi}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="pt-2 border-t">
                                    <p className="text-sm text-gray-600">
                                        {gedung.stats.totalKelas > 0
                                            ? `Rata-rata ${Math.round(
                                                  gedung.stats.totalKapasitas /
                                                      gedung.stats.totalKelas
                                              )} orang per kelas`
                                            : 'Belum ada kelas'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
