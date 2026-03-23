'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'
import { DEPARTMENTS } from '@/types/database.types'

type CorrectionRow = {
    id: string; 
    result_id: string; 
    student_id: string; 
    subject_code: string;
    exam_type: string; 
    semester: number; 
    academic_year: string;
    old_marks: number; 
    new_marks: number; 
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    requested_by: string; 
    reviewed_by: string | null; 
    reviewed_at: string | null;
    created_at: string;
    // Joined fields
    student: { full_name: string; roll_no: number | null } | null
    requester: { full_name: string } | null
}

type ResultForCorrection = {
    id: string; 
    student_id: string; 
    subject_code: string; 
    exam_type: string;
    marks_obtained: number; 
    max_marks: number; 
    semester: number; 
    academic_year: string;
    users: { full_name: string; roll_no: number | null } | null
}

export default function AdminCorrectionsPage() {
    const supabase = createClient()
    const [corrections, setCorrections] = useState<CorrectionRow[]>([])
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [userRoleId, setUserRoleId] = useState(99)
    const [userId, setUserId] = useState('')

    // For creating new correction
    const [departmentSearch, setDepartmentSearch] = useState('')
    const [semesterSearch, setSemesterSearch] = useState<number | ''>('')
    const [rollNoSearch, setRollNoSearch] = useState('')
    const [studentResults, setStudentResults] = useState<ResultForCorrection[]>([])
    const [selectedResult, setSelectedResult] = useState<ResultForCorrection | null>(null)
    const [newMarks, setNewMarks] = useState('')
    const [reason, setReason] = useState('')

    useEffect(() => { loadCorrections(); loadUserContext() }, [])

    async function loadUserContext() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUserId(user.id)
            const { data } = await supabase.from('users').select('role_id, department').eq('id', user.id).single()
            if (data) {
                const profile = data as unknown as { role_id: number; department: string | null }
                setUserRoleId(profile.role_id)
                setUserDept(profile.department)
                if (profile.role_id >= 3 && profile.department) setDepartmentSearch(profile.department)
            }
        }
    }

    async function loadCorrections() {
        const { data } = await supabase
            .from('result_corrections')
            .select(`
                *,
                student:users!result_corrections_student_id_fkey(full_name, roll_no),
                requester:users!result_corrections_requested_by_fkey(full_name)
            `)
            .order('created_at', { ascending: false })
        setCorrections((data as unknown as CorrectionRow[]) ?? [])
    }

    async function searchStudentResults() {
        if (!rollNoSearch.trim() || !departmentSearch || !semesterSearch) return
        const rollNum = parseInt(rollNoSearch.trim())
        if (isNaN(rollNum)) { toast.error('Roll number must be numeric'); return }

        const { data: student } = await supabase
            .from('users')
            .select('id')
            .eq('roll_no', rollNum)
            .eq('department', departmentSearch)
            .eq('role_id', 5)
            .single()

        if (!student) { toast.error('Student not found for this department'); return }

        const sid = (student as unknown as { id: string }).id
        const { data, error } = await supabase
            .from('results')
            .select('id, student_id, subject_code, exam_type, marks_obtained, max_marks, semester, academic_year, users!results_student_id_fkey!inner(full_name, roll_no, department, semester)')
            .eq('student_id', sid)
            .eq('semester', semesterSearch)
            .order('exam_type')
        if (error) console.error("Corrections fetch error:", error)
        setStudentResults((data as unknown as ResultForCorrection[]) ?? [])
        if (!data || data.length === 0) toast.error('No results found for Semester ' + semesterSearch)
    }

    async function submitCorrection() {
        if (!selectedResult || !reason.trim()) { toast.error('Select a result and provide a reason'); return }
        const nm = Number(newMarks)
        if (isNaN(nm) || nm < 0 || nm > selectedResult.max_marks) {
            toast.error(`New marks must be between 0 and ${selectedResult.max_marks}`)
            return
        }
        setSaving(true)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('result_corrections') as any).insert({
                result_id: selectedResult.id,
                student_id: selectedResult.student_id,
                subject_code: selectedResult.subject_code,
                exam_type: selectedResult.exam_type,
                semester: selectedResult.semester,
                academic_year: selectedResult.academic_year,
                old_marks: selectedResult.marks_obtained,
                new_marks: nm,
                reason: reason.trim(),
                requested_by: userId,
            })
            if (error) { toast.error(error.message); return }
            toast.success('Correction request submitted')
            setShowModal(false); resetForm(); loadCorrections()
        } finally { setSaving(false) }
    }

    async function reviewCorrection(correctionId: string, action: 'approved' | 'rejected') {
        setSaving(true)
        try {
            if (action === 'approved') {
                const correction = corrections.find(c => c.id === correctionId)
                if (correction) {
                    // Update the actual result
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (supabase.from('results') as any).update({
                        marks_obtained: correction.new_marks
                    }).eq('id', correction.result_id)
                }
            }

            // Update correction status
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('result_corrections') as any).update({
                status: action,
                reviewed_by: userId,
                reviewed_at: new Date().toISOString(),
            }).eq('id', correctionId)

            if (error) { toast.error(error.message); return }
            toast.success(action === 'approved' ? 'Correction approved and marks updated' : 'Correction rejected')
            loadCorrections()
        } finally { setSaving(false) }
    }

    async function deleteCorrection(id: string) {
        if (!confirm('Are you sure you want to delete this correction request?')) return
        setSaving(true)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase.from('result_corrections') as any).delete().eq('id', id)
            if (error) { toast.error(error.message); return }
            toast.success('Correction request deleted')
            loadCorrections()
        } finally { setSaving(false) }
    }

    function resetForm() {
        setRollNoSearch(''); setStudentResults([]); setSelectedResult(null); setNewMarks(''); setReason('');
    }

    const [userDept, setUserDept] = useState<string | null>(null)

    const statusColor = (s: string) => s === 'approved' ? 'success' : s === 'rejected' ? 'danger' : 'warning'
    const availableDepts = (userRoleId >= 3 && userDept) ? [userDept] : [...DEPARTMENTS]

    return (
        <div>
            <PageHeader
                title="Result Corrections"
                subtitle="Request and review mark corrections"
                icon="✏️"
                action={<button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary">+ New Correction Request</button>}
            />

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table className="table-dark">
                    <thead>
                        <tr>
                            <th>Student</th><th>Subject</th><th>Old → New</th><th>Reason</th><th>Status</th><th>Requested By</th><th>Date</th>
                            {userRoleId <= 1 && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {corrections.map(c => (
                            <tr key={c.id}>
                                <td>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{c.student?.full_name ?? '—'}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Roll No: {c.student?.roll_no}</div>
                                </td>
                                <td>
                                    <div style={{ fontWeight: 600 }}>{c.subject_code}</div>
                                </td>
                                <td>
                                    <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>{c.old_marks}</span>
                                    {' → '}
                                    <span style={{ color: '#22c55e', fontWeight: 700 }}>{c.new_marks}</span>
                                </td>
                                <td style={{ fontSize: '0.8rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.reason}</td>
                                <td><Badge variant={statusColor(c.status)}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</Badge></td>
                                <td style={{ fontSize: '0.8rem' }}>{c.requester?.full_name ?? '—'}</td>
                                <td style={{ fontSize: '0.8rem' }}>{formatDate(c.created_at)}</td>
                                {userRoleId <= 1 && (
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            {c.status === 'pending' && (
                                                <>
                                                    <button onClick={() => reviewCorrection(c.id, 'approved')} className="btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} disabled={saving}>✓</button>
                                                    <button onClick={() => reviewCorrection(c.id, 'rejected')} className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} disabled={saving}>✗</button>
                                                </>
                                            )}
                                            <button onClick={() => deleteCorrection(c.id)} className="btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} disabled={saving}>Del</button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                {corrections.length === 0 && <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No correction requests found.</div>}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 700, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>New Correction Request</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
                            <div>
                                <label className="label-default">Department *</label>
                                <select className="input-dark" value={departmentSearch} onChange={e => setDepartmentSearch(e.target.value)}>
                                    <option value="">Select Dept…</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-default">Semester *</label>
                                <select className="input-dark" value={semesterSearch} onChange={e => setSemesterSearch(e.target.value ? Number(e.target.value) : '')}>
                                    <option value="">Select Sem…</option>
                                    {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-default">Roll Number *</label>
                                <input className="input-dark" type="number" value={rollNoSearch} disabled={!departmentSearch || !semesterSearch} onChange={e => setRollNoSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && searchStudentResults()} placeholder="Enter numeric…" />
                            </div>
                            <button onClick={searchStudentResults} disabled={!departmentSearch || !semesterSearch || !rollNoSearch.trim()} className="btn-primary" style={{ padding: '0.55rem 1rem' }}>Search</button>
                        </div>

                        {studentResults.length > 0 && !selectedResult && (
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label-default">Select Result to Correct</label>
                                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                                    {studentResults.map(r => (
                                        <div key={r.id} onClick={() => { setSelectedResult(r); setNewMarks(String(r.marks_obtained)) }}
                                            style={{ padding: '0.5rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{r.subject_code}</span>
                                            <span>{r.exam_type} · {r.marks_obtained}/{r.max_marks} · Sem {r.semester}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedResult && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(59,130,246,0.1)', fontSize: '0.8rem', border: '1px solid rgba(59,130,246,0.3)' }}>
                                    <strong>{selectedResult.users?.full_name}</strong> · {selectedResult.subject_code} · Current: {selectedResult.marks_obtained}/{selectedResult.max_marks}
                                    <button onClick={() => setSelectedResult(null)} style={{ float: 'right', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕ Change</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="label-default">Old Marks</label>
                                        <input className="input-dark" value={selectedResult.marks_obtained} disabled />
                                    </div>
                                    <div>
                                        <label className="label-default">New Marks *</label>
                                        <input className="input-dark" type="number" min={0} max={selectedResult.max_marks} value={newMarks} onChange={e => setNewMarks(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="label-default">Reason for Correction *</label>
                                    <textarea className="input-dark" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Explain why the marks need to be corrected…" />
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={submitCorrection} className="btn-primary" disabled={saving || !selectedResult || !reason.trim()}>{saving ? 'Submitting…' : 'Submit Request'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
