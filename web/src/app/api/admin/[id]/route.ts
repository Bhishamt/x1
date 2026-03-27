import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const adminId = id
        const supabase = await createClient()

        // 1. Verify caller is super_admin
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('users')
            .select('role_id')
            .eq('id', user.id)
            .single()

        if (!profile || (profile as { role_id: number }).role_id !== 1) {
            return NextResponse.json({ error: 'Forbidden: Only Super Admin can delete accounts' }, { status: 403 })
        }

        // 2. Prevent self-deletion
        if (user.id === adminId) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // 3. Step 1: Delete from admins table
        const { error: dbError } = await (adminSupabase.from('admins') as any).delete().eq('user_id', adminId)
        if (dbError) {
            console.error('DB Delete error:', dbError)
            return NextResponse.json({ error: 'Failed to delete admin record' }, { status: 500 })
        }

        // 4. Step 2: Delete from Auth using admin client
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(adminId)

        if (deleteError) {
            console.error('Delete error:', deleteError)
            return NextResponse.json({ error: deleteError.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('API Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
