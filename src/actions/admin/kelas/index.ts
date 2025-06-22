import { database } from '@/lib/firebase/firebase.config'
import { get, push, ref, set } from 'firebase/database'
import { toast } from 'react-hot-toast'
import slugify from 'slugify'
import { z } from 'zod'
import { addKelasToGedung, removeKelasFromGedung } from '@/actions/admin/gedung'

// Schema untuk form kelas
const formSchema = z.object({
    code_kelas: z
        .string()
        .min(3, { message: 'Nama kelas harus minimal 3 karakter' }),
    kapasitas_orang: z.coerce
        .number()
        .min(1, { message: 'Kapasitas minimal 1 orang' }),
    total_papan_tulis: z.coerce
        .number()
        .min(0, { message: 'Jumlah papan tulis tidak boleh negatif' }),
    total_televisi: z.coerce
        .number()
        .min(0, { message: 'Jumlah televisi tidak boleh negatif' }),
    lantai: z.string().min(1, { message: 'Lantai harus ditentukan' }),
    gedung_id: z.string().min(1, { message: 'Gedung harus dipilih' }),
    image: z
        .string()
        .url({ message: 'URL gambar tidak valid' })
        .optional()
        .or(z.literal('')),
})

// Fungsi untuk membuat kelas baru
export async function createKelas(
    prevState: any,
    formData: FormData
): Promise<
    | { success: true; id: string | null }
    | {
          success: false
          error: {
              fieldErrors?: {
                  code_kelas?: string[]
                  kapasitas_orang?: string[]
                  total_papan_tulis?: string[]
                  total_televisi?: string[]
                  lantai?: string[]
                  gedung_id?: string[]
                  image?: string[]
              }
          }
      }
> {
    const parsed = formSchema.safeParse({
        code_kelas: formData.get('code_kelas'),
        kapasitas_orang: formData.get('kapasitas_orang'),
        total_papan_tulis: formData.get('total_papan_tulis'),
        total_televisi: formData.get('total_televisi'),
        lantai: formData.get('lantai'),
        gedung_id: formData.get('gedung_id'),
        image: formData.get('image') || '',
    })

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        }
    }

    const data = parsed.data

    try {
        const kelasRef = ref(
            database,
            `gedung/${data.gedung_id}/kelas/${data.lantai}`
        )

        const snapshot = await get(kelasRef)
        const existingData = snapshot.exists() ? snapshot.val() : {}

        let nextId = 1
        if (Object.keys(existingData).length > 0) {
            const existingIds = Object.values(existingData)
                .map((kelas: any) => {
                    if (kelas.id && typeof kelas.id === 'string') {
                        const idParts = kelas.id.split('-')
                        if (idParts.length >= 2) {
                            return parseInt(idParts[idParts.length - 1]) || 0
                        }
                    }
                    return 0
                })
                .filter((id) => id > 0)

            if (existingIds.length > 0) {
                nextId = Math.max(...existingIds) + 1
            }
        }

        const newKelas = {
            id: `${data.lantai}-${nextId}`,
            code_kelas: data.code_kelas,
            kapasitas_orang: data.kapasitas_orang,
            total_papan_tulis: data.total_papan_tulis,
            total_televisi: data.total_televisi,
            lantai: data.lantai,
            gedung_id: data.gedung_id,
            image: data.image || null,
            slug: slugify(`${data.code_kelas}-${data.lantai}`, { lower: true }),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        const newRef = push(kelasRef)
        await set(newRef, newKelas)

        toast.success(
            `Kelas berhasil dibuat di lantai ${
                data.lantai.split('_')[1]
            } gedung ${data.gedung_id}`,
            {
                position: 'bottom-right',
            }
        )

        return {
            success: true,
            id: newRef.key,
        }
    } catch (err) {
        console.error('Gagal membuat kelas:', err)
        toast.error('Gagal membuat kelas', {
            position: 'bottom-right',
        })
        return {
            success: false,
            error: {
                fieldErrors: {
                    code_kelas: ['Terjadi kesalahan saat menyimpan data'],
                },
            },
        }
    }
}

export async function getAllKelas(page: number = 1, limit: number = 5) {
    try {
        const gedungRef = ref(database, 'gedung')
        const snapshot = await get(gedungRef)
        const data = snapshot.val()

        if (!data)
            return { data: [], total: 0, currentPage: page, totalPages: 0 }

        const kelasList: any[] = []

        Object.entries(data).forEach(
            ([gedungId, gedungData]: [string, any]) => {
                if (gedungData && gedungData.kelas) {
                    Object.entries(gedungData.kelas).forEach(
                        ([lantai, kelasData]: [string, any]) => {
                            if (kelasData && typeof kelasData === 'object') {
                                Object.entries(kelasData).forEach(
                                    ([id, kelas]: [string, any]) => {
                                        kelasList.push({
                                            firebaseId: id,
                                            gedungFirebaseId: gedungId,
                                            ...kelas,
                                        })
                                    }
                                )
                            }
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
        console.error('Gagal ambil data kelas:', error)
        return { data: [], total: 0, currentPage: page, totalPages: 0 }
    }
}

export async function getKelasByGedungId(
    gedungId: string,
    page: number = 1,
    limit: number = 5
) {
    try {
        const kelasRef = ref(database, `gedung/${gedungId}/kelas`)
        const snapshot = await get(kelasRef)
        const data = snapshot.val()

        if (!data)
            return { data: [], total: 0, currentPage: page, totalPages: 0 }

        const kelasList: any[] = []

        Object.entries(data).forEach(([lantai, kelasData]: [string, any]) => {
            if (kelasData && typeof kelasData === 'object') {
                Object.entries(kelasData).forEach(
                    ([id, kelas]: [string, any]) => {
                        kelasList.push({
                            firebaseId: id,
                            gedungFirebaseId: gedungId,
                            ...kelas,
                        })
                    }
                )
            }
        })

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
        return { data: [], total: 0, currentPage: page, totalPages: 0 }
    }
}

const updateKelasSchema = z.object({
    code_kelas: z
        .string()
        .min(3, { message: 'Nama kelas harus minimal 3 karakter' }),
    kapasitas_orang: z.coerce
        .number()
        .min(1, { message: 'Kapasitas minimal 1 orang' }),
    total_papan_tulis: z.coerce
        .number()
        .min(0, { message: 'Jumlah papan tulis tidak boleh negatif' }),
    total_televisi: z.coerce
        .number()
        .min(0, { message: 'Jumlah televisi tidak boleh negatif' }),
    lantai: z.string().min(1, { message: 'Lantai harus ditentukan' }),
    gedung_id: z.string().min(1, { message: 'Gedung harus dipilih' }),
    image: z
        .string()
        .url({ message: 'URL gambar tidak valid' })
        .optional()
        .or(z.literal('')),
})

export async function updateKelas(
    kelasId: string,
    gedungId: string,
    lantai: string,
    prevState: any,
    formData: FormData
): Promise<
    | { success: true; id: string }
    | {
          success: false
          error: {
              fieldErrors?: {
                  code_kelas?: string[]
                  kapasitas_orang?: string[]
                  total_papan_tulis?: string[]
                  total_televisi?: string[]
                  lantai?: string[]
                  gedung_id?: string[]
                  image?: string[]
              }
          }
      }
> {
    const parsed = updateKelasSchema.safeParse({
        code_kelas: formData.get('code_kelas'),
        kapasitas_orang: formData.get('kapasitas_orang'),
        total_papan_tulis: formData.get('total_papan_tulis'),
        total_televisi: formData.get('total_televisi'),
        lantai: formData.get('lantai'),
        gedung_id: formData.get('gedung_id'),
        image: formData.get('image') || '',
    })

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.flatten(),
        }
    }
    const data = parsed.data

    try {
        const kelasRef = ref(
            database,
            `gedung/${gedungId}/kelas/${lantai}/${kelasId}`
        )
        const snapshot = await get(kelasRef)

        if (!snapshot.exists()) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        code_kelas: ['Kelas tidak ditemukan'],
                    },
                },
            }
        }
        const existingData = snapshot.val()

        const oldGedungId = gedungId
        const oldLantai = lantai
        const updatedKelas = {
            ...existingData,
            code_kelas: data.code_kelas,
            kapasitas_orang: data.kapasitas_orang,
            total_papan_tulis: data.total_papan_tulis,
            total_televisi: data.total_televisi,
            lantai: data.lantai,
            gedung_id: oldGedungId,
            image: data.image || null,
            slug: slugify(`${data.code_kelas}-${data.lantai}`, { lower: true }),
            updated_at: new Date().toISOString(),
        }

        if (data.lantai !== oldLantai) {
            await set(kelasRef, null)

            const newKelasRef = ref(
                database,
                `gedung/${oldGedungId}/kelas/${data.lantai}/${kelasId}`
            )
            await set(newKelasRef, updatedKelas)
        } else {
            await set(kelasRef, updatedKelas)
        }

        toast.success(`Kelas ${data.code_kelas} berhasil diupdate`, {
            position: 'bottom-right',
        })

        return {
            success: true,
            id: kelasId,
        }
    } catch (err) {
        toast.error('Gagal mengupdate kelas', {
            position: 'bottom-right',
        })
        return {
            success: false,
            error: {
                fieldErrors: {
                    code_kelas: ['Terjadi kesalahan saat mengupdate data'],
                },
            },
        }
    }
}

export async function deleteKelas(
    kelasId: string,
    gedungId: string,
    lantai: string
): Promise<{
    success: boolean
    error?: string
}> {
    try {
        const kelasRef = ref(
            database,
            `gedung/${gedungId}/kelas/${lantai}/${kelasId}`
        )
        const snapshot = await get(kelasRef)

        if (!snapshot.exists()) {
            return {
                success: false,
                error: 'Kelas tidak ditemukan',
            }
        }

        const kelasData = snapshot.val()

        await set(kelasRef, null)

        toast.success(`Kelas ${kelasData.code_kelas} berhasil dihapus`, {
            position: 'bottom-right',
        })

        return {
            success: true,
        }
    } catch (error) {
        toast.error('Gagal menghapus kelas', {
            position: 'bottom-right',
        })
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        }
    }
}

export async function getKelasById(
    kelasId: string,
    gedungId: string,
    lantai: string
) {
    try {
        const kelasRef = ref(
            database,
            `gedung/${gedungId}/kelas/${lantai}/${kelasId}`
        )
        const snapshot = await get(kelasRef)

        if (!snapshot.exists()) {
            return null
        }

        return {
            firebaseId: kelasId,
            gedungFirebaseId: gedungId,
            ...snapshot.val(),
        }
    } catch (error) {
        console.error('Gagal ambil data kelas:', error)
        return null
    }
}
