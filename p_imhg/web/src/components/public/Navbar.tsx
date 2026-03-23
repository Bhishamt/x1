'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { User } from '@supabase/supabase-js'

interface UserProfile { full_name: string; role_id: number }

const PUBLIC_NAV = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Courses', href: '/courses' },
    { label: 'Admissions', href: '/admissions' },
    { label: 'Contact', href: '/contact' },
]

export default function GlobalNavbar() {
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    const [user, setUser] = useState<User | null>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loaded, setLoaded] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    // On mount: get current session and subscribe to changes
    useEffect(() => {
        // Initial session load
        supabase.auth.getUser().then((res: any) => {
            const user = res.data?.user
            setUser(user)
            if (user) fetchProfile(user.id)
            else setLoaded(true)
        })

        // Realtime auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            const u = session?.user ?? null
            setUser(u)
            if (u) fetchProfile(u.id)
            else { setProfile(null); setLoaded(true) }
        })

        return () => subscription.unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function fetchProfile(uid: string) {
        const { data } = await supabase.from('users').select('full_name, role_id').eq('id', uid).single()
        setProfile((data as unknown as UserProfile) ?? null)
        setLoaded(true)
    }

    // Scroll-aware background
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    async function handleLogout() {
        await supabase.auth.signOut()
        toast.success('Signed out')
        router.push('/')
        router.refresh()
    }

    const dashboardHref = profile?.role_id === 1 ? '/admin/dashboard' : '/student/profile'

    // Hide on portal pages — they have their own sidebar nav
    const isPortal = pathname.startsWith('/student') || pathname.startsWith('/admin')
    if (isPortal) return null

    return (
        <nav style={{
            position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
            background: scrolled ? 'rgba(8,12,20,0.97)' : 'rgba(8,12,20,0.75)',
            backdropFilter: 'blur(16px)',
            borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
            transition: 'all 0.3s ease',
        }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', height: 64 }}>

                {/* Logo */}
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', flexShrink: 0 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '0.5rem',
                        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                    }}>🎓</div>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>ABC Polytechnic</span>
                </Link>

                {/* Desktop: public nav links */}
                <div className="gnav-links" style={{ display: 'flex', alignItems: 'center', gap: '0.125rem', marginLeft: '2rem' }}>
                    {PUBLIC_NAV.map(l => (
                        <Link key={l.href} href={l.href} className={`gnav-link${pathname === l.href ? ' gnav-active' : ''}`}>
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop: auth section */}
                <div className="gnav-links" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {!loaded ? (
                        <span style={{ width: 80, height: 32, borderRadius: '0.5rem', background: 'rgba(255,255,255,0.06)', display: 'inline-block' }} />
                    ) : user && profile ? (
                        <>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                👋 <strong style={{ color: 'var(--text-primary)' }}>{profile.full_name}</strong>
                            </span>
                            <Link href={dashboardHref} className="btn-ghost" style={{ fontSize: '0.825rem', padding: '0.4rem 0.9rem', textDecoration: 'none' }}>
                                {profile.role_id === 1 ? '⚡ Admin Panel' : '🎓 Dashboard'}
                            </Link>
                            <button onClick={handleLogout} className="btn-danger-sm">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link href="/login" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', textDecoration: 'none' }}>
                            Login
                        </Link>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setMenuOpen(!menuOpen)} className="gnav-hamburger">
                    {menuOpen ? '✕' : '☰'}
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div style={{ borderTop: '1px solid var(--border)', background: 'rgba(8,12,20,0.98)', padding: '1rem 1.5rem' }}>
                    {PUBLIC_NAV.map(l => (
                        <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{
                            display: 'block', color: 'var(--text-secondary)', textDecoration: 'none',
                            fontSize: '0.9rem', padding: '0.625rem 0', borderBottom: '1px solid rgba(30,45,64,0.4)',
                        }}>{l.label}</Link>
                    ))}

                    <div style={{ marginTop: '1rem' }}>
                        {user && profile ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                                    Signed in as <strong style={{ color: 'var(--text-primary)' }}>{profile.full_name}</strong>
                                </div>
                                <Link href={dashboardHref} onClick={() => setMenuOpen(false)} style={{
                                    background: 'rgba(59,130,246,0.15)', color: '#93c5fd',
                                    textDecoration: 'none', borderRadius: '0.5rem', padding: '0.75rem 1rem',
                                    textAlign: 'center', fontWeight: 600, fontSize: '0.85rem',
                                }}>My Dashboard</Link>
                                <button onClick={() => { setMenuOpen(false); handleLogout() }} style={{
                                    background: 'rgba(239,68,68,0.1)', color: '#f87171',
                                    border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1rem',
                                    cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                }}>Sign Out</button>
                            </div>
                        ) : (
                            <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                                display: 'block', background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                                color: 'white', textDecoration: 'none', borderRadius: '0.5rem',
                                padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 600,
                            }}>Login</Link>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .gnav-link {
                    color: var(--text-secondary); text-decoration: none;
                    font-size: 0.825rem; font-weight: 500;
                    padding: 0.375rem 0.625rem; border-radius: 0.375rem;
                    transition: color 0.15s, background 0.15s;
                }
                .gnav-link:hover { color: var(--text-primary); background: rgba(255,255,255,0.06); }
                .gnav-active { color: var(--text-primary) !important; background: rgba(59,130,246,0.12) !important; }
                .btn-ghost {
                    background: rgba(255,255,255,0.06); border: 1px solid var(--border);
                    border-radius: 0.5rem; color: var(--text-primary); cursor: pointer; font-weight: 600;
                    transition: background 0.15s;
                }
                .btn-ghost:hover { background: rgba(255,255,255,0.1); }
                .btn-danger-sm {
                    background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
                    border-radius: 0.5rem; color: #f87171; cursor: pointer;
                    font-size: 0.825rem; padding: 0.4rem 0.9rem; font-weight: 600;
                    transition: background 0.15s;
                }
                .btn-danger-sm:hover { background: rgba(239,68,68,0.18); }
                .gnav-hamburger {
                    margin-left: auto; background: none; border: none;
                    color: var(--text-primary); cursor: pointer; padding: 0.5rem;
                    font-size: 1.25rem; display: none;
                }
                @media (max-width: 900px) {
                    .gnav-links { display: none !important; }
                    .gnav-hamburger { display: flex !important; }
                }
            `}</style>
        </nav>
    )
}
