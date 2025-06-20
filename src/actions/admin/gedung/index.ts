'use server'

import { z } from 'zod'
import { ref, push, get, set } from 'firebase/database'
import slugify from 'slugify'
import { database } from '@/lib/firebase/firebase.config'

const formSchema = z.object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
    image: z.string().url({ message: 'Image must be a valid URL' }).optional(),
    kode_gedung: z
        .string()
        .min(2, { message: 'Kode gedung minimal 2 karakter' }),
})

export async function createGedung(
    prevState: any,
    formData: FormData
): Promise<
    | { success: true; id: string | null }
    | {
          success: false
          error: {
              fieldErrors?: {
                  name?: string[]
                  image?: string[]
                  kode_gedung?: string[]
              }
          }
      }
> {
    const parsed = formSchema.safeParse({
        name: formData.get('name'),
        image: formData.get('image') || null,
        kode_gedung: formData.get('kode_gedung'),
    })

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        }
    }

    const data = parsed.data

    try {
        const gedungRef = ref(database, 'gedung')

        const snapshot = await get(gedungRef)
        const existingData = snapshot.exists() ? snapshot.val() : {}
        const lastId = Object.values(existingData).length

        const newRef = push(gedungRef)

        await set(newRef, {
            id: lastId + 1,
            name: data.name,
            kode_gedung: data.kode_gedung,
            image: data.image || null,
            slug: slugify(data.name, { lower: true }),
            kelas: {}, // Relasi ke kelas-kelas yang berada di gedung ini
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })

        return {
            success: true,
            id: newRef.key,
        }
    } catch (err) {
        console.error('Gagal membuat gedung:', err)
        return {
            success: false,
            error: {},
        }
    }
}

export async function getKampus() {
    const kampusRef = ref(database, '/gedung')

    try {
        const snapshot = await get(kampusRef)
        const data = snapshot.val()

        if (!data) return []

        const kampusList = Object.entries(data).map(
            ([id, value]: [string, any]) => ({
                id,
                ...value,
            })
        )

        return kampusList
    } catch (error) {
        console.error('Gagal ambil data kampus:', error)
        return []
    }
}

// Fungsi untuk mengambil semua gedung dengan pagination
export async function getKampusPaginated(page: number = 1, limit: number = 5) {
    const kampusRef = ref(database, '/gedung')

    try {
        const snapshot = await get(kampusRef)
        const data = snapshot.val()
        console.log('Raw Firebase data:', data) // Debug log

        if (!data)
            return {
                data: [],
                total: 0,
                currentPage: page,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false,
            }

        const kampusList = Object.entries(data).map(
            ([id, value]: [string, any]) => ({
                id,
                firebaseId: id,
                ...value,
            })
        )
        console.log('Processed kampus list:', kampusList) // Debug log

        // Sort by created_at (newest first)
        kampusList.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        )

        // Pagination
        const total = kampusList.length
        const totalPages = Math.ceil(total / limit)
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedData = kampusList.slice(startIndex, endIndex)

        console.log('Pagination calculation:', {
            total,
            totalPages,
            startIndex,
            endIndex,
            paginatedData,
        }) // Debug log

        return {
            data: paginatedData,
            total,
            currentPage: page,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
        }
    } catch (error) {
        console.error('Gagal ambil data kampus:', error)
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

// Fungsi untuk menambahkan kelas ke gedung
export async function addKelasToGedung(gedungId: string, kelasData: any) {
    try {
        const kelasRef = ref(
            database,
            `gedung/${gedungId}/kelas/${kelasData.id}`
        )
        await set(kelasRef, {
            id: kelasData.id,
            code_kelas: kelasData.code_kelas,
            lantai: kelasData.lantai,
            slug: kelasData.slug,
        })
        return { success: true }
    } catch (error) {
        console.error('Gagal menambahkan kelas ke gedung:', error)
        return { success: false, error }
    }
}

// Fungsi untuk mengambil semua kelas dari gedung tertentu
export async function getKelasByGedung(gedungId: string) {
    try {
        const kelasRef = ref(database, `gedung/${gedungId}/kelas`)
        const snapshot = await get(kelasRef)
        const data = snapshot.val()

        if (!data) return []

        const kelasList = Object.entries(data).map(
            ([id, value]: [string, any]) => ({
                id,
                ...value,
            })
        )

        return kelasList
    } catch (error) {
        console.error('Gagal ambil data kelas dari gedung:', error)
        return []
    }
}

// Fungsi untuk menghapus kelas dari gedung
export async function removeKelasFromGedung(gedungId: string, kelasId: string) {
    try {
        const kelasRef = ref(database, `gedung/${gedungId}/kelas/${kelasId}`)
        await set(kelasRef, null)
        return { success: true }
    } catch (error) {
        console.error('Gagal menghapus kelas dari gedung:', error)
        return { success: false, error }
    }
}

// Update Schema untuk edit gedung
const updateGedungSchema = z.object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
    image: z.string().url({ message: 'Image must be a valid URL' }).optional(),
    kode_gedung: z
        .string()
        .min(2, { message: 'Kode gedung minimal 2 karakter' }),
})

// Fungsi untuk mengupdate gedung
export async function updateGedung(
    gedungId: string,
    prevState: any,
    formData: FormData
): Promise<
    | { success: true; id: string }
    | {
          success: false
          error: {
              fieldErrors?: {
                  name?: string[]
                  image?: string[]
                  kode_gedung?: string[]
              }
          }
      }
> {
    const parsed = updateGedungSchema.safeParse({
        name: formData.get('name'),
        image: formData.get('image') || null,
        kode_gedung: formData.get('kode_gedung'),
    })

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        }
    }

    const data = parsed.data

    try {
        // Ambil data gedung yang sudah ada
        const gedungRef = ref(database, `gedung/${gedungId}`)
        const snapshot = await get(gedungRef)

        if (!snapshot.exists()) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        name: ['Gedung tidak ditemukan'],
                    },
                },
            }
        }

        const existingData = snapshot.val()

        // Update data gedung
        await set(gedungRef, {
            ...existingData,
            name: data.name,
            kode_gedung: data.kode_gedung,
            image: data.image || null,
            slug: slugify(data.name, { lower: true }),
            updated_at: new Date().toISOString(),
        })

        return {
            success: true,
            id: gedungId,
        }
    } catch (err) {
        console.error('Gagal mengupdate gedung:', err)
        return {
            success: false,
            error: {},
        }
    }
}

// Fungsi untuk menghapus gedung beserta relasinya
export async function deleteGedung(gedungId: string): Promise<{
    success: boolean
    error?: string
    deletedKelas?: number
}> {
    try {
        // Ambil data gedung untuk mendapatkan daftar kelas
        const gedungRef = ref(database, `gedung/${gedungId}`)
        const snapshot = await get(gedungRef)

        if (!snapshot.exists()) {
            return {
                success: false,
                error: 'Gedung tidak ditemukan',
            }
        }

        const gedungData = snapshot.val()
        let deletedKelasCount = 0

        // Hapus semua kelas yang berada di gedung ini
        if (gedungData.kelas) {
            const kelasIds = Object.keys(gedungData.kelas)

            for (const kelasId of kelasIds) {
                // Hapus kelas dari koleksi kelas
                const kelasRef = ref(database, `kelas`)
                const kelasSnapshot = await get(kelasRef)
                const kelasData = kelasSnapshot.val()

                if (kelasData) {
                    // Cari dan hapus kelas berdasarkan ID
                    for (const [lantai, lantaiData] of Object.entries(
                        kelasData
                    ) as [string, any][]) {
                        if (lantaiData && lantaiData[kelasId]) {
                            const specificKelasRef = ref(
                                database,
                                `kelas/${lantai}/${kelasId}`
                            )
                            await set(specificKelasRef, null)
                            deletedKelasCount++
                        }
                    }
                }
            }
        }

        // Hapus gedung
        await set(gedungRef, null)

        return {
            success: true,
            deletedKelas: deletedKelasCount,
        }
    } catch (error) {
        console.error('Gagal menghapus gedung:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

// Fungsi untuk mendapatkan detail gedung berdasarkan ID
export async function getGedungById(gedungId: string) {
    try {
        const gedungRef = ref(database, `gedung/${gedungId}`)
        const snapshot = await get(gedungRef)

        if (!snapshot.exists()) {
            return null
        }

        return {
            firebaseId: gedungId,
            ...snapshot.val(),
        }
    } catch (error) {
        console.error('Gagal ambil data gedung:', error)
        return null
    }
}

// Fungsi untuk mendapatkan gedung berdasarkan slug
export async function getGedungBySlug(slug: string) {
    try {
        const gedungRef = ref(database, 'gedung')
        const snapshot = await get(gedungRef)
        const data = snapshot.val()

        if (!data) return null

        // Cari gedung dengan slug yang cocok
        for (const [id, gedung] of Object.entries(data) as [string, any][]) {
            if (gedung.slug === slug) {
                return {
                    firebaseId: id,
                    ...gedung,
                }
            }
        }

        return null
    } catch (error) {
        console.error('Gagal ambil data gedung berdasarkan slug:', error)
        return null
    }
}
