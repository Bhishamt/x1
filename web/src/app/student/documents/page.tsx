'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import type { DocumentRecord } from '@/types/extended'

export default function StudentDocumentsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [docs, setDocs] = useState<DocumentRecord[]>([])
    const [stats, setStats] = useState({ syllabus: 0, papers: 0, forms: 0 })

    useEffect(() => {
        loadDocs()
    }, [])

    async function loadDocs() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: profile } = await supabase.from('users').select('department_id, semester').eq('id', user.id).single()
        
        const deptId = profile?.department_id ?? '00000000-0000-0000-0000-000000000000'

        const { data } = await supabase.from('documents')
            .select('*, departments(name)')
            .or(`department_id.is.null,department_id.eq.${deptId}`)
            .order('created_at', { ascending: false })

        if (data) {
            setDocs(data as any)
            setStats({
                syllabus: data.filter(d => d.type === 'syllabus').length,
                papers: data.filter(d => d.type === 'previous_paper').length,
                forms: data.filter(d => d.type === 'form').length,
            })
        }
        setLoading(false)
    }

    const calendarDocs = docs.filter(d => d.type === 'academic_calendar')
    const otherDocs = docs.filter(d => d.type !== 'academic_calendar')

    const categories = [
        { id: 'syllabus', label: 'Syllabus', icon: '📘', color: 'blue' },
        { id: 'previous_paper', label: 'Previous Papers', icon: '📝', color: 'yellow' },
        { id: 'form', label: 'Official Forms', icon: '📄', color: 'green' },
        { id: 'other', label: 'Other Resources', icon: '📂', color: 'purple' },
    ]

    if (loading) return (
        <div className="flex items-center justify-center h-60">
            <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
        </div>
    )

    return (
        <div className="container mx-auto p-4 max-w-5xl space-y-8">
            <PageHeader 
                title="Resources & Documents" 
                subtitle="Access academic calendar, syllabus, and other resources" 
                icon="📂"
            />

            {/* Academic Calendar Highlight */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">📅</span>
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">Academic Calendar</h2>
                </div>
                {calendarDocs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {calendarDocs.map(doc => (
                            <div key={doc.id} className="glass-card p-6 flex items-center justify-between border-l-4 border-red-500 bg-red-500/5">
                                <div>
                                    <h3 className="font-bold text-white mb-1">{doc.title}</h3>
                                    <p className="text-xs text-gray-500">{doc.description || 'Official college schedule'}</p>
                                </div>
                                <a href={doc.file_url} target="_blank" rel="noreferrer" className="btn-primary py-2 px-4 text-xs font-bold">View ↗</a>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-8 text-center text-gray-500 text-sm border-dashed border-2 border-[#2d2d3d]">
                        Academic calendar not yet uploaded for this session.
                    </div>
                )}
            </section>

            {/* Category Groups */}
            <div className="space-y-10">
                {categories.map(cat => {
                    const catDocs = otherDocs.filter(d => d.type === cat.id)
                    if (catDocs.length === 0) return null

                    return (
                        <div key={cat.id}>
                            <div className="flex items-center gap-2 mb-4 border-b border-[#2d2d3d] pb-2">
                                <span className="text-xl">{cat.icon}</span>
                                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">{cat.label}</h2>
                                <Badge variant="info" className="ml-auto bg-white/5 border-none text-[10px]">{catDocs.length} Files</Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {catDocs.map((doc) => (
                                    <div key={doc.id} className="glass-card p-4 flex items-center justify-between group hover:bg-[#1e1e2e]/50 transition-all border border-[#2d2d3d] hover:border-blue-500/30">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">{cat.icon}</div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{doc.title}</h3>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase">Sem {doc.semester}</span>
                                                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter italic">
                                                        {doc.departments?.name || 'College-wide'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors p-2 bg-[#2d2d3d] rounded-lg">
                                            ⬇️
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {otherDocs.length === 0 && !loading && (
                <div className="glass-card p-12 text-center text-gray-500 text-sm">
                    No academic resources found for your profile.
                </div>
            )}
        </div>
    )
}
