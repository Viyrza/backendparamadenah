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
