import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthContextType {
    session: Session | null
    roleId: number | null          // 1 = admin, 2 = student
    isAdmin: boolean
    isStudent: boolean
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    session: null, roleId: null, isAdmin: false, isStudent: false, loading: true,
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [roleId, setRoleId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    async function fetchRole(userId: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase.from('users') as any)
            .select('role_id')
            .eq('id', userId)
            .single()
        setRoleId(data?.role_id ?? 2)   // default to student
    }

    useEffect(() => {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            setSession(session)
            if (session?.user) await fetchRole(session.user.id)
            setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session)
            if (session?.user) {
                await fetchRole(session.user.id)
            } else {
                setRoleId(null)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    return (
        <AuthContext.Provider value={{
            session,
            roleId,
            isAdmin: roleId === 1,
            isStudent: roleId === 2,
            loading,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
