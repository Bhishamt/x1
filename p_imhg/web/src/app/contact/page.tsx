import Navbar from '@/components/public/Navbar'
import Link from 'next/link'

const CONTACTS = [
    { icon: '📍', label: 'Address', value: 'Sunder Nagar, Mandi District, Himachal Pradesh — 175002' },
    { icon: '📞', label: 'Phone', value: '+91 1905-000000' },
    { icon: '✉️', label: 'Email', value: 'info@abcpolytechnic.edu.in' },
    { icon: '🕐', label: 'Office Hours', value: 'Mon–Sat: 9:00 AM – 5:00 PM' },
]

export default function ContactPage() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <Navbar />
            <div style={{ maxWidth: 800, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Contact Us</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>We're here to help. Reach out to us anytime.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {CONTACTS.map(c => (
                        <div key={c.label} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{c.icon}</span>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{c.label}</div>
                                <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{c.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    )
}
