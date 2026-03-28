'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import { formatDateTime } from '@/lib/utils'
import type { CalendarEvent } from '@/types/extended'
import { uploadFile } from '@/lib/storage'

export default function AdminCalendarPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [academicCalendarUrl, setAcademicCalendarUrl] = useState<string | null>(null)
    
    const [depts, setDepts] = useState<any[]>([])
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'event' as 'exam' | 'holiday' | 'event' | 'deadline',
        start_date: '',
        end_date: '',
        target_department: '',
        target_semester: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        const [eventsRes, deptsRes] = await Promise.all([
            supabase.from('calendar_events').select('*, departments(name)').order('start_date', { ascending: true }),
            supabase.from('departments').select('id, name').eq('is_active', true)
        ])
        
        if (eventsRes.data) setEvents(eventsRes.data as any)
        if (deptsRes.data) setDepts(deptsRes.data)
        
        // Load latest academic calendar file
        const { data: calendarData } = await supabase.from('academic_calendar').select('file_url').order('created_at', { ascending: false }).limit(1).single()
        if (calendarData?.file_url) setAcademicCalendarUrl(calendarData.file_url)
        
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase.from('calendar_events').insert([{
                title: formData.title,
                description: formData.description || null,
                type: formData.type,
                start_date: formData.start_date,
                end_date: formData.end_date,
                target_department: formData.target_department || null,
                target_semester: formData.target_semester ? Number(formData.target_semester) : null,
                created_by: user?.id
            }])
            
            if (error) throw error
            toast.success('Calendar event added')
            setShowModal(false)
            setFormData({ title: '', description: '', type: 'event', start_date: '', end_date: '', target_department: '', target_semester: '' })
            loadData()
        } catch (err: any) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    async function deleteEvent(id: string) {
        if (!confirm('Delete this event?')) return
        const { error } = await supabase.from('calendar_events').delete().eq('id', id)
        if (error) toast.error('Failed to delete event')
        else {
            toast.success('Event deleted')
            setEvents(prev => prev.filter(e => e.id !== id))
        }
    }
    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileName = `academic-calendar-${Date.now()}.${file.name.split('.').pop()}`
            const publicUrl = await uploadFile('calendar', fileName, file)
            
            // Save to academic_calendar table
            const { error } = await supabase.from('academic_calendar').insert({
                title: 'Official Academic Calendar',
                file_url: publicUrl,
                start_date: new Date().toISOString(),
                end_date: new Date().toISOString(),
                event_type: 'event'
            })

            if (error) throw error
            setAcademicCalendarUrl(publicUrl)
            toast.success('Calendar file uploaded successfully')
        } catch (err: any) {
            toast.error(err.message || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }
    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <PageHeader 
                title="Academic Calendar" 
                subtitle="Manage college events, exams and holidays" 
                icon="📅"
                action={
                    <div className="flex gap-2">
                        <label className={`btn-secondary cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            {uploading ? 'Uploading...' : '📁 Upload PDF/Image'}
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileUpload} disabled={uploading} />
                        </label>
                        <button onClick={() => setShowModal(true)} className="btn-primary">
                            + Add Event
                        </button>
                    </div>
                }
            />

            {academicCalendarUrl && (
                <div className="glass-card p-4 mb-6 flex items-center justify-between border-l-4 border-blue-500">
                    <div>
                        <div className="text-sm font-bold text-gray-200">Official Calendar File</div>
                        <div className="text-xs text-gray-500">Currently published for all students</div>
                    </div>
                    <div className="flex gap-3">
                        <a href={academicCalendarUrl} target="_blank" rel="noreferrer" className="btn-ghost-sm">👁️ View File</a>
                        <button onClick={() => setAcademicCalendarUrl(null)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-full transition-colors">🗑️ Remove</button>
                    </div>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1e1e2e]/30 text-xs text-gray-400 uppercase">
                            <tr>
                                <th className="px-6 py-4">Event</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Dates</th>
                                <th className="px-6 py-4">Target</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d2d3d]">
                            {events.map((event) => (
                                <tr key={event.id} className="hover:bg-white/5 transition-colors text-sm">
                                    <td className="px-6 py-4 font-bold">{event.title}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={event.type === 'exam' ? 'danger' : 'info'}>{event.type.toUpperCase()}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-blue-400">
                                        {formatDateTime(event.start_date)}
                                    </td>
                                    <td className="px-6 py-4 text-xs">
                                        {event.departments?.name || 'All Branches'}
                                        {event.target_semester && ` / Sem ${event.target_semester}`}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => deleteEvent(event.id)} className="text-red-500">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && !loading && (
                                <tr><td colSpan={5} className="p-12 text-center text-gray-500">No events scheduled.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="glass-card p-8 w-full max-w-md bg-[#161623] relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400">✕</button>
                        <h2 className="text-xl font-black mb-6">New Calendar Event</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label-default">Title</label>
                                <input required className="input-dark w-full" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. Mid Semester Exams" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-default">Start Date</label>
                                    <input type="datetime-local" className="input-dark w-full" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                                </div>
                                <div>
                                    <label className="label-default">End Date</label>
                                    <input type="datetime-local" className="input-dark w-full" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} required />
                                </div>
                            </div>
                            <div>
                                <label className="label-default">Event Type</label>
                                <select className="input-dark w-full" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                                    <option value="event">General Event</option>
                                    <option value="exam">Examination</option>
                                    <option value="holiday">Holiday</option>
                                    <option value="deadline">Deadline</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-default">Branch</label>
                                    <select className="input-dark w-full" value={formData.target_department} onChange={e => setFormData({...formData, target_department: e.target.value})}>
                                        <option value="">All Branches</option>
                                        {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-default">Semester</label>
                                    <select className="input-dark w-full" value={formData.target_semester} onChange={e => setFormData({...formData, target_semester: e.target.value})}>
                                        <option value="">All Semesters</option>
                                        {[1,2,3,4,5,6].map(s => <option key={s} value={s.toString()}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button disabled={saving} className="btn-primary w-full py-3 mt-4">
                                {saving ? 'Adding...' : 'Add to Calendar'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
