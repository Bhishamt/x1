import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { supabase } from '../../src/lib/supabase'
import type { Announcement } from '../../src/lib/types'

const CAT_COLOR: Record<string, string> = { general: '#475569', exam: '#ef4444', event: '#8b5cf6', placement: '#10b981' }

export default function AnnouncementsScreen() {
    const [items, setItems] = useState<Announcement[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data } = await supabase.from('announcements').select('*')
                .eq('is_published', true)
                .order('is_pinned', { ascending: false })
                .order('published_at', { ascending: false })
            setItems((data as unknown as Announcement[]) ?? []); 
            setLoading(false);
        }

        fetchAnnouncements();

        const channel = supabase
            .channel('public:announcements')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
                // Instantly refetch on any announcement insert/update/delete
                fetchAnnouncements();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        }
    }, [])

    if (loading) return <View style={s.loader}><Text style={{ color: '#3b82f6' }}>Loading…</Text></View>

    return (
        <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <Text style={s.pageTitle}>📢 Announcements</Text>

            {items.map(a => (
                <View key={a.id} style={[s.card, { borderLeftColor: a.is_pinned ? '#3b82f6' : '#1e2d40' }]}>
                    <View style={s.row}>
                        <View style={[s.catBadge, { backgroundColor: CAT_COLOR[a.category] + '22' }]}>
                            <Text style={[s.catText, { color: CAT_COLOR[a.category] }]}>{a.category}</Text>
                        </View>
                        {a.is_pinned && <View style={s.pinBadge}><Text style={s.pinText}>📌 Pinned</Text></View>}
                    </View>
                    <Text style={s.title}>{a.title}</Text>
                    <Text style={s.content}>{a.content}</Text>
                    {a.published_at && (
                        <Text style={s.date}>{new Date(a.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    )}
                </View>
            ))}

            {items.length === 0 && (
                <View style={s.empty}>
                    <Text style={{ fontSize: 40, marginBottom: 8 }}>📭</Text>
                    <Text style={{ color: '#64748b' }}>No announcements yet</Text>
                </View>
            )}
        </ScrollView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080c14' },
    loader: { flex: 1, backgroundColor: '#080c14', alignItems: 'center', justifyContent: 'center' },
    pageTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 16 },
    card: {
        backgroundColor: '#111827', borderRadius: 14, borderWidth: 1, borderColor: '#1e2d40',
        borderLeftWidth: 3, padding: 16, marginBottom: 12
    },
    row: { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
    catBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
    catText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
    pinBadge: { backgroundColor: 'rgba(59,130,246,0.15)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 },
    pinText: { fontSize: 11, color: '#3b82f6', fontWeight: '700' },
    title: { fontSize: 15, color: '#f1f5f9', fontWeight: '700', marginBottom: 6 },
    content: { fontSize: 13, color: '#94a3b8', lineHeight: 20, marginBottom: 8 },
    date: { fontSize: 11, color: '#475569' },
    empty: { alignItems: 'center', padding: 60 },
})
