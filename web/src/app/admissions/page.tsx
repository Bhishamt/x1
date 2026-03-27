import Navbar from '@/components/public/Navbar'
import Link from 'next/link'

export const metadata = {
    title: 'Admissions | ABC Polytechnic Institute',
    description: 'Apply for admission to our diploma engineering programs for the 2025-26 academic year.',
}

export default function AdmissionsPage() {
    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <Navbar />

            <div style={{ maxWidth: 800, margin: '0 auto', padding: '8rem 1.5rem 4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', border: '1px solid rgba(59,130,246,0.2)' }}>
                        🎓 ADMISSIONS OPEN FOR 2025-26
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.2 }}>Start Your Engineering Journey</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
                        Join ABC Polytechnic Institute and build a bright career in technology. We offer diploma programs approved by the HP Tech Board.
                    </p>
                </div>

                <div className="glass-card" style={{ padding: '3rem 2.5rem', textAlign: 'center', borderTop: '4px solid #3b82f6', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '1.5rem' }}>Apply Online</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
                        The admission process for the academic year 2025-26 is currently ongoing. Ensure you have all required documents ready before starting your application.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button className="btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                            Begin Application
                        </button>
                        <button className="btn-secondary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>
                            Download Prospectus
                        </button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
                        * Application portal is hosted securely.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', color: '#60a5fa' }}>📋</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Eligibility Criteria</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            10th pass for first-year entry. 12th PCM/ITI for lateral entry into the second year. Candidates must meet the HP Tech Board guidelines.
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem', color: '#a78bfa' }}>📞</div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Need Help?</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Our admission helpdesk is open Monday to Saturday, 9:00 AM to 5:00 PM. <br /><br />
                            <strong>Call:</strong> +91 98765 43210
                        </p>
                        <Link href="/contact" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: 600 }}>Message Us →</Link>
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    )
}
