import { useEffect, useRef } from 'react'
import { Stack, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, ActivityIndicator } from 'react-native'
import * as Notifications from 'expo-notifications'
import { AuthProvider, useAuth } from '../src/context/AuthContext'
import { registerPushToken, configureForegroundHandler } from '../src/lib/notifications'

// Configure how notifications look when app is open — must be at top level
configureForegroundHandler()

function NavigationGuard() {
    const { session, loading } = useAuth()
    const router = useRouter()
    const segments = useSegments()

    useEffect(() => {
        if (loading) return
        const inAuth = segments[0] === '(auth)'
        if (!session && !inAuth) router.replace('/(auth)/login')
        if (session && inAuth) router.replace('/(student)/profile')
    }, [session, loading, segments])

    return null
}

function PushRegistrar() {
    const { session } = useAuth()
    const registered = useRef(false)

    useEffect(() => {
        if (session?.user && !registered.current) {
            registered.current = true
            registerPushToken(session.user.id).catch(console.error)
        }
        if (!session) registered.current = false
    }, [session])

    // Handle notification tap when app was background/killed
    useEffect(() => {
        const sub = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('[Push] Notification tapped:', response.notification.request.content.title)
            // Could navigate to notifications tab here
        })
        return () => sub.remove()
    }, [])

    return null
}

function RootContent() {
    const { loading } = useAuth()

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080c14' }}>
                <ActivityIndicator color="#3b82f6" size="large" />
            </View>
        )
    }

    return (
        <>
            <StatusBar style="light" />
            <NavigationGuard />
            <PushRegistrar />
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#080c14' } }} />
        </>
    )
}

export default function RootLayout() {
    return (
        <AuthProvider>
            <RootContent />
        </AuthProvider>
    )
}
