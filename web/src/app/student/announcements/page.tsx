import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/layout/PageHeader'
import Badge from '@/components/ui/Badge'
import { formatDate, getCategoryBadge } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database.types'
type Ann = Tables<'announcements'>

export default async function AnnouncementsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: rawAnn } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .order('is_pinned', { ascending: false })
        .order('published_at', { ascending: false })
    const announcements = (rawAnn ?? []) as unknown as Ann[]

    const categoryLabel: Record<string, string> = {
        general: 'General', exam: 'Exam', event: 'Event', placement: 'Placement',
    }

    return (
        <div>
            <PageHeader title="Announcements" subtitle="Latest college updates and notices" icon="📢" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(announcements ?? []).map(a => (
                    <div key={a.id} className="glass-card" style={{
                        padding: '1.5rem',
                        borderLeft: a.is_pinned ? '3px solid #3b82f6' : '3px solid var(--border)',
                    }}>
                        <div style={{
                            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                            gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {a.is_pinned && <Badge variant="info">📌 Pinned</Badge>}
                                <span className={cn('badge', getCategoryBadge(a.category))}>
                                    {categoryLabel[a.category] ?? a.category}
                                </span>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                                {a.published_at ? formatDate(a.published_at) : ''}
                            </span>
                        </div>
                        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            {a.title}
                        </h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                            {a.content}
                        </p>
                        {a.expires_at && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                                ⏳ Expires: {formatDate(a.expires_at)}
                            </p>
                        )}
                    </div>
                ))}
                {(announcements ?? []).length === 0 && (
                    <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
                        <p style={{ color: 'var(--text-secondary)' }}>No announcements at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
