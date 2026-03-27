import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import { Platform } from 'react-native'
import { supabase } from './supabase'

/**
 * Registers for Expo push notifications and saves the token to Supabase.
 *
 * Requires a Development Build (NOT Expo Go) for SDK 53+.
 * Run: `npm run build:dev` to build the dev client APK.
 */
export async function registerPushToken(userId: string): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('[Push] Skipping — emulator/simulator, no real push support')
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
        console.warn('[Push] Permission denied by user')
        return null
    }

    // Android foreground notification channel
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'ABC Polytechnic',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#3b82f6',
            sound: 'default',
        })
    }

    // Get EAS projectId from app.json extra.eas.projectId
    // This is required for SDK 53+ when using development builds
    const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ??
        Constants.easConfig?.projectId

    if (!projectId) {
        console.error('[Push] No EAS projectId found in app.json → extra.eas.projectId. Run: eas init')
        return null
    }

    let token: string
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId })
        token = tokenData.data
        console.log('[Push] Token registered:', token)
    } catch (err) {
        console.error('[Push] Failed to get push token:', err)
        return null
    }

    // Persist to Supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('users') as any)
        .update({ push_token: token })
        .eq('id', userId)
    if (error) console.error('[Push] Failed to save token to DB:', error.message)

    return token
}

/**
 * Configure how notifications appear when app is in the FOREGROUND.
 * Call this once at app startup — before any notifications arrive.
 */
export function configureForegroundHandler() {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldShowBanner: true,
            shouldShowList: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
        }),
    })
}

/**
 * Send Expo push notifications to a list of tokens.
 * Batches in chunks of 100 (Expo API limit).
 */
export async function sendExpoPush(tokens: string[], title: string, body: string): Promise<void> {
    const valid = tokens.filter(t => t?.startsWith('ExponentPushToken'))
    if (valid.length === 0) {
        console.log('[Push] No valid tokens to send to')
        return
    }

    const chunks: { to: string; title: string; body: string; sound: 'default' }[][] = []
    for (let i = 0; i < valid.length; i += 100) {
        chunks.push(valid.slice(i, i + 100).map(to => ({ to, title, body, sound: 'default' as const })))
    }

    for (const chunk of chunks) {
        try {
            const res = await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                },
                body: JSON.stringify(chunk.length === 1 ? chunk[0] : chunk),
            })
            const json = await res.json()
            console.log('[Push] Sent chunk:', json)
        } catch (err) {
            console.error('[Push] Chunk failed:', err)
        }
    }
}
