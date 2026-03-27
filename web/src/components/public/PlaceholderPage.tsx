
import Link from 'next/link'

interface PlaceholderProps {
  title: string
  description?: string
}

export default function PlaceholderPage({ title, description = "Content for this section is coming soon. We are working hard to bring you the best experience." }: PlaceholderProps) {
  return (
    <div style={{ 
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', 
      padding: '4rem 1.5rem', background: 'var(--bg-primary)', color: 'var(--text-primary)' 
    }}>
      <div style={{ maxWidth: 600, textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-block', padding: '1rem', borderRadius: '1rem', 
          background: 'rgba(59,130,246,0.1)', marginBottom: '1.5rem', fontSize: '3rem' 
        }}>
          🚧
        </div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>{title}</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
          {description}
        </p>
        <Link href="/" className="btn-primary" style={{ textDecoration: 'none', padding: '0.75rem 2rem', display: 'inline-block' }}>
          Return Home
        </Link>
      </div>
    </div>
  )
}
