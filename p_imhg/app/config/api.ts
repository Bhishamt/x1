import { Platform } from 'react-native'
import Constants from 'expo-constants'

/**
 * Base URL for the Next.js web backend.
 * In production builds, this reads EXPO_PUBLIC_API_URL or falls back to the app.json extra.apiUrl URL.
 */
const DEV_ANDROID_EMU = '10.0.2.2'     // Android emulator loopback to host
const PORT = 3000

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

    // 4. Fallback logic for local Android Emulator
    const host = DEV_ANDROID_EMU
    return `http://${host}:${PORT}`
}

export const API_BASE = getBaseUrl()
if (__DEV__) {
    console.log(`[API] Base URL resolved to: ${API_BASE}`)
}

export const CHATBOT_URL = process.env.EXPO_PUBLIC_API_URL
    ? `${process.env.EXPO_PUBLIC_API_URL}/api/chatbot`
    : `${API_BASE}/api/chatbot`
