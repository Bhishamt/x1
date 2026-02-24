import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import type { Tables } from '@/types/database.types'
type Student = Tables<'users'>

export default async function AdminStudentsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: rawStudents } = await supabase
        .from('users')
        .select('*')
        .eq('role_id', 2)
        .order('full_name')
    const students = (rawStudents ?? []) as unknown as Student[]

    return (
        <div>
            <PageHeader title="Students" subtitle={`${students?.length ?? 0} registered students`} icon="🎓" />

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table className="table-dark">
                    <thead>
                        <tr>
                            <th>Name</th><th>Roll No</th><th>Email</th>
                            <th>Department</th><th>Year</th><th>Status</th><th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(students ?? []).map(s => (
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
                {(students ?? []).length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No students found.
                    </div>
                )}
            </div>
        </div>
    )
}
