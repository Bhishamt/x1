import { Tabs } from 'expo-router'
import { Text, ActivityIndicator, View } from 'react-native'
import { useAuth } from '../../src/context/AuthContext'

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
    return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
}

export default function StudentTabLayout() {
    const { isAdmin, loading } = useAuth()

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: '#080c14', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator color="#3b82f6" size="large" />
            </View>
        )
    }

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#0d1321', borderTopColor: '#1e2d40',
                borderTopWidth: 1, height: 60, paddingBottom: 8,
            },
            tabBarActiveTintColor: '#3b82f6',
            tabBarInactiveTintColor: '#475569',
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        }}>
            {/* ── SHARED: Profile (role-aware content inside the screen) ── */}
            <Tabs.Screen
                name="profile"
                options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} /> }}
            />

            {/* ── STUDENT ONLY tabs ── */}
            <Tabs.Screen
                name="results"
                options={{
                    title: 'Results',
                    tabBarIcon: ({ focused }) => <TabIcon icon="📊" focused={focused} />,
                    href: isAdmin ? null : undefined,   // hide tab for admin
                }}
            />
            <Tabs.Screen
                name="announcements"
                options={{
                    title: 'Notices',
                    tabBarIcon: ({ focused }) => <TabIcon icon="📢" focused={focused} />,
                    href: isAdmin ? null : undefined,
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: isAdmin ? 'Alerts' : 'Alerts',
                    tabBarIcon: ({ focused }) => <TabIcon icon="🔔" focused={focused} />,
                }}
            />

            {/* ── ADMIN ONLY tab ── */}
            <Tabs.Screen
                name="admin-panel"
                options={{
                    title: 'Admin',
                    tabBarIcon: ({ focused }) => <TabIcon icon="⚡" focused={focused} />,
                    href: isAdmin ? undefined : null,   // hide tab for students
                }}
            />

            {/* ── SHARED: AI Assistant ── */}
            <Tabs.Screen
                name="chatbot"
                options={{ title: 'AI Assistant', tabBarIcon: ({ focused }) => <TabIcon icon="🤖" focused={focused} /> }}
            />
        </Tabs>
    )
}
