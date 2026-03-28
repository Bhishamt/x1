'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import type { DocumentRecord } from '@/types/extended'
import { uploadFile } from '@/lib/storage'

export default function AdminDocumentsPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [documents, setDocuments] = useState<DocumentRecord[]>([])
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    
    const [depts, setDepts] = useState<any[]>([])
    // RBAC Context
    const [userRoleId, setUserRoleId] = useState(4)
    const [userDeptId, setUserDeptId] = useState<string | null>(null)

    const [uploading, setUploading] = useState(false)
    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file_url: '',
        type: 'syllabus' as DocumentRecord['type'],
        department_id: '',
        semester: 1,
        academic_year: new Date().getFullYear().toString()
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data: profile } = await supabase.from('users').select('role_id, department_id').eq('id', user.id).single()
            if (profile) {
                setUserRoleId(profile.role_id)
                setUserDeptId(profile.department_id)
                if (profile.role_id >= 2 && profile.department_id) setFormData(prev => ({ ...prev, department_id: profile.department_id || '' }))
            }
        }

        const [docsRes, deptsRes] = await Promise.all([
            supabase.from('documents').select('*, departments(name)').order('created_at', { ascending: false }),
            supabase.from('departments').select('id, name').eq('is_active', true)
        ])
        
        if (docsRes.data) setDocuments(docsRes.data as any)
        if (deptsRes.data) setDepts(deptsRes.data)
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            let finalUrl = formData.file_url

            if (uploadMode === 'file' && selectedFile) {
                const fileName = `${Date.now()}-${selectedFile.name.replace(/\s+/g, '_')}`
                finalUrl = await uploadFile('documents', fileName, selectedFile)
            }

            if (!finalUrl) {
                toast.error('Please provide a file or URL')
                setSaving(false)
                return
            }

            const { error } = await supabase.from('documents').insert([{
                title: formData.title,
                description: formData.description || null,
                file_url: finalUrl,
                type: formData.type,
                department_id: formData.department_id || null,
                semester: formData.semester,
                academic_year: formData.academic_year,
                uploaded_by: user?.id
            }])
            
            if (error) throw error
            toast.success('Document added successfully')
            setShowModal(false)
            setFormData({ title: '', description: '', file_url: '', type: 'syllabus', department_id: userDeptId || '', semester: 1, academic_year: new Date().getFullYear().toString() })
            setSelectedFile(null)
            loadData()
        } catch (err: any) {
            toast.error(err.message || 'Failed to save document')
        } finally {
            setSaving(false)
        }
    }

    async function deleteDoc(id: string) {
        if (!confirm('Are you sure you want to delete this document?')) return
        const { error } = await supabase.from('documents').delete().eq('id', id)
        if (error) toast.error('Failed to delete document')
        else {
            toast.success('Document deleted')
            setDocuments(prev => prev.filter(d => d.id !== id))
        }
    }

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <PageHeader 
                title="Documents & Resources" 
                subtitle="Manage syllabus, previous papers, and official forms" 
                icon="📂"
                action={
                    <button onClick={() => setShowModal(true)} className="btn-primary">
                        + Add Document
                    </button>
                }
            />

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#1e1e2e]/30 text-xs text-gray-400 uppercase">
                            <tr>
                                <th className="px-6 py-4">Document</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Dept/Sem</th>
                                <th className="px-6 py-4">URL</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d2d3d]">
                            {documents.map((doc) => (
                                <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-sm">{doc.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{doc.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={
                                            doc.type === 'academic_calendar' ? 'danger' :
                                            doc.type === 'syllabus' ? 'info' : 
                                            doc.type === 'previous_paper' ? 'warning' : 'success'
                                        }>
                                            {doc.type.split('_').join(' ').toUpperCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        <div className="flex items-center gap-2">
                                            {doc.type === 'academic_calendar' ? '📅' :
                                             doc.type === 'syllabus' ? '📘' :
                                             doc.type === 'previous_paper' ? '📝' : '📄'}
                                            <span>{doc.type.split('_').join(' ')}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-medium">
                                        {doc.departments?.name || 'All'} / Sem {doc.semester}
                                    </td>
                                    <td className="px-6 py-4">
                                        <a href={doc.file_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-xs truncate max-w-[150px] inline-block font-mono">
                                            {doc.file_url}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => deleteDoc(doc.id)} className="text-red-500 hover:text-red-400">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                            {documents.length === 0 && !loading && (
                                <tr><td colSpan={5} className="p-12 text-center text-gray-500 text-sm">No documents found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="glass-card p-6 md:p-8 w-full max-w-2xl bg-[#161623] relative my-auto">
                        <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
                        <h2 className="text-xl font-black mb-6">New Document Record</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label-default">Title</label>
                                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-dark w-full" placeholder="e.g. CS 5th Sem Syllabus" />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-default">Category</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="input-dark w-full">
                                        <option value="academic_calendar">📅 Academic Calendar</option>
                                        <option value="syllabus">📘 Syllabus</option>
                                        <option value="previous_paper">📝 Previous Papers</option>
                                        <option value="form">📄 Forms</option>
                                        <option value="other">📂 Other Resources</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-default">Department</label>
                                    <select 
                                        disabled={userRoleId >= 2 && !!userDeptId}
                                        value={formData.department_id} 
                                        onChange={e => setFormData({...formData, department_id: e.target.value})} 
                                        className="input-dark w-full disabled:opacity-50"
                                    >
                                        <option value="">All Departments</option>
                                        {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="label-default">Semester</label>
                                    <select value={formData.semester} onChange={e => setFormData({...formData, semester: Number(e.target.value)})} className="input-dark w-full">
                                        {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="label-default">Year</label>
                                    <input type="text" value={formData.academic_year} onChange={e => setFormData({...formData, academic_year: e.target.value})} className="input-dark w-full" />
                                </div>
                            </div>
                            <div className="bg-[#1e1e2e]/50 p-4 rounded-lg border border-[#2d2d3d] space-y-4">
                                <div className="flex bg-[#161623] p-1.5 rounded-lg mb-2 gap-1">
                                    <button type="button" onClick={() => setUploadMode('file')} className={`flex-1 min-h-[44px] py-2.5 text-xs font-bold rounded-md transition-all ${uploadMode === 'file' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>📁 Upload File</button>
                                    <button type="button" onClick={() => setUploadMode('url')} className={`flex-1 min-h-[44px] py-2.5 text-xs font-bold rounded-md transition-all ${uploadMode === 'url' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>🔗 External URL</button>
                                </div>

                                {uploadMode === 'file' ? (
                                    <div>
                                        <label className="label-default">Select File (PDF, Image, Doc)</label>
                                        <div className="relative group">
                                            <input 
                                                type="file" 
                                                onChange={e => setSelectedFile(e.target.files?.[0] || null)} 
                                                className="input-dark w-full pt-8 pb-3 cursor-pointer file:hidden"
                                                accept=".pdf,.doc,.docx,image/*" 
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-gray-500 group-hover:text-blue-400 transition-colors">
                                                {selectedFile ? `✅ ${selectedFile.name}` : 'Click to browse or drag and drop'}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="label-default">External File URL</label>
                                        <input required type="url" value={formData.file_url} onChange={e => setFormData({...formData, file_url: e.target.value})} className="input-dark w-full text-blue-400 font-mono" placeholder="https://google_drive_link.com/..." />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="label-default">Description</label>
                                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-dark w-full h-20" placeholder="Optional details..." />
                            </div>
                            <button disabled={saving} className="btn-primary w-full py-3 mt-4">
                                {saving ? 'Adding...' : 'Save Document'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
