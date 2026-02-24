import Navbar from '@/components/public/Navbar'
import Link from 'next/link'

export default function AboutPage() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <Navbar />
            <div style={{ maxWidth: 900, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem' }}>About Us</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.8 }}>
                    ABC Polytechnic Institute was established in 2000 under the Himachal Pradesh State Board of Technical Education, Dharamshala. Located in the scenic Sunder Nagar valley, we offer 6 government-approved 3-year diploma engineering programs.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.5rem', marginTop: '3rem' }}>
                    {[['🏛️', 'Established', '2000'], ['👨‍🏫', 'Faculty Members', '50+'], ['🎓', 'Alumni', '5000+'], ['🏭', 'Industry Partners', '30+']].map(([icon, label, value]) => (
                        <div key={label} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6' }}>{value}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{label}</div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    )
}
