import { z } from 'zod'

const ConnectionSchema = z.object({
    target: z.string().min(1, { message: 'Pilih target koneksi' }),
    distance: z.number().min(1, { message: 'Jarak minimal 1 meter' })
})

const BuildingFormValidation = z.object({
    name: z.string().min(3, { message: 'Nama lokasi minimal 3 karakter' }),
    latitude: z.number()
        .min(-90, { message: 'Latitude harus antara -90 hingga 90' })
        .max(90, { message: 'Latitude harus antara -90 hingga 90' }),
    longitude: z.number()
        .min(-180, { message: 'Longitude harus antara -180 hingga 180' })
        .max(180, { message: 'Longitude harus antara -180 hingga 180' }),
    type: z.literal('building', { errorMap: () => ({ message: 'Type harus building' }) }),
    gedung_slug: z.string().min(1, { message: 'Pilih gedung yang valid' }),
    connections: z.array(ConnectionSchema).optional().default([]),
})

const NonBuildingFormValidation = z.object({
    name: z.string().min(3, { message: 'Nama lokasi minimal 3 karakter' }),
    latitude: z.number()
        .min(-90, { message: 'Latitude harus antara -90 hingga 90' })
        .max(90, { message: 'Latitude harus antara -90 hingga 90' }),
    longitude: z.number()
        .min(-180, { message: 'Longitude harus antara -180 hingga 180' })
        .max(180, { message: 'Longitude harus antara -180 hingga 180' }),
    type: z.enum(['entrance', 'parking', 'intersection', 'landmark'], {
        errorMap: () => ({ message: 'Pilih tipe lokasi yang valid' }),
    }),
    gedung_slug: z.string().optional().or(z.literal('')),
    connections: z.array(ConnectionSchema).optional().default([]),
})

export const NavigationNodeFormValidation = z.discriminatedUnion('type', [
    BuildingFormValidation,
    NonBuildingFormValidation,
])

const BuildingUpdateValidation = z.object({
    name: z.string().min(3, { message: 'Nama lokasi minimal 3 karakter' }),
    latitude: z.number()
        .min(-90, { message: 'Latitude harus antara -90 hingga 90' })
        .max(90, { message: 'Latitude harus antara -90 hingga 90' }),
    longitude: z.number()
        .min(-180, { message: 'Longitude harus antara -180 hingga 180' })
        .max(180, { message: 'Longitude harus antara -180 hingga 180' }),
    type: z.literal('building', { errorMap: () => ({ message: 'Type harus building' }) }),
    gedung_slug: z.string().min(1, { message: 'Pilih gedung yang valid' }),
    connections: z.array(ConnectionSchema).optional().default([]),
})

const NonBuildingUpdateValidation = z.object({
    name: z.string().min(3, { message: 'Nama lokasi minimal 3 karakter' }),
    latitude: z.number()
        .min(-90, { message: 'Latitude harus antara -90 hingga 90' })
        .max(90, { message: 'Latitude harus antara -90 hingga 90' }),
    longitude: z.number()
        .min(-180, { message: 'Longitude harus antara -180 hingga 180' })
        .max(180, { message: 'Longitude harus antara -180 hingga 180' }),
    type: z.enum(['entrance', 'parking', 'intersection', 'landmark'], {
        errorMap: () => ({ message: 'Pilih tipe lokasi yang valid' }),
    }),
    gedung_slug: z.string().optional().or(z.literal('')),
    connections: z.array(ConnectionSchema).optional().default([]),
})

export const UpdateNavigationNodeFormValidation = z.discriminatedUnion('type', [
    BuildingUpdateValidation,
    NonBuildingUpdateValidation,
])
