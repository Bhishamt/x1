'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { getGradeColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { Tables } from '@/types/database.types'

type ResultRow = Tables<'results'> & { users: { full_name: string; roll_no: string | null } | null; courses: { name: string; code: string } | null }
type StudentRow = { id: string; full_name: string; roll_no: string | null }
type CourseRow = { id: string; name: string; code: string }

const EXAM_TYPES = ['internal', 'mid', 'final']

export default function AdminResultsPage() {
    const supabase = createClient()
    const [results, setResults] = useState<ResultRow[]>([])
    const [students, setStudents] = useState<StudentRow[]>([])
    const [courses, setCourses] = useState<CourseRow[]>([])
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [form, setForm] = useState({
        student_id: '', course_id: '', exam_type: 'final',
        marks_obtained: '', max_marks: '100', semester: '1', academic_year: '2024-25', remarks: '',
    })

    useEffect(() => { loadAll() }, [])

    async function loadAll() {
        const [r, s, c] = await Promise.all([
            supabase.from('results').select('*, users(full_name,roll_no), courses(name,code)').order('created_at', { ascending: false }).limit(50),
            supabase.from('users').select('id,full_name,roll_no').eq('role_id', 2).order('full_name'),
            supabase.from('courses').select('id,name,code').eq('is_active', true).order('code'),
        ])
        setResults((r.data as unknown as ResultRow[]) ?? [])
        setStudents((s.data as unknown as StudentRow[]) ?? [])
        setCourses((c.data as unknown as CourseRow[]) ?? [])
    }

    async function save() {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('results') as any).insert({
                student_id: form.student_id,
                course_id: form.course_id,
                exam_type: form.exam_type,
                marks_obtained: Number(form.marks_obtained),
                max_marks: Number(form.max_marks),
                semester: Number(form.semester),
                academic_year: form.academic_year,
                remarks: form.remarks || null,
                uploaded_by: user?.id,
            })
            if (error) { toast.error(error.message); return }
            toast.success('Result uploaded'); setShowModal(false); loadAll()
        } finally { setSaving(false) }
    }

    async function deleteResult(id: string) {
        if (!confirm('Delete this result?')) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('results') as any).delete().eq('id', id)
        if (error) toast.error(error.message)
        else { toast.success('Deleted'); loadAll() }
    }

    return (
        <div>
            <PageHeader title="Results" subtitle="Upload and manage student results" icon="📊"
                action={<button onClick={() => setShowModal(true)} className="btn-primary">+ Upload Result</button>} />

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table className="table-dark">
                    <thead><tr><th>Student</th><th>Course</th><th>Type</th><th>Marks</th><th>Grade</th><th>Semester</th><th>Year</th><th></th></tr></thead>
                    <tbody>
                        {results.map(r => (
                            <tr key={r.id}>
                                <td>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.users?.full_name ?? '—'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.users?.roll_no ?? ''}</div>
                                </td>
                                <td>
                                    <div>{r.courses?.name ?? '—'}</div>
                                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--accent)' }}>{r.courses?.code}</div>
                                </td>
                                <td><Badge variant="info">{r.exam_type}</Badge></td>
                                <td>{r.marks_obtained} / {r.max_marks}</td>
                                <td><span className={getGradeColor(r.grade)} style={{ fontWeight: 700 }}>{r.grade ?? '—'}</span></td>
                                <td>Sem {r.semester}</td>
                                <td>{r.academic_year}</td>
                                <td><button onClick={() => deleteResult(r.id)} className="btn-danger" style={{ padding: '0.3rem 0.75rem' }}>Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 560, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Upload Result</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {/* Student */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Student</label>
                                <select className="input-dark" value={form.student_id} onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}>
                                    <option value="">Select student…</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.roll_no ?? 'no roll'})</option>)}
                                </select>
                            </div>
                            {/* Course */}
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Course</label>
                                <select className="input-dark" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
                                    <option value="">Select course…</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                                </select>
                            </div>
                            {/* Exam Type */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Exam Type</label>
                                <select className="input-dark" value={form.exam_type} onChange={e => setForm(f => ({ ...f, exam_type: e.target.value }))}>
                                    {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            {/* Semester */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Semester</label>
                                <input className="input-dark" type="number" min={1} max={8} value={form.semester} onChange={e => setForm(f => ({ ...f, semester: e.target.value }))} />
                            </div>
                            {/* Marks */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Marks Obtained</label>
                                <input className="input-dark" type="number" value={form.marks_obtained} onChange={e => setForm(f => ({ ...f, marks_obtained: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Max Marks</label>
                                <input className="input-dark" type="number" value={form.max_marks} onChange={e => setForm(f => ({ ...f, max_marks: e.target.value }))} />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Academic Year</label>
                                <input className="input-dark" placeholder="2024-25" value={form.academic_year} onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={save} className="btn-primary" disabled={saving || !form.student_id || !form.course_id}>{saving ? 'Saving…' : 'Upload'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
