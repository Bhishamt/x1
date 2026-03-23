'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'
import { ROLE_MAP, DEPARTMENTS } from '@/types/database.types'

type StaffUser = {
    id: string; full_name: string; email: string; role_id: number;
    department: string | null; phone: string | null; is_active: boolean; created_at: string
}

const STAFF_ROLES = [
    { id: 2, label: 'Admin' },
    { id: 3, label: 'HOD' },
    { id: 4, label: 'Class Incharge' },
]

export default function AdminManagePage() {
    const supabase = createClient()
    const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
    const [currentRoleId, setCurrentRoleId] = useState<number>(99)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [form, setForm] = useState({
        email: '', password: '', full_name: '', role_id: 2,
        department: '', phone: '',
    })

    useEffect(() => { loadStaff(); loadCurrentRole() }, [])

    async function loadCurrentRole() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase.from('users').select('role_id').eq('id', user.id).single()
            if (data) setCurrentRoleId((data as unknown as { role_id: number }).role_id)
        }
    }

    async function loadStaff() {
        const { data } = await supabase
            .from('users')
            .select('id, full_name, email, role_id, department, phone, is_active, created_at')
            .in('role_id', [1, 2, 3, 4])
            .order('role_id')
            .order('full_name')
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
            setForm({ email: '', password: '', full_name: '', role_id: 2, department: '', phone: '' })
            loadStaff()
        } catch {
            toast.error('Failed to create user')
        } finally { setSaving(false) }
    }

    async function toggleActive(userId: string, active: boolean) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('users') as any)
            .update({ is_active: active })
            .eq('id', userId)
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
                            const roleName = ROLE_MAP[u.role_id] ?? 'unknown'
                            const roleLabel = roleName.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                            return (
                                <tr key={u.id}>
                                    <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{u.full_name}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{u.email}</td>
                                    <td>
                                        <Badge variant={u.role_id === 1 ? 'warning' : u.role_id === 2 ? 'info' : 'default'}>
                                            {roleLabel}
                                        </Badge>
                                    </td>
                                    <td>{u.department ?? '—'}</td>
                                    <td style={{ fontSize: '0.8rem' }}>{u.phone ?? '—'}</td>
                                    <td>
                                        <Badge variant={u.is_active ? 'success' : 'danger'}>
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {!u.is_active ? (
                                                <button
                                                    onClick={() => toggleActive(u.id, true)}
                                                    className="btn-primary"
                                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                                >
                                                    Activate
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => toggleActive(u.id, false)}
                                                    className="btn-secondary"
                                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                                >
                                                    Deactivate
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setShowDeleteModal(u.id)}
                                                className="btn-danger"
                                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                                                disabled={u.role_id === 1 && u.id === staffUsers.find(user => user.role_id === 1)?.id} // Prevent self-delete hint
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
                                <select className="input-dark" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                                    <option value="">Select department…</option>
                                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
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
