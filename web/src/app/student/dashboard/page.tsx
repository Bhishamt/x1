import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Link from 'next/link'
import { formatDateTime } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

export default async function StudentDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch profile first to get department_id for filtering
    const { data: profile } = await supabase.from('users').select('full_name, department_id, semester, roll_no').eq('id', user.id).single()
    
    const deptId = profile?.department_id ?? '00000000-0000-0000-0000-000000000000'

    // Fetch parallel data for the dashboard
    const [
        { data: summary },
        { data: attendance },
        { data: events }
    ] = await Promise.all([
        supabase.from('student_result_summary').select('*').eq('student_id', user.id).order('semester', { ascending: false }).limit(1),
        supabase.from('attendance').select('status').eq('student_id', user.id),
        supabase.from('calendar_events').select('*')
            .or(`target_department.is.null,target_department.eq.${deptId}`)
            .gte('end_date', new Date().toISOString())
            .order('start_date', { ascending: true }).limit(3)
    ])

    const latestSummary = summary?.[0]
    const attendanceRecords = attendance ?? []
    const totalDays = attendanceRecords.length
    const presentDays = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length
    const attendancePct = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0.0'

    return (
        <div className="container mx-auto p-4">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    👋 Welcome, {profile?.full_name?.split(' ')[0]}
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Roll No: {profile?.roll_no} · {profile?.department_id ? 'Active' : 'Guest'} · Sem {profile?.semester}
                </p>
            </div>

            {/* Stats Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '3px solid #3b82f6' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Academic Performance</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{latestSummary?.percentage ?? '—'}%</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sem {latestSummary?.semester ?? profile?.semester}</span>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '3px solid #10b981' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Attendance Rate</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{attendancePct}%</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Overall</span>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '3px solid #f59e0b' }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Pending Dues</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>$0.00</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* Upcoming Events */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Upcoming Events</h3>
                        <Link href="/student/calendar" style={{ fontSize: '0.75rem', color: '#60a5fa', textDecoration: 'none' }}>Full Calendar →</Link>
                    </div>
                    {events && events.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {events.map(e => (
                                <div key={e.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: 44, height: 44, borderRadius: '0.5rem', background: 'rgba(59,130,246,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#60a5fa' }}>{new Date(e.start_date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                                        <span style={{ fontSize: '1rem', fontWeight: 900 }}>{new Date(e.start_date).getDate()}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{e.title}</div>
                                            <Badge variant={e.type === 'exam' ? 'danger' : 'info'} className="scale-75 origin-left">{e.type}</Badge>
                                        </div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDateTime(e.start_date)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming events scheduled.</p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <Link href="/student/results" className="btn-secondary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>📊</span> Results
                        </Link>
                        <Link href="/student/attendance" className="btn-secondary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>✅</span> Attendance
                        </Link>
                        <Link href="/student/chatbot" className="btn-secondary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>🤖</span> AI Assistant
                        </Link>
                        <Link href="/student/documents" className="btn-secondary" style={{ padding: '1rem', textAlign: 'center', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>📂</span> Documents
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
