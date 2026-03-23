'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { DEPARTMENTS } from '@/types/database.types'
import type { Tables } from '@/types/database.types'

type Student = Tables<'users'>

export default function AdminStudentsPage() {
    const supabase = createClient()
    const [students, setStudents] = useState<Student[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // Filters
    const [deptFilter, setDeptFilter] = useState('')
    const [semFilter, setSemFilter] = useState<number>(0)
    const [schemeFilter, setSchemeFilter] = useState('N22')

    // User context
    const [userRoleId, setUserRoleId] = useState(99)
    const [userDept, setUserDept] = useState<string | null>(null)

    useEffect(() => { loadUserContext() }, [])
    useEffect(() => { loadStudents() }, [deptFilter, semFilter, schemeFilter])

    async function loadUserContext() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('users').select('role_id, department').eq('id', user.id).single()
            if (data) {
                const profile = data as unknown as { role_id: number; department: string | null }
                setUserRoleId(profile.role_id)
                setUserDept(profile.department)
                if (profile.role_id >= 3 && profile.department) {
                    setDeptFilter(profile.department)
                }
            }
        }
    }

    async function loadStudents() {
        setLoading(true)
        let query = supabase
            .from('users')
            .select('*')
            .eq('role_id', 5)
            .order('roll_no', { ascending: true })

        if (deptFilter) query = query.eq('department', deptFilter)
        if (semFilter) query = query.eq('semester', semFilter)
        if (schemeFilter) query = query.eq('scheme', schemeFilter)

        const { data } = await query
        setStudents((data ?? []) as unknown as Student[])
        setLoading(false)
    }

    const availableDepts = (userRoleId >= 3 && userDept) ? [userDept] : [...DEPARTMENTS]
    const filtersActive = !!(deptFilter || semFilter || schemeFilter !== 'N22')

    async function deleteStudent(id: string) {
        if (!confirm('Are you sure you want to delete this student and all related data?')) return
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/student/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const err = await res.json()
                toast.error(err.error || 'Failed to delete student')
                return
            }
            toast.success('Student and all related data deleted successfully')
            loadStudents()
        } catch (err: any) {
            toast.error(err.message || 'An error occurred')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div>
            <PageHeader
                title="Students"
                subtitle={`${students.length} student${students.length !== 1 ? 's' : ''}${filtersActive ? ' (filtered)' : ''}${loading ? ' — loading…' : ''}`}
                icon="🎓"
            />

            {/* Filter bar: Department, Semester, Scheme */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
                <select
                    value={deptFilter}
                    disabled={userRoleId >= 3 && !!userDept}
                    onChange={e => setDeptFilter(e.target.value)}
                    className="input-dark"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                    <option value="">All Departments</option>
                    {availableDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select
                    value={semFilter || ''}
                    onChange={e => setSemFilter(Number(e.target.value))}
                    className="input-dark"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                    ))}
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
                            <th>Name</th><th>Roll No</th><th>Email</th>
                            <th>Department</th><th>Semester</th><th>Status</th><th>Joined</th>
                            {userRoleId <= 1 && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id}>
                                <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.9rem', fontWeight: 700, color: 'white',
                                    }}>
                                        {s.full_name?.[0]?.toUpperCase()}
                                    </div>
                                    <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.full_name}</span>
                                </td>
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>Roll No: {s.roll_no ?? '—'}</td>
                                <td style={{ fontSize: '0.8rem' }}>{s.email}</td>
                                <td>{s.department ?? '—'}</td>
                                <td>{s.semester ? `Semester ${s.semester}` : '—'}</td>
                                <td><Badge variant={s.is_active ? 'success' : 'danger'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                <td style={{ fontSize: '0.8rem' }}>{formatDate(s.created_at)}</td>
                                {userRoleId <= 1 && (
                                    <td>
                                        <button 
                                            onClick={() => deleteStudent(s.id)} 
                                            disabled={saving}
                                            className="btn-danger" 
                                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                        >
                                            {saving ? '...' : 'Delete'}
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && !loading && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No students found.
                    </div>
                )}
            </div>
        </div>
    )
}
