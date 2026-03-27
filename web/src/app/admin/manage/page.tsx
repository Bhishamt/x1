'use client'

import { useState, useEffect } from 'react'

import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import { ROLE_MAP } from '@/types/database.types'

type Department = { id: string; name: string }

type StaffUser = {
    user_id: string; name: string; email: string; role: string;
    department_id: string | null; phone: string | null; status: string; created_at: string
}

const STAFF_ROLES = [
    { id: 2, label: 'HOD' },
    { id: 3, label: 'Class Incharge' },
]

const getRoleLabel = (role: string) => role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function AdminManagePage() {
    const supabase = createClient()
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [currentRoleId, setCurrentRoleId] = useState<number>(99)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [form, setForm] = useState({
        email: '', password: '', full_name: '', role_id: 2,
        department_id: '', phone: '',
    })

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true)
            await Promise.all([loadCurrentRole(), loadDepartments()])
            setLoading(false)
        }
        loadAll()
    }, [])

    useEffect(() => {
        if (!loading && currentRoleId !== 99) {
            loadStaff()
            if (currentRoleId >= 2 && currentRoleId <= 3) {
                // Fetch user's department to lock the form
                const getDept = async () => {
                   const { data: { user } } = await supabase.auth.getUser()
                   if (user) {
                       const { data } = await supabase.from('users').select('department_id').eq('id', user.id).single()
                       const profile = data as any
                       if (profile?.department_id) setForm(prev => ({ ...prev, department_id: profile.department_id }))
                   }
                }
                getDept()
            }
        }
    }, [loading, currentRoleId])

    async function loadCurrentRole() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('users').select('role_id').eq('id', user.id).single()
            if (data) setCurrentRoleId((data as unknown as { role_id: number }).role_id)
        }
    }

    async function loadDepartments() {
        const { data } = await supabase.from('departments').select('id, name').eq('is_active', true)
        if (data) setDepartments(data)
    }

    async function loadStaff() {
        let q = (supabase.from('admins') as any).select('user_id, name, email, role, department_id, phone, status, created_at, departments(name)')
        
        if (currentRoleId >= 2 && currentRoleId <= 3) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: prof } = await supabase.from('users').select('department_id').eq('id', user.id).single()
                const profile = prof as any
                if (profile?.department_id) q = q.eq('department_id', profile.department_id)
            }
        }

        const { data } = await q.order('role').order('name')
        setStaffUsers((data ?? []) as unknown as StaffUser[])
    }

    async function createUser() {
        setSaving(true)
        try {
            const res = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const result = await res.json()
            if (!res.ok) { toast.error(result.error); return }
            toast.success('User created successfully')
            setShowModal(false)
            setForm({ email: '', password: '', full_name: '', role_id: 2, department_id: '', phone: '' })
            loadStaff()
        } catch {
            toast.error('Failed to create user')
        } finally { setSaving(false) }
    }

    async function toggleActive(userId: string, active: boolean) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('admins') as any)
            .update({ status: active ? 'active' : 'inactive' })
            .eq('user_id', userId)
        if (error) toast.error(error.message)
        else { toast.success(active ? 'User activated' : 'User deactivated'); loadStaff() }
    }

    async function deleteAccount(userId: string) {
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/${userId}`, {
                method: 'DELETE',
            })
            const result = await res.json()
            if (!res.ok) {
                toast.error(result.error || 'Failed to delete account')
                return
            }
            toast.success('Account deleted successfully')
            setShowDeleteModal(null)
            loadStaff()
        } catch {
            toast.error('An error occurred during deletion')
        } finally {
            setDeleting(false)
        }
    }

    // Only super_admin can access this page
    if (currentRoleId > 1) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <h2>🔒 Access Denied</h2>
                <p>Only Super Admin can access Admin Management.</p>
            </div>
        )
    }

    return (
        <div>
            <PageHeader
                title="Admin Management"
                subtitle="Create and manage staff accounts"
                icon="⚙️"
                action={<button onClick={() => setShowModal(true)} className="btn-primary">+ Create Staff Account</button>}
            />

            <div className="glass-card" style={{ overflowX: 'auto' }}>
                <table className="table-dark">
                    <thead>
                        <tr>
                            <th>Name</th><th>Email</th><th>Role</th>
                            <th>Department</th><th>Phone</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {staffUsers.map(u => {
                            const roleLabel = getRoleLabel(u.role)
                            const deptName = (u as any).departments?.name || departments.find(d => d.id === u.department_id)?.name || '—'
                            return (
                                <tr key={u.user_id}>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{u.email}</td>
                                    <td>
                                        <Badge variant={u.role === 'super_admin' ? 'warning' : u.role === 'admin' ? 'info' : 'default'}>
                                            {roleLabel}
                                        </Badge>
                                    </td>
                                    <td>{deptName}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{u.phone ?? '—'}</td>
                                    <td>
                                        <Badge variant={u.status === 'active' ? 'success' : 'danger'}>
                                            {u.status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {u.status !== 'active' ? (
                                                <button
                                                    onClick={() => toggleActive(u.user_id, true)}
                                                    className="btn-primary"
                                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                                >
                                                    Activate
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => toggleActive(u.user_id, false)}
                                                    className="btn-secondary"
                                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowDeleteModal(u.user_id)}
                                                className="btn-danger"
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                                disabled={u.role === 'super_admin'}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                {staffUsers.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No staff accounts found.
                    </div>
                )}
            </div>

            {/* Create Staff Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 540, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Create Staff Account</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Full Name *</label>
                                <input className="input-dark" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Email *</label>
                                <input className="input-dark" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Password *</label>
                                <input className="input-dark" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Role *</label>
                                <select className="input-dark" value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: Number(e.target.value) }))}>
                                    {STAFF_ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Department</label>
                                <select className="input-dark" value={form.department_id} disabled={currentRoleId >= 2 && currentRoleId <= 3} onChange={e => setForm({ ...form, department_id: e.target.value })}>
                                    <option value="">Select department…</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Phone</label>
                                <input className="input-dark" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button
                                onClick={createUser}
                                className="btn-primary"
                                disabled={saving || !form.email || !form.password || !form.full_name}
                            >
                                {saving ? 'Creating…' : 'Create Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div className="glass-card" style={{ maxWidth: 400, padding: '2rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
                        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Are you sure you want to delete this admin account?</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                            This action cannot be undone. All associated data for this staff member will be permanently removed.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setShowDeleteModal(null)} className="btn-secondary" disabled={deleting}>Cancel</button>
                            <button
                                onClick={() => deleteAccount(showDeleteModal)}
                                className="btn-danger"
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting…' : 'Delete Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
