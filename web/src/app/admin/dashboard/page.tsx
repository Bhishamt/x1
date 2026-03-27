'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Stats = { students: number; subjects: number; pendingCorrections: number; announcements: number }
type RecentStudent = { full_name: string; roll_no: number | null; department_name: string | null }
type RecentAnnouncement = { title: string; category: string }

export default function AdminDashboard() {
    const supabase = createClient()
    const [stats, setStats] = useState<Stats>({ students: 0, subjects: 0, pendingCorrections: 0, announcements: 0 })
    const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([])
    const [announcements, setAnnouncements] = useState<RecentAnnouncement[]>([])
    const [roleId, setRoleId] = useState<number>(1)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) { window.location.href = '/login'; return }

                const { data: profileRaw } = await supabase
                    .from('users').select('role_id, department_id').eq('id', user.id).single()
                const profile = profileRaw as { role_id: number; department_id: string | null } | null
                const rid = profile?.role_id ?? 4
                const deptId = profile?.department_id ?? null
                setRoleId(rid)

                const isDeptFiltered = rid >= 2 && rid <= 3 && deptId

                // Run data queries in parallel
                const [
                    { count: studentsCount },
                    { count: subjectsCount },
                    { count: correctionsCount },
                    { count: annCount },
                    { data: studs },
                    { data: ann }
                ] = await Promise.all([
                    // Students count
                    (() => {
                        let sq = supabase.from('users').select('id', { count: 'exact', head: true }).eq('role_id', 4).eq('is_active', true)
                        if (isDeptFiltered) sq = sq.eq('department_id', deptId!)
                        return sq
                    })(),
                    // Subjects count
                    (() => {
                        let subq = supabase.from('subjects').select('id', { count: 'exact', head: true }).eq('is_active', true)
                        if (isDeptFiltered) subq = subq.eq('department_id', deptId!)
                        return subq
                    })(),
                    // Pending corrections
                    (() => {
                        let pq = supabase.from('result_corrections').select('id', { count: 'exact', head: true }).eq('status', 'pending')
                        if (isDeptFiltered) pq = pq.eq('student_id', user.id) // Wait, student_id should match department, not user.id
                        // Correct join for filtering corrections by student's department
                        if (isDeptFiltered) {
                            return supabase.from('result_corrections')
                                .select('id, users!inner(department_id)', { count: 'exact', head: true })
                                .eq('status', 'pending')
                                .eq('users.department_id', deptId!)
                        }
                        return pq
                    })(),
                    // Announcements count
                    supabase.from('announcements').select('id', { count: 'exact', head: true }),
                    // Recent students
                    (() => {
                        let studQ = supabase.from('users')
                            .select('full_name, roll_no, departments(name)')
                            .eq('role_id', 4).order('created_at', { ascending: false }).limit(5)
                        if (isDeptFiltered) studQ = studQ.eq('department_id', deptId!)
                        return studQ
                    })(),
                    // Recent announcements
                    supabase.from('announcements')
                        .select('title, category').order('created_at', { ascending: false }).limit(4)
                ])

                setStats({
                    students: studentsCount ?? 0,
                    subjects: subjectsCount ?? 0,
                    pendingCorrections: correctionsCount ?? 0,
                    announcements: annCount ?? 0,
                })

                setRecentStudents(
                    ((studs ?? []) as any[]).map(s => ({
                        full_name: s.full_name,
                        roll_no: s.roll_no,
                        department_name: s.departments?.name ?? null,
                    }))
                )

                setAnnouncements((ann ?? []) as RecentAnnouncement[])

            } catch (err) {
                console.error('Dashboard load error:', err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const QUICK_LINKS = [
        { href: '/admin/students', icon: '👥', label: 'Manage Students' },
        { href: '/admin/results', icon: '📊', label: 'Upload Results' },
        { href: '/admin/subjects', icon: '📘', label: 'Manage Subjects' },
        { href: '/admin/announcements', icon: '📢', label: 'Post Announcement' },
        { href: '/admin/corrections', icon: '✏️', label: `Corrections${stats.pendingCorrections > 0 ? ` (${stats.pendingCorrections} pending)` : ''}` },
        { href: '/admin/manage', icon: '🔧', label: 'Manage Admins' },
    ]

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ width: 40, height: 40, border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading dashboard…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    🏠 Dashboard
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Welcome back{roleId === 1 ? ', Super Admin' : ''} 👋
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { icon: '👥', label: 'Total Students', value: stats.students, color: '#3b82f6' },
                    { icon: '📘', label: 'Active Subjects', value: stats.subjects, color: '#8b5cf6' },
                    { icon: '📢', label: 'Total Announcements', value: stats.announcements, color: '#f59e0b' },
                    { icon: '⏳', label: 'Pending Corrections', value: stats.pendingCorrections, color: stats.pendingCorrections > 0 ? '#ef4444' : '#22c55e' },
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '1.25rem 1.5rem', borderLeft: `3px solid ${s.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{s.label}</p>
                                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{s.value}</p>
                            </div>
                            <div style={{ width: 44, height: 44, borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', background: `${s.color}22` }}>{s.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Students */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Students</h3>
                        <Link href="/admin/students" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
                    </div>
                    {recentStudents.length === 0
                        ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No students enrolled yet.</p>
                        : recentStudents.map((s, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < recentStudents.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{s.full_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.department_name ?? 'No dept'}</div>
                                </div>
                                {s.roll_no && <span style={{ fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'monospace' }}>#{s.roll_no}</span>}
                            </div>
                        ))
                    }
                </div>

                {/* Recent Announcements */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Recent Announcements</h3>
                        <Link href="/admin/announcements" style={{ fontSize: '0.75rem', color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
                    </div>
                    {announcements.length === 0
                        ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No announcements yet.</p>
                        : announcements.map((a, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: i < announcements.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem', flex: 1, marginRight: '0.5rem' }}>{a.title}</div>
                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: 'rgba(59,130,246,0.12)', color: '#60a5fa', whiteSpace: 'nowrap' }}>{a.category}</span>
                            </div>
                        ))
                    }
                </div>

                {/* Quick links */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {QUICK_LINKS.map(l => (
                            <Link key={l.href} href={l.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'var(--text-secondary)', fontSize: '0.875rem', transition: 'background 0.15s' }}
                                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                onMouseOut={e => (e.currentTarget.style.background = 'transparent')}>
                                <span>{l.icon}</span>{l.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
