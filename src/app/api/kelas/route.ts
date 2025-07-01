import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/firebase/firebase.config'
import { ref, get, push, set } from 'firebase/database'
import { z } from 'zod'
import slugify from 'slugify'

// ✅ Validasi dengan Zod
const formSchema = z.object({
  code_kelas: z.string().min(3),
  kapasitas_orang: z.coerce.number().min(1),
  total_papan_tulis: z.coerce.number().min(0),
  total_televisi: z.coerce.number().min(0),
  lantai: z.string().min(1),
  gedung_id: z.string().min(1),
  images: z.array(z.string().url()).optional(),
  denah_lokasi: z.string().url().optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()

    // 🖼️ Ambil semua gambar kelas
    const rawImages = form.getAll('images[]')
      .map(item => String(item))
      .filter(Boolean)

    // 🗺️ Ambil 1 denah lokasi (dari denah_images[])
    const rawDenah = form.getAll('denah_images[]')
      .map(item => String(item))
      .filter(Boolean)

    // 🔧 Susun body sesuai schema
    const body = {
      code_kelas: form.get('code_kelas')?.toString() || '',
      kapasitas_orang: Number(form.get('kapasitas_orang')),
      total_papan_tulis: Number(form.get('total_papan_tulis')),
      total_televisi: Number(form.get('total_televisi')),
      lantai: form.get('lantai')?.toString() || '',
      gedung_id: form.get('gedung_id')?.toString() || '',
      images: rawImages,
      denah_lokasi: rawDenah[0] || '',
    }

    console.log('📦 Raw Form Body:', body)

    // ✅ Validasi data
    const parsed = formSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({
        success: false,
        error: parsed.error.flatten(),
      }, { status: 400 })
    }

    const data = parsed.data

    // 🔍 Cari ID selanjutnya
    const kelasRef = ref(database, `gedung/${data.gedung_id}/kelas/${data.lantai}`)
    const snapshot = await get(kelasRef)
    const existingData = snapshot.exists() ? snapshot.val() : {}

    let nextId = 1
    if (existingData) {
      const ids = Object.values(existingData).map((k: any) => {
        const parts = k.id?.split('-') || []
        return parseInt(parts[parts.length - 1]) || 0
      })
      nextId = Math.max(0, ...ids) + 1
    }

    // 🧱 Bangun data kelas baru
    const newKelas = {
      id: `${data.lantai}-${nextId}`,
      code_kelas: data.code_kelas,
      kapasitas_orang: data.kapasitas_orang,
      total_papan_tulis: data.total_papan_tulis,
      total_televisi: data.total_televisi,
      lantai: data.lantai,
      gedung_id: data.gedung_id,
      image: data.images?.[0] || '',
      images: data.images || [],
      denah_lokasi: data.denah_lokasi || '',
      slug: slugify(`${data.code_kelas}-${data.lantai}`, { lower: true }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 🔐 Simpan ke Firebase
    const newRef = push(kelasRef)
    await set(newRef, newKelas)

    return NextResponse.json({ success: true, id: newRef.key })
  } catch (error) {
    console.error('❌ ERROR in POST /api/kelas:', error)
    return NextResponse.json({
      success: false,
      error: {
        fieldErrors: {
          code_kelas: ['Terjadi kesalahan saat menyimpan kelas'],
        },
      },
    }, { status: 500 })
  }
}
