'use server'

import { database } from '@/lib/firebase/firebase.config'
import { ref, get, set } from 'firebase/database'
import slugify from 'slugify'
import { z } from 'zod'
import type { FasilitasCategory } from '@/lib/constants/fasilitas'

const formSchema = z.object({
    name: z.string().min(3, { message: 'Nama harus minimal 3 karakter' }),
    description: z
        .string()
        .min(3, { message: 'Deskripsi harus minimal 3 karakter' })
        .max(3200, { message: 'Deskripsi maksimal 3200 karakter' }),
    category: z.enum(
        ['fasilitas-umum', 'lab-kelas', 'ruang-kantor', 'fasilitas-lainnya'],
        {
            errorMap: () => ({ message: 'Pilih kategori fasilitas' }),
        }
    ),
    imageUrl: z.string().optional(),
})

export async function createFasilitas(
    prevState: any,
    formData: FormData
): Promise<
    | { success: true; id: string }
    | {
          success: false
          error: {
              fieldErrors?: {
                  name?: string[]
                  description?: string[]
                  category?: string[]
              }
              formError?: string
          }
      }
> {
    const parsed = formSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        imageUrl: formData.get('imageUrl'),
    })

    if (!parsed.success) {
        return {
            success: false,
            error: {
                fieldErrors: parsed.error.flatten().fieldErrors,
                formError: parsed.error.message,
            },
        }
    }

    const data = parsed.data

    try {
        const fasilitasRef = ref(database, `fasilitas/${data.category}`)
        const snapshot = await get(fasilitasRef)
        const existingData = snapshot.exists() ? snapshot.val() : {}

        const existingFasilitas = Object.values(existingData).find(
            (fasilitas: any) =>
                fasilitas.name.toLowerCase() === data.name.toLowerCase()
        )

        if (existingFasilitas) {
            return {
                success: false,
                error: {
                    fieldErrors: {
                        name: [
                            'Fasilitas dengan nama ini sudah ada dalam kategori yang sama',
                        ],
                    },
                },
            }
        }

        const slug = slugify(data.name, {
            lower: true,
            strict: true,
            trim: true,
        })

        let maxId = 0
        Object.values(existingData).forEach((fasilitas: any) => {
            if (
                fasilitas.id &&
                typeof fasilitas.id === 'number' &&
                fasilitas.id > maxId
            ) {
                maxId = fasilitas.id
            }
        })

        const newId = maxId + 1
        const newFasilitasData = {
            id: newId,
            name: data.name,
            description: data.description,
            category: data.category,
            imageUrl: data.imageUrl || '',
            slug: slug,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        const newFasilitasRef = ref(
            database,
            `fasilitas/${data.category}/${slug}`
        )
        await set(newFasilitasRef, newFasilitasData)

        console.log('Fasilitas created successfully:', newFasilitasData)

        return {
            success: true,
            id: slug,
        }
    } catch (error) {
        console.error('Error creating fasilitas:', error)
        return {
            success: false,
            error: {
                formError: 'Terjadi kesalahan saat menyimpan data fasilitas',
            },
        }
    }
}

export async function getFasilitasByCategory(category?: FasilitasCategory) {
    try {
        const fasilitasRef = category
            ? ref(database, `fasilitas/${category}`)
            : ref(database, 'fasilitas')

        const snapshot = await get(fasilitasRef)

        if (!snapshot.exists()) {
            return []
        }

        const data = snapshot.val()

        if (category) {
            return Object.entries(data).map(
                ([slug, fasilitas]: [string, any]) => ({
                    slug,
                    ...fasilitas,
                })
            )
        } else {
            const allFasilitas: any[] = []
            Object.entries(data).forEach(
                ([cat, categoryData]: [string, any]) => {
                    if (categoryData && typeof categoryData === 'object') {
                        Object.entries(categoryData).forEach(
                            ([slug, fasilitas]: [string, any]) => {
                                allFasilitas.push({
                                    slug,
                                    category: cat,
                                    ...fasilitas,
                                })
                            }
                        )
                    }
                }
            )
            return allFasilitas
        }
    } catch (error) {
        console.error('Error fetching fasilitas:', error)
        return []
    }
}

export async function getAllFasilitasGrouped() {
    try {
        const fasilitasRef = ref(database, 'fasilitas')
        const snapshot = await get(fasilitasRef)

        if (!snapshot.exists()) {
            return {}
        }

        const data = snapshot.val()
        const grouped: Record<string, any[]> = {}

        Object.entries(data).forEach(
            ([category, categoryData]: [string, any]) => {
                if (categoryData && typeof categoryData === 'object') {
                    grouped[category] = Object.entries(categoryData).map(
                        ([slug, fasilitas]: [string, any]) => ({
                            slug,
                            category,
                            ...fasilitas,
                        })
                    )
                }
            }
        )

        return grouped
    } catch (error) {
        console.error('Error fetching grouped fasilitas:', error)
        return {}
    }
}

export async function updateFasilitas(
    prevState: any,
    formData: FormData
): Promise<
    | { success: true; id: string }
    | {
          success: false
          error: {
              fieldErrors?: {
                  name?: string[]
                  description?: string[]
                  category?: string[]
              }
              formError?: string
          }
      }
> {
    const parsed = formSchema.safeParse({
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        imageUrl: formData.get('imageUrl'),
    })

    if (!parsed.success) {
        return {
            success: false,
            error: {
                fieldErrors: parsed.error.flatten().fieldErrors,
                formError: parsed.error.message,
            },
        }
    }

    const data = parsed.data
    const oldCategory = formData.get('oldCategory') as string
    const oldSlug = formData.get('oldSlug') as string

    try {
        if (oldCategory !== data.category) {
            const oldFasilitasRef = ref(
                database,
                `fasilitas/${oldCategory}/${oldSlug}`
            )
            await set(oldFasilitasRef, null)
        }

        const newSlug = slugify(data.name, {
            lower: true,
            strict: true,
            trim: true,
        })

        const fasilitasRef = ref(database, `fasilitas/${data.category}`)
        const snapshot = await get(fasilitasRef)

        if (snapshot.exists()) {
            const existingData = snapshot.val()
            const existingFasilitas = Object.entries(existingData).find(
                ([slug, fasilitas]: [string, any]) =>
                    slug !== oldSlug &&
                    fasilitas.name.toLowerCase() === data.name.toLowerCase()
            )

            if (existingFasilitas) {
                return {
                    success: false,
                    error: {
                        fieldErrors: {
                            name: [
                                'Fasilitas dengan nama ini sudah ada dalam kategori yang sama',
                            ],
                        },
                    },
                }
            }
        }

        const updatedFasilitasData = {
            id: parseInt(formData.get('id') as string),
            name: data.name,
            description: data.description,
            category: data.category,
            imageUrl: data.imageUrl || '',
            slug: newSlug,
            created_at: formData.get('created_at') as string,
            updated_at: new Date().toISOString(),
        }

        const newFasilitasRef = ref(
            database,
            `fasilitas/${data.category}/${newSlug}`
        )
        await set(newFasilitasRef, updatedFasilitasData)

        if (oldCategory === data.category && oldSlug !== newSlug) {
            const oldFasilitasRef = ref(
                database,
                `fasilitas/${oldCategory}/${oldSlug}`
            )
            await set(oldFasilitasRef, null)
        }

        return {
            success: true,
            id: newSlug,
        }
    } catch (error) {
        console.error('Error updating fasilitas:', error)
        return {
            success: false,
            error: {
                formError: 'Terjadi kesalahan saat mengupdate data fasilitas',
            },
        }
    }
}

export async function deleteFasilitas(
    category: string,
    slug: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const fasilitasRef = ref(database, `fasilitas/${category}/${slug}`)
        await set(fasilitasRef, null)

        return {
            success: true,
        }
    } catch (error) {
        console.error('Error deleting fasilitas:', error)
        return {
            success: false,
            error: 'Terjadi kesalahan saat menghapus data fasilitas',
        }
    }
}
