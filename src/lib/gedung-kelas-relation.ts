import { database } from '@/lib/firebase/firebase.config'
import { get, ref, set } from 'firebase/database'

export interface Gedung {
    id: string
    name: string
    kode_gedung: string
    image?: string
    slug: string
    kelas?: Record<string, KelasReference>
    created_at: string
    updated_at: string
}

export interface KelasReference {
    id: string
    code_kelas: string
    lantai: string
    slug: string
}

export interface Kelas {
    id: string
    firebaseId?: string
    code_kelas: string
    kapasitas_orang: number
    total_papan_tulis: number
    total_televisi: number
    lantai: string
    gedung_id: string
    image?: string
    slug: string
    created_at: string
    updated_at: string
}

export class GedungKelasRelation {
    static async getGedungWithKelas(gedungId: string): Promise<Gedung | null> {
        try {
            const gedungRef = ref(database, `gedung/${gedungId}`)
            const snapshot = await get(gedungRef)

            if (!snapshot.exists()) {
                return null
            }

            return snapshot.val() as Gedung
        } catch (error) {
            console.error('Error fetching gedung with kelas:', error)
            throw error
        }
    } 
    static async getDetailedKelasByGedung(
        gedungId: string,
        page: number = 1,
        limit: number = 5
    ): Promise<{
        data: Kelas[]
        total: number
        currentPage: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }> {
        try {
            const kelasRef = ref(database, `gedung/${gedungId}/kelas`)
            const snapshot = await get(kelasRef)

            if (!snapshot.exists()) {
                return {
                    data: [],
                    total: 0,
                    currentPage: page,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPrevPage: false,
                }
            }

            const kelasData = snapshot.val()
            const kelasList: Kelas[] = []

            Object.entries(kelasData).forEach(
                ([lantai, lantaiData]: [string, any]) => {
                    if (lantaiData && typeof lantaiData === 'object') {
                        Object.entries(lantaiData).forEach(
                            ([firebaseId, kelas]: [string, any]) => {
                                kelasList.push({
                                    firebaseId,
                                    gedungFirebaseId: gedungId,
                                    ...kelas,
                                })
                            }
                        )
                    }
                }
            )

            kelasList.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            )
            const total = kelasList.length
            const totalPages = Math.ceil(total / limit)
            const startIndex = (page - 1) * limit
            const endIndex = startIndex + limit
            const paginatedData = kelasList.slice(startIndex, endIndex)

            return {
                data: paginatedData,
                total,
                currentPage: page,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            }
        } catch (error) {
            console.error('Error fetching detailed kelas for gedung:', error)
            return {
                data: [],
                total: 0,
                currentPage: page,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
            }
        }
    }

    static async updateGedungKelasRelation(
        gedungId: string,
        kelasId: string,
        kelasData: KelasReference
    ): Promise<void> {
        try {
            const kelasRef = ref(
                database,
                `gedung/${gedungId}/kelas/${kelasId}`
            )
            await set(kelasRef, kelasData)
        } catch (error) {
            console.error('Error updating gedung-kelas relation:', error)
            throw error
        }
    }

    static async removeKelasFromGedung(
        gedungId: string,
        kelasId: string
    ): Promise<void> {
        try {
            const kelasRef = ref(
                database,
                `gedung/${gedungId}/kelas/${kelasId}`
            )
            await set(kelasRef, null)
        } catch (error) {
            console.error('Error removing kelas from gedung:', error)
            throw error
        }
    } 
    static async getGedungStatistics(gedungId: string): Promise<{
        totalKelas: number
        totalKapasitas: number
        totalPapanTulis: number
        totalTelevisi: number
    }> {
        try {

            const gedungRef = ref(database, `gedung/${gedungId}`)
            const gedungSnapshot = await get(gedungRef)
            console.log(`Gedung exists: ${gedungSnapshot.exists()}`) 

            if (gedungSnapshot.exists()) {
                const gedungData = gedungSnapshot.val()

                const kelasRef = ref(database, `gedung/${gedungId}/kelas`)
                const kelasSnapshot = await get(kelasRef)
               

                if (kelasSnapshot.exists()) {
                    const kelasData = kelasSnapshot.val()
                }
            }

            const kelasResponse = await this.getDetailedKelasByGedung(
                gedungId,
                1,
                1000
            )

            const kelasDetails = kelasResponse.data

            const stats = kelasDetails.reduce(
                (acc, kelas) => {
                    return {
                        totalKelas: acc.totalKelas + 1,
                        totalKapasitas:
                            acc.totalKapasitas + (kelas.kapasitas_orang || 0),
                        totalPapanTulis:
                            acc.totalPapanTulis +
                            (kelas.total_papan_tulis || 0),
                        totalTelevisi:
                            acc.totalTelevisi + (kelas.total_televisi || 0),
                    }
                },
                {
                    totalKelas: 0,
                    totalKapasitas: 0,
                    totalPapanTulis: 0,
                    totalTelevisi: 0,
                }
            )

            return stats
        } catch (error) {
            console.error('Error calculating gedung statistics:', error)
            throw error
        }
    }

    static async validateConsistency(): Promise<{
        orphanedKelas: Kelas[]
        missingKelasRefs: { gedungId: string; kelasId: string }[]
    }> {
        try {
            const allKelas = await this.getAllKelas()
            const allGedung = await this.getAllGedung()

            const orphanedKelas: Kelas[] = []
            const missingKelasRefs: { gedungId: string; kelasId: string }[] = []

            for (const kelas of allKelas) {
                const gedungExists = allGedung.some(
                    (gedung) => gedung.id === kelas.gedung_id
                )
                if (!gedungExists) {
                    orphanedKelas.push(kelas)
                }
            }

            for (const gedung of allGedung) {
                if (gedung.kelas) {
                    for (const [kelasId] of Object.entries(gedung.kelas)) {
                        const kelasExists = allKelas.some(
                            (k) => k.firebaseId === kelasId
                        )
                        if (!kelasExists) {
                            missingKelasRefs.push({
                                gedungId: gedung.id,
                                kelasId,
                            })
                        }
                    }
                }
            }

            return { orphanedKelas, missingKelasRefs }
        } catch (error) {
            console.error('Error validating consistency:', error)
            throw error
        }
    }

    private static async getAllKelas(): Promise<Kelas[]> {
        const kelasRef = ref(database, 'kelas')
        const snapshot = await get(kelasRef)
        const data = snapshot.val()

        if (!data) return []

        const kelasList: Kelas[] = []
        Object.entries(data).forEach(([lantai, kelasData]: [string, any]) => {
            if (kelasData && typeof kelasData === 'object') {
                Object.entries(kelasData).forEach(
                    ([id, kelas]: [string, any]) => {
                        kelasList.push({
                            firebaseId: id,
                            ...kelas,
                        } as Kelas)
                    }
                )
            }
        })

        return kelasList
    }

    private static async getAllGedung(): Promise<Gedung[]> {
        const gedungRef = ref(database, 'gedung')
        const snapshot = await get(gedungRef)
        const data = snapshot.val()

        if (!data) return []

        return Object.entries(data).map(([id, value]: [string, any]) => ({
            id,
            ...value,
        })) as Gedung[]
    }
}
