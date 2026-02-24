import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
    title: z.string().min(1).max(100),
    message: z.string().min(1).max(500),
    type: z.enum(['info', 'success', 'warning', 'error']).default('info'),
    target: z.enum(['all', 'department', 'year', 'both']).default('all'),
    department: z.string().optional(),
    year: z.coerce.number().int().min(1).max(3).optional(),
})

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Verify admin role
        const { data: profile } = await supabase.from('users').select('role_id').eq('id', user.id).single()
        if (!profile || (profile as any).role_id !== 1) {
            return NextResponse.json({ error: 'Forbidden — admins only' }, { status: 403 })
        }

        const body = schema.parse(await req.json())

        // Build student query
        let query = supabase.from('users').select('id, push_token').eq('role_id', 2).eq('is_active', true)
        if (body.target === 'department' && body.department) query = (query as any).eq('department', body.department)
        if (body.target === 'year' && body.year) query = (query as any).eq('year', body.year)
        if (body.target === 'both') {
            if (body.department) query = (query as any).eq('department', body.department)
            if (body.year) query = (query as any).eq('year', body.year)
        }

        const { data: students } = await query
        if (!students || students.length === 0) {
            return NextResponse.json({ sent: 0, message: 'No matching students found' })
        }

        const typedStudents = students as unknown as { id: string; push_token: string | null }[]

        // Insert notification records for each student
        await supabase.from('notifications').insert(
            typedStudents.map(s => ({
                user_id: s.id,
                title: body.title,
                message: body.message,
                type: body.type,
            }))
        )

        // Send Expo push notifications (only to students with a push token)
        const tokens = typedStudents.map(s => s.push_token).filter(Boolean) as string[]
        let pushSent = 0

        if (tokens.length > 0) {
            const messages = tokens
                .filter(t => t.startsWith('ExponentPushToken'))
                .map(to => ({ to, title: body.title, body: body.message, sound: 'default' }))

            // Send in chunks of 100
            for (let i = 0; i < messages.length; i += 100) {
                const chunk = messages.slice(i, i + 100)
                const res = await fetch('https://exp.host/--/api/v2/push/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify(chunk.length === 1 ? chunk[0] : chunk),
                })
                if (res.ok) pushSent += chunk.length
            }
        }

        return NextResponse.json({
            sent: typedStudents.length,
            pushSent,
            message: `Notification sent to ${typedStudents.length} student(s), ${pushSent} push notification(s) delivered.`,
        })
    } catch (err) {
        if (err instanceof z.ZodError) return NextResponse.json({ error: 'Invalid input', details: err.issues }, { status: 400 })
        console.error('Notification send error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
