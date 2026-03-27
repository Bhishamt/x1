import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

import AdminLayoutClient from '@/components/layout/AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: rawProfile } = await supabase
        .from('users')
        .select('full_name, email, role_id, department_id')
        .eq('id', user.id)
        .single()
    const profile = rawProfile as unknown as { full_name: string; email: string; role_id: number; department_id: string | null } | null

    // Only students (role_id=4) get redirected to student portal
    if (!profile || profile.role_id === 4) redirect('/student/profile')

    return (
        <AdminLayoutClient 
            sidebarContent={
                <Sidebar
                    role="admin"
                    roleId={profile.role_id}
                    userName={profile.full_name ?? 'Admin'}
                    email={profile.email ?? user.email ?? ''}
                />
            }
        >
            {children}
        </AdminLayoutClient>
    )
}
