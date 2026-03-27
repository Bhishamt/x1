'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { timeAgo, getNotificationTypeStyles } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Notification } from '@/types/database.types'

type StudentRow = { id: string; full_name: string }
type NotifRow = Notification & { users: { full_name: string } | null }

const TYPES = ['info', 'success', 'warning', 'error']
const DEPARTMENTS = ['Computer Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Electronics & Communication', 'Information Technology']
const EMPTY = { user_id: '', title: '', message: '', type: 'info', action_url: '' }
const BROAD_EMPTY = { title: '', message: '', type: 'info', target: 'all', department: '', year: '' }

export default function AdminNotificationsPage() {
    const supabase = createClient()
    const [notifs, setNotifs] = useState<NotifRow[]>([])
    const [students, setStudents] = useState<StudentRow[]>([])
    const [showModal, setShowModal] = useState(false)
    const [showBroadcast, setShowBroadcast] = useState(false)
    const [form, setForm] = useState({ ...EMPTY })
    const [broad, setBroad] = useState({ ...BROAD_EMPTY })
    const [saving, setSaving] = useState(false)

    useEffect(() => { load() }, [])

    async function load() {
        const [n, s] = await Promise.all([
            supabase.from('notifications').select('*, users(full_name)').order('created_at', { ascending: false }).limit(60),
            supabase.from('users').select('id, full_name').eq('role_id', 2).order('full_name'),
        ])
        setNotifs((n.data as unknown as NotifRow[]) ?? [])
        setStudents((s.data as unknown as StudentRow[]) ?? [])
    }

    async function send() {
        setSaving(true)
        try {
            const payload = { user_id: form.user_id, title: form.title, message: form.message, type: form.type, action_url: form.action_url || null }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('notifications') as any).insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success('Notification sent!'); setShowModal(false); load()
        } finally { setSaving(false) }
    }

    async function broadcast() {
        if (!broad.title.trim() || !broad.message.trim()) { toast.error('Title and message are required'); return }
        if ((broad.target === 'department' || broad.target === 'both') && !broad.department) { toast.error('Select a department'); return }
        if ((broad.target === 'year' || broad.target === 'both') && !broad.year) { toast.error('Select a year'); return }
        setSaving(true)
        try {
            const res = await fetch('/api/notifications/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: broad.title, message: broad.message, type: broad.type,
                    target: broad.target,
                    ...(broad.department ? { department: broad.department } : {}),
                    ...(broad.year ? { year: Number(broad.year) } : {}),
                }),
            })
            const json = await res.json()
            if (!res.ok) { toast.error(json.error ?? 'Failed'); return }
            toast.success(json.message)
            setShowBroadcast(false)
            setBroad({ ...BROAD_EMPTY })
            load()
        } catch { toast.error('Network error') }
        finally { setSaving(false) }
    }

    async function del(id: string) {
        if (!confirm('Delete?')) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('notifications') as any).delete().eq('id', id)
        if (error) toast.error(error.message)
        else { toast.success('Deleted'); load() }
    }

    return (
        <div>
            <PageHeader title="Notifications" subtitle="Send and manage student notifications" icon="🔔"
                action={
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => { setBroad({ ...BROAD_EMPTY }); setShowBroadcast(true) }} className="btn-secondary">📢 Broadcast</button>
                        <button onClick={() => { setForm({ ...EMPTY }); setShowModal(true) }} className="btn-primary">+ Individual</button>
                    </div>
                } />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {notifs.map(n => {
                    const st = getNotificationTypeStyles(n.type)
                    return (
                        <div key={n.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ fontSize: '1.25rem' }}>{st.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{n.title}</span>
                                    <Badge variant={n.type as any}>{n.type}</Badge>
                                    <Badge variant={n.is_read ? 'default' : 'info'}>{n.is_read ? 'Read' : 'Unread'}</Badge>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>{n.message}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.2rem 0 0' }}>
                                    To: {n.users?.full_name ?? '—'} · {timeAgo(n.created_at)}
                                </p>
                            </div>
                            <button onClick={() => del(n.id)} className="btn-danger" style={{ padding: '0.3rem 0.75rem', flexShrink: 0 }}>Delete</button>
                        </div>
                    )
                })}
                {notifs.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>No notifications yet.</p>}
            </div>

            {/* ── Individual send modal ── */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 520, padding: '2rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Send to Individual</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Student</label>
                                <select className="input-dark" value={form.user_id} onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}>
                                    <option value="">Select student…</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Title</label>
                                <input className="input-dark" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Message</label>
                                <textarea className="input-dark" rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Type</label>
                                <select className="input-dark" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={send} className="btn-primary" disabled={saving || !form.user_id || !form.title}>{saving ? 'Sending…' : 'Send'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Broadcast modal ── */}
            {showBroadcast && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 560, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.25rem' }}>📢 Broadcast Notification</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                            Sends to Supabase DB + Expo push notification to all matching students.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Title *</label>
                                <input className="input-dark" value={broad.title} onChange={e => setBroad(b => ({ ...b, title: e.target.value }))} placeholder="Seminar starting in 10 minutes…" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Message *</label>
                                <textarea className="input-dark" rows={3} value={broad.message} onChange={e => setBroad(b => ({ ...b, message: e.target.value }))} placeholder="All students are requested to assemble in the auditorium." />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Type</label>
                                    <select className="input-dark" value={broad.type} onChange={e => setBroad(b => ({ ...b, type: e.target.value }))}>
                                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Send To</label>
                                    <select className="input-dark" value={broad.target} onChange={e => setBroad(b => ({ ...b, target: e.target.value, department: '', year: '' }))}>
                                        <option value="all">All Students</option>
                                        <option value="department">By Department</option>
                                        <option value="year">By Year</option>
                                        <option value="both">Department + Year</option>
                                    </select>
                                </div>
                            </div>
                            {(broad.target === 'department' || broad.target === 'both') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Department</label>
                                    <select className="input-dark" value={broad.department} onChange={e => setBroad(b => ({ ...b, department: e.target.value }))}>
                                        <option value="">Select department…</option>
                                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            )}
                            {(broad.target === 'year' || broad.target === 'both') && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Academic Year</label>
                                    <select className="input-dark" value={broad.year} onChange={e => setBroad(b => ({ ...b, year: e.target.value }))}>
                                        <option value="">Select year…</option>
                                        <option value="1">Year 1</option>
                                        <option value="2">Year 2</option>
                                        <option value="3">Year 3</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowBroadcast(false)} className="btn-secondary">Cancel</button>
                            <button onClick={broadcast} className="btn-primary" disabled={saving}>{saving ? 'Sending…' : '📢 Broadcast'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
