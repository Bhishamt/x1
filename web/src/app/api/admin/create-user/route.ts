import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'
import { rateLimit, LIMITS, getClientIP } from '@/lib/rateLimit'

const adminLimiter = rateLimit(LIMITS.admin)

export async function POST(req: NextRequest) {
    try {
        const ip = getClientIP(req)
        if (adminLimiter.check(ip)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
        }

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
        const { email, password, full_name, role_id, department_id, phone, status } = body

        if (!email || !password || !full_name || !role_id) {
            return NextResponse.json({ error: 'Missing required fields: email, password, full_name, role_id' }, { status: 400 })
        }

        // 1. Validation: Check if email already exists
        const { data: inUsers } = await adminSupabase.from('users').select('id').eq('email', email).maybeSingle()
        const { data: inAdmins } = await (adminSupabase.from('admins') as any).select('user_id').eq('email', email).maybeSingle()

        if (inUsers || inAdmins) {
            return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
        }

        // Only super_admin can create other super_admins
        if (role_id === 1 && (caller as { role_id: number }).role_id !== 1) {
            return NextResponse.json({ error: 'Only Super Admin can create Super Admin accounts' }, { status: 403 })
        }

        const roleNames: Record<number, string> = { 1: 'super_admin', 2: 'hod', 3: 'class_incharge', 4: 'student' }
        const roleLabel = roleNames[role_id] || 'staff'

        // 2. Step 1: Create auth user using service role
        const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name, role_id },
        })

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 })
        }

        const newUserId = authData.user.id

        // 3. Step 2: WAIT for trigger or MANUALLY ensure public.users record exists
        // This prevents FK violation in admins table if trigger is slow
        let retries = 5
        let userExists = false
        while (retries > 0 && !userExists) {
            const { data } = await adminSupabase.from('users').select('id').eq('id', newUserId).maybeSingle()
            if (data) {
                userExists = true
            } else {
                await new Promise(r => setTimeout(r, 100))
                retries--
            }
        }

        if (!userExists) {
            console.log('Trigger slow - manually creating public.users record for', newUserId)
            await (adminSupabase.from('users') as any).insert({
                id: newUserId,
                email,
                full_name,
                role_id: Number(role_id)
            })
        }

        // 4. Step 3: Insert into admins table
        const { error: dbError } = await (adminSupabase.from('admins') as any)
            .insert({
                user_id: newUserId,
                name: full_name,
                email,
                role: roleLabel,
                department_id: department_id || null,
                phone: phone || null,
                status: status || 'active'
            })

        if (dbError) {
            console.error('Database error creating admin record:', dbError)
            // Cleanup: delete auth user if db record fails
            await adminSupabase.auth.admin.deleteUser(newUserId)
            return NextResponse.json({ error: `Database error: ${dbError.message}` }, { status: 500 })
        }

        // 5. Step 4: Final update to public.users with all details
        await (adminSupabase.from('users') as any).update({
            full_name,
            department_id: department_id || null,
            phone: phone || null,
            is_active: status !== 'inactive'
        }).eq('id', newUserId)

        return NextResponse.json({ success: true, userId: newUserId })
    } catch (err: any) {
        console.error('Create user error:', err)
        return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
    }
}
