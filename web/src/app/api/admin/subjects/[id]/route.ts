import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const supabase = await createClient()

        // 1. Verify caller is staff (role_id <= 3)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: profile } = await supabase
            .from('users')
            .select('role_id')
            .eq('id', user.id)
            .single()

        if (!profile || (profile as { role_id: number }).role_id > 3) {
            return NextResponse.json({ error: 'Forbidden: Only administrators can delete subjects' }, { status: 403 })
        }

        // 2. Delete the subject
        const { error } = await supabase
            .from('subjects')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Delete error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('API Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
