import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: rawProfile } = await supabase
        .from('users')
        .select('full_name, email, role_id')
        .eq('id', user.id)
        .single()
    const profile = rawProfile as unknown as { full_name: string; email: string; role_id: number } | null

    if (profile?.role_id === 1) redirect('/admin/dashboard')

    return (
        <div>
            <Sidebar
                role="student"
                userName={profile?.full_name ?? 'Student'}
                email={profile?.email ?? user.email ?? ''}
            />
            <main className="page-container fade-in">{children}</main>
        </div>
    )
}
