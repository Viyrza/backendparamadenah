import { NextRequest, NextResponse } from 'next/server'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase/firebase.config'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
    const { email, password } = await req.json()
    const cookieStore = await cookies()

    if (!email || !password) {
        return NextResponse.json(
            { success: false, message: 'Email dan password harus diisi' },
            { status: 400 }
        )
    }

    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        )
        const token = await userCredential.user.getIdToken()

        cookieStore.set('token', btoa(token), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
        })

        cookieStore.set('user_email', email, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24,
        })

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (error: any) {
        console.error('Login error:', error)
        let errorMessage = 'Login gagal'

        if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Email atau password salah'
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'User tidak ditemukan'
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Password salah'
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Terlalu banyak percobaan login'
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Koneksi internet bermasalah'
        }

        return NextResponse.json(
            { success: false, message: errorMessage },
            { status: 401 }
        )
    }
}
