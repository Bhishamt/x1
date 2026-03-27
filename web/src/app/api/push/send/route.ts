import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminSupabase } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        // Verify caller is staff
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { data: caller } = await supabase.from('users').select('role_id').eq('id', user.id).single()
        if (!caller || (caller as { role_id: number }).role_id >= 5) {
            return NextResponse.json({ error: 'Only staff can send push notifications' }, { status: 403 })
        }

        const body = await req.json()
        const { title, message, target_role } = body

        if (!title || !message) {
            return NextResponse.json({ error: 'title and message are required' }, { status: 400 })
        }

        // Get push tokens
        let tokensQuery = adminSupabase.from('push_tokens').select('token, user_id')
        if (target_role) {
            // Filter tokens by user role
            const { data: targetUsers } = await adminSupabase
                .from('users')
                .select('id')
                .eq('role_id', target_role)
            if (targetUsers) {
                const userIds = (targetUsers as { id: string }[]).map(u => u.id)
                tokensQuery = tokensQuery.in('user_id', userIds)
            }
        }

        const { data: tokens } = await tokensQuery
        if (!tokens || tokens.length === 0) {
            return NextResponse.json({ sent: 0, message: 'No push tokens found' })
        }

        // Send via Expo Push API
        const pushTokens = (tokens as { token: string }[]).map(t => t.token).filter(t => t.startsWith('ExponentPushToken'))

        if (pushTokens.length === 0) {
            return NextResponse.json({ sent: 0, message: 'No valid Expo push tokens' })
        }

        // Batch notifications (Expo supports up to 100 per request)
        const messages = pushTokens.map(token => ({
            to: token,
            sound: 'default' as const,
            title,
            body: message,
        }))

        const chunkSize = 100
        let totalSent = 0
        for (let i = 0; i < messages.length; i += chunkSize) {
            const chunk = messages.slice(i, i + chunkSize)
            const response = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chunk),
            })
            if (response.ok) totalSent += chunk.length
        }

        return NextResponse.json({ sent: totalSent })
    } catch (err) {
        console.error('Push notification error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
