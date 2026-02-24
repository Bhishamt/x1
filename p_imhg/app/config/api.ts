import { Platform } from 'react-native'

/**
 * Base URL for the Next.js web backend.
 *
 * - Android emulator uses 10.0.2.2 to reach the host machine's localhost.
 * - iOS simulator / physical device on same WiFi uses the host machine's LAN IP.
 * - Web build uses a relative URL (same origin).
 *
 * In production, set EXPO_PUBLIC_API_URL in your .env file pointing to the
 * deployed Vercel/server URL, e.g. https://abcpolytechnic.vercel.app
 */
const DEV_LAN_IP = '10.236.46.81'      // Your machine's LAN IP (update if it changes)
const DEV_ANDROID_EMU = '10.0.2.2'     // Android emulator loopback to host
const PORT = 3000

function getBaseUrl(): string {
    // Use env var if set (for production or custom override)
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL
    }
    // Web platform — relative URLs work fine
    if (Platform.OS === 'web') return ''
    // Android emulator — use special loopback IP
    if (Platform.OS === 'android') {
        // Heuristic: if running on real device, use LAN IP
        // On emulator, 10.0.2.2 reaches host
        return `http://${DEV_ANDROID_EMU}:${PORT}`
    }
    // iOS simulator / physical device — use LAN IP
    return `http://${DEV_LAN_IP}:${PORT}`
}

export const API_BASE = getBaseUrl()

export const CHATBOT_URL = `${API_BASE}/api/chatbot`
