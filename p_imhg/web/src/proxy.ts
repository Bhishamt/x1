import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    // Public routes — always accessible (no auth required)
    const PUBLIC_PATHS = ['/login', '/signup', '/auth/callback', '/about', '/courses', '/admissions', '/faculty', '/placements', '/student/announcements', '/gallery', '/contact']
    const isPublic = pathname === '/' || PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
    if (isPublic) {
        // If logged in and hitting login/signup, redirect to portal
        if (user && (pathname === '/login' || pathname === '/signup')) {
            const { data: rawProfile } = await supabase
                .from('users')
                .select('role_id')
                .eq('id', user.id)
                .single()
            const profile = rawProfile as unknown as { role_id: number } | null
            const dest = profile?.role_id === 1 ? '/admin/dashboard' : '/student/profile'
            return NextResponse.redirect(new URL(dest, request.url))
        }
        return supabaseResponse
    }

    // Unauthenticated — redirect to login
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Fetch role for route guarding
    const { data: rawProfile } = await supabase
        .from('users')
        .select('role_id')
        .eq('id', user.id)
        .single()
    const profile = rawProfile as unknown as { role_id: number } | null

    const isAdmin = profile?.role_id === 1

    // Admin-only routes guard
    if (pathname.startsWith('/admin') && !isAdmin) {
        return NextResponse.redirect(new URL('/student/profile', request.url))
    }

    // Student-only routes guard
    if (pathname.startsWith('/student') && isAdmin) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/|auth/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
