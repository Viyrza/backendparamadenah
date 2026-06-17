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
    latitude: z.number()
        .min(-90, { message: 'Latitude harus antara -90 hingga 90' })
        .max(90, { message: 'Latitude harus antara -90 hingga 90' }),
    longitude: z.number()
        .min(-180, { message: 'Longitude harus antara -180 hingga 180' })
        .max(180, { message: 'Longitude harus antara -180 hingga 180' }),
})

export async function createGedung(
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
                  latitude?: string[]
                  longitude?: string[]
              }
              formError?: string
          }
      }
> {
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')

    const parsed = formSchema.safeParse({
        name: formData.get('name'),
        image: formData.get('image') || undefined,
        kode_gedung: formData.get('kode_gedung'),
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
    })

    if (!parsed.success) {
        return {
            success: false,
            error: {
                fieldErrors: parsed.error.flatten().fieldErrors,
            },
        }
    }

    const data = parsed.data

    try {
        const gedungRef = ref(database, 'gedung')
        const snapshot = await get(gedungRef)
        const existingData = snapshot.exists() ? snapshot.val() : {}

        const existingKodeGedung = Object.values(existingData).find(
            (gedung: any) => gedung.kode_gedung === data.kode_gedung
        )

        if (existingKodeGedung) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        kode_gedung: ['Kode gedung sudah digunakan'],
                    },
                },
            }
        }

        const slug = slugify(data.name, {
            lower: true,
            strict: true, 
            trim: true,
        })

        const existingName = Object.values(existingData).find(
            (gedung: any) =>
                gedung.name.toLowerCase() === data.name.toLowerCase() ||
                gedung.slug === slug
        )

        if (existingName) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        name: ['Nama gedung sudah digunakan'],
                    },
                },
            }
        }

        let maxId = 0
        Object.values(existingData).forEach((gedung: any) => {
            if (
                gedung.id &&
                typeof gedung.id === 'number' &&
                gedung.id > maxId
            ) {
                maxId = gedung.id
            }
        })
        const newId = maxId + 1
        const newGedungData = {
            id: newId,
            name: data.name,
            kode_gedung: data.kode_gedung,
            image: data.image || null,
            latitude: data.latitude,
            longitude: data.longitude,
            slug: slug,
            kelas: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        const newGedungRef = ref(database, `gedung/${slug}`)
        await set(newGedungRef, newGedungData)

        return {
            success: true,
            id: slug,
        }
    } catch (err) {
        console.error('Gagal membuat gedung:', err)
        return {
            success: false,
            error: {
                formError: 'Terjadi kesalahan saat menyimpan data gedung',
            },
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

export async function getKampusPaginated(page: number = 1, limit: number = 5) {
    const kampusRef = ref(database, '/gedung')

    try {
        const snapshot = await get(kampusRef)
        const data = snapshot.val()

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

        kampusList.sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
        )

        const total = kampusList.length
        const totalPages = Math.ceil(total / limit)
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedData = kampusList.slice(startIndex, endIndex)

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

const updateGedungSchema = z.object({
    name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
    image: z.string().url({ message: 'Image must be a valid URL' }).optional(),
    kode_gedung: z
        .string()
        .min(2, { message: 'Kode gedung minimal 2 karakter' }),
    latitude: z.number()
        .min(-90, { message: 'Latitude harus antara -90 hingga 90' })
        .max(90, { message: 'Latitude harus antara -90 hingga 90' }),
    longitude: z.number()
        .min(-180, { message: 'Longitude harus antara -180 hingga 180' })
        .max(180, { message: 'Longitude harus antara -180 hingga 180' }),
})

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
                  latitude?: string[]
                  longitude?: string[]
              }
          }
      }
> {
    const latitude = formData.get('latitude')
    const longitude = formData.get('longitude')

    const parsed = updateGedungSchema.safeParse({
        name: formData.get('name'),
        image: formData.get('image') || null,
        kode_gedung: formData.get('kode_gedung'),
        latitude: latitude ? parseFloat(latitude as string) : undefined,
        longitude: longitude ? parseFloat(longitude as string) : undefined,
    })

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        }
    }

    const data = parsed.data

    try {
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

        const allGedungRef = ref(database, 'gedung')
        const allGedungSnapshot = await get(allGedungRef)
        const allGedungData = allGedungSnapshot.exists()
            ? allGedungSnapshot.val()
            : {}

        const duplicateKodeGedung = Object.entries(allGedungData).find(
            ([id, gedung]: [string, any]) =>
                id !== gedungId && gedung.kode_gedung === data.kode_gedung
        )

        const duplicateName = Object.entries(allGedungData).find(
            ([id, gedung]: [string, any]) =>
                id !== gedungId &&
                gedung.name.toLowerCase() === data.name.toLowerCase()
        )

        if (duplicateKodeGedung) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        kode_gedung: [
                            'Kode gedung sudah digunakan oleh gedung lain',
                        ],
                    },
                },
            }
        }

        if (duplicateName) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        name: ['Nama gedung sudah digunakan oleh gedung lain'],
                    },
                },
            }
        }

        await set(gedungRef, {
            ...existingData,
            name: data.name,
            kode_gedung: data.kode_gedung,
            image: data.image || null,
            latitude: data.latitude,
            longitude: data.longitude,
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

export async function deleteGedung(gedungId: string): Promise<{
    success: boolean
    error?: string
    deletedKelas?: number
}> {
    try {
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

        if (gedungData.kelas) {
            const kelasIds = Object.keys(gedungData.kelas)

            for (const kelasId of kelasIds) {
                const kelasRef = ref(database, `kelas`)
                const kelasSnapshot = await get(kelasRef)
                const kelasData = kelasSnapshot.val()

                if (kelasData) {
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

export async function getGedungBySlug(slug: string) {
    try {
        const gedungRef = ref(database, 'gedung')
        const snapshot = await get(gedungRef)
        const data = snapshot.val()

        if (!data) return null

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
