'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import PageHeader from '@/components/layout/PageHeader'
import toast from 'react-hot-toast'

export default function AdminProfilePage() {
    const supabase = createClient()
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [showEdit, setShowEdit] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [saving, setSaving] = useState(false)
    const [fullName, setFullName] = useState('')
    const [newPassword, setNewPassword] = useState('')

    useEffect(() => {
        loadProfile()
    }, [])

    async function loadProfile() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { window.location.href = '/login'; return }

        const { data } = await (supabase.from('users') as any)
            .select('full_name, email, is_active, created_at, role_id')
            .eq('id', user.id)
            .single()

        if (data) {
            setProfile(data)
            setFullName(data.full_name)
        }
        setLoading(false)
    }

    async function handleUpdateProfile() {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await (supabase.from('users') as any).update({ full_name: fullName }).eq('id', user?.id)
        if (error) toast.error(error.message)
        else {
            toast.success('Profile updated')
            setShowEdit(false)
            loadProfile()
        }
        setSaving(false)
    }

    async function handleChangePassword() {
        if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return }
        setSaving(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) toast.error(error.message)
        else {
            toast.success('Password updated successfully')
            setShowPassword(false)
            setNewPassword('')
        }
        setSaving(false)
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>
    if (!profile) return null

    const fields = [
        { label: 'Full Name', value: profile.full_name, icon: '👤' },
        { label: 'Email', value: profile.email, icon: '📧' },
        { label: 'Post / Role', value: profile.role_id === 1 ? 'Super Admin' : profile.role_id === 2 ? 'HOD' : 'Staff', icon: '⚡' },
        { label: 'Member Since', value: new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: '📆' },
        { label: 'Status', value: profile.is_active ? 'Active' : 'Inactive', icon: '🟢' },
    ]

    return (
        <div>
            <PageHeader title="Admin Profile" subtitle="Your account information" icon="⚡" />

            <div className="glass-card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ height: 120, background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.4))' }} />
                <div style={{ padding: '0 2rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                        <div style={{
                            width: 90, height: 90, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                            border: '4px solid var(--bg-card)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', marginTop: -45,
                            boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
                            color: 'white'
                        }}>
                            {profile.full_name?.[0]?.toUpperCase() ?? '⚡'}
                        </div>
                        <div style={{ paddingBottom: '0.25rem' }}>
                            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{(profile as any).full_name}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>{(profile as any).role_id === 1 ? 'Super Admin' : 'Academic Admin'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={() => setShowPassword(true)} className="btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>🔑 Password</button>
                        <button onClick={() => setShowEdit(true)} className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>✏️ Edit Profile</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {fields.map(f => (
                    <div key={f.label} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: 42, height: 42, borderRadius: '0.625rem', fontSize: '1.25rem', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{f.icon}</div>
                        <div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.2rem' }}>{f.label}</p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>{(f as any).value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {showEdit && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem' }}>Edit Profile</h3>
                        <label className="label-default">Full Name</label>
                        <input className="input-dark" value={fullName} onChange={e => setFullName(e.target.value)} />
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                            <button onClick={handleUpdateProfile} disabled={saving} className="btn-primary" style={{ flex: 1 }}>{saving ? 'Saving...' : 'Save'}</button>
                            <button onClick={() => setShowEdit(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {showPassword && (
                <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: 400, padding: '2rem' }}>
                        <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.125rem' }}>Change Password</h3>
                        <label className="label-default">New Password</label>
                        <input className="input-dark" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                            <button onClick={handleChangePassword} disabled={saving} className="btn-primary" style={{ flex: 1 }}>{saving ? 'Updating...' : 'Update Password'}</button>
                            <button onClick={() => setShowPassword(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
