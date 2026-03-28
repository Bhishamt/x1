import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export default async function StudentAttendancePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch attendance with subject details
    const { data: attendance } = await supabase
        .from('attendance')
        .select('*, subjects(subject_code, subject_name)')
        .eq('student_id', user.id)
        .order('date', { ascending: false })

    const records = (attendance ?? []) as any[]

    // Calculate subject-wise percentage
    const stats = records.reduce((acc: any, r) => {
        const subId = r.subject_id
        if (!acc[subId]) {
            acc[subId] = { 
                name: r.subjects?.subject_name, 
                code: r.subjects?.subject_code, 
                total: 0, 
                present: 0 
            }
        }
        acc[subId].total++
        if (r.status === 'present' || r.status === 'late') acc[subId].present++
        return acc
    }, {})

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present': return 'success'
            case 'absent': return 'danger'
            case 'late': return 'warning'
            default: return 'info'
        }
    }

    return (
        <div>
            <PageHeader title="My Attendance" subtitle="Subject-wise attendance tracking" icon="✅" />

            {/* Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {Object.values(stats).map((s: any) => {
                    const pct = ((s.present / s.total) * 100).toFixed(1)
                    const isLow = Number(pct) < 75
                    return (
                        <div key={s.code} className="glass-card" style={{ padding: '1.25rem', borderLeft: `3px solid ${isLow ? '#ef4444' : '#10b981'}` }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{s.code}</div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</h4>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: isLow ? '#f87171' : '#34d399' }}>{pct}%</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>({s.present}/{s.total} days)</span>
                            </div>
                            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: '0.75rem', overflow: 'hidden' }}>
                                <div style={{ width: `${pct}%`, height: '100%', background: isLow ? '#ef4444' : '#10b981' }} />
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Attendance Log */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Attendance Log</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="table-dark">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Subject</th>
                                <th>Status</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map(r => (
                                <tr key={r.id}>
                                    <td style={{ fontWeight: 600 }}>{formatDate(r.date)}</td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.subjects?.subject_code}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.subjects?.subject_name}</div>
                                    </td>
                                    <td><Badge variant={getStatusBadge(r.status)}>{r.status}</Badge></td>
                                    <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{r.remarks || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {records.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No attendance records found.
                    </div>
                )}
            </div>
        </div>
    )
}
