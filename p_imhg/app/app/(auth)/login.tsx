import { useState } from 'react'
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native'
import * as Notifications from 'expo-notifications'
import { supabase } from '../../src/lib/supabase'

export default function LoginScreen() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
        if (!email || !password) { Alert.alert('Error', 'Please fill in all fields'); return }
        setLoading(true)
        const { error, data } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            Alert.alert('Login Failed', error.message)
        } else if (data.user) {
            try {
                const token = (await Notifications.getExpoPushTokenAsync()).data;
                console.log("Expo Push Token:", token);
                await supabase.from('users').update({ push_token: token }).eq('id', data.user.id);
            } catch (err) {
                console.log("Push token registration failed on login", err);
            }
        }
        setLoading(false)
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
            <View style={s.card}>
                {/* Logo */}
                <View style={s.logoBox}>
                    <Text style={{ fontSize: 36 }}>🎓</Text>
                </View>
                <Text style={s.title}>ABC Polytechnic</Text>
                <Text style={s.subtitle}>Sign in to continue</Text>

                {/* Email */}
                <Text style={s.label}>Email Address</Text>
                <TextInput
                    style={s.input}
                    placeholder="you@abcpolytechnic.edu"
                    placeholderTextColor="#475569"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                />

                {/* Password */}
                <Text style={s.label}>Password</Text>
                <TextInput
                    style={s.input}
                    placeholder="••••••••"
                    placeholderTextColor="#475569"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                />

                <TouchableOpacity style={s.button} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={s.buttonText}>Sign In</Text>
                    }
                </TouchableOpacity>

                <Text style={s.hint}>Contact admin to reset your password</Text>
            </View>
        </KeyboardAvoidingView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080c14', alignItems: 'center', justifyContent: 'center', padding: 20 },
    card: {
        width: '100%', maxWidth: 420, backgroundColor: '#111827', borderRadius: 20,
        padding: 28, borderWidth: 1, borderColor: '#1e2d40'
    },
    logoBox: {
        width: 72, height: 72, borderRadius: 18, backgroundColor: '#2563eb',
        alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
        marginBottom: 16, shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 16, elevation: 8
    },
    title: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', textAlign: 'center', marginBottom: 4 },
    subtitle: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 28 },
    label: { fontSize: 12, fontWeight: '600', color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: '#1e2d40',
        borderRadius: 10, color: '#f1f5f9', padding: 14, fontSize: 15, marginBottom: 16
    },
    button: {
        backgroundColor: '#2563eb', borderRadius: 10, padding: 16, alignItems: 'center',
        marginTop: 8, shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 12, elevation: 6
    },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    hint: { textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 20 },
})
