import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'

export default async function AdminProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: rawProfile } = await supabase
        .from('users')
        .select('full_name, email, is_active, created_at, role_id')
        .eq('id', user.id)
        .single()

    const profile = rawProfile as unknown as {
        full_name: string; email: string; is_active: boolean; created_at: string; role_id: number
    } | null

    if (!profile || profile.role_id !== 1) redirect('/student/profile')

    const fields = [
        { label: 'Full Name', value: profile.full_name, icon: '👤' },
        { label: 'Email', value: profile.email, icon: '📧' },
        { label: 'Post / Role', value: 'Administrator', icon: '⚡' },
        { label: 'Institution', value: 'ABC Polytechnic Institute', icon: '🏛️' },
        { label: 'Member Since', value: new Date(profile.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: '📆' },
        { label: 'Status', value: profile.is_active ? 'Active' : 'Inactive', icon: '🟢' },
    ]

    return (
        <div>
            <PageHeader title="Admin Profile" subtitle="Your account information" icon="⚡" />

            {/* Avatar + Banner */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ height: 120, background: 'linear-gradient(135deg, rgba(59,130,246,0.4), rgba(139,92,246,0.4))' }} />
                <div style={{ padding: '0 2rem 2rem' }}>
                    <div style={{
                        width: 90, height: 90, borderRadius: '50%',
                        background: 'linear-gradient(135deg,#f59e0b,#ef4444)',
                        border: '4px solid var(--bg-card)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '2.5rem', marginTop: -45,
                        boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
                    }}>
                        {profile.full_name?.[0]?.toUpperCase() ?? '⚡'}
                    </div>
                    <div style={{ marginTop: '0.75rem' }}>
                        <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {profile.full_name}
                        </h2>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.375rem' }}>
                            <span style={{
                                background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)',
                                color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700,
                                padding: '0.15rem 0.6rem', borderRadius: '9999px', letterSpacing: '0.05em',
                            }}>
                                ⚡ ADMINISTRATOR
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>ABC Polytechnic Institute</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {fields.map(f => (
                    <div key={f.label} className="glass-card" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            width: 42, height: 42, borderRadius: '0.625rem', fontSize: '1.25rem',
                            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>{f.icon}</div>
                        <div>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.2rem' }}>
                                {f.label}
                            </p>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                                {f.value}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
