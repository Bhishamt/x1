import { useEffect, useState, useRef } from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../../src/lib/supabase'
import type { Notification } from '../../src/lib/types'

const TYPE_ICON: Record<string, string> = { info: '💬', success: '✅', warning: '⚠️', error: '🚨' }
const TYPE_COLOR: Record<string, string> = { info: '#3b82f6', success: '#10b981', warning: '#f59e0b', error: '#ef4444' }
const STATUS_COLOR = { connecting: '#f59e0b', connected: '#10b981', disconnected: '#64748b', error: '#ef4444' }

type ConnStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export default function NotificationsScreen() {
    const [notifs, setNotifs] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [connStatus, setConnStatus] = useState<ConnStatus>('connecting')
    const [userId, setUserId] = useState<string | null>(null)

    // Use refs so the cleanup function always has the latest channel ref
    const channelRef = useRef<RealtimeChannel | null>(null)
    const mountedRef = useRef(true)

    useEffect(() => {
        mountedRef.current = true

        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || !mountedRef.current) return
            setUserId(user.id)

            // ── Initial fetch ────────────────────────────────────────────────
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabase.from('notifications') as any)
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('[Realtime] Initial load error:', error.message)
            } else if (mountedRef.current) {
                setNotifs((data as Notification[]) ?? [])
            }
            if (mountedRef.current) setLoading(false)

            // ── Realtime subscription ────────────────────────────────────────
            /**
             * Production checklist:
             * ✅ Unique channel name per user prevents cross-user leakage
             * ✅ filter: user_id=eq.<uuid> — DB-side filter + RLS enforces ownership
             * ✅ Both INSERT and UPDATE events handled
             * ✅ subscribe() callback logs status changes
             * ✅ Cleanup removes channel on unmount
             */
            const channel = supabase
                .channel(`mobile-notifs-${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    payload => {
                        console.log('[Realtime] INSERT:', payload.new)
                        if (!mountedRef.current) return
                        setNotifs(prev => [payload.new as Notification, ...prev])
                    }
                )
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    payload => {
                        console.log('[Realtime] UPDATE:', payload.new)
                        if (!mountedRef.current) return
                        setNotifs(prev =>
                            prev.map(n => n.id === (payload.new as Notification).id
                                ? payload.new as Notification : n)
                        )
                    }
                )
                .subscribe(status => {
                    console.log('[Realtime] Status:', status)
                    if (!mountedRef.current) return
                    if (status === 'SUBSCRIBED') setConnStatus('connected')
                    else if (status === 'CHANNEL_ERROR') {
                        setConnStatus('error')
                        console.error('[Realtime] Error — is Realtime enabled on notifications table?')
                    } else if (status === 'CLOSED') setConnStatus('disconnected')
                    else if (status === 'TIMED_OUT') {
                        setConnStatus('error')
                        console.error('[Realtime] Timed out')
                    }
                })

            channelRef.current = channel
        }

        init()

        return () => {
            mountedRef.current = false
            if (channelRef.current) {
                console.log('[Realtime] Removing channel on unmount')
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }
        }
    }, [])

    async function markAllRead() {
        if (!userId) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('notifications') as any)
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)
        setNotifs(prev => prev.map(n => ({ ...n, is_read: true })))
    }

    async function markRead(id: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('notifications') as any).update({ is_read: true }).eq('id', id)
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    const unread = notifs.filter(n => !n.is_read).length

    if (loading) return (
        <View style={s.loader}><Text style={{ color: '#3b82f6' }}>Loading…</Text></View>
    )

    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <View style={{ flex: 1 }}>
                    <Text style={s.pageTitle}>🔔 Notifications</Text>
                    {unread > 0 && <Text style={s.unreadCount}>{unread} unread</Text>}
                </View>

                {/* Live status dot */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[s.statusDot, { backgroundColor: STATUS_COLOR[connStatus] }]} />
                    <Text style={{ color: '#475569', fontSize: 11 }}>
                        {connStatus === 'connected' ? 'Live' : connStatus === 'connecting' ? 'Connecting…' : connStatus === 'error' ? 'Error' : 'Offline'}
                    </Text>
                </View>

                {unread > 0 && (
                    <TouchableOpacity onPress={markAllRead} style={s.markBtn}>
                        <Text style={s.markBtnText}>Mark all read</Text>
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
                {notifs.map(n => (
                    <TouchableOpacity key={n.id} activeOpacity={n.is_read ? 1 : 0.7}
                        onPress={() => !n.is_read && markRead(n.id)}>
                        <View style={[s.card, {
                            borderLeftColor: n.is_read ? '#1e2d40' : (TYPE_COLOR[n.type] ?? '#3b82f6'),
                            opacity: n.is_read ? 0.65 : 1,
                        }]}>
                            <View style={s.row}>
                                <Text style={{ fontSize: 24 }}>{TYPE_ICON[n.type] ?? '💬'}</Text>
                                <View style={{ flex: 1 }}>
                                    <View style={[s.row, { justifyContent: 'space-between' }]}>
                                        <Text style={s.notifTitle}>
                                            {n.title}
                                            {!n.is_read && <Text style={{ color: '#3b82f6' }}> •</Text>}
                                        </Text>
                                        <Text style={s.time}>
                                            {new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </Text>
                                    </View>
                                    <Text style={s.message}>{n.message}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
                {notifs.length === 0 && (
                    <View style={s.empty}>
                        <Text style={{ fontSize: 40, marginBottom: 8 }}>🔕</Text>
                        <Text style={{ color: '#64748b' }}>You're all caught up!</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080c14' },
    loader: { flex: 1, backgroundColor: '#080c14', alignItems: 'center', justifyContent: 'center' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 8, gap: 8 },
    pageTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
    unreadCount: { fontSize: 12, color: '#3b82f6', marginTop: 2 },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    markBtn: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#1e2d40' },
    markBtnText: { color: '#94a3b8', fontSize: 11, fontWeight: '600' },
    card: { backgroundColor: '#111827', borderRadius: 14, borderWidth: 1, borderColor: '#1e2d40', borderLeftWidth: 3, padding: 14, marginBottom: 10 },
    row: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    notifTitle: { fontSize: 14, color: '#f1f5f9', fontWeight: '700', flex: 1 },
    time: { fontSize: 11, color: '#475569' },
    message: { fontSize: 13, color: '#94a3b8', marginTop: 4, lineHeight: 18 },
    empty: { alignItems: 'center', padding: 60 },
})
