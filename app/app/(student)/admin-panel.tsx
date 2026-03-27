import { useEffect, useState } from 'react'
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, TextInput, ActivityIndicator, Alert,
} from 'react-native'
import { useAuth } from '../../src/context/AuthContext'
import { supabase } from '../../src/lib/supabase'
import { sendExpoPush } from '../../src/lib/notifications'

/* ── types ── */
interface Student { id: string; full_name: string; email: string; roll_no: string | null; department: string | null; push_token: string | null }

type Panel = 'home' | 'notify' | 'students'
type Target = 'all' | 'department' | 'year' | 'both'
type NotifType = 'info' | 'success' | 'warning' | 'error'

const DEPARTMENTS = ['Computer Engineering', 'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering', 'Electronics & Communication', 'Information Technology']
const YEARS = [1, 2, 3]
const NOTIF_TYPES: { id: NotifType; label: string; color: string }[] = [
    { id: 'info', label: '💬 Info', color: '#3b82f6' },
    { id: 'success', label: '✅ Success', color: '#10b981' },
    { id: 'warning', label: '⚠️ Warning', color: '#f59e0b' },
    { id: 'error', label: '🚨 Urgent', color: '#ef4444' },
]

export default function AdminPanelScreen() {
    const { isAdmin } = useAuth()
    if (!isAdmin) {
        return (
            <View style={s.center}>
                <Text style={{ fontSize: 40, marginBottom: 12 }}>🚫</Text>
                <Text style={s.denyTitle}>Access Denied</Text>
                <Text style={s.denySub}>This panel is for admins only.</Text>
            </View>
        )
    }
    return <AdminPanelContent />
}

function AdminPanelContent() {
    const [panel, setPanel] = useState<Panel>('home')
    const [students, setStudents] = useState<Student[]>([])
    const [loadingStu, setLoadingStu] = useState(false)

    // Notification form state
    const [notifTitle, setNotifTitle] = useState('')
    const [notifMsg, setNotifMsg] = useState('')
    const [notifType, setNotifType] = useState<NotifType>('info')
    const [target, setTarget] = useState<Target>('all')
    const [selDept, setSelDept] = useState('')
    const [selYear, setSelYear] = useState<number | null>(null)
    const [sending, setSending] = useState(false)

    async function loadStudents() {
        setLoadingStu(true)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data } = await (supabase.from('users') as any)
            .select('id, full_name, email, roll_no, department, push_token')
            .eq('role_id', 2).order('full_name')
        setStudents((data ?? []) as Student[])
        setLoadingStu(false)
    }

    useEffect(() => { if (panel === 'students') loadStudents() }, [panel])

    async function sendNotification() {
        if (!notifTitle.trim() || !notifMsg.trim()) {
            Alert.alert('Missing fields', 'Title and message are required.')
            return
        }
        if ((target === 'department' || target === 'both') && !selDept) {
            Alert.alert('Select department', 'Please choose a department.')
            return
        }
        if ((target === 'year' || target === 'both') && !selYear) {
            Alert.alert('Select year', 'Please choose an academic year.')
            return
        }

        setSending(true)
        try {
            // Build query
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let q = (supabase.from('users') as any)
                .select('id, push_token')
                .eq('role_id', 2)
                .eq('is_active', true)
            if (target === 'department' || target === 'both') q = q.eq('department', selDept)
            if (target === 'year' || target === 'both') q = q.eq('year', selYear)

            const { data: targets } = await q
            const typedTargets = (targets ?? []) as { id: string; push_token: string | null }[]

            if (typedTargets.length === 0) {
                Alert.alert('No students found', 'No students matched the selected filter.')
                setSending(false)
                return
            }

            // Insert Supabase notification records
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('notifications') as any).insert(
                typedTargets.map(t => ({
                    user_id: t.id,
                    title: notifTitle.trim(),
                    message: notifMsg.trim(),
                    type: notifType,
                }))
            )

            // Send Expo push notifications
            const tokens = typedTargets.map(t => t.push_token).filter(Boolean) as string[]
            if (tokens.length > 0) await sendExpoPush(tokens, notifTitle.trim(), notifMsg.trim())

            Alert.alert(
                '✅ Sent!',
                `Notification delivered to ${typedTargets.length} student(s).\n${tokens.length} push notification(s) sent.`
            )
            setNotifTitle(''); setNotifMsg(''); setNotifType('info'); setTarget('all'); setSelDept(''); setSelYear(null)
        } catch (err) {
            Alert.alert('Error', String(err))
        }
        setSending(false)
    }

    const navBtns: { id: Panel; icon: string; label: string }[] = [
        { id: 'home', icon: '📊', label: 'Overview' },
        { id: 'notify', icon: '🔔', label: 'Send Alert' },
        { id: 'students', icon: '🎓', label: 'Students' },
    ]

    return (
        <View style={s.container}>
            <View style={s.header}>
                <Text style={s.headerTitle}>⚡ Admin Panel</Text>
                <Text style={s.headerSub}>ABC Polytechnic Institute</Text>
            </View>
            <View style={s.subnav}>
                {navBtns.map(b => (
                    <TouchableOpacity key={b.id} style={[s.navBtn, panel === b.id && s.navBtnActive]}
                        onPress={() => setPanel(b.id)} activeOpacity={0.7}>
                        <Text style={{ fontSize: 16 }}>{b.icon}</Text>
                        <Text style={[s.navBtnLabel, panel === b.id && { color: '#3b82f6' }]}>{b.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

                {/* ── Overview ── */}
                {panel === 'home' && <OverviewPanel />}

                {/* ── Send Notification ── */}
                {panel === 'notify' && (
                    <View>
                        <Text style={s.sectionTitle}>🔔 Send Notification</Text>

                        <Text style={s.inputLabel}>Title *</Text>
                        <TextInput style={s.input} value={notifTitle} onChangeText={setNotifTitle}
                            placeholder="Notification title…" placeholderTextColor="#475569" />

                        <Text style={s.inputLabel}>Message *</Text>
                        <TextInput style={[s.input, { height: 100, textAlignVertical: 'top' }]}
                            value={notifMsg} onChangeText={setNotifMsg} multiline
                            placeholder="Write your message…" placeholderTextColor="#475569" />

                        <Text style={s.inputLabel}>Type</Text>
                        <View style={s.chipRow}>
                            {NOTIF_TYPES.map(t => (
                                <TouchableOpacity key={t.id}
                                    style={[s.chip, notifType === t.id && { borderColor: t.color, backgroundColor: t.color + '18' }]}
                                    onPress={() => setNotifType(t.id)}>
                                    <Text style={[s.chipText, notifType === t.id && { color: t.color }]}>{t.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={s.inputLabel}>Send To</Text>
                        <View style={s.chipRow}>
                            {(['all', 'department', 'year', 'both'] as Target[]).map(t => (
                                <TouchableOpacity key={t} style={[s.chip, target === t && s.chipActive]}
                                    onPress={() => setTarget(t)}>
                                    <Text style={[s.chipText, target === t && { color: '#3b82f6' }]}>
                                        {t === 'all' ? '👥 All' : t === 'department' ? '🏛️ Dept' : t === 'year' ? '📅 Year' : '🎯 Both'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {(target === 'department' || target === 'both') && (
                            <>
                                <Text style={s.inputLabel}>Department</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                                    <View style={[s.chipRow, { flexWrap: 'nowrap' }]}>
                                        {DEPARTMENTS.map(d => (
                                            <TouchableOpacity key={d} style={[s.chip, selDept === d && s.chipActive]}
                                                onPress={() => setSelDept(d)}>
                                                <Text style={[s.chipText, selDept === d && { color: '#3b82f6' }]}>{d}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </ScrollView>
                            </>
                        )}

                        {(target === 'year' || target === 'both') && (
                            <>
                                <Text style={s.inputLabel}>Academic Year</Text>
                                <View style={s.chipRow}>
                                    {YEARS.map(y => (
                                        <TouchableOpacity key={y} style={[s.chip, selYear === y && s.chipActive]}
                                            onPress={() => setSelYear(y)}>
                                            <Text style={[s.chipText, selYear === y && { color: '#3b82f6' }]}>Year {y}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        <TouchableOpacity style={s.sendBtn} onPress={sendNotification}
                            disabled={sending} activeOpacity={0.8}>
                            {sending
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text style={s.sendBtnText}>🔔 Send Notification</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {/* ── Students List ── */}
                {panel === 'students' && (
                    <View>
                        <Text style={s.sectionTitle}>🎓 Enrolled Students</Text>
                        {loadingStu
                            ? <ActivityIndicator color="#3b82f6" style={{ marginTop: 40 }} />
                            : students.map(st => (
                                <View key={st.id} style={s.studentCard}>
                                    <View style={s.stuAvatar}>
                                        <Text style={{ color: '#fff', fontWeight: '700' }}>
                                            {st.full_name?.[0]?.toUpperCase() ?? '?'}
                                        </Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                            <Text style={s.stuName}>{st.full_name}</Text>
                                            {st.push_token && <Text style={s.pushBadge}>📱</Text>}
                                        </View>
                                        <Text style={s.stuMeta}>{st.roll_no ?? 'No Roll No'} · {st.department ?? 'N/A'}</Text>
                                        <Text style={s.stuEmail}>{st.email}</Text>
                                    </View>
                                </View>
                            ))}
                        {!loadingStu && students.length === 0 && (
                            <Text style={{ color: '#475569', textAlign: 'center', marginTop: 40 }}>No students found.</Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    )
}

function OverviewPanel() {
    const [counts, setCounts] = useState({ students: 0, announcements: 0, notifications: 0 })
    useEffect(() => {
        async function load() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const [s, a, n] = await Promise.all([
                (supabase.from('users') as any).select('id', { count: 'exact' }).eq('role_id', 2).eq('is_active', true),
                (supabase.from('announcements') as any).select('id', { count: 'exact' }).eq('is_published', true),
                (supabase.from('notifications') as any).select('id', { count: 'exact' }).eq('is_read', false),
            ])
            setCounts({ students: s.count ?? 0, announcements: a.count ?? 0, notifications: n.count ?? 0 })
        }
        load()
    }, [])

    const stats = [
        { label: 'Active Students', value: counts.students, icon: '🎓', color: '#3b82f6' },
        { label: 'Published Notices', value: counts.announcements, icon: '📢', color: '#10b981' },
        { label: 'Unread Alerts', value: counts.notifications, icon: '🔔', color: '#f59e0b' },
    ]

    return (
        <View>
            <Text style={s.sectionTitle}>📊 Overview</Text>
            {stats.map(st => (
                <View key={st.label} style={[s.statCard, { borderLeftColor: st.color }]}>
                    <Text style={{ fontSize: 28 }}>{st.icon}</Text>
                    <View>
                        <Text style={[s.statVal, { color: st.color }]}>{st.value}</Text>
                        <Text style={s.statLabel}>{st.label}</Text>
                    </View>
                </View>
            ))}
            <View style={s.infoBox}>
                <Text style={s.infoText}>📌 Use "Send Alert" to push notifications to students instantly.</Text>
                <Text style={[s.infoText, { marginTop: 6 }]}>📱 Students with the app installed receive push even when offline.</Text>
            </View>
        </View>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080c14' },
    center: { flex: 1, backgroundColor: '#080c14', alignItems: 'center', justifyContent: 'center', padding: 40 },
    denyTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9', marginBottom: 8 },
    denySub: { fontSize: 14, color: '#64748b', textAlign: 'center' },
    header: { padding: 16, paddingBottom: 10, backgroundColor: '#0d1321', borderBottomWidth: 1, borderColor: '#1e2d40' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
    headerSub: { fontSize: 12, color: '#475569', marginTop: 2 },
    subnav: { flexDirection: 'row', backgroundColor: '#0d1321', borderBottomWidth: 1, borderColor: '#1e2d40' },
    navBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 3 },
    navBtnActive: { borderBottomWidth: 2, borderBottomColor: '#3b82f6' },
    navBtnLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
    sectionTitle: { fontSize: 16, fontWeight: '800', color: '#f1f5f9', marginBottom: 14 },
    inputLabel: { fontSize: 11, color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 12 },
    input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#1e2d40', borderRadius: 10, color: '#f1f5f9', padding: 12, fontSize: 14 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
    chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#1e2d40' },
    chipActive: { borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)' },
    chipText: { color: '#64748b', fontSize: 12, fontWeight: '600' },
    sendBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    sendBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    statCard: { backgroundColor: '#111827', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#1e2d40', borderLeftWidth: 4, flexDirection: 'row', alignItems: 'center', gap: 16 },
    statVal: { fontSize: 28, fontWeight: '800' },
    statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
    infoBox: { backgroundColor: 'rgba(59,130,246,0.08)', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', marginTop: 8 },
    infoText: { color: '#94a3b8', fontSize: 13, lineHeight: 20 },
    studentCard: { backgroundColor: '#111827', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#1e2d40', flexDirection: 'row', alignItems: 'center', gap: 12 },
    stuAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1d4ed8', alignItems: 'center', justifyContent: 'center' },
    stuName: { fontSize: 14, fontWeight: '700', color: '#f1f5f9' },
    stuMeta: { fontSize: 12, color: '#64748b', marginTop: 2 },
    stuEmail: { fontSize: 11, color: '#475569', marginTop: 1 },
    pushBadge: { fontSize: 12 },
})
