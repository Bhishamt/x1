'use client'

import { useState, useRef, useEffect } from 'react'
import PageHeader from '@/components/layout/PageHeader'
import { createClient } from '@/lib/supabase/client'
import { timeAgo } from '@/lib/utils'

interface Message { role: 'user' | 'assistant'; content: string; time: string }

export default function ChatbotPage() {
    const [messages, setMessages] = useState<Message[]>([{
        role: 'assistant',
        content: 'Hello! 👋 I\'m your ABC Polytechnic AI Assistant. Ask me anything about courses, results, exams, campus life, or college procedures.',
        time: new Date().toISOString(),
    }])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

    async function sendMessage(e: React.FormEvent) {
        e.preventDefault()
        if (!input.trim() || loading) return

        const userMsg: Message = { role: 'user', content: input.trim(), time: new Date().toISOString() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setLoading(true)

        try {
            const res = await fetch('/api/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg.content }),
            })

            if (!res.ok) {
                // API returned non-200 — could be auth redirect or server error
                throw new Error(`HTTP ${res.status}`)
            }

            const json = await res.json()

            if (json.error) throw new Error(json.error)

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: json.reply ?? 'Sorry, I couldn\'t process that.',
                time: new Date().toISOString(),
            }])
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'unknown'
            console.error('Chatbot fetch error:', msg)
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '⚠️ Could not reach the assistant. Please check your connection and try again.',
                time: new Date().toISOString(),
            }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <PageHeader title="AI Assistant" subtitle="Powered by ABC Polytechnic knowledge base" icon="🤖" />

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 220px)', minHeight: 500 }}>
                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            display: 'flex', gap: '0.75rem',
                            flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0, fontSize: '1rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg,#3b82f6,#8b5cf6)'
                                    : 'linear-gradient(135deg,#0f172a,#1e293b)',
                                border: '2px solid',
                                borderColor: msg.role === 'user' ? 'rgba(59,130,246,0.4)' : 'var(--border)',
                            }}>
                                {msg.role === 'user' ? '👤' : '🤖'}
                            </div>
                            {/* Bubble */}
                            <div style={{
                                maxWidth: '70%',
                                padding: '0.75rem 1rem',
                                borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                                background: msg.role === 'user'
                                    ? 'linear-gradient(135deg,rgba(59,130,246,0.3),rgba(139,92,246,0.2))'
                                    : 'rgba(255,255,255,0.05)',
                                border: '1px solid',
                                borderColor: msg.role === 'user' ? 'rgba(59,130,246,0.3)' : 'var(--border)',
                            }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.7, margin: '0 0 0.25rem' }}>
                                    {msg.content}
                                </p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', margin: 0 }}>{timeAgo(msg.time)}</p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', background: 'rgba(59,130,246,0.2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>🤖</div>
                            <div style={{
                                padding: '0.75rem 1rem', borderRadius: '1rem 1rem 1rem 0.25rem',
                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                                display: 'flex', gap: '4px', alignItems: 'center',
                            }}>
                                {[0, 1, 2].map(i => (
                                    <span key={i} style={{
                                        width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)',
                                        animation: `bounce 1s ${i * 0.2}s ease infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex', gap: '0.75rem',
                }}>
                    <input
                        className="input-dark"
                        placeholder="Ask about courses, results, exams, placement…"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={loading}
                        style={{ flex: 1 }}
                    />
                    <button type="submit" className="btn-primary" disabled={loading || !input.trim()}
                        style={{ padding: '0.625rem 1.25rem', whiteSpace: 'nowrap' }}>
                        Send ➤
                    </button>
                </form>
            </div>

            <style>{`
        @keyframes bounce {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }
      `}</style>
        </div>
    )
}
