import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        // Verify caller is super_admin or admin
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: caller } = await supabase
            .from('users')
            .select('role_id')
            .eq('id', user.id)
            .single()

        if (!caller || (caller as { role_id: number }).role_id > 2) {
            return NextResponse.json({ error: 'Only Super Admin or Admin can create users' }, { status: 403 })
        }

        const body = await req.json()
        const { email, password, full_name, role_id, department, phone } = body

        if (!email || !password || !full_name || !role_id) {
            return NextResponse.json({ error: 'Missing required fields: email, password, full_name, role_id' }, { status: 400 })
        }

        // Only super_admin can create other super_admins
        if (role_id === 1 && (caller as { role_id: number }).role_id !== 1) {
            return NextResponse.json({ error: 'Only Super Admin can create Super Admin accounts' }, { status: 403 })
        }

        // Create auth user using service role
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name, role_id },
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        // The auth trigger will create the public.users row, but update it with extra fields
        if (authData.user) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (adminSupabase.from('users') as any).update({
                role_id,
                full_name,
                department: department || null,
                phone: phone || null,
            }).eq('id', authData.user.id)
        }

        return NextResponse.json({ success: true, userId: authData.user?.id })
    } catch (err) {
        console.error('Create user error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
