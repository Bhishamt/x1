'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import { DEPARTMENTS } from '@/types/database.types'

type SubjectRow = {
    id: string
    subject_code: string
    subject_name: string
    department_id: string
    semester: number
    scheme: string
    credits: number
    is_active: boolean
    departments: { name: string; code: string } | null
}

export default function AdminSubjectsPage() {
    const supabase = createClient()
    const [subjects, setSubjects] = useState<SubjectRow[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [userRoleId, setUserRoleId] = useState(99)
    const [userDept, setUserDept] = useState<string | null>(null)

    // Form state
    const [editingId, setEditingId] = useState<string | null>(null)
    const [form, setForm] = useState({
        subject_code: '',
        subject_name: '',
        department_id: '',
        semester: 1,
        scheme: 'N22',
        credits: 4,
        is_active: true
    })

    const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null)

    // Filter state
    const [deptFilter, setDeptFilter] = useState('')
    const [semFilter, setSemFilter] = useState<number>(0)
    const [schemeFilter, setSchemeFilter] = useState('')

    useEffect(() => { 
        setLoading(true)
        loadUserContext().finally(() => setLoading(false)) 
    }, [])
    useEffect(() => { if (!loading) loadSubjects() }, [deptFilter, semFilter, schemeFilter])

    const [depts, setDepts] = useState<{id: string, name: string, code: string}[]>([])

    async function loadUserContext() {
        const { data: deptData } = await supabase.from('departments').select('*')
        setDepts(deptData || [])

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('users').select('role_id, department_id').eq('id', user.id).single()
            if (data) {
                const profile = data as unknown as { role_id: number; department_id: string | null }
                setUserRoleId(profile.role_id)
                setUserDept(profile.department_id)
                if (profile.role_id >= 2 && profile.department_id) setDeptFilter(profile.department_id)
            }
        }
    }

    async function loadSubjects() {
        setLoading(true)
        let query = supabase.from('subjects').select('*, departments(name, code)').order('semester').order('subject_code')

        if (deptFilter) {
            if (semFilter === 1 || semFilter === 2) {
                // If sem 1/2, load requested dept + COMMON
                const commonDept = depts.find(d => d.code === 'COMMON')
                if (commonDept) {
                    query = query.or(`department_id.eq.${deptFilter},department_id.eq.${commonDept.id}`)
                } else {
                    query = query.eq('department_id', deptFilter)
                }
            } else {
                query = query.eq('department_id', deptFilter)
            }
        }
        if (semFilter) query = query.eq('semester', semFilter)
        if (schemeFilter) query = query.eq('scheme', schemeFilter)

        const { data } = await query
        setSubjects((data as unknown as SubjectRow[]) ?? [])
        setLoading(false)
    }

    function openModal(subject?: SubjectRow) {
        if (subject) {
            setEditingId(subject.id)
            setForm({
                subject_code: subject.subject_code,
                subject_name: subject.subject_name,
                department_id: subject.department_id,
                semester: subject.semester,
                scheme: subject.scheme,
                credits: subject.credits,
                is_active: subject.is_active
            })
        } else {
            setEditingId(null)
            const commonDept = depts.find(d => d.code === 'COMMON')
            setForm({
                subject_code: '',
                subject_name: '',
                department_id: userDept ?? commonDept?.id ?? '',
                semester: 1,
                scheme: 'N22',
                credits: 4,
                is_active: true
            })
        }
        setShowModal(true)
    }

    async function saveSubject() {
        if (!form.subject_code.trim() || !form.subject_name.trim() || !form.department_id) {
            toast.error('Code, Name, and Department are required')
            return
        }

        const commonDept = depts.find(d => d.code === 'COMMON')

        // Enforcement: Semester 1 & 2 must be COMMON
        if ((form.semester === 1 || form.semester === 2) && form.department_id !== commonDept?.id) {
            toast.error('Rule Violation: Semesters 1 and 2 must use the Common Engineering department.')
            return
        }

        // Enforcement: Semester 3-6 must NOT be COMMON
        if (form.semester >= 3 && form.department_id === commonDept?.id) {
            toast.error('Rule Violation: Common Engineering department is only allowed for Semesters 1 and 2.')
            return
        }

        setSaving(true)
        const payload = {
            subject_code: form.subject_code.trim().toUpperCase(),
            subject_name: form.subject_name.trim(),
            department_id: form.department_id,
            semester: form.semester,
            scheme: form.scheme,
            credits: form.credits,
            is_active: form.is_active
        }

        let error
        if (editingId) {
            const res = await (supabase.from('subjects') as any).update(payload).eq('id', editingId)
            error = res.error
        } else {
            const res = await (supabase.from('subjects') as any).insert(payload)
            error = res.error
        }

        if (error) {
            if (error.code === '23505') {
                toast.error(`A subject with the code ${payload.subject_code} already exists for this department in Semester ${payload.semester}`)
            } else {
                toast.error(error.message)
            }
        } else {
            toast.success(editingId ? 'Subject updated' : 'Subject created')
            setShowModal(false)
            loadSubjects()
        }
        setSaving(false)
    }

    async function toggleActive(id: string, currentStatus: boolean) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('subjects') as any).update({ is_active: !currentStatus }).eq('id', id)
        if (error) toast.error(error.message)
        else { toast.success('Status updated'); loadSubjects() }
    }

    async function deleteSubject(id: string) {
        setSaving(true)
        const loadingToast = toast.loading('Deleting subject...')
        try {
            const res = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' })
            const data = await res.json()
            
            if (!res.ok) throw new Error(data.error || 'Failed to delete')

            toast.success('Subject deleted', { id: loadingToast })
            setSubjects(prev => prev.filter(s => s.id !== id))
            setConfirmDelete(null)
        } catch (err: any) {
            toast.error(err.message, { id: loadingToast })
        } finally {
            setSaving(false)
        }
    }

    const availableDepts = (userRoleId >= 3 && userDept) ? depts.filter(d => d.id === userDept) : depts
    const filtersActive = !!(deptFilter || semFilter || schemeFilter !== 'N22')

    return (
        <div>
            <PageHeader
                title="Subjects Management"
                subtitle="Manage curriculum subjects and credits"
                icon="📘"
                action={
                    userRoleId <= 3 && (
                        <button onClick={() => openModal()} className="btn-primary">
                            + New Subject
                        </button>
                    )
                }
            />

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
                <select
                    value={deptFilter}
                    disabled={userRoleId >= 3 && !!userDept}
                    onChange={e => setDeptFilter(e.target.value)}
                    className="input-dark"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                    <option value="">All Departments</option>
                    {availableDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>

                <select
                    value={semFilter || ''}
                    onChange={e => setSemFilter(Number(e.target.value))}
                    className="input-dark"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>

                <select
                    value={schemeFilter}
                    onChange={e => setSchemeFilter(e.target.value)}
                    className="input-dark"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                    <option value="N22">N22 Scheme</option>
                    <option value="N17">N17 Scheme</option>
                    <option value="N12">N12 Scheme</option>
                    <option value="">All Schemes</option>
                </select>

                {filtersActive && (
                    <button
                        onClick={() => { setDeptFilter(userRoleId >= 3 && userDept ? userDept : ''); setSemFilter(0); setSchemeFilter('N22') }}
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Clear
                    </button>
                )}
            </div>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table className="table-dark">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Subject Name</th>
                            <th>Department</th>
                            <th>Semester</th>
                            <th>Credits</th>
                            <th>Scheme</th>
                            <th>Status</th>
                            {userRoleId <= 3 && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.map(s => (
                            <tr key={s.id}>
                                <td style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 600 }}>{s.subject_code}</td>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.subject_name}</td>
                                <td>{s.departments?.name ?? '—'}</td>
                                <td>Sem {s.semester}</td>
                                <td>{s.credits}</td>
                                <td>{s.scheme}</td>
                                <td><Badge variant={s.is_active ? 'success' : 'danger'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                {userRoleId <= 3 && (
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => openModal(s)} className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Edit</button>
                                            <button onClick={() => toggleActive(s.id, s.is_active)} className={s.is_active ? "btn-danger" : "btn-primary"} style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                                                {s.is_active ? 'Disable' : 'Enable'}
                                            </button>
                                            <button 
                                                onClick={() => setConfirmDelete({ id: s.id, name: s.subject_name })} 
                                                className="btn-danger" 
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                                                onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                                                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subjects.length === 0 && !loading && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No subjects found.
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 500, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>{editingId ? 'Edit Subject' : 'New Subject'}</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="label-default">Subject Code *</label>
                                <input className="input-dark" value={form.subject_code} onChange={e => setForm({ ...form, subject_code: e.target.value })} placeholder="e.g. OOPS" />
                            </div>
                            
                            <div>
                                <label className="label-default">Credits *</label>
                                <input className="input-dark" type="number" min={1} max={10} value={form.credits} onChange={e => setForm({ ...form, credits: Number(e.target.value) })} />
                            </div>

                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="label-default">Subject Name *</label>
                                <input className="input-dark" value={form.subject_name} onChange={e => setForm({ ...form, subject_name: e.target.value })} placeholder="e.g. Object Oriented Programming" />
                            </div>

                            <div>
                                <label className="label-default">Semester *</label>
                                <select className="input-dark" value={form.semester} onChange={e => {
                                    const sem = Number(e.target.value)
                                    const commonDept = depts.find(d => d.code === 'COMMON')
                                    setForm({ 
                                        ...form, 
                                        semester: sem,
                                        // Auto-enforce COMMON rule for user convenience
                                        department_id: (sem === 1 || sem === 2) ? (commonDept?.id ?? form.department_id) : (form.department_id === commonDept?.id ? '' : form.department_id)
                                    })
                                }}>
                                    {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="label-default">Department *</label>
                                <select className="input-dark" value={form.department_id} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                                    <option value="">Select Dept…</option>
                                    {availableDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                                {(form.semester === 1 || form.semester === 2) && form.department_id !== depts.find(d => d.code === 'COMMON')?.id && (
                                    <div style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '0.2rem' }}>Must be Common for Sem 1/2</div>
                                )}
                            </div>

                            <div>
                                <label className="label-default">Scheme *</label>
                                <select className="input-dark" value={form.scheme} onChange={e => setForm({ ...form, scheme: e.target.value })}>
                                    <option value="N22">N22</option>
                                    <option value="N17">N17</option>
                                    <option value="N12">N12</option>
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.5rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                                    Active (Selectable)
                                </label>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={saveSubject} className="btn-primary" disabled={saving}>
                                {saving ? 'Saving…' : 'Save Subject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📘</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Delete Subject?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Are you sure you want to delete <strong>{confirmDelete.name}</strong>?<br/>
                            This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary" disabled={saving}>Cancel</button>
                            <button onClick={() => deleteSubject(confirmDelete.id)} className="btn-danger" disabled={saving}>
                                {saving ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
