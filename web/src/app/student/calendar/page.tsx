'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils'
import type { CalendarEvent } from '@/types/extended'

export default function StudentCalendarPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [events, setEvents] = useState<CalendarEvent[]>([])

    useEffect(() => {
        loadEvents()
    }, [])

    async function loadEvents() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('users').select('department_id').eq('id', user.id).single()
        
        const deptId = profile?.department_id ?? '00000000-0000-0000-0000-000000000000'

        const { data } = await supabase.from('calendar_events')
            .select('*, departments(name)')
            .or(`target_department.is.null,target_department.eq.${deptId}`)
            .order('start_date', { ascending: true })

        if (data) setEvents(data as any)
        setLoading(false)
    }

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="container mx-auto p-4 max-w-5xl">
            <PageHeader 
                title="Academic Calendar" 
                subtitle="Upcoming exams, holidays, and campus events" 
                icon="📅"
            />

            <div className="space-y-4">
                {events.length === 0 ? (
                    <div className="glass-card p-12 text-center text-gray-500 text-sm">
                        No upcoming events found.
                    </div>
                ) : events.map((event) => {
                    const isExam = event.type === 'exam'
                    const isHoliday = event.type === 'holiday'
                    return (
                        <div key={event.id} className={`glass-card p-6 border-l-4 transition-all hover:translate-x-1 ${
                            isExam ? 'border-red-500 bg-red-500/5' : 
                            isHoliday ? 'border-yellow-500 bg-yellow-500/5' : 
                            'border-blue-500 bg-blue-500/5'
                        }`}>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge variant={isExam ? 'danger' : isHoliday ? 'warning' : 'info'}>
                                            {event.type.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                            {formatDateTime(event.start_date)}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-black text-white mb-1">{event.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium">{event.description || 'No description provided.'}</p>
                                </div>
                                <div className="bg-[#1e1e2e] p-3 rounded-xl border border-[#2d2d3d] md:min-w-[200px] text-center">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">Schedule</div>
                                    <div className="text-xs font-mono text-blue-400">
                                        {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {' - '}
                                        {new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1">
                                        {event.departments?.name || 'College-wide'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
