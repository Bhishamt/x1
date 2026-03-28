'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import toast from 'react-hot-toast'
import type { SubjectRow } from '@/types/extended'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'

export default function AdminAttendancePage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    
    // Selection state
    const [departments, setDepartments] = useState<any[]>([])
    const [subjects, setSubjects] = useState<SubjectRow[]>([])
    const [students, setStudents] = useState<any[]>([])
    
    // User Context for RBAC
    const [userRoleId, setUserRoleId] = useState(4)
    const [userDeptId, setUserDeptId] = useState<string | null>(null)
    
    const [selectedDept, setSelectedDept] = useState('')
    const [selectedSem, setSelectedSem] = useState(1)
    const [selectedSubject, setSelectedSubject] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    
    // Attendance state
    const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent' | 'late'>>({})

    useEffect(() => {
        loadInitialData()
    }, [supabase])

    useEffect(() => {
        if (selectedDept && selectedSem) {
            loadSubjects()
            loadStudents()
        }
    }, [selectedDept, selectedSem])

    useEffect(() => {
        if (selectedSubject && selectedDate) {
            loadExistingAttendance()
        }
    }, [selectedSubject, selectedDate])

    async function loadInitialData() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase.from('users').select('role_id, department_id').eq('id', user.id).single()
            if (profile) {
                setUserRoleId(profile.role_id)
                setUserDeptId(profile.department_id)
                
                // Only auto-select if profile has a department (HOD/Incharge)
                if (profile.department_id) {
                    setSelectedDept(profile.department_id)
                }
            }
        }

        const { data } = await supabase.from('departments').select('*').eq('is_active', true).order('name')
        if (data) setDepartments(data)
        setLoading(false)
    }

    async function loadSubjects() {
        if (!selectedDept || !selectedSem) {
            setSubjects([])
            return
        }

        const commonDept = departments.find(d => d.code === 'COMMON')
        let query = supabase.from('subjects')
            .select('*')
            .eq('semester', selectedSem)
            .eq('is_active', true)

        if ((selectedSem === 1 || selectedSem === 2) && commonDept) {
            // For sem 1/2, subjects are typically in 'COMMON' dept
            query = query.eq('department_id', commonDept.id)
        } else {
            query = query.eq('department_id', selectedDept)
        }

        const { data, error } = await query.order('subject_name')

        if (error) {
            toast.error('Failed to load subjects')
            return
        }

        setSubjects(data as SubjectRow[])
        if (data && data.length > 0) {
            setSelectedSubject(data[0].id)
        } else {
            setSelectedSubject('')
        }
    }

    async function loadStudents() {
        if (!selectedDept || !selectedSem) {
            setStudents([])
            return
        }

        const { data, error } = await supabase.from('users')
            .select('id, full_name, roll_no')
            .eq('role_id', 4)
            .eq('department_id', selectedDept)
            .eq('semester', selectedSem)
            .eq('is_active', true)
            .order('roll_no', { ascending: true })

        if (error) {
            toast.error('Failed to load students')
            return
        }
        setStudents(data || [])
    }

    async function loadExistingAttendance() {
        if (!selectedSubject || !selectedDate) return
        
        const { data } = await supabase.from('attendance')
            .select('student_id, status')
            .eq('subject_id', selectedSubject)
            .eq('date', selectedDate)
            
        const mapping: Record<string, any> = {}
        data?.forEach(record => {
            mapping[record.student_id] = record.status
        })
        setAttendanceData(mapping)
    }

    const toggleStatus = (studentId: string) => {
        setAttendanceData(prev => {
            const current = prev[studentId] || 'absent'
            const nextMap: Record<string, 'present' | 'absent' | 'late'> = {
                'absent': 'present',
                'present': 'late',
                'late': 'absent'
            }
            return { ...prev, [studentId]: nextMap[current] as any }
        })
    }

    async function handleSave() {
        if (!selectedSubject || !selectedDate) {
            toast.error('Please select subject and date')
            return
        }
        
        setSaving(true)
        try {
            const records = students.map(s => ({
                student_id: s.id,
                subject_id: selectedSubject,
                date: selectedDate,
                status: attendanceData[s.id] || 'absent'
            }))

            // Use upsert or delete/insert strategy
            // For simplicity in this demo, we'll delete existing for this subject/date and insert new
            await supabase.from('attendance')
                .delete()
                .eq('subject_id', selectedSubject)
                .eq('date', selectedDate)

            const { error } = await supabase.from('attendance').insert(records)
            
            if (error) throw error
            toast.success('Attendance saved successfully')
            
            // Log activity
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await supabase.from('activity_logs').insert({
                    user_id: user.id,
                    action: 'update',
                    details: {
                        resource: 'attendance',
                        description: `Marked attendance for ${subjects.find(s => s.id === selectedSubject)?.subject_name} on ${selectedDate}`
                    }
                })
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to save attendance')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <PageHeader 
                title="Attendance marking" 
                subtitle="Daily attendance records management" 
                icon="📅"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Department</label>
                    <select 
                        value={selectedDept} 
                        onChange={e => setSelectedDept(e.target.value)}
                        disabled={userRoleId >= 2 && !!userDeptId}
                        className="w-full bg-[#1e1e2e] border border-[#2d2d3d] rounded-lg p-2.5 text-sm focus:border-blue-500 transition-all outline-none disabled:opacity-50"
                    >
                        <option value="">Select Department</option>
                        {(userRoleId >= 2 && userDeptId ? departments.filter(d => d.id === userDeptId) : departments).map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Semester</label>
                    <select 
                        value={selectedSem} 
                        onChange={e => setSelectedSem(Number(e.target.value))}
                        className="w-full bg-[#1e1e2e] border border-[#2d2d3d] rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                    >
                        {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Subject</label>
                    <select 
                        value={selectedSubject} 
                        onChange={e => setSelectedSubject(e.target.value)}
                        className="w-full bg-[#1e1e2e] border border-[#2d2d3d] rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                        disabled={!subjects.length}
                    >
                        {subjects.length === 0 && <option>No subjects found</option>}
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Date</label>
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={e => setSelectedDate(e.target.value)}
                        className="w-full bg-[#1e1e2e] border border-[#2d2d3d] rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none"
                    />
                </div>
            </div>

            {selectedSubject ? (
                <div className="glass-card overflow-hidden">
                    <div className="p-4 border-b border-[#2d2d3d] flex justify-between items-center bg-[#1e1e2e]/50">
                        <h3 className="font-bold text-sm">Student List</h3>
                        <div className="flex gap-4 text-xs font-medium">
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> Present</span>
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> Absent</span>
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Late</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#1e1e2e]/30 text-xs text-gray-400 uppercase">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Roll No</th>
                                    <th className="px-6 py-4 font-semibold">Name</th>
                                    <th className="px-6 py-4 font-semibold">Status</th>
                                    <th className="px-6 py-4 font-semibold text-center">Toggle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2d2d3d]">
                                {students.map((student) => {
                                    const status = attendanceData[student.id] || 'absent'
                                    return (
                                        <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-mono text-sm text-blue-400">#{student.roll_no}</td>
                                            <td className="px-6 py-4 text-sm font-medium">{student.full_name}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    status === 'present' ? 'bg-green-500/10 text-green-500' :
                                                    status === 'late' ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => toggleStatus(student.id)}
                                                    className="w-10 h-10 rounded-xl bg-[#2d2d3d] flex items-center justify-center hover:bg-[#3d3d4d] transition-all mx-auto"
                                                >
                                                    🎯
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    {students.length === 0 && (
                        <div className="p-12 text-center text-gray-500 text-sm">No students found for this filter.</div>
                    )}
                    <div className="p-6 border-t border-[#2d2d3d] bg-[#1e1e2e]/30 flex justify-end">
                        <button 
                            onClick={handleSave}
                            disabled={saving || !students.length}
                            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                        >
                            {saving ? 'Saving...' : 'Save Records'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="glass-card p-12 text-center text-gray-400 flex flex-col items-center gap-4">
                    <div className="text-4xl">👆</div>
                    <p className="font-medium text-sm">Select a department and semester to begin marking attendance.</p>
                </div>
            )}
        </div>
    )
}
