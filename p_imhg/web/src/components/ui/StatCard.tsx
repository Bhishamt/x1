interface StatCardProps {
    label: string
    value: string | number
    icon: string
    color?: string
    sub?: string
}

export default function StatCard({ label, value, icon, color = '#3b82f6', sub }: StatCardProps) {
    return (
        <div className="stat-card" style={{ borderLeft: `3px solid ${color}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{
                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.5rem'
                    }}>
                        {label}
                    </p>
                    <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>
                        {value}
                    </p>
                    {sub && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>{sub}</p>}
                </div>
                <div style={{
                    width: 44, height: 44, borderRadius: '0.75rem', fontSize: '1.375rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${color}22`, border: `1px solid ${color}44`,
                }}>{icon}</div>
            </div>
        </div>
    )
}
