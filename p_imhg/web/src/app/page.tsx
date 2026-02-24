import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const COURSES = [
  { code: 'CE', name: 'Civil Engineering', icon: '🏗️', duration: '3 Years', seats: 60 },
  { code: 'ME', name: 'Mechanical Engineering', icon: '⚙️', duration: '3 Years', seats: 60 },
  { code: 'EE', name: 'Electrical Engineering', icon: '⚡', duration: '3 Years', seats: 60 },
  { code: 'CS', name: 'Computer Engineering', icon: '💻', duration: '3 Years', seats: 60 },
  { code: 'EC', name: 'Electronics & Communication', icon: '📡', duration: '3 Years', seats: 60 },
  { code: 'IT', name: 'Information Technology', icon: '🌐', duration: '3 Years', seats: 60 },
]

const PLACEMENTS = [
  { company: 'Infosys', package: '3.6 LPA', logo: '🏢' },
  { company: 'TCS', package: '3.5 LPA', logo: '🏭' },
  { company: 'L&T', package: '4.2 LPA', logo: '🔧' },
  { company: 'Wipro', package: '3.8 LPA', logo: '💼' },
]

const GALLERY = ['🏫', '🔬', '📚', '🖥️', '⚽', '🎭', '🏆', '🌳']

export default async function HomePage() {
  const supabase = await createClient()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id,title,category,created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(5)
  const ann = (announcements ?? []) as { id: string; title: string; category: string; created_at: string }[]

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      {/* ── Notice Ticker ── */}
      {ann.length > 0 && (
        <div style={{
          marginTop: 64, background: 'rgba(59,130,246,0.12)', borderBottom: '1px solid rgba(59,130,246,0.2)',
          padding: '0.5rem 0', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 1rem' }}>
            <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '0.25rem', flexShrink: 0, letterSpacing: '0.05em' }}>
              NOTICE
            </span>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="ticker-wrap">
                {[...ann, ...ann].map((a, i) => (
                  <span key={i} style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginRight: '3rem' }}>
                    📌 {a.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <section style={{
        marginTop: ann.length ? 0 : 64,
        minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4rem 1.5rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(59,130,246,0.07)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(139,92,246,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: '9999px', padding: '0.375rem 1rem', fontSize: '0.8rem', color: '#93c5fd', marginBottom: '1.5rem', fontWeight: 500 }}>
            🎓 Government Recognized Polytechnic Institute
          </div>
          <h1 style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 1.25rem', letterSpacing: '-0.02em' }}>
            <span>Shaping </span>
            <span style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Tomorrow&apos;s Engineers
            </span>
            <span> Today</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            ABC Polytechnic Institute offers world-class diploma engineering programs with state-of-the-art infrastructure, experienced faculty, and 90%+ placement record.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="btn-primary hero-btn" style={{ padding: '0.875rem 2rem', fontSize: '1rem', textDecoration: 'none', borderRadius: '0.625rem' }}>
              Student Portal →
            </Link>
            <Link href="/courses" className="hero-btn-outline" style={{
              padding: '0.875rem 2rem', fontSize: '1rem', textDecoration: 'none',
              border: '1px solid var(--border)', borderRadius: '0.625rem', color: 'var(--text-primary)',
              background: 'rgba(255,255,255,0.04)', fontWeight: 600,
            }}>
              Explore Courses
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '3.5rem', flexWrap: 'wrap' }}>
            {[['2000+', 'Students'], ['50+', 'Faculty'], ['90%', 'Placement'], ['25+', 'Years']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#3b82f6' }}>{n}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick Links ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: '📋', label: 'Admissions', desc: 'Apply now for 2025-26', href: '/admissions' },
            { icon: '📊', label: 'Results', desc: 'Check your scores', href: '/login' },
            { icon: '🔔', label: 'Notifications', desc: 'Stay updated', href: '/login' },
            { icon: '📢', label: 'Announcements', desc: 'Latest notices', href: '/notices' },
          ].map(q => (
            <Link key={q.label} href={q.href} className="quick-link-card" style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '3px solid #3b82f6' }}>
                <span style={{ fontSize: '2rem' }}>{q.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{q.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{q.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Courses ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Diploma Programs</h2>
          <p style={{ color: 'var(--text-secondary)' }}>6 government-approved 3-year diploma engineering courses</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {COURSES.map(c => (
            <div key={c.code} className="glass-card course-card" style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{c.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 0.5rem' }}>{c.name}</h3>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>{c.duration}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(59,130,246,0.1)', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>Seats: {c.seats}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Latest Announcements ── */}
      {ann.length > 0 && (
        <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>📢 Latest Announcements</h2>
            <Link href="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {ann.map(a => (
              <div key={a.id} className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(59,130,246,0.15)', color: '#93c5fd', flexShrink: 0 }}>
                  {a.category.toUpperCase()}
                </span>
                <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', flex: 1 }}>{a.title}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', flexShrink: 0 }}>
                  {new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Placement Highlights ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem' }}>🏆 Placement Highlights</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Our students placed in top companies</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {PLACEMENTS.map(p => (
            <div key={p.company} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{p.logo}</div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.company}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#3b82f6', marginTop: '0.25rem' }}>{p.package}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Campus Gallery ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.5rem' }}>📸 Campus Gallery</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Life at ABC Polytechnic</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {GALLERY.map((emoji, i) => (
            <div key={i} className="gallery-tile" style={{
              aspectRatio: '1', borderRadius: '0.75rem',
              background: `linear-gradient(135deg, hsl(${(i * 47) % 360},50%,15%), hsl(${(i * 47 + 60) % 360},50%,20%))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', border: '1px solid var(--border)',
            }}>
              {emoji}
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', marginTop: '3rem', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🎓</span>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>ABC Polytechnic</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7 }}>
              Empowering students with technical education since 2000.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {['About', 'Courses', 'Admissions', 'Faculty', 'Contact'].map(l => (
                <Link key={l} href={`/${l.toLowerCase()}`} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem' }}>{l}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Contact</h4>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 2 }}>
              <div>📍 Sundernagar, Himachal Pradesh</div>
              <div>📞 +91 1905-000000</div>
              <div>✉️ info@abcpolytechnic.edu.in</div>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Student Portal</h4>
            <Link href="/login" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '0.625rem 1.25rem', fontSize: '0.85rem' }}>
              Login / Sign Up
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
              Access results, notifications &amp; chatbot
            </p>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          © {new Date().getFullYear()} ABC Polytechnic Institute. All rights reserved.
        </div>
      </footer>

      <style>{`
                @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .ticker-wrap { display: flex; animation: ticker 30s linear infinite; white-space: nowrap; }
                .quick-link-card:hover .glass-card { transform: translateY(-3px); border-color: rgba(59,130,246,0.4); }
                .quick-link-card .glass-card { transition: transform 0.2s, border-color 0.2s; }
                .course-card { transition: transform 0.2s, border-color 0.2s; }
                .course-card:hover { transform: translateY(-4px); border-color: rgba(59,130,246,0.4); }
                .gallery-tile { transition: transform 0.2s; cursor: pointer; }
                .gallery-tile:hover { transform: scale(1.06); }
                .hero-btn-outline:hover { background: rgba(255,255,255,0.08) !important; }
            `}</style>
    </div>
  )
}
