'use server'

import { database } from '@/lib/firebase/firebase.config'
import { ref, update } from 'firebase/database'

export async function updateFasilitasDetails(formData: FormData) {
  const category = formData.get('category')?.toString()
  const id = formData.get('id')?.toString()
  const description = formData.get('description')?.toString()
  const image = formData.get('image')?.toString()
  const denah_lokasi = formData.get('denah_lokasi')?.toString()

  if (!category || !id) {
    return { success: false, error: { formError: 'Kategori dan ID wajib diisi' } }
  }

  const fasilitasRef = ref(database, `fasilitas/${category}/${id}`)

  await update(fasilitasRef, {
    details: {
      description,
      imageUrl: image,
      denah_lokasi,
    },
    updated_at: new Date().toISOString(),
  })

  return { success: true }
}
