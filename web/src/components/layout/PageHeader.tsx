import { cn } from '@/lib/utils'

interface PageHeaderProps {
    title: string
    subtitle?: string
    icon?: string
    action?: React.ReactNode
}

export default function PageHeader({ title, subtitle, icon, action }: PageHeaderProps) {
    return (
        <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {icon && (
                    <div style={{
                        width: 48, height: 48, borderRadius: '0.75rem',
                        background: 'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(139,92,246,0.2))',
                        border: '1px solid rgba(59,130,246,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                    }}>{icon}</div>
                )}
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {title}
                    </h1>
                    {subtitle && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {action && <div>{action}</div>}
        </div>
    )
}
