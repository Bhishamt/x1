import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { getGradeColor, percentage } from '@/lib/utils'
import type { Tables } from '@/types/database.types'

type Result = Tables<'results'> & { subjects: { subject_code: string; subject_name: string } | null }
type Summary = { student_id: string; academic_year: string; semester: number; percentage: number; total_subjects: number; failed_subjects: number }

export default async function ResultsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: rawResults } = await supabase
        .from('results')
        .select('*, subjects(subject_code, subject_name)')
        .eq('student_id', user.id)
        .order('academic_year', { ascending: false })
        .order('semester', { ascending: false })

    const results = (rawResults ?? []) as any[]

    const { data: rawSummary } = await supabase
        .from('student_result_summary')
        .select('*')
        .eq('student_id', user.id)

    const summary = (rawSummary ?? []) as unknown as Summary[]

    // Group by semester+year
    const grouped = results.reduce<Record<string, Result[]>>((acc, r) => {
        const key = `${r.academic_year} — Sem ${r.semester}`
        if (!acc[key]) acc[key] = []
        acc[key]!.push(r)
        return acc
    }, {})

    return (
        <div>
            <PageHeader title="My Results" subtitle="Semester-wise academic performance" icon="📊" />

            {/* Summary Cards */}
            {summary.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    {summary.map(s => (
                        <div key={`${s.academic_year}-${s.semester}`} className="stat-card"
                            style={{ borderLeft: '3px solid #3b82f6' }}>
                            <p style={{
                                fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem'
                            }}>
                                {s.academic_year} · Sem {s.semester}
                            </p>
                            <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                                {s.percentage}%
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
                                {s.total_subjects} subjects · {s.failed_subjects} failed
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Results Tables */}
            {Object.entries(grouped).map(([sem, rows]) => (
                <div key={sem} className="glass-card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                    <div style={{
                        padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                        <span style={{ fontSize: '1rem' }}>📋</span>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>{sem}</h3>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table-dark">
                            <thead>
                                <tr>
                                    <th>Course</th><th>Code</th><th>Type</th>
                                    <th>Marks</th><th>Percentage</th><th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(r => (
                                    <tr key={r.id}>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                                            {r.subjects?.subject_name ?? '—'}
                                        </td>
                                        <td><span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                                            {r.subjects?.subject_code ?? '—'}
                                        </span></td>
                                        <td><Badge variant="info">{r.exam_type}</Badge></td>
                                        <td>{r.marks_obtained} / {r.max_marks}</td>
                                        <td>{percentage(r.marks_obtained, r.max_marks)}%</td>
                                        <td>
                                            <span className={getGradeColor(r.grade)} style={{ fontWeight: 700, fontSize: '1rem' }}>
                                                {r.grade ?? '—'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}

            {Object.keys(grouped).length === 0 && (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                    <p style={{ color: 'var(--text-secondary)' }}>No results published yet.</p>
                </div>
            )}
        </div>
    )
}
