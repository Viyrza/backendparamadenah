'use server'

import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/firebase.config'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(
    prevState: { success: boolean; message?: string },
    formData: FormData
): Promise<{ success: boolean; message?: string }> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const cookie = await cookies()
    if (!email || !password) {
        return { success: false, message: 'Email dan password wajib diisi' }
    }

    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        )
        const token = await userCredential.user.getIdToken()

        cookie.set('token', btoa(token), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
        })

        cookie.set('user_email', email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
        })

        return { success: true }
    } catch (err: any) {
        const message =
            err.code === 'auth/invalid-credential'
                ? 'Email atau password salah'
                : err.code === 'auth/user-not-found'
                ? 'Akun tidak ditemukan'
                : 'Login gagal'

        return { success: false, message }
    }
}

export async function logoutAction(): Promise<{ success: boolean }> {
    const cookie = await cookies()

    cookie.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        maxAge: 0,
    })

    cookie.set('user_email', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
        maxAge: 0,
    })

    return { success: true }
}
