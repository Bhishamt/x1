'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { getGradeColor } from '@/lib/utils'
import toast from 'react-hot-toast'
import { EXAM_TYPES, DEPARTMENTS } from '@/types/database.types'
import { exportToCSV } from '@/lib/export-utils'

type SubjectRow = { id: string; subject_name: string; subject_code: string; credits: number }
type StudentRow = { id: string; full_name: string; roll_no: number | null; academic_year: string | null; scheme: string | null }
type ResultRow = {
    id: string; 
    student_id: string; 
    subject_id: string;
    marks_obtained: number; 
    max_marks: number; 
    grade: string | null;
    semester: number; 
    academic_year: string;
    users: { full_name: string; roll_no: number | null; department_id: string | null; semester: number | null } | null;
    subjects: { subject_code: string; subject_name: string } | null;
}

type MarksEntry = Record<string, string> // subject_code → marks value

const SCHEMES = ['N22', 'N17', 'N12']

export default function AdminResultsPage() {
    const supabase = createClient()

    // View / Upload toggle
    const [results, setResults] = useState<ResultRow[]>([])
    const [viewMode, setViewMode] = useState<'list' | 'upload'>('list')

    // Upload workflow state
    const [step, setStep] = useState(1)
    const [scheme, setScheme] = useState('N22')
    const [departmentId, setDepartmentId] = useState('')
    const [semester, setSemester] = useState<number>(0)
    const [examType, setExamType] = useState('final_exam')
    const [rollNo, setRollNo] = useState('')

    // Fetched data
    const [subjects, setSubjects] = useState<SubjectRow[]>([])
    const [foundStudent, setFoundStudent] = useState<StudentRow | null>(null)
    const [marks, setMarks] = useState<MarksEntry>({})
    const [saving, setSaving] = useState(false)
    const [maxMarks, setMaxMarks] = useState(30)

    // View filters
    const [filterDept, setFilterDept] = useState('')
    const [filterSem, setFilterSem] = useState<number | ''>('')
    const [filterRollNo, setFilterRollNo] = useState('')

    // User context
    const [userDeptId, setUserDeptId] = useState<string | null>(null)
    const [userRoleId, setUserRoleId] = useState(99)
    const [depts, setDepts] = useState<{id: string, name: string}[]>([])
    const [loading, setLoading] = useState(true)


    async function loadUserContext() {
        const { data: deptData } = await supabase.from('departments').select('id, name')
        setDepts(deptData || [])

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('users').select('role_id, department_id').eq('id', user.id).single()
            if (data) {
                const profile = data as unknown as { role_id: number; department_id: string | null }
                setUserRoleId(profile.role_id)
                setUserDeptId(profile.department_id)
                if (profile.role_id >= 2 && profile.department_id) setDepartmentId(profile.department_id)
            }
        }
    }

    const loadResults = useCallback(async () => {
        let q = supabase
            .from('results')
            .select('*, users!results_student_id_fkey!inner(full_name,roll_no,department_id,semester), subjects(subject_code, subject_name)')

        let targetDeptId = filterDept
        if (userRoleId >= 2 && userDeptId) targetDeptId = userDeptId

        if (targetDeptId) q = q.eq('users.department_id', targetDeptId)
        if (filterSem) q = q.eq('users.semester', filterSem)
        if (filterRollNo) q = q.eq('users.roll_no', Number(filterRollNo) as any)

        const { data } = await q.order('created_at', { ascending: false }).limit(200)
        setResults((data as unknown as ResultRow[]) ?? [])
    }, [filterDept, filterSem, filterRollNo, userRoleId, userDeptId, supabase])

    const loadSubjects = useCallback(async () => {
        if (!departmentId || !semester || !scheme) return
        
        // Semesters 1 and 2 subjects are COMMON for all branches
        let query = supabase
            .from('subjects')
            .select('id, subject_name, subject_code, credits')
            .eq('semester', semester)
            .eq('scheme', scheme)
            .eq('is_active', true)
        
        if (semester === 1 || semester === 2) {
            query = query.or(`department_id.eq.${departmentId}`)
        } else {
            query = query.eq('department_id', departmentId)
        }

        const { data } = await query.order('subject_code')
        setSubjects((data as unknown as SubjectRow[]) ?? [])
    }, [departmentId, semester, scheme, supabase])

    useEffect(() => { 
        setLoading(true)
        loadUserContext().finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!loading) loadResults()
    }, [filterDept, filterSem, filterRollNo, userDeptId, loading, loadResults])

    useEffect(() => {
        if (departmentId && semester && scheme) loadSubjects()
    }, [departmentId, semester, scheme, loadSubjects])

    async function lookupStudent() {
        if (!rollNo.trim()) { toast.error('Enter a roll number'); return }
        const q = supabase.from('users').select('id, full_name, roll_no, academic_year, scheme').eq('role_id', 4)
        if (departmentId) q.eq('department_id', departmentId)
        
        // Since roll_no is now an integer, we must parse it
        const rollNum = parseInt(rollNo.trim())
        if (isNaN(rollNum)) { toast.error('Roll number must be numeric'); return }

        const { data, error } = await q.eq('roll_no', rollNum).single()
        if (error || !data) { toast.error('Student not found'); setFoundStudent(null); return }
        setFoundStudent(data as unknown as StudentRow)
        const emptyMarks: MarksEntry = {}
        subjects.forEach(s => { emptyMarks[s.id] = '' }) // Use id as key
        setMarks(emptyMarks)
    }

    function getMaxMarksForExam(): number {
        const et = EXAM_TYPES.find(e => e.key === examType)
        return et?.maxMarks ?? 100
    }

    function validateMarks(): boolean {
        const max = getMaxMarksForExam()
        for (const sId of Object.keys(marks)) {
            const val = marks[sId]
            if (val === '' || val === undefined) continue
            const num = Number(val)
            if (isNaN(num) || num < 0 || num > max) {
                toast.error('Marks exceed allowed maximum for this exam type.')
                return false
            }
        }
        return true
    }

    async function submitResults() {
        if (!foundStudent) { toast.error('Look up a student first'); return }
        if (!validateMarks()) return
        const max = getMaxMarksForExam()
        const filledMarks = Object.entries(marks).filter(([, v]) => v !== '' && v !== undefined)
        if (filledMarks.length === 0) { toast.error('Enter marks for at least one subject'); return }

        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const inserts = filledMarks.map(([sId, val]) => ({
                student_id: foundStudent.id,
                subject_id: sId,
                marks_obtained: Number(val),
                max_marks: max,
                exam_type: examType,
                semester,
                academic_year: foundStudent.academic_year ?? `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
                uploaded_by: user?.id,
            }))

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('results') as any).insert(inserts)
            if (error) {
                if (error.message?.includes('duplicate') || error.code === '23505') {
                    toast.error('Duplicate result! Already exists for this combination.')
                } else { toast.error(error.message) }
                return
            }
            toast.success(`${filledMarks.length} result(s) uploaded successfully!`)
            setFoundStudent(null); setRollNo(''); setMarks({}); loadResults()
        } finally { setSaving(false) }
    }

    async function deleteResult(id: string) {
        if (!confirm('Delete this result?')) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('results') as any).delete().eq('id', id)
        if (error) toast.error(error.message)
        else { toast.success('Deleted'); loadResults() }
    }
    
    async function handleExport() {
        setSaving(true)
        try {
            let q = supabase
                .from('results')
                .select('*, users!results_student_id_fkey!inner(full_name,roll_no,department_id,semester,departments(name)), subjects(subject_code, subject_name)')

            let targetDeptId = filterDept
            if (userRoleId >= 2 && userDeptId) targetDeptId = userDeptId

            if (targetDeptId) q = q.eq('users.department_id', targetDeptId)
            if (filterSem) q = q.eq('users.semester', filterSem)
            if (filterRollNo) q = q.eq('users.roll_no', Number(filterRollNo) as any)

            const { data, error } = await q.order('created_at', { ascending: false })
            
            if (error || !data || data.length === 0) {
                toast.error('No results to export')
                return
            }

            const exportData = (data as any[]).map(r => ({
                Student: r.users?.full_name,
                'Roll No': r.users?.roll_no,
                Branch: r.users?.departments?.name,
                Subject: r.subjects?.subject_name,
                Code: r.subjects?.subject_code,
                Marks: r.marks_obtained,
                'Max Marks': r.max_marks,
                Grade: r.grade,
                Semester: r.semester,
                Year: r.academic_year,
                'Exam Type': r.exam_type
            }))

            exportToCSV(exportData, 'Results_Export')
            toast.success('Results exported!')
        } catch (err) {
            toast.error('Export failed')
        } finally {
            setSaving(false)
        }
    }

    const availableDepts = (userRoleId >= 3 && userDeptId) ? depts.filter(d => d.id === userDeptId) : depts

    return (
        <div>
            <PageHeader
                title="Results"
                subtitle={viewMode === 'list' ? 'View uploaded results' : 'Upload student results'}
                icon="📊"
                action={
                    <button onClick={() => setViewMode(v => v === 'list' ? 'upload' : 'list')} className="btn-primary">
                        {viewMode === 'list' ? '📤 Upload Results' : '📋 View Results'}
                    </button>
                }
            />

            {viewMode === 'list' ? (
                <>
                    <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                        <div>
                            <label className="label-default">Branch</label>
                            <select className="input-dark" value={userRoleId >= 2 && userDeptId ? userDeptId : filterDept} disabled={userRoleId >= 2 && !!userDeptId} onChange={e => setFilterDept(e.target.value)}>
                                <option value="">All Branches</option>
                                {availableDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-default">Semester</label>
                            <select className="input-dark" value={filterSem} onChange={e => setFilterSem(e.target.value ? Number(e.target.value) : '')}>
                                <option value="">All Semesters</option>
                                {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-default">Roll No</label>
                            <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} className="input-dark" placeholder="e.g. 5" value={filterRollNo} onChange={e => setFilterRollNo(e.target.value.replace(/\D/g, ''))} />
                        </div>
                        
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
                        <thead><tr><th>Student</th><th>Subject</th><th>Marks</th><th>Grade</th><th>Semester</th><th>Year</th><th></th></tr></thead>
                        <tbody>
                            {results.map(r => (
                                <tr key={r.id}>
                                    <td>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{r.users?.full_name ?? '—'}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Roll No: {r.users?.roll_no}</div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{r.subjects?.subject_code}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{r.subjects?.subject_name}</div>
                                    </td>
                                    <td>{r.marks_obtained} / {r.max_marks}</td>
                                    <td><span className={getGradeColor(r.grade)} style={{ fontWeight: 700 }}>{r.grade ?? '—'}</span></td>
                                    <td>Sem {r.semester}</td>
                                    <td>{r.academic_year}</td>
                                    <td>{userRoleId === 1 && <button onClick={() => deleteResult(r.id)} className="btn-danger" style={{ padding: '0.3rem 0.75rem' }}>Delete</button>}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {results.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No results found for these filters.</div>}
                </div>
                </>
            ) : (
                <div className="glass-card" style={{ padding: '2rem' }}>
                    {/* Simplified Workflow */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label className="label-default">Scheme *</label>
                            <select className="input-dark" value={scheme} onChange={e => { setScheme(e.target.value); setStep(Math.max(step, 2)) }}>
                                {SCHEMES.map(s => <option key={s} value={s}>{s} Scheme</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-default">Department *</label>
                            <select className="input-dark" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                                <option value="">Select Branch…</option>
                                {availableDepts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-default">Semester *</label>
                            <select className="input-dark" value={semester || ''} 
                                onChange={e => { setSemester(Number(e.target.value)); setStep(Math.max(step, 5)) }}>
                                <option value="">Select semester…</option>
                                {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="label-default">Exam Type *</label>
                            <select className="input-dark" value={examType}
                                onChange={e => { setExamType(e.target.value); const et = EXAM_TYPES.find(ex => ex.key === e.target.value); setMaxMarks(et?.maxMarks ?? 100) }}>
                                {EXAM_TYPES.map(et => <option key={et.key} value={et.key}>{et.label}</option>)}
                            </select>
                        </div>
                    </div>

                    {semester > 0 && departmentId && (
                        <>
                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1, maxWidth: 300 }}>
                                    <label className="label-default">Roll Number</label>
                                    <input className="input-dark" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={3} placeholder="Enter numeric roll number…" value={rollNo}
                                        onChange={e => setRollNo(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={e => e.key === 'Enter' && lookupStudent()} />
                                </div>
                                <button onClick={lookupStudent} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>🔍 Look Up Student</button>
                            </div>

                            {foundStudent && (
                                <div style={{
                                    padding: '1rem 1.5rem', borderRadius: '0.75rem', marginBottom: '1.5rem',
                                    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)',
                                }}>
                                    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                                        <span><strong>Name:</strong> {foundStudent.full_name}</span>
                                        <span><strong>Roll No:</strong> {foundStudent.roll_no}</span>
                                    </div>
                                </div>
                            )}

                            {foundStudent && subjects.length > 0 && (
                                <>
                                    <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
                                        <table className="table-dark">
                                            <thead>
                                                <tr>
                                                    <th style={{ minWidth: 100 }}>Code</th>
                                                    <th style={{ minWidth: 200 }}>Subject</th>
                                                    <th style={{ minWidth: 80 }}>Credits</th>
                                                    <th style={{ minWidth: 120 }}>Marks (max {maxMarks})</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {subjects.map(s => {
                                                    const val = marks[s.id] ?? ''
                                                    const num = Number(val)
                                                    const isInvalid = val !== '' && (isNaN(num) || num < 0 || num > maxMarks)
                                                    return (
                                                        <tr key={s.id}>
                                                            <td style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 600 }}>{s.subject_code}</td>
                                                            <td style={{ color: 'var(--text-primary)' }}>{s.subject_name}</td>
                                                            <td>{s.credits}</td>
                                                            <td>
                                                                <input className="input-dark" type="number" min={0} max={maxMarks} step="0.5"
                                                                    placeholder="—" value={val}
                                                                    onChange={e => setMarks(m => ({ ...m, [s.id]: e.target.value }))}
                                                                    style={{ width: 100, textAlign: 'center', borderColor: isInvalid ? '#ef4444' : undefined }} />
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setFoundStudent(null); setRollNo(''); setMarks({}) }} className="btn-secondary">Clear</button>
                                        <button onClick={submitResults} className="btn-primary" disabled={saving}>
                                            {saving ? 'Uploading…' : `📤 Submit Results`}
                                        </button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
