'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/public/Navbar'
import Link from 'next/link'
import type { Course } from '@/types/database.types'

export default function CoursesPage() {
    const supabase = createClient()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Selection State
    const [selectedDept, setSelectedDept] = useState<string | null>(null)

    // Filters & Sorting state (for active department view)
    const [semFilter, setSemFilter] = useState('All')
    const [sortBy, setSortBy] = useState('name')

    useEffect(() => {
        async function fetchCourses() {
            setLoading(true)
            setError(null)
            try {
                // Fetch active courses
                const { data, error: dbError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('is_active', true)

                if (dbError) throw dbError

                setCourses((data ?? []) as unknown as Course[])
            } catch (err: any) {
                console.error('Failed to fetch courses:', err)
                setError('Failed to load courses. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        fetchCourses()
    }, [])

    // Aggregate Departments for Level 1 Grid
    const depts = useMemo(() => {
        const counts: Record<string, number> = {}
        courses.forEach(c => {
            if (c.department) {
                counts[c.department] = (counts[c.department] || 0) + 1
            }
        })
        return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))
    }, [courses])

    // Specific Department filtered data for Level 2
    const currentDeptCourses = useMemo(() => {
        if (!selectedDept) return []

        let result = courses.filter(c => c.department === selectedDept)

        if (semFilter !== 'All') {
            result = result.filter(c => c.semester?.toString() === semFilter)
        }

        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'code') return a.code.localeCompare(b.code)
            return 0
        })

        return result
    }, [courses, selectedDept, semFilter, sortBy])

    // Group the department courses by year
    const groupedByYear = useMemo(() => {
        const groups: Record<number, Course[]> = {}
        currentDeptCourses.forEach(c => {
            const y = c.year || 1
            if (!groups[y]) groups[y] = []
            groups[y].push(c)
        })
        return Object.keys(groups).map(Number).sort((a, b) => a - b).map(year => ({
            year,
            subjects: groups[year]
        }))
    }, [currentDeptCourses])

    const semesters = useMemo(() => {
        if (!selectedDept) return []
        return ['All', ...Array.from(new Set(courses.filter(c => c.department === selectedDept).map(c => c.semester?.toString())))].filter(Boolean)
    }, [courses, selectedDept])

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <Navbar />

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Our Courses</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Explore our diploma engineering programs.</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(59,130,246,0.3)', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                        Loading courses...
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '3rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
                        <p>{error}</p>
                    </div>
                ) : !selectedDept ? (
                    // LEVEL 1: Departments Grid
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            {depts.map(d => (
                                <button
                                    key={d.name}
                                    onClick={() => { setSelectedDept(d.name); setSemFilter('All'); setSortBy('name'); }}
                                    className="glass-card dept-card"
                                    style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                                >
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem', color: '#3b82f6' }}>🏛️</div>
                                    <h3 style={{ fontWeight: 800, fontSize: '1.25rem', margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>{d.name}</h3>
                                    <span style={{ fontSize: '0.85rem', color: 'var(--accent)', background: 'rgba(59,130,246,0.1)', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontWeight: 600 }}>
                                        {d.count} Subjects
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // LEVEL 2 & 3: Department Details (Years -> Subjects)
                    <div>
                        {/* Breadcrumbs */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            <button onClick={() => setSelectedDept(null)} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>All Departments</button>
                            <span style={{ color: 'var(--text-muted)' }}>/</span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{selectedDept}</span>
                        </div>

                        {/* Filters */}
                        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', background: 'var(--bg-secondary)' }}>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Semester Filter</label>
                                <select className="input-dark" value={semFilter} onChange={e => setSemFilter(e.target.value)} style={{ width: '100%' }}>
                                    {semesters.map(s => <option key={s} value={s}>{s === 'All' ? 'All' : `Semester ${s}`}</option>)}
                                </select>
                            </div>
                            <div style={{ flex: '1 1 150px' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Sort Subjects By</label>
                                <select className="input-dark" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '100%' }}>
                                    <option value="name">Subject Name (A-Z)</option>
                                    <option value="code">Subject Code</option>
                                </select>
                            </div>
                        </div>

                        {/* Grouped Subjects */}
                        {groupedByYear.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
                                <p>No subjects found for the selected criteria.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                {groupedByYear.map(group => (
                                    <div key={group.year}>
                                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '2px solid rgba(59,130,246,0.3)', display: 'inline-block' }}>
                                            {group.year}{group.year === 1 ? 'st' : group.year === 2 ? 'nd' : group.year === 3 ? 'rd' : 'th'} Year
                                        </h2>

                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                                            {group.subjects.map(c => {
                                                const hasLink = c.description && c.description.toLowerCase().startsWith('http')
                                                const CardContent = (
                                                    <div className="glass-card subject-card" style={{ padding: '1.25rem', borderLeft: '3px solid #3b82f6', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                            <h4 style={{ fontWeight: 700, fontSize: '1.05rem', margin: 0, flex: 1, color: hasLink ? '#60a5fa' : 'inherit' }}>{c.name}</h4>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                                            <span style={{ fontSize: '0.75rem', color: '#93c5fd', background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontFamily: 'monospace', fontWeight: 600 }}>{c.code}</span>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Level: Sem {c.semester}</span>
                                                        </div>

                                                        <div style={{ marginTop: 'auto' }}>
                                                            {hasLink ? (
                                                                <span className="btn-secondary" style={{ display: 'inline-block', width: '100%', textAlign: 'center', fontSize: '0.85rem', padding: '0.5rem', pointerEvents: 'none' }}>
                                                                    📄 View Curriculum PDF
                                                                </span>
                                                            ) : (
                                                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                                                                    {c.description || 'No curriculum document available.'}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )

                                                return hasLink ? (
                                                    <a key={c.code} href={c.description ?? undefined} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                                                        {CardContent}
                                                    </a>
                                                ) : (
                                                    <div key={c.code} style={{ display: 'block' }}>
                                                        {CardContent}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
                </div>
            </div>

            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .dept-card { transition: all 0.2s ease; }
                .dept-card:hover { transform: translateY(-5px); border-color: rgba(59,130,246,0.6); background: rgba(59,130,246,0.05); }
                .subject-card { transition: transform 0.2s; }
                .subject-card:hover { transform: translateX(4px); border-color: rgba(59,130,246,0.4); }
            `}</style>
        </div>
    )
}
