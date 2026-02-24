'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/layout/PageHeader'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const DEPARTMENTS = ['Computer Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Electronics & Communication', 'Information Technology']

interface Profile {
    id: string; full_name: string; email: string; roll_no: string | null
    department: string | null; year: number | null; phone: string | null
    is_active: boolean; created_at: string
}

export default function StudentProfilePage() {
    const router = useRouter()
    const supabase = createClient()

    const [profile, setProfile] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)

    // edit form state
    const [rollNo, setRollNo] = useState('')
    const [dept, setDept] = useState('')
    const [year, setYear] = useState('')
    const [phone, setPhone] = useState('')
    const [fullName, setFullName] = useState('')

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) { router.push('/login'); return }
            const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
            if (!data) { router.push('/login'); return }
            const p = data as unknown as Profile
            setProfile(p)
            // prefill edit form
            setFullName(p.full_name ?? '')
            setRollNo(p.roll_no ?? '')
            setDept(p.department ?? '')
            setYear(p.year ? String(p.year) : '')
            setPhone(p.phone ?? '')
            setLoading(false)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function handleSave() {
        if (!profile) return
        if (!rollNo.trim()) { toast.error('Roll number is required'); return }
        if (!dept) { toast.error('Please select a department'); return }
        if (!year) { toast.error('Please select academic year'); return }

        setSaving(true)
        const { error } = await (supabase.from('users') as any).update({
            full_name: fullName.trim(),
            roll_no: rollNo.trim().toUpperCase(),
            department: dept,
            year: parseInt(year),
            phone: phone.trim() || null,
        }).eq('id', profile.id)

        if (error) {
            if (error.code === '23505') toast.error('Roll number already taken by another student')
            else toast.error('Could not save: ' + error.message)
        } else {
            setProfile(prev => prev ? { ...prev, full_name: fullName.trim(), roll_no: rollNo.trim().toUpperCase(), department: dept, year: parseInt(year), phone: phone.trim() || null } : prev)
            setEditing(false)
            toast.success('Profile updated!')
        }
        setSaving(false)
    }

    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
            <div className="spinner" />
        </div>
    )
    if (!profile) return null

    const infoFields = [
        { label: 'Full Name', value: profile.full_name, icon: '👤' },
        { label: 'Email', value: profile.email, icon: '📧' },
        { label: 'Roll Number', value: profile.roll_no ?? 'N/A', icon: '🆔', missing: !profile.roll_no },
        { label: 'Department', value: profile.department ?? 'N/A', icon: '🏛️', missing: !profile.department },
        { label: 'Academic Year', value: profile.year ? `Year ${profile.year}` : 'N/A', icon: '📅', missing: !profile.year },
        { label: 'Phone', value: profile.phone ?? 'Not set', icon: '📞' },
        { label: 'Member Since', value: new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: '📆' },
        { label: 'Status', value: profile.is_active ? 'Active' : 'Inactive', icon: '🟢' },
    ]

    const hasMissing = !profile.roll_no || !profile.department || !profile.year

    return (
        <div>
            <PageHeader title="My Profile" subtitle="Your academic information" icon="👤" />

            {/* Avatar + Banner */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ height: 120, background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))' }} />
                <div style={{ padding: '0 2rem 2rem', position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                        <div style={{
                            width: 90, height: 90, borderRadius: '50%',
                            background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                            border: '4px solid var(--bg-card)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', marginTop: -45,
                            boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
                        }}>
                            {profile.full_name?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div style={{ paddingBottom: '0.25rem' }}>
                            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{profile.full_name}</h2>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                                {profile.roll_no ?? 'No Roll No'} · {profile.department ?? 'ABC Polytechnic'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditing(!editing)}
                        className={editing ? 'btn-secondary' : 'btn-primary'}
                        style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}
                    >
                        {editing ? '✕ Cancel' : '✏️ Edit Profile'}
                    </button>
                </div>
            </div>

            {/* Missing info banner */}
            {hasMissing && !editing && (
                <div style={{
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                    borderRadius: '0.75rem', padding: '0.875rem 1.25rem',
                    marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>⚠️</span>
                    <div>
                        <div style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.875rem' }}>Profile Incomplete</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            Roll number, department, and academic year are missing. Click <strong style={{ color: 'var(--text-primary)' }}>Edit Profile</strong> to fill them in.
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Form */}
            {editing && (
                <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>✏️ Edit Profile</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>Full Name</label>
                            <input className="input-dark" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>
                                Roll Number <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input className="input-dark" value={rollNo} onChange={e => setRollNo(e.target.value)} placeholder="e.g. CE2021001" />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>
                                Department <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select className="input-dark" value={dept} onChange={e => setDept(e.target.value)} style={{ cursor: 'pointer' }}>
                                <option value="">Select department…</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>
                                Academic Year <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <select className="input-dark" value={year} onChange={e => setYear(e.target.value)} style={{ cursor: 'pointer' }}>
                                <option value="">Select year…</option>
                                <option value="1">Year 1 (First Year)</option>
                                <option value="2">Year 2 (Second Year)</option>
                                <option value="3">Year 3 (Third Year)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.375rem' }}>Phone</label>
                            <input className="input-dark" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" type="tel" />
                        </div>
                    </div>

                    <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                        <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem' }}>
                            {saving ? '⏳ Saving…' : '💾 Save Changes'}
                        </button>
                        <button onClick={() => setEditing(false)} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1rem' }}>
                {infoFields.map(f => (
                    <div key={f.label} className="glass-card" style={{
                        padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center',
                        border: (f as any).missing ? '1px solid rgba(245,158,11,0.3)' : undefined,
                    }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: '0.625rem', fontSize: '1.25rem',
                            background: (f as any).missing ? 'rgba(245,158,11,0.1)' : 'rgba(59,130,246,0.1)',
                            border: `1px solid ${(f as any).missing ? 'rgba(245,158,11,0.2)' : 'rgba(59,130,246,0.2)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{f.icon}</div>
                        <div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.2rem' }}>
                                {f.label}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: (f as any).missing ? '#fbbf24' : 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                                {f.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
