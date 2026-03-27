'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type Dept = { id: string; name: string; code: string }

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [depts, setDepts] = useState<Dept[]>([])
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        department_id: '',
        roll_no: '',
        semester: '1',
        phone: '',
    })

    useEffect(() => {
        supabase.from('departments').select('id, name, code')
            .neq('code', 'COMMON')
            .order('name')
            .then(({ data }) => setDepts((data as Dept[]) ?? []))
    }, [])

    function set(field: string, value: string) {
        setForm(f => ({ ...f, [field]: value }))
    }

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()

        if (!form.full_name.trim()) { toast.error('Full name is required'); return }
        if (!form.department_id) { toast.error('Please select a department'); return }
        if (!form.roll_no.trim()) { toast.error('Roll number is required'); return }
        if (!/^\d{1,3}$/.test(form.roll_no.trim())) {
            toast.error('Roll number must be 1–3 digits only'); return
        }
        const semester = Number(form.semester)
        if (semester < 1 || semester > 6) { toast.error('Semester must be 1–6'); return }
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
        if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return }

        setLoading(true)
        try {
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email.trim(),
                password: form.password,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
            })

            if (authError) {
                toast.error(authError.message.includes('already registered') ? 'An account with this email already exists.' : authError.message)
                return
            }
            if (!authData.user) { toast.error('Signup failed. Please try again.'); return }

            // Update profile — trigger handle_new_user() already created the row
            const { error: profileError } = await (supabase.from('users') as any)
                .update({
                    full_name: form.full_name.trim(),
                    department_id: form.department_id,
                    roll_no: parseInt(form.roll_no.trim()),
                    year: Math.ceil(semester / 2),
                    semester,
                    phone: form.phone.trim() || null,
                    is_active: true,
                })
                .eq('id', authData.user.id)

            if (profileError) {
                if (profileError.code === '23505') {
                    if (profileError.message.includes('roll_no')) {
                        toast.error('Roll number already taken. Please check your roll number.')
                    } else {
                        toast.error('Account already exists. Please login instead.')
                    }
                } else {
                    toast.error(profileError.message)
                }
                await supabase.auth.signOut()
                return
            }

            toast.success('Account created! Please check your email to verify, then login.')
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }

    const fieldLabel = (text: string) => (
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>
            {text}
        </label>
    )

    const pwField = (key: 'password' | 'confirm_password', show: boolean, toggle: () => void, label: string, placeholder: string) => (
        <div>
            {fieldLabel(label)}
            <div style={{ position: 'relative' }}>
                <input
                    className="input-dark"
                    type={show ? 'text' : 'password'}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    required
                    style={{ paddingRight: '3rem' }}
                />
                <button type="button" onClick={toggle} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem', padding: 0 }}>
                    {show ? '🙈' : '👁️'}
                </button>
            </div>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
            <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />

            <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '1rem', background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1rem', boxShadow: '0 8px 32px rgba(59,130,246,0.3)' }}>🎓</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Create Student Account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.4rem' }}>ABC Polytechnic Institute</p>
                </div>

                <form onSubmit={handleSignup} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Full Name */}
                    <div>
                        {fieldLabel('Full Name *')}
                        <input className="input-dark" type="text" placeholder="Bhisham Thakur" value={form.full_name} onChange={e => set('full_name', e.target.value)} required />
                    </div>

                    {/* Email */}
                    <div>
                        {fieldLabel('Email Address *')}
                        <input className="input-dark" type="email" placeholder="student@college.edu" value={form.email} onChange={e => set('email', e.target.value)} required />
                    </div>

                    {/* Department + Roll No */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            {fieldLabel('Department *')}
                            <select className="input-dark" value={form.department_id} onChange={e => set('department_id', e.target.value)} required>
                                <option value="">Select…</option>
                                {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            {fieldLabel('Roll Number *')}
                            <input className="input-dark" type="text" inputMode="numeric" pattern="[0-9]*" placeholder="e.g. 04" value={form.roll_no} onChange={e => set('roll_no', e.target.value.replace(/\D/g, ''))} maxLength={3} required />
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Digits only, 1–3 characters</p>
                        </div>
                    </div>

                    {/* Semester + Phone */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            {fieldLabel('Semester *')}
                            <select className="input-dark" value={form.semester} onChange={e => set('semester', e.target.value)} required>
                                {[1,2,3,4,5,6].map(s => <option key={s} value={s}>{s}{['st','nd','rd','th','th','th'][s-1]} Semester</option>)}
                            </select>
                        </div>
                        <div>
                            {fieldLabel('Phone')}
                            <input className="input-dark" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                        </div>
                    </div>

                    {/* Passwords */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        {pwField('password', showPassword, () => setShowPassword(v => !v), 'Password *', 'Min 6 characters')}
                        {pwField('confirm_password', showConfirm, () => setShowConfirm(v => !v), 'Confirm Password *', 'Repeat password')}
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}>
                        {loading ? 'Creating account…' : 'Create Account'}
                    </button>

                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
