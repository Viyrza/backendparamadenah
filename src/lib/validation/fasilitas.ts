import { z } from 'zod'

export const FasilitasFormValidation = z.object({
    name: z.string().min(3, { message: 'Nama harus minimal 3 karakter' }),
    description: z
        .string()
        .min(3, { message: 'Deskripsi harus minimal 3 karakter' })
        .max(3200, { message: 'Deskripsi maksimal 3200 karakter' }),
})
