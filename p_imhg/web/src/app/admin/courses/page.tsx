'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import type { Course } from '@/types/database.types'

const EMPTY: Omit<Course, 'id' | 'created_at' | 'updated_at' | 'created_by'> = {
    code: '', name: '', department: '', year: 1, semester: 1, credits: 3, description: '', is_active: true,
}

export default function AdminCoursesPage() {
    const supabase = createClient()
    const [courses, setCourses] = useState<Course[]>([])
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState<Course | null>(null)
    const [form, setForm] = useState({ ...EMPTY })
    const [saving, setSaving] = useState(false)

    useEffect(() => { load() }, [])

    async function load() {
        const { data } = await supabase.from('courses').select('*').order('year').order('semester').order('code')
        setCourses((data ?? []) as unknown as Course[])
    }

    function openNew() { setEditing(null); setForm({ ...EMPTY }); setShowModal(true) }
    function openEdit(c: Course) {
        setEditing(c); setForm({
            code: c.code, name: c.name, department: c.department,
            year: c.year, semester: c.semester, credits: c.credits, description: c.description ?? '', is_active: c.is_active
        }); setShowModal(true)
    }

    async function save() {
        setSaving(true)
        try {
            if (editing) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error } = await (supabase.from('courses') as any).update(form).eq('id', editing.id)
                if (error) { toast.error(error.message); return }
                toast.success('Course updated')
            } else {
                const { data: { user } } = await supabase.auth.getUser()
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const { error } = await (supabase.from('courses') as any).insert({ ...form, created_by: user?.id })
                if (error) { toast.error(error.message); return }
                toast.success('Course created')
            }
            setShowModal(false); load()
        } finally { setSaving(false) }
    }

    async function deleteCourse(id: string) {
        if (!confirm('Delete this course?')) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('courses') as any).delete().eq('id', id)
        if (error) toast.error(error.message)
        else { toast.success('Deleted'); load() }
    }

    return (
        <div>
            <PageHeader title="Courses" subtitle="Manage all courses" icon="📚"
                action={<button onClick={openNew} className="btn-primary">+ Add Course</button>} />

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table className="table-dark">
                    <thead><tr><th>Code</th><th>Name</th><th>Dept</th><th>Year/Sem</th><th>Credits</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                        {courses.map(c => (
                            <tr key={c.id}>
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, color: 'var(--accent)' }}>{c.code}</td>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                                <td>{c.department}</td>
                                <td>Y{c.year} / S{c.semester}</td>
                                <td>{c.credits}</td>
                                <td><Badge variant={c.is_active ? 'success' : 'default'}>{c.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => openEdit(c)} className="btn-secondary" style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}>Edit</button>
                                        <button onClick={() => deleteCourse(c.id)} className="btn-danger" style={{ padding: '0.3rem 0.75rem' }}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 540, padding: '2rem' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>{editing ? 'Edit' : 'New'} Course</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {[['code', 'Code'], ['name', 'Name'], ['department', 'Department']].map(([k, l]) => (
                                <div key={k} style={k === 'name' ? { gridColumn: 'span 2' } : {}}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{l}</label>
                                    <input className="input-dark" value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                                </div>
                            ))}
                            {[['year', 'Year', 'number'], ['semester', 'Semester', 'number'], ['credits', 'Credits', 'number']].map(([k, l, t]) => (
                                <div key={k}>
                                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>{l}</label>
                                    <input className="input-dark" type={t} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: Number(e.target.value) }))} />
                                </div>
                            ))}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Description</label>
                                <textarea className="input-dark" rows={3} value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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
