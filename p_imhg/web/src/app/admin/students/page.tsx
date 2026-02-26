import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Tables } from '@/types/database.types'
type Student = Tables<'users'>

const DEPARTMENTS = [
    'Computer Engineering',
    'Civil Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Electronics & Communication',
    'Information Technology',
]

// Semester maps to year: sem 1-2 → year 1, sem 3-4 → year 2, etc.
function semToYear(sem: string | null | undefined): number | null {
    const s = Number(sem)
    if (!s || s < 1 || s > 8) return null
    return Math.ceil(s / 2)
}

export default async function AdminStudentsPage({
    searchParams,
}: {
    searchParams: Promise<{ dept?: string; year?: string; sem?: string }>
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { dept, year, sem } = await searchParams

    // sem filter resolves to a year; year filter used otherwise
    const effectiveYear = sem ? semToYear(sem) : (year ? Number(year) : null)

    let query = supabase
        .from('users')
        .select('*')
        .eq('role_id', 2)
        .order('roll_no', { ascending: true })

    if (dept) query = query.eq('department', dept)
    if (effectiveYear) query = query.eq('year', effectiveYear)

    const { data: rawStudents } = await query
    const students = (rawStudents ?? []) as unknown as Student[]

    const filtersActive = !!(dept || year || sem)

    return (
        <div>
            <PageHeader
                title="Students"
                subtitle={`${students.length} student${students.length !== 1 ? 's' : ''}${filtersActive ? ' (filtered)' : ''}`}
                icon="🎓"
            />

            {/* Filter form — server-rendered, no JS required */}
            <form
                method="get"
                action="/admin/students"
                style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem', alignItems: 'center' }}
            >
                {/* Department */}
                <select
                    name="dept"
                    defaultValue={dept ?? ''}
                    className="input-dark"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                    <option value="">All Departments</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                {/* Year */}
                <select
                    name="year"
                    defaultValue={year ?? ''}
                    className="input-dark"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                    <option value="">All Years</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                </select>

                {/* Semester */}
                <select
                    name="sem"
                    defaultValue={sem ?? ''}
                    className="input-dark"
                    style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                >
                    <option value="">All Semesters</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Semester {s}</option>
                    ))}
                </select>

                <button type="submit" className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                    Filter
                </button>

                {filtersActive && (
                    <a
                        href="/admin/students"
                        style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                    >
                        Clear
                    </a>
                )}
            </form>

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table className="table-dark">
                    <thead>
                        <tr>
                            <th>Name</th><th>Roll No</th><th>Email</th>
                            <th>Department</th><th>Year</th><th>Status</th><th>Joined</th>
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
                                <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>{s.roll_no ?? '—'}</td>
                                <td style={{ fontSize: '0.8rem' }}>{s.email}</td>
                                <td>{s.department ?? '—'}</td>
                                <td>{s.year ? `Year ${s.year}` : '—'}</td>
                                <td><Badge variant={s.is_active ? 'success' : 'danger'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></td>
                                <td style={{ fontSize: '0.8rem' }}>{formatDate(s.created_at)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {students.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No students found.
                    </div>
                )}
            </div>
        </div>
    )
}
