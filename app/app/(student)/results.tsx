import { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { supabase } from '../../src/lib/supabase'

interface ResultRow {
    id: string; exam_type: string; marks_obtained: number; max_marks: number
    grade: string | null; semester: number; academic_year: string
    courses: { name: string; code: string } | null
}

const GRADE_COLOR: Record<string, string> = {
    O: '#10b981', 'A+': '#22c55e', A: '#84cc16', 'B+': '#eab308', B: '#f59e0b', C: '#f97316', F: '#ef4444',
}

export default function ResultsScreen() {
    const [results, setResults] = useState<ResultRow[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getUser().then(async ({ data: { user } }) => {
            if (!user) return
            const { data } = await supabase
                .from('results')
                .select('*, courses(name,code)')
                .eq('student_id', user.id)
                .order('semester', { ascending: false })
            setResults((data as unknown as ResultRow[]) ?? [])
            setLoading(false)
        })
    }, [])

    // Group by semester/year
    const grouped = results.reduce<Record<string, ResultRow[]>>((acc, r) => {
        const key = `${r.academic_year} · Sem ${r.semester}`
        return { ...acc, [key]: [...(acc[key] ?? []), r] }
    }, {})

    if (loading) return <View style={s.loader}><Text style={{ color: '#3b82f6' }}>Loading…</Text></View>

    return (
        <ScrollView style={s.container} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <Text style={s.pageTitle}>📊 My Results</Text>

            {Object.entries(grouped).map(([sem, rows]) => (
                <View key={sem} style={s.card}>
                    <Text style={s.semHeader}>{sem}</Text>
                    {rows.map(r => (
                        <View key={r.id} style={s.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={s.courseName}>{r.courses?.name ?? '—'}</Text>
                                <Text style={s.courseCode}>{r.courses?.code} · {r.exam_type}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={[s.grade, { color: GRADE_COLOR[r.grade ?? ''] ?? '#94a3b8' }]}>
                                    {r.grade ?? '—'}
                                </Text>
                                <Text style={s.marks}>{r.marks_obtained}/{r.max_marks}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            ))}

            {Object.keys(grouped).length === 0 && (
                <View style={s.empty}>
                    <Text style={{ fontSize: 40, marginBottom: 8 }}>📭</Text>
                    <Text style={{ color: '#64748b', fontSize: 15 }}>No results published yet</Text>
                </View>
            )}
        </ScrollView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080c14' },
    loader: { flex: 1, backgroundColor: '#080c14', alignItems: 'center', justifyContent: 'center' },
    pageTitle: { fontSize: 22, fontWeight: '800', color: '#f1f5f9', marginBottom: 16 },
    card: { backgroundColor: '#111827', borderRadius: 14, borderWidth: 1, borderColor: '#1e2d40', marginBottom: 14, overflow: 'hidden' },
    semHeader: {
        padding: 12, paddingHorizontal: 16, backgroundColor: 'rgba(59,130,246,0.1)',
        color: '#3b82f6', fontWeight: '700', fontSize: 13, borderBottomWidth: 1, borderColor: '#1e2d40'
    },
    row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderColor: 'rgba(30,45,64,0.5)' },
    courseName: { fontSize: 14, color: '#f1f5f9', fontWeight: '600', marginBottom: 2 },
    courseCode: { fontSize: 12, color: '#64748b' },
    grade: { fontSize: 22, fontWeight: '800' },
    marks: { fontSize: 11, color: '#64748b', marginTop: 2 },
    empty: { alignItems: 'center', padding: 60 },
})
