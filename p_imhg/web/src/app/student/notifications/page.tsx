'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import { timeAgo, getNotificationTypeStyles } from '@/lib/utils'
import type { Notification } from '@/types/database.types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import toast from 'react-hot-toast'

type ConnStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export default function NotificationsPage() {
    const supabase = createClient()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loading, setLoading] = useState(true)
    const [connStatus, setConnStatus] = useState<ConnStatus>('connecting')
    const [userId, setUserId] = useState<string | null>(null)

    // ── Initial load ──────────────────────────────────────────────────────────
    const loadNotifications = useCallback(async (uid: string) => {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
        if (error) {
            console.error('[Realtime] Initial load failed:', error.message)
        } else {
            setNotifications((data ?? []) as unknown as Notification[])
        }
        setLoading(false)
    }, [])

    // ── Realtime subscription ─────────────────────────────────────────────────
    useEffect(() => {
        let channel: RealtimeChannel | null = null
        let mounted = true

        async function init() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user || !mounted) return
            setUserId(user.id)
            await loadNotifications(user.id)

            /**
             * Key points for RLS-compatible realtime:
             * 1. Channel name must be unique per user
             * 2. filter uses `user_id=eq.{uuid}` — Supabase enforces this via RLS
             * 3. Both INSERT and UPDATE events subscribed
             */
            channel = supabase
                .channel(`notifs-user-${user.id}`, {
                    config: { broadcast: { ack: false }, presence: { key: '' } },
                })
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    payload => {
                        console.log('[Realtime] INSERT received:', payload.new)
                        if (!mounted) return
                        setNotifications(prev => [payload.new as Notification, ...prev])
                        toast('🔔 ' + (payload.new as Notification).title, { duration: 4000 })
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
                        console.log('[Realtime] UPDATE received:', payload.new)
                        if (!mounted) return
                        setNotifications(prev =>
                            prev.map(n => n.id === (payload.new as Notification).id
                                ? payload.new as Notification : n)
                        )
                    }
                )
                .subscribe(status => {
                    console.log('[Realtime] Channel status:', status)
                    if (!mounted) return
                    if (status === 'SUBSCRIBED') setConnStatus('connected')
                    else if (status === 'CHANNEL_ERROR') {
                        setConnStatus('error')
                        console.error('[Realtime] Channel error — check Realtime is enabled for notifications table')
                    } else if (status === 'CLOSED') setConnStatus('disconnected')
                    else if (status === 'TIMED_OUT') {
                        setConnStatus('error')
                        console.error('[Realtime] Subscription timed out')
                    }
                })
        }

        init()

        return () => {
            mounted = false
            if (channel) {
                console.log('[Realtime] Cleaning up channel')
                supabase.removeChannel(channel)
            }
        }
    }, [])

    // ── Mark read ─────────────────────────────────────────────────────────────
    async function markAllRead() {
        if (!userId) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('notifications') as any)
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false)
        if (error) { toast.error('Failed to mark read'); return }
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        toast.success('All marked as read')
    }

    async function markRead(id: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('notifications') as any).update({ is_read: true }).eq('id', id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    }

    const unread = notifications.filter(n => !n.is_read).length

    const statusDot: Record<ConnStatus, { color: string; label: string }> = {
        connecting: { color: '#f59e0b', label: 'Connecting…' },
        connected: { color: '#10b981', label: 'Live' },
        disconnected: { color: '#64748b', label: 'Offline' },
        error: { color: '#ef4444', label: 'Error' },
    }
    const dot = statusDot[connStatus]

    return (
        <div>
            <PageHeader
                title="Notifications"
                subtitle={`${unread} unread notification${unread !== 1 ? 's' : ''}`}
                icon="🔔"
                action={
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        {/* Realtime status indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: dot.color, boxShadow: `0 0 6px ${dot.color}` }} />
                            {dot.label}
                        </div>
                        {unread > 0 && (
                            <button onClick={markAllRead} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                                ✓ Mark all read
                            </button>
                        )}
                    </div>
                }
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading…</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {notifications.map(n => {
                        const styles = getNotificationTypeStyles(n.type)
                        return (
                            <div
                                key={n.id}
                                className="glass-card"
                                onClick={() => !n.is_read && markRead(n.id)}
                                style={{
                                    padding: '1.25rem 1.5rem',
                                    display: 'flex', gap: '1rem', alignItems: 'flex-start',
                                    borderLeft: '3px solid',
                                    borderColor: n.is_read ? 'var(--border)' : 'var(--accent)',
                                    opacity: n.is_read ? 0.7 : 1,
                                    cursor: n.is_read ? 'default' : 'pointer',
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                                    background: styles.bg, border: '1px solid',
                                }}>{styles.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
                                            {n.title}
                                            {!n.is_read && (
                                                <span style={{
                                                    display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
                                                    background: 'var(--accent)', marginLeft: 8, verticalAlign: 'middle',
                                                }} />
                                            )}
                                        </p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                            {timeAgo(n.created_at)}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.3rem 0 0' }}>
                                        {n.message}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                    {notifications.length === 0 && (
                        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔕</div>
                            <p style={{ color: 'var(--text-secondary)' }}>You're all caught up!</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
