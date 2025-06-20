import { database } from '@/lib/firebase/firebase.config'
import { get, ref, set } from 'firebase/database'

// Type definitions
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

// Utility functions for managing gedung-kelas relationships
export class GedungKelasRelation {
    // Get gedung with its related kelas
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
    } // Get all kelas details for a specific gedung with pagination
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

            // Iterate through each lantai
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

            // Sort by created_at (newest first)
            kelasList.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            )

            // Pagination
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

    // Update gedung-kelas relationship
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

    // Remove kelas from gedung
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
    } // Get statistics for a gedung
    static async getGedungStatistics(gedungId: string): Promise<{
        totalKelas: number
        totalKapasitas: number
        totalPapanTulis: number
        totalTelevisi: number
    }> {
        try {
            console.log(`Getting statistics for gedung ID: ${gedungId}`) // Debug log

            // First check if gedung exists
            const gedungRef = ref(database, `gedung/${gedungId}`)
            const gedungSnapshot = await get(gedungRef)
            console.log(`Gedung exists: ${gedungSnapshot.exists()}`) // Debug log

            if (gedungSnapshot.exists()) {
                const gedungData = gedungSnapshot.val()
                console.log(`Gedung data for ${gedungId}:`, gedungData) // Debug log

                // Check if kelas data exists
                const kelasRef = ref(database, `gedung/${gedungId}/kelas`)
                const kelasSnapshot = await get(kelasRef)
                console.log(
                    `Kelas data exists for ${gedungId}: ${kelasSnapshot.exists()}`
                ) // Debug log

                if (kelasSnapshot.exists()) {
                    const kelasData = kelasSnapshot.val()
                    console.log(`Raw kelas data for ${gedungId}:`, kelasData) // Debug log
                }
            }

            // Get all kelas without pagination for statistics calculation
            const kelasResponse = await this.getDetailedKelasByGedung(
                gedungId,
                1,
                1000
            )
            console.log(`Kelas response for ${gedungId}:`, kelasResponse) // Debug log

            const kelasDetails = kelasResponse.data
            console.log(`Kelas details for ${gedungId}:`, kelasDetails) // Debug log

            const stats = kelasDetails.reduce(
                (acc, kelas) => {
                    console.log(`Processing kelas:`, kelas) // Debug log
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

            console.log(`Final stats for ${gedungId}:`, stats) // Debug log
            return stats
        } catch (error) {
            console.error('Error calculating gedung statistics:', error)
            throw error
        }
    }

    // Validate kelas-gedung consistency
    static async validateConsistency(): Promise<{
        orphanedKelas: Kelas[]
        missingKelasRefs: { gedungId: string; kelasId: string }[]
    }> {
        try {
            const allKelas = await this.getAllKelas()
            const allGedung = await this.getAllGedung()

            const orphanedKelas: Kelas[] = []
            const missingKelasRefs: { gedungId: string; kelasId: string }[] = []

            // Check for orphaned kelas (kelas with invalid gedung_id)
            for (const kelas of allKelas) {
                const gedungExists = allGedung.some(
                    (gedung) => gedung.id === kelas.gedung_id
                )
                if (!gedungExists) {
                    orphanedKelas.push(kelas)
                }
            }

            // Check for missing kelas references in gedung
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

    // Helper functions
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
