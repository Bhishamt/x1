import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const PRIMARY_URL = Constants.expoConfig?.extra?.supabaseUrl;
const PROXY_URL = Constants.expoConfig?.extra?.supabaseProxyUrl;
const ANON_KEY = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!PRIMARY_URL || !ANON_KEY || !PROXY_URL) {
    throw new Error("Supabase credentials missing in app.json");
}

let activeUrl = PRIMARY_URL;

async function resolveUrl() {
    try {
        await fetch(`${PRIMARY_URL}/rest/v1/`, { method: 'HEAD' })
        activeUrl = PRIMARY_URL
    } catch {
        activeUrl = PROXY_URL
    }
}

// User explicitly wants await resolveUrl()
// We'll wrap in an internal init call or resolve immediately if environment supports.
// Using top-level await might crash old React Native, wait.
// The snippet says:
// await resolveUrl()
// export const supabase = createClient(activeUrl, ANON_KEY)
// Let's implement EXACTLY that syntax to comply with instructions, assuming Metro has topLevelAwait enabled!

await resolveUrl();

export const supabase = createClient(
    activeUrl,
    ANON_KEY,
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false
        }
    }
);
