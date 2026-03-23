import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile, error } = await supabase
            .from('users')
            .select('full_name, email, phone, roll_no, department, semester, scheme')
            .eq('id', user.id)
            .single()

        if (error || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // Cast to any or use explicit shape to avoid 'never' inference
        const p = profile as any

        return NextResponse.json({
            name: p.full_name,
            email: p.email,
            phone: p.phone,
            roll_no: p.roll_no,
            department: p.department,
            semester: p.semester,
            scheme: p.scheme
        })
    } catch (err) {
        console.error('Profile API Error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
