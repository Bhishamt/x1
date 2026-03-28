import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'
import ResponsiveLayout from '@/components/layout/ResponsiveLayout'

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

    if (profile && profile.role_id <= 3) redirect('/admin/dashboard')

    return (
        <ResponsiveLayout
            logoText="Student Portal"
            sidebar={
                <Sidebar
                    role="student"
                    userName={profile?.full_name ?? 'Student'}
                    email={profile?.email ?? user.email ?? ''}
                />
            }
        >
            {children}
        </ResponsiveLayout>
    )
}
