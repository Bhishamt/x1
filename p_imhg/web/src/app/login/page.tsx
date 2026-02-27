'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        try {
            console.log("Login start")
            console.log("Email:", email)
            console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

            const { error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) {
                console.error("FULL LOGIN ERROR:", error)
                toast.error(error.message);
                return
            }

            // Fetch role to redirect properly
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: rawProfile } = await supabase
                .from('users')
                .select('role_id')
                .eq('id', user.id)
                .single()
            const profile = rawProfile as unknown as { role_id: number } | null

            toast.success('Welcome back!')
            router.push(profile?.role_id === 1 ? '/admin/dashboard' : '/student/profile')
            router.refresh()
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
            style={{ background: 'var(--bg-primary)' }}>
            {/* Animated background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div style={{
                    position: 'absolute', top: '10%', left: '15%',
                    width: 400, height: 400, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }} />
                <div style={{
                    position: 'absolute', bottom: '10%', right: '15%',
                    width: 350, height: 350, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
                    filter: 'blur(40px)',
                }} />
            </div>

            <div className="fade-in glass-card glow-blue w-full max-w-md mx-4 p-8 relative z-10">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 8px 32px rgba(59,130,246,0.35)' }}>
                        <span style={{ fontSize: '1.75rem' }}>🎓</span>
                    </div>
                    <h1 className="text-2xl font-bold gradient-text mb-1">ABC Polytechnic</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Digital Platform — Sign in to continue
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: '0.5rem'
                        }}>
                            Email Address
                        </label>
                        <input
                            className="input-dark"
                            type="email"
                            placeholder="you@abcpolytechnic.edu"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label style={{
                            display: 'block', fontSize: '0.8rem', fontWeight: 600,
                            color: 'var(--text-secondary)', marginBottom: '0.5rem'
                        }}>
                            Password
                        </label>
                        <input
                            className="input-dark"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary w-full mt-2"
                        disabled={loading}
                        style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }}
                    >
                        {loading ? (
                            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <svg style={{ animation: 'spin 1s linear infinite', width: 18, height: 18 }}
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                </svg>
                                Signing in…
                            </span>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    New student?{' '}
                    <a href="/signup" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                        Create account
                    </a>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}
