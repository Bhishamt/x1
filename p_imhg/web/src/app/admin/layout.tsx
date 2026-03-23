import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: rawProfile } = await supabase
        .from('users')
        .select('full_name, email, role_id, department')
        .eq('id', user.id)
        .single()
    const profile = rawProfile as unknown as { full_name: string; email: string; role_id: number; department: string | null } | null

    // Allow all staff roles (1=super_admin, 2=admin, 3=hod, 4=class_incharge)
    if (!profile || profile.role_id >= 5) redirect('/student/profile')

    return (
        <div>
            <Sidebar
                role="admin"
                roleId={profile.role_id}
                userName={profile.full_name ?? 'Admin'}
                email={profile.email ?? user.email ?? ''}
            />
            <main className="page-container fade-in">{children}</main>
        </div>
    )
}
