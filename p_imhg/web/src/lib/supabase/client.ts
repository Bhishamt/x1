'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

const PRIMARY_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL

const PROXY_URL =
    process.env.NEXT_PUBLIC_SUPABASE_PROXY_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_PROXY_URL

const ANON_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

let activeUrl = PRIMARY_URL

async function resolveUrl() {
    try {
        await fetch(`${PRIMARY_URL}/rest/v1/`, { method: 'HEAD' })
        activeUrl = PRIMARY_URL
    } catch {
        activeUrl = PROXY_URL
    }
}

// Next.js client initialization
let clientInstance: ReturnType<typeof createBrowserClient<Database>> | null = null;
let isInitialized = false;

export function createClient() {
    if (clientInstance) return clientInstance;

    // Trigger async resolution but don't block React sync render initially
    if (!isInitialized) {
        resolveUrl().catch(console.error);
        isInitialized = true;
    }

    clientInstance = createBrowserClient<Database>(
        activeUrl as string,
        ANON_KEY as string,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            }
        }
    )

    return clientInstance;
}
