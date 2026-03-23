import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import StatCard from '@/components/ui/StatCard'

export default async function AdminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get user context for department filtering
    const { data: rawProfile } = await supabase.from('users').select('role_id, department').eq('id', user.id).single()
    const profile = rawProfile as unknown as { role_id: number; department: string | null } | null
    const isDeptFiltered = profile && profile.role_id >= 3 && profile.department

    // Fetch counts in parallel
    let studentsQuery = supabase.from('users').select('id', { count: 'exact' }).eq('role_id', 5).eq('is_active', true)
    let coursesQuery = supabase.from('courses').select('id', { count: 'exact' }).eq('is_active', true)

    if (isDeptFiltered) {
        studentsQuery = studentsQuery.eq('department', profile.department!)
        coursesQuery = coursesQuery.eq('department', profile.department!)
    }

    const [students, courses, announcements, unreadNotifs] = await Promise.all([
        studentsQuery,
        coursesQuery,
        supabase.from('announcements').select('id', { count: 'exact' }).eq('is_published', true),
        supabase.from('notifications').select('id', { count: 'exact' }).eq('is_read', false),
    ])

    // Recent students
    let recentStudentsQuery = supabase
        .from('users')
        .select('full_name, email, roll_no, department, created_at')
        .eq('role_id', 5)
        .order('created_at', { ascending: false })
        .limit(5)

    if (isDeptFiltered) {
        recentStudentsQuery = recentStudentsQuery.eq('department', profile.department!)
    }

    const { data: rawStudents } = await recentStudentsQuery
    const recentStudents = (rawStudents ?? []) as unknown as { full_name: string; email: string; roll_no: string | null; department: string | null }[]

    const { data: rawAnnounce } = await supabase
        .from('announcements')
        .select('title, category, published_at')
        .order('published_at', { ascending: false })
        .limit(4)
    const recentAnnouncements = (rawAnnounce ?? []) as unknown as { title: string; category: string; published_at: string | null }[]

    // Department Stats calculation
    const { data: rawUsers } = await supabase.from('users').select('id, department').eq('role_id', 5).eq('is_active', true)
    const { data: rawResults } = await supabase.from('results').select('student_id')
    
    const allUsers = (rawUsers ?? []) as unknown as { id: string; department: string | null }[]
    const allResults = (rawResults ?? []) as unknown as { student_id: string }[]

    const uploadedIds = new Set(allResults.map(r => r.student_id))
    const deptStats: Record<string, { total: number, uploaded: number, pending: number }> = {}
    
    allUsers.forEach(u => {
        if (isDeptFiltered && u.department !== profile?.department) return
        const d = u.department || 'Unknown'
        if (!deptStats[d]) deptStats[d] = { total: 0, uploaded: 0, pending: 0 }
        deptStats[d].total++
        if (uploadedIds.has(u.id)) deptStats[d].uploaded++
        else deptStats[d].pending++
    })

    const deptLabel = isDeptFiltered ? ` — ${profile.department}` : ''

    return (
        <div>
            <PageHeader
                title="Admin Dashboard"
                subtitle={`Overview of ABC Polytechnic Digital Platform${deptLabel}`}
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

            {/* Department Results Overview */}
            <div className="glass-card" style={{ overflow: 'hidden', marginTop: '1.5rem' }}>
                <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontWeight: 700, margin: 0 }}>📊 Department Result Overview</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', padding: '1.5rem' }}>
                    {Object.entries(deptStats).map(([dept, stats]) => (
                        <Link href={`/admin/results`} key={dept} style={{ textDecoration: 'none' }}>
                            <div style={{ 
                                background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.25rem',
                                transition: 'all 0.2s', cursor: 'pointer',
                            }}>
                                <h4 style={{ margin: '0 0 1rem', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{dept}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Total Students</span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{stats.total}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Results Uploaded</span>
                                    <span style={{ fontWeight: 600, color: '#22c55e' }}>{stats.uploaded}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                    <span style={{ color: 'var(--text-muted)' }}>Pending Results</span>
                                    <span style={{ fontWeight: 600, color: '#ef4444' }}>{stats.pending}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {Object.keys(deptStats).length === 0 && <div style={{ color: 'var(--text-muted)' }}>No department data available.</div>}
                </div>
            </div>
        </div>
    )
}
