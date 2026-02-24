import { useState, useRef } from 'react'
import {
    View, Text, TextInput, TouchableOpacity, ScrollView,
    StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native'
import { CHATBOT_URL } from '../../config/api'

interface Message { role: 'user' | 'assistant'; content: string }


export default function ChatbotScreen() {
    const [messages, setMessages] = useState<Message[]>([{
        role: 'assistant',
        content: 'Hello! 👋 I\'m your ABC Polytechnic AI Assistant. Ask me anything about courses, results, exams, or college procedures.',
    }])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const scrollRef = useRef<ScrollView>(null)

    async function send() {
        if (!input.trim() || loading) return
        const userMsg: Message = { role: 'user', content: input.trim() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)
        scrollRef.current?.scrollToEnd({ animated: true })

        try {
            const res = await fetch(CHATBOT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const json = await res.json()
            if (json.error) throw new Error(json.error)
            setMessages(prev => [...prev, { role: 'assistant', content: json.reply ?? 'Sorry, could not get a response.' }])
        } catch (err) {
            console.error('Chatbot error:', err)
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Could not reach assistant. Make sure you are on the same WiFi as the server.' }])
        } finally {
            setLoading(false)
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
        }
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
            {/* Title */}
            <View style={s.header}>
                <Text style={s.headerTitle}>🤖 AI Assistant</Text>
                <Text style={s.headerSub}>ABC Polytechnic Knowledge Base</Text>
            </View>

            {/* Messages */}
            <ScrollView ref={scrollRef} style={s.messages} contentContainerStyle={{ padding: 16, gap: 12 }}>
                {messages.map((m, i) => (
                    <View key={i} style={[s.bubble, m.role === 'user' ? s.userBubble : s.botBubble]}>
                        <Text style={[s.bubbleText, m.role === 'user' ? s.userText : s.botText]}>{m.content}</Text>
                    </View>
                ))}
                {loading && (
                    <View style={[s.bubble, s.botBubble]}>
                        <ActivityIndicator color="#3b82f6" size="small" />
                    </View>
                )}
            </ScrollView>

            {/* Input */}
            <View style={s.inputWrap}>
                <TextInput
                    style={s.input}
                    placeholder="Ask about courses, results, exams…"
                    placeholderTextColor="#475569"
                    value={input}
                    onChangeText={setInput}
                    multiline
                    maxLength={500}
                />
                <TouchableOpacity style={[s.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}
                    onPress={send} disabled={!input.trim() || loading}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>➤</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    )
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#080c14' },
    header: { padding: 16, paddingBottom: 8, borderBottomWidth: 1, borderColor: '#1e2d40', backgroundColor: '#0d1321' },
    headerTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9' },
    headerSub: { fontSize: 12, color: '#475569', marginTop: 2 },
    messages: { flex: 1 },
    bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 4 },
    userBubble: {
        alignSelf: 'flex-end', backgroundColor: 'rgba(59,130,246,0.25)',
        borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)', borderBottomRightRadius: 4
    },
    botBubble: {
        alignSelf: 'flex-start', backgroundColor: '#111827',
        borderWidth: 1, borderColor: '#1e2d40', borderBottomLeftRadius: 4
    },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    userText: { color: '#f1f5f9' },
    botText: { color: '#cbd5e1' },
    inputWrap: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1, borderColor: '#1e2d40', backgroundColor: '#0d1321' },
    input: {
        flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#1e2d40',
        borderRadius: 12, color: '#f1f5f9', padding: 12, fontSize: 14, maxHeight: 100
    },
    sendBtn: {
        width: 44, height: 44, backgroundColor: '#2563eb', borderRadius: 12,
        alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-end'
    },
})
