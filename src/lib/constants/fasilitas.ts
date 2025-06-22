// Constants for fasilitas categories
export const FASILITAS_CATEGORIES = {
    'fasilitas-umum': 'Fasilitas Umum',
    'lab-kelas': 'Lab Kelas',
    'ruang-kantor': 'Ruang Kantor',
    'fasilitas-lainnya': 'Fasilitas Lainnya',
} as const

export type FasilitasCategory = keyof typeof FASILITAS_CATEGORIES
