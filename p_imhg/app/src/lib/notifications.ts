import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { supabase } from './supabase'

/**
 * Registers for Expo push notifications and saves the token to Supabase.
 * Must be called after the user is authenticated.
 */
export async function registerPushToken(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
        // Push notifications don't work in simulators
        console.log('[Push] Skipping — not a physical device')
        return null
    }

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
    }
    if (finalStatus !== 'granted') {
        console.log('[Push] Permission denied')
        return null
    }

    // Android foreground channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'ABC Polytechnic',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3b82f6',
        })
    }

    // Get token
    const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,   // optional, set in .env if needed
    })
    const token = tokenData.data
    console.log('[Push] Token:', token)

    // Save to Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('users') as any).update({ push_token: token }).eq('id', userId)

    return token
}

/**
 * Configure how notifications behave when the app is in the foreground.
 * Call this once at app startup (before any notification arrives).
 */
export function configureForegroundHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    })
}

/**
 * Send an Expo push notification to a list of tokens.
 * Called from the admin panel to push to students.
 */
export async function sendExpoPush(tokens: string[], title: string, body: string): Promise<void> {
    const messages = tokens
        .filter(t => t && t.startsWith('ExponentPushToken'))
        .map(token => ({ to: token, title, body, sound: 'default' as const }))

    if (messages.length === 0) return

    // Send in chunks of 100 (Expo limit)
    const chunks: typeof messages[] = []
    for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100))

    for (const chunk of chunks) {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Accept-Encoding': 'gzip, deflate' },
            body: JSON.stringify(chunk.length === 1 ? chunk[0] : chunk),
        })
    }
}
