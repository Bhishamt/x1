import { useEffect, useState } from 'react'
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet,
    TextInput, ActivityIndicator, Platform,
} from 'react-native'
import { supabase } from '../../src/lib/supabase'
import type { UserProfile } from '../../src/lib/types'

const DEPARTMENTS = [
    'Computer Engineering', 'Civil Engineering', 'Mechanical Engineering',
    'Electrical Engineering', 'Electronics & Communication', 'Information Technology',
]

export default function ProfileScreen() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // edit fields
    const [fullName, setFullName] = useState('')
    const [rollNo, setRollNo] = useState('')
    const [phone, setPhone] = useState('')

    const isAdmin = profile?.role_id === 1

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data } = await (supabase.from('users') as any).select('*').eq('id', user.id).single()
            const p = data as UserProfile
            setProfile(p)
            setFullName(p?.full_name ?? '')
            setRollNo(p?.roll_no ?? '')
            setPhone(p?.phone ?? '')
            setLoading(false)
        })
    }, [])

    async function logout() { await supabase.auth.signOut() }

    async function save() {
        if (!profile) return
        if (!isAdmin && !rollNo.trim()) { setError('Roll number is required'); return }
        setSaving(true); setError('')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: err } = await (supabase.from('users') as any).update({
            full_name: fullName.trim(),
            ...(isAdmin ? {} : { roll_no: rollNo.trim().toUpperCase(), phone: phone.trim() || null }),
        }).eq('id', profile.id)
        if (err) { setError(err.code === '23505' ? 'Roll number already taken' : err.message) }
        else {
            setProfile(prev => prev ? { ...prev, full_name: fullName.trim(), roll_no: rollNo.trim().toUpperCase(), phone: phone.trim() || null } : prev)
            setEditing(false)
        }
        setSaving(false)
    }

    if (loading) return (
        <View style={s.center}><ActivityIndicator color="#3b82f6" size="large" /></View>
    )
    if (!profile) return null

    // ── Admin view ─────────────────────────────────────────
    if (isAdmin) {
        const adminFields = [
            { label: 'Email', value: profile.email, icon: '📧' },
            { label: 'Post / Role', value: 'Administrator', icon: '⚡' },
            { label: 'Institution', value: 'ABC Polytechnic Institute', icon: '🏛️' },
            { label: 'Status', value: profile.is_active ? 'Active' : 'Inactive', icon: '🟢' },
            { label: 'Member Since', value: new Date(profile.created_at ?? '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), icon: '📆' },
        ]
        return (
            <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={[s.banner, { backgroundColor: '#1a1000' }]} />
                <View style={s.avatarWrap}>
                    <View style={[s.avatar, { backgroundColor: '#d97706' }]}>
                        <Text style={{ fontSize: 36, color: '#fff', fontWeight: '800' }}>
                            {profile.full_name?.[0]?.toUpperCase()}
                        </Text>
                    </View>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={s.name}>{profile.full_name}</Text>
                    <View style={{ alignItems: 'center', marginBottom: 24 }}>
                        <View style={s.adminBadge}>
                            <Text style={s.adminBadgeText}>⚡ ADMINISTRATOR</Text>
                        </View>
                    </View>
                    {adminFields.map(f => (
                        <View key={f.label} style={s.field}>
                            <Text style={{ fontSize: 20 }}>{f.icon}</Text>
                            <View style={{ flex: 1 }}>
                                <Text style={s.fieldLabel}>{f.label}</Text>
                                <Text style={s.fieldValue}>{f.value}</Text>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity style={s.logout} onPress={logout} activeOpacity={0.8}>
                        <Text style={s.logoutText}>🚪 Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        )
    }

    // ── Student view ───────────────────────────────────────
    const studentFields = [
        { label: 'Roll Number', value: profile.roll_no ?? 'N/A', icon: '🆔', missing: !profile.roll_no },
        { label: 'Department', value: profile.department ?? 'N/A', icon: '🏛️', missing: !profile.department },
        { label: 'Academic Year', value: profile.year ? `Year ${profile.year}` : 'N/A', icon: '📅', missing: !profile.year },
        { label: 'Email', value: profile.email, icon: '📧' },
        { label: 'Phone', value: profile.phone ?? 'Not set', icon: '📞' },
    ]
    const hasMissing = !profile.roll_no || !profile.department || !profile.year

    return (
        <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={s.banner} />
            <View style={s.avatarWrap}>
                <View style={s.avatar}>
                    <Text style={{ fontSize: 36, color: '#fff', fontWeight: '800' }}>
                        {profile.full_name?.[0]?.toUpperCase()}
                    </Text>
                </View>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
                <Text style={s.name}>{profile.full_name}</Text>
                <Text style={s.meta}>{profile.roll_no ?? 'Student'} · {profile.department ?? 'ABC Polytechnic'}</Text>

                {/* Edit toggle button */}
                <TouchableOpacity
                    style={editing ? s.btnCancel : s.btnEdit}
                    onPress={() => { setEditing(!editing); setError('') }}
                    activeOpacity={0.8}
                >
                    <Text style={{ color: editing ? '#94a3b8' : '#fff', fontWeight: '700', fontSize: 14 }}>
                        {editing ? '✕ Cancel' : '✏️ Edit Profile'}
                    </Text>
                </TouchableOpacity>

                {/* Incomplete warning */}
                {hasMissing && !editing && (
                    <View style={s.warning}>
                        <Text style={{ fontSize: 16 }}>⚠️</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#fbbf24', fontWeight: '700', fontSize: 13 }}>Profile Incomplete</Text>
                            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Tap Edit Profile to fill in missing info.</Text>
                        </View>
                    </View>
                )}

                {/* Edit Form */}
                {editing && (
                    <View style={s.editCard}>
                        <Text style={{ color: '#f1f5f9', fontWeight: '700', fontSize: 15, marginBottom: 14 }}>✏️ Edit Profile</Text>

                        <Text style={s.inputLabel}>Full Name</Text>
                        <TextInput style={s.input} value={fullName} onChangeText={setFullName} placeholderTextColor="#475569" placeholder="Full name" />

                        <Text style={s.inputLabel}>Roll Number *</Text>
                        <TextInput style={s.input} value={rollNo} onChangeText={setRollNo} placeholderTextColor="#475569" placeholder="e.g. CS2021001" autoCapitalize="characters" />

                        <Text style={s.inputLabel}>Phone</Text>
                        <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholderTextColor="#475569" placeholder="+91 XXXXX XXXXX" keyboardType="phone-pad" />

                        {error ? <Text style={{ color: '#f87171', fontSize: 13, marginBottom: 8 }}>{error}</Text> : null}

                        <TouchableOpacity style={s.btnSave} onPress={save} disabled={saving} activeOpacity={0.8}>
                            {saving
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>💾 Save Changes</Text>
                            }
                        </TouchableOpacity>
                    </View>
                )}

                {/* Info Fields */}
                {studentFields.map(f => (
                    <View key={f.label} style={[s.field, (f as any).missing && { borderColor: 'rgba(245,158,11,0.3)' }]}>
                        <Text style={{ fontSize: 20 }}>{f.icon}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={s.fieldLabel}>{f.label}</Text>
                            <Text style={[s.fieldValue, (f as any).missing && { color: '#fbbf24' }]}>{f.value}</Text>
                        </View>
                    </View>
                ))}

                <TouchableOpacity style={s.logout} onPress={logout} activeOpacity={0.8}>
                    <Text style={s.logoutText}>🚪 Sign Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080c14' },
    center: { flex: 1, backgroundColor: '#080c14', alignItems: 'center', justifyContent: 'center' },
    banner: { height: 120, backgroundColor: '#0d1a2d', borderBottomWidth: 1, borderColor: '#1e2d40' },
    avatarWrap: { alignItems: 'center', marginTop: -45, marginBottom: 12 },
    avatar: {
        width: 90, height: 90, borderRadius: 45, backgroundColor: '#2563eb',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: 4, borderColor: '#080c14',
        shadowColor: '#3b82f6', shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
    },
    adminBadge: {
        backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
        borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4,
    },
    adminBadgeText: { color: '#fbbf24', fontWeight: '700', fontSize: 12, letterSpacing: 1 },
    name: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', textAlign: 'center', marginBottom: 4 },
    meta: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 16 },
    btnEdit: {
        backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 11, alignItems: 'center', marginBottom: 14,
    },
    btnCancel: {
        backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, paddingVertical: 11,
        alignItems: 'center', borderWidth: 1, borderColor: '#1e2d40', marginBottom: 14,
    },
    btnSave: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
    warning: {
        backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
        borderRadius: 10, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 14,
    },
    editCard: {
        backgroundColor: '#111827', borderRadius: 12, padding: 16,
        borderWidth: 1, borderColor: '#1e2d40', marginBottom: 16,
    },
    inputLabel: { fontSize: 11, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#1e2d40',
        borderRadius: 10, color: '#f1f5f9', padding: 12, fontSize: 14, marginBottom: 12,
    },
    field: {
        backgroundColor: '#111827', borderRadius: 12, padding: 14, marginBottom: 10,
        borderWidth: 1, borderColor: '#1e2d40', flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    fieldLabel: { fontSize: 11, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    fieldValue: { fontSize: 15, color: '#f1f5f9', fontWeight: '500' },
    logout: {
        backgroundColor: 'rgba(239,68,68,0.12)', borderRadius: 12, padding: 14, alignItems: 'center',
        marginTop: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
    },
    logoutText: { color: '#f87171', fontWeight: '700', fontSize: 15 },
})
