import { z } from 'zod'

export const GedungFormValidation = z.object({
    name: z.string().min(3, { message: 'Nama gedung minimal 3 karakter' }),
    kode_gedung: z.string().min(1, { message: 'Kode gedung wajib diisi' }),
    latitude: z.number()
        .min(-90, { message: 'Latitude harus antara -90 hingga 90' })
        .max(90, { message: 'Latitude harus antara -90 hingga 90' }),
    longitude: z.number()
        .min(-180, { message: 'Longitude harus antara -180 hingga 180' })
        .max(180, { message: 'Longitude harus antara -180 hingga 180' }),
    image: z.string().url({ message: 'Image harus URL yang valid' }).optional().or(z.literal('')),
})

export const UpdateGedungFormValidation = z.object({
    name: z.string().min(3, { message: 'Nama gedung minimal 3 karakter' }),
    kode_gedung: z.string().min(1, { message: 'Kode gedung wajib diisi' }),
    latitude: z.number()
        .min(-90, { message: 'Latitude harus antara -90 hingga 90' })
        .max(90, { message: 'Latitude harus antara -90 hingga 90' }),
    longitude: z.number()
        .min(-180, { message: 'Longitude harus antara -180 hingga 180' })
        .max(180, { message: 'Longitude harus antara -180 hingga 180' }),
    image: z.string().url({ message: 'Image harus URL yang valid' }).optional().or(z.literal('')),
})
