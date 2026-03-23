'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate, getCategoryBadge } from '@/lib/utils'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Announcement } from '@/types/database.types'

const EMPTY = { title: '', content: '', category: 'general', is_pinned: false, is_published: true, target_role: null as number | null, expires_at: '' }

export default function AdminAnnouncementsPage() {
    const supabase = createClient()
    const [items, setItems] = useState<Announcement[]>([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<Announcement | null>(null)
    const [form, setForm] = useState({ ...EMPTY })
    const [saving, setSaving] = useState(false)

    useEffect(() => { load() }, [])

    async function load() {
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
        setItems((data ?? []) as unknown as Announcement[])
    }

    function openNew() { setEditing(null); setForm({ ...EMPTY }); setShowModal(true) }
    function openEdit(a: Announcement) {
        setEditing(a)
        setForm({
            title: a.title, content: a.content, category: a.category, is_pinned: a.is_pinned,
            is_published: a.is_published, target_role: a.target_role, expires_at: a.expires_at?.slice(0, 10) ?? ''
        })
        setShowModal(true)
    }

    async function save() {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const payload = { ...form, expires_at: form.expires_at || null, created_by: user?.id }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = editing
                ? await (supabase.from('announcements') as any).update(payload).eq('id', editing.id)
                : await (supabase.from('announcements') as any).insert(payload)
            if (error) { toast.error(error.message); return }
            toast.success(editing ? 'Updated' : 'Created')

            // Send push notification for new published announcements
            if (!editing && form.is_published) {
                try {
                    await fetch('/api/push/send', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: `📢 ${form.title}`,
                            message: form.content.slice(0, 200),
                            target_role: form.target_role,
                        }),
                    })
                } catch {
                    // Push notification failure should not block announcement creation
                    console.warn('Push notification failed, announcement was still created')
                }
            }

            setShowModal(false); load()
        } finally { setSaving(false) }
    }

    async function del(id: string) {
        if (!confirm('Delete?')) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('announcements') as any).delete().eq('id', id)
        if (error) toast.error(error.message)
        else { toast.success('Deleted'); load() }
    }

    return (
        <div>
            <PageHeader title="Announcements" subtitle="Manage notices and posts" icon="📢"
                action={<button onClick={openNew} className="btn-primary">+ New Announcement</button>} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {items.map(a => (
                    <div key={a.id} className="glass-card" style={{
                        padding: '1.25rem 1.5rem',
                        borderLeft: `3px solid ${a.is_pinned ? '#3b82f6' : 'var(--border)'}`
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                                    {a.is_pinned && <Badge variant="info">📌 Pinned</Badge>}
                                    <span className={cn('badge', getCategoryBadge(a.category))}>{a.category}</span>
                                    <Badge variant={a.is_published ? 'success' : 'default'}>{a.is_published ? 'Published' : 'Draft'}</Badge>
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>{a.title}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>{a.content.slice(0, 120)}{a.content.length > 120 ? '…' : ''}</p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>
                                    {a.published_at ? formatDate(a.published_at) : 'Not published'}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                <button onClick={() => openEdit(a)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>Edit</button>
                                <button onClick={() => del(a.id)} className="btn-danger" style={{ padding: '0.35rem 0.75rem' }}>Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 580, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>{editing ? 'Edit' : 'New'} Announcement</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Title</label>
                                <input className="input-dark" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Content</label>
                                <textarea className="input-dark" rows={5} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Category</label>
                                    <select className="input-dark" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                        {['general', 'exam', 'event', 'placement'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Expires (optional)</label>
                                    <input className="input-dark" type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                {[['is_pinned', '📌 Pin this'], ['is_published', '✅ Publish now']].map(([k, l]) => (
                                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        <input type="checkbox" checked={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.checked }))} />
                                        {l}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={save} className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
