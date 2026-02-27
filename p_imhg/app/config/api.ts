import { Platform } from 'react-native'
import Constants from 'expo-constants'

/**
 * Base URL for the Next.js web backend.
 * In production builds, this reads EXPO_PUBLIC_API_URL or falls back to the app.json extra.apiUrl URL.
 */
function getBaseUrl(): string {
    // 1. Explicit environment variable takes absolute priority
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL
    }

    // 2. Fallback to app.json config injected by Expo (crucial for APKs without .env)
    const extraApiUrl = Constants.expoConfig?.extra?.apiUrl
    if (extraApiUrl) {
        return extraApiUrl
    }

    // 3. Web platform — relative URLs work fine
    if (Platform.OS === 'web') return ''

    // No localhost or local IP fallbacks in production
    return 'https://x1-drab.vercel.app'
}

export const API_BASE = getBaseUrl()

console.log("[API] Production Base URL:", API_BASE);

export const CHATBOT_URL = `${API_BASE}/api/chatbot`
