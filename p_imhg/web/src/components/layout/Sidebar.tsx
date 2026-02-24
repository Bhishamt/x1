'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

interface NavItem { href: string; label: string; icon: string }

const studentNav: NavItem[] = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/student/profile', label: 'Profile', icon: '👤' },
    { href: '/student/results', label: 'Results', icon: '📊' },
    { href: '/student/announcements', label: 'Announcements', icon: '📢' },
    { href: '/student/notifications', label: 'Notifications', icon: '🔔' },
    { href: '/student/chatbot', label: 'AI Assistant', icon: '🤖' },
]

const adminNav: NavItem[] = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/admin/profile', label: 'Profile', icon: '👤' },
    { href: '/admin/students', label: 'Students', icon: '🎓' },
    { href: '/admin/courses', label: 'Courses', icon: '📚' },
    { href: '/admin/results', label: 'Results', icon: '📋' },
    { href: '/admin/announcements', label: 'Announcements', icon: '📢' },
    { href: '/admin/notifications', label: 'Notifications', icon: '🔔' },
]

interface SidebarProps { role: 'admin' | 'student'; userName: string; email: string }

export default function Sidebar({ role, userName, email }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const navItems = role === 'admin' ? adminNav : studentNav

    async function handleLogout() {
        await supabase.auth.signOut()
        toast.success('Logged out')
        router.push('/login')
        router.refresh()
    }

    return (
        <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '0.625rem', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                        background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
                        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                    }}>🎓</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            ABC Polytechnic
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {role === 'admin' ? '⚡ Admin Panel' : '🎓 Student Portal'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
                <div style={{
                    fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.5rem', paddingLeft: '0.25rem'
                }}>
                    Navigation
                </div>
                {navItems.map(item => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn('sidebar-link', pathname.startsWith(item.href) && 'active')}
                    >
                        <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* User info + Logout */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <div style={{
                    padding: '0.75rem', borderRadius: '0.625rem',
                    background: 'rgba(255,255,255,0.03)', marginBottom: '0.5rem'
                }}>
                    <div style={{
                        fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                        {userName}
                    </div>
                    <div style={{
                        fontSize: '0.7rem', color: 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                        {email}
                    </div>
                </div>
                <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem' }}>
                    🚪 Sign Out
                </button>
            </div>
        </aside>
    )
}
