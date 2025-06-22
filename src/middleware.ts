import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('token')?.value as string

    const protectedRoutes = ['/menu-utama']
    const authRoutes = ['/auth']

    const isProtectedRoute = protectedRoutes.some((route) =>
        pathname.startsWith(route)
    )

    const isAuthRoute = authRoutes.some((route) => pathname === route)

    if (isProtectedRoute && !token) {
        console.log('Redirecting to /auth - no token for protected route')
        const authUrl = new URL('/auth', request.url)
        return NextResponse.redirect(authUrl)
    }

    if (isAuthRoute && token) {
        const menuUtamaUrl = new URL('/menu-utama', request.url)
        return NextResponse.redirect(menuUtamaUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
    ],
}
