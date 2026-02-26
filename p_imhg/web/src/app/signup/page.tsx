'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
    'Computer Engineering',
    'Civil Engineering',
    'Mechanical Engineering',
    'Electrical Engineering',
    'Electronics & Communication',
    'Information Technology',
]

export default function SignupPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        confirm_password: '',
        department: '',
        roll_no: '',
        year: '1',
        phone: '',
    })

    function set(field: string, value: string) {
        setForm(f => ({ ...f, [field]: value }))
    }

    async function handleSignup(e: React.FormEvent) {
        e.preventDefault()

        // Validation
        if (!form.full_name.trim()) { toast.error('Full name is required'); return }
        if (!form.department) { toast.error('Please select a department'); return }
        if (!form.roll_no.trim()) { toast.error('Roll number is required'); return }
        if (!/^\d{1,3}$/.test(form.roll_no.trim())) {
            toast.error('Roll number must be 1–3 digits only (e.g. 4, 04, 125)'); return
        }
        const year = Number(form.year)
        if (year < 1 || year > 4) { toast.error('Academic year must be 1–4'); return }
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
        if (form.password !== form.confirm_password) { toast.error('Passwords do not match'); return }

        setLoading(true)
        try {
            // Step 1: Create Auth account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: form.email.trim(),
                password: form.password,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
            })

            if (authError) {
                if (authError.message.includes('already registered')) {
                    toast.error('An account with this email already exists.')
                } else {
                    toast.error(authError.message)
                }
                return
            }

            if (!authData.user) { toast.error('Signup failed. Please try again.'); return }

            // Step 2: Update profile fields — trigger handle_new_user() already created the row
            const { error: profileError } = await (supabase.from('users') as any)
                .update({
                    full_name: form.full_name.trim(),
                    department: form.department,
                    roll_no: form.roll_no.trim(),
                    year: year,
                    phone: form.phone.trim() || null,
                    is_active: true,
                })
                .eq('id', authData.user.id)

            if (profileError) {
                if (profileError.message.includes('duplicate') || profileError.code === '23505') {
                    if (profileError.message.includes('roll_no')) {
                        toast.error('Roll number already exists. Please check your roll number.')
                    } else if (profileError.message.includes('email')) {
                        toast.error('Email already exists.')
                    } else {
                        toast.error('Account already exists. Please login instead.')
                    }
                } else {
                    toast.error(profileError.message)
                }
                // Cleanup: delete the auth user since profile insert failed
                await supabase.auth.signOut()
                return
            }

            toast.success('Account created! Please check your email to verify, then login.')
            router.push('/login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem 1rem',
        }}>
            {/* Background glow */}
            <div style={{
                position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
                background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 60%)'
            }} />

            <div style={{ width: '100%', maxWidth: 560, position: 'relative', zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: '1rem',
                        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.75rem', marginBottom: '1rem', boxShadow: '0 8px 32px rgba(59,130,246,0.3)'
                    }}>🎓</div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                        Create Student Account
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.4rem' }}>
                        ABC Polytechnic Institute
                    </p>
                </div>

                <form onSubmit={handleSignup} className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Row 1: Full Name */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Full Name *
                        </label>
                        <input
                            className="input-dark"
                            type="text"
                            placeholder="Bhisham Thakur"
                            value={form.full_name}
                            onChange={e => set('full_name', e.target.value)}
                            required
                        />
                    </div>

                    {/* Row 2: Email */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Email Address *
                        </label>
                        <input
                            className="input-dark"
                            type="email"
                            placeholder="student@college.edu"
                            value={form.email}
                            onChange={e => set('email', e.target.value)}
                            required
                        />
                    </div>

                    {/* Row 3: Department + Roll No */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Department *
                            </label>
                            <select
                                className="input-dark"
                                value={form.department}
                                onChange={e => set('department', e.target.value)}
                                required
                            >
                                <option value="">Select…</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Roll Number *
                            </label>
                            <input
                                className="input-dark"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="e.g. 04"
                                value={form.roll_no}
                                onChange={e => set('roll_no', e.target.value.replace(/\D/g, ''))}
                                maxLength={3}
                                required
                            />
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Digits only, 1–3 characters (e.g. 4, 04, 125)
                            </p>
                        </div>
                    </div>

                    {/* Row 4: Year + Phone */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Academic Year *
                            </label>
                            <select
                                className="input-dark"
                                value={form.year}
                                onChange={e => set('year', e.target.value)}
                                required
                            >
                                <option value="1">1st Year</option>
                                <option value="2">2nd Year</option>
                                <option value="3">3rd Year</option>
                                <option value="4">4th Year</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Phone
                            </label>
                            <input
                                className="input-dark"
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={form.phone}
                                onChange={e => set('phone', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Row 5: Password + Confirm */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Password *
                            </label>
                            <input
                                className="input-dark"
                                type="password"
                                placeholder="Min 6 characters"
                                value={form.password}
                                onChange={e => set('password', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Confirm Password *
                            </label>
                            <input
                                className="input-dark"
                                type="password"
                                placeholder="Repeat password"
                                value={form.confirm_password}
                                onChange={e => set('confirm_password', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
                    >
                        {loading ? 'Creating account…' : 'Create Account'}
                    </button>

                    {/* Login link */}
                    <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                            Sign in
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}
