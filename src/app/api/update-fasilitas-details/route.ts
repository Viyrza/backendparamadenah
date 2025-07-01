import { ref, update } from 'firebase/database'
import { database } from '@/lib/firebase/firebase.config'

export async function POST(req: Request) {
  const formData = await req.formData()

  const category = formData.get('category')?.toString()
  const slug = formData.get('slug')?.toString()
  const description = formData.get('description')?.toString()
  const imageUrl = formData.get('image')?.toString()
  const denah_lokasi = formData.get('denah_lokasi')?.toString()

  if (!category || !slug) {
    return Response.json({ success: false, error: 'Missing category or slug' }, { status: 400 })
  }

  try {
    const fasilitasRef = ref(database, `fasilitas/${category}/${slug}`)
    await update(fasilitasRef, {
      details: {
        description,
        imageUrl,
        denah_lokasi,
      },
      updated_at: new Date().toISOString(),
    })
    return Response.json({ success: true })
  } catch (error) {
    console.error('Firebase error:', error)
    return Response.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
  }
}
