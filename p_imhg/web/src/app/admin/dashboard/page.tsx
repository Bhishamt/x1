import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/ui/StatCard'

export default async function AdminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Fetch counts in parallel
    const [students, courses, announcements, unreadNotifs] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact' }).eq('role_id', 2).eq('is_active', true),
        supabase.from('courses').select('id', { count: 'exact' }).eq('is_active', true),
        supabase.from('announcements').select('id', { count: 'exact' }).eq('is_published', true),
        supabase.from('notifications').select('id', { count: 'exact' }).eq('is_read', false),
    ])

    const { data: rawStudents } = await supabase
        .from('users')
        .select('full_name, email, roll_no, department, created_at')
        .eq('role_id', 2)
        .order('created_at', { ascending: false })
        .limit(5)
    const recentStudents = (rawStudents ?? []) as unknown as { full_name: string; email: string; roll_no: string | null; department: string | null }[]

    const { data: rawAnnounce } = await supabase
        .from('announcements')
        .select('title, category, published_at')
        .order('published_at', { ascending: false })
        .limit(4)
    const recentAnnouncements = (rawAnnounce ?? []) as unknown as { title: string; category: string; published_at: string | null }[]

    return (
        <div>
            <PageHeader
                title="Admin Dashboard"
                subtitle="Overview of ABC Polytechnic Digital Platform"
                icon="🏠"
            />

            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard label="Active Students" value={students.count ?? 0} icon="🎓" color="#3b82f6" />
                <StatCard label="Courses" value={courses.count ?? 0} icon="📚" color="#8b5cf6" />
                <StatCard label="Announcements" value={announcements.count ?? 0} icon="📢" color="#06b6d4" />
                <StatCard label="Unread Notifications" value={unreadNotifs.count ?? 0} icon="🔔" color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Recent Students */}
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontWeight: 700, margin: 0 }}>🎓 Recent Students</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table-dark">
                            <thead><tr><th>Name</th><th>Roll No</th><th>Dept</th></tr></thead>
                            <tbody>
                                {(recentStudents ?? []).map(s => (
                                    <tr key={s.email}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{s.full_name}</td>
                                        <td>{s.roll_no ?? '—'}</td>
                                        <td>{s.department ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Announcements */}
                <div className="glass-card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontWeight: 700, margin: 0 }}>📢 Recent Announcements</h3>
                    </div>
                    <div style={{ padding: '0.75rem' }}>
                        {(recentAnnouncements ?? []).map(a => (
                            <div key={a.title} style={{
                                padding: '0.75rem', borderRadius: '0.5rem',
                                background: 'rgba(255,255,255,0.02)', marginBottom: '0.5rem',
                            }}>
                                <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', margin: '0 0 0.25rem' }}>
                                    {a.title}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                                    {a.category} · {a.published_at ? new Date(a.published_at).toLocaleDateString() : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
