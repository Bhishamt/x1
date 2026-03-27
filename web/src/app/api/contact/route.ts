import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json()

        if (!name?.trim() || !email?.trim() || !message?.trim()) {
            return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
        }

        const supabase = await createClient()
        const { error } = await (supabase.from('contact_messages') as any)
            .insert([{ name: name.trim(), email: email.trim(), message: message.trim() }])

        if (error) {
            console.error('Contact insert error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Message sent successfully!' })
    } catch (err: any) {
        console.error('Contact API error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
