'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { DEPARTMENTS } from '@/types/database.types'
import type { Tables } from '@/types/database.types'
import Link from 'next/link'
import BulkImport from '@/components/students/BulkImport'
import { exportToCSV } from '@/lib/export-utils'

type Student = Tables<'users'>

export default function AdminStudentsPage() {
    const supabase = createClient()
    const [students, setStudents] = useState<Student[]>([])
    const [depts, setDepts] = useState<{ id: string, name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 20

    // Filters
    const [deptFilter, setDeptFilter] = useState('')
    const [semFilter, setSemFilter] = useState<number>(0)
    const [schemeFilter, setSchemeFilter] = useState('N22')

    // User context
    const [userRoleId, setUserRoleId] = useState(99)
    const [userDept, setUserDept] = useState<string | null>(null)

    useEffect(() => { 
        setLoading(true)
        Promise.all([loadUserContext(), loadDepartments()]).finally(() => {
            // Students will be loaded by the watchEffect on deptFilter/currentPage
            setLoading(false)
        })
    }, [])
    useEffect(() => { setCurrentPage(1); loadStudents(1) }, [deptFilter, semFilter, schemeFilter])
    useEffect(() => { loadStudents(currentPage) }, [currentPage])

    async function loadUserContext() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('users').select('role_id, department_id').eq('id', user.id).single()
            if (data) {
                const profile = data as unknown as { role_id: number; department_id: string | null }
                setUserRoleId(profile.role_id)
                setUserDept(profile.department_id)
                if (profile.role_id >= 2 && profile.department_id) {
                    setDeptFilter(profile.department_id)
                }
            }
        }
    }

    async function loadDepartments() {
        const { data } = await supabase.from('departments').select('id, name').eq('is_active', true).order('name')
        if (data) setDepts(data)
    }

    async function loadStudents(page: number = 1) {
        setLoading(true)
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        let query = supabase
            .from('users')
            .select('*, departments(name, code)', { count: 'exact' })
            .eq('role_id', 4)
            .order('roll_no', { ascending: true })
            .range(from, to)

        // Force department restriction for HOD (2) and Class Incharge (3)
        if (userRoleId === 2 || userRoleId === 3) {
            if (userDept) {
                query = query.eq('department_id', userDept)
            }
        } else if (deptFilter) {
            query = query.eq('department_id', deptFilter)
        }

        if (semFilter) query = query.eq('semester', semFilter)
        if (schemeFilter) query = query.eq('scheme', schemeFilter)

        const { data, count, error } = await query
        if (error) {
            toast.error('Failed to load students')
        } else {
            setStudents((data ?? []) as any)
            setTotalCount(count ?? 0)
        }
        setLoading(false)
    }

    const filteredDepts = ((userRoleId === 2 || userRoleId === 3) && userDept) 
        ? depts.filter(d => d.id === userDept) 
        : depts
    const filtersActive = !!(deptFilter || semFilter || schemeFilter !== 'N22')

    const [confirmDelete, setConfirmDelete] = useState<{ id: string, name: string } | null>(null)

    async function deleteStudent(id: string) {
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
            if (!res.ok) {
                const err = await res.json()
                toast.error(err.error || 'Failed to delete student')
                return
            }
            toast.success('Student deleted successfully')
            setStudents(prev => prev.filter(s => s.id !== id))
            setTotalCount(prev => prev - 1)
            setConfirmDelete(null)
        } catch (err: any) {
            toast.error(err.message || 'An error occurred')
        } finally {
            setSaving(false)
        }
    }

    async function handleExport() {
        setSaving(true)
        try {
            let query = supabase
                .from('users')
                .select('full_name, roll_no, email, phone, year, semester, academic_year, is_active, departments(name)')
                .eq('role_id', 4)

            if (userRoleId === 2 || userRoleId === 3) {
                if (userDept) query = query.eq('department_id', userDept)
            } else if (deptFilter) {
                query = query.eq('department_id', deptFilter)
            }
            if (semFilter) query = query.eq('semester', semFilter)
            if (schemeFilter) query = query.eq('scheme', schemeFilter)

            const { data } = await query
            if (!data || data.length === 0) {
                toast.error('No data found to export')
                return
            }

            const exportData = (data as any[]).map(s => ({
                Name: s.full_name,
                'Roll No': s.roll_no,
                Email: s.email,
                Phone: s.phone ?? '—',
                Department: s.departments?.name ?? '—',
                Semester: s.semester,
                Year: s.year,
                Scheme: schemeFilter,
                Status: s.is_active ? 'Active' : 'Inactive'
            }))

            exportToCSV(exportData, 'Students_List')
            toast.success('Students list exported!')
        } catch (err) {
            toast.error('Export failed')
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
                action={<BulkImport onImportSuccess={loadStudents} />}
            />

            {/* Filter bar: Department, Semester, Scheme */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}>
                <select
                    value={deptFilter}
                    disabled={(userRoleId === 2 || userRoleId === 3) && !!userDept}
                    onChange={e => setDeptFilter(e.target.value)}
                    className="input-dark"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                    {!(userRoleId === 2 || userRoleId === 3) && <option value="">All Departments</option>}
                    {filteredDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
                        onClick={() => { setDeptFilter((userRoleId === 2 || userRoleId === 3) && userDept ? userDept : ''); setSemFilter(0); setSchemeFilter('N22') }}
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Clear
                    </button>
                )}
                
                <div style={{ marginLeft: 'auto' }}>
                    <button 
                        onClick={handleExport}
                        disabled={loading || saving}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        📥 Export to CSV
                    </button>
                </div>
            </div>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table className="table-dark">
                    <thead>
                        <tr>
                            <th>Name</th><th>Roll No</th><th>Email</th>
                            <th>Department</th><th>Semester</th><th>Status</th><th>Joined</th>
                            {userRoleId <= 3 && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(s => (
                            <tr key={s.id} style={{ transition: 'background 0.2s' }} className="hover:bg-white/5">
                                <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Link href={`/admin/students/${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                                        <div style={{
                                            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                                            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.9rem', fontWeight: 700, color: 'white',
                                        }}>
                                            {s.full_name?.[0]?.toUpperCase()}
                                        </div>
                                        <span style={{ color: '#60a5fa', fontWeight: 600 }}>{s.full_name}</span>
                                    </Link>
                                </td>
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>Roll No: {s.roll_no ?? '—'}</td>
                                <td style={{ fontSize: '0.8rem' }}>{s.email}</td>
                                <td>{(s as any).departments?.name ?? '—'}</td>
                                <td>{s.semester ? `Semester ${s.semester}` : '—'}</td>
                                <td><Badge variant={s.is_active ? 'success' : 'danger'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                <td style={{ fontSize: '0.8rem' }}>{formatDate(s.created_at)}</td>
                                {userRoleId <= 3 && (
                                    <td>
                                        <button 
                                            onClick={() => setConfirmDelete({ id: s.id, name: s.full_name || 'Student' })} 
                                            disabled={saving}
                                            className="btn-danger" 
                                            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                        >
                                            Delete
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

            {/* Pagination UI */}
            {totalCount > pageSize && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', alignItems: 'center' }}>
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                        ← Previous
                    </button>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Page <strong>{currentPage}</strong> of {Math.ceil(totalCount / pageSize)}
                    </span>
                    <button 
                        disabled={currentPage >= Math.ceil(totalCount / pageSize)} 
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Delete Student?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            Are you sure you want to delete <strong>{confirmDelete.name}</strong>?<br/>
                            This will also delete all marks and records. This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setConfirmDelete(null)} className="btn-secondary" disabled={saving}>Cancel</button>
                            <button onClick={() => deleteStudent(confirmDelete.id)} className="btn-danger" disabled={saving}>
                                {saving ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
