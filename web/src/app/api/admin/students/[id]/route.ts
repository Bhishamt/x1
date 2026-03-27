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

        // 1. Verify caller is authorized (role_id <= 3: Super Admin, HOD, Class Incharge)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('users')
            .select('role_id')
            .eq('id', user.id)
            .single()

        if (!profile || (profile as { role_id: number }).role_id > 3) {
            return NextResponse.json({ error: 'Forbidden: Only administrators or staff can delete students' }, { status: 403 })
        }

        // 2. Prevent self-deletion
        if (user.id === studentId) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
        }

        // 3. Attempt to delete from Auth using backend service role
        //    (This triggers ON DELETE CASCADE in users, results, result_corrections if set up by trigger)
        const { error: deleteAuthError } = await adminSupabase.auth.admin.deleteUser(studentId)

        if (deleteAuthError) {
            // If user not found in Auth, it might be a demo user in public.users only
            if (deleteAuthError.message.includes('User not found') || (deleteAuthError as any).status === 404) {
                console.log('User not found in Auth, attempting direct public.users deletion for:', studentId)
                const { error: deleteUserError } = await adminSupabase
                    .from('users')
                    .delete()
                    .eq('id', studentId)
                
                if (deleteUserError) {
                    console.error('Direct deletion error:', deleteUserError)
                    return NextResponse.json({ error: deleteUserError.message }, { status: 500 })
                }
            } else {
                console.error('Auth delete error:', deleteAuthError)
                return NextResponse.json({ error: deleteAuthError.message }, { status: 500 })
            }
        }

        // 4. Ensure it's deleted from public.users even if Auth deletion didn't trigger it (fallback)
        await adminSupabase.from('users').delete().eq('id', studentId)

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('API Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
