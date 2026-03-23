import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const studentId = id
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
            return NextResponse.json({ error: 'Forbidden: Only Super Admin can delete students' }, { status: 403 })
        }

        // 2. Prevent self-deletion
        if (user.id === studentId) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // 3. Delete from Auth using backend service role
        //    (This triggers ON DELETE CASCADE in users, results, result_corrections)
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(studentId)

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
