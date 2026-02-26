'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/public/Navbar'
import Link from 'next/link'
import toast from 'react-hot-toast'

const CONTACTS = [
    { icon: '📍', label: 'Address', value: 'Sunder Nagar, Mandi District, Himachal Pradesh — 175002' },
    { icon: '📞', label: 'Phone', value: '+91 1905-000000' },
    { icon: '✉️', label: 'Email', value: 'info@abcpolytechnic.edu.in' },
    { icon: '🕐', label: 'Office Hours', value: 'Mon–Sat: 9:00 AM – 5:00 PM' },
]

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error('Please fill in all required fields.')
            return
        }

        setLoading(true)
        try {
            // @ts-ignore - contact_messages might not be in the generated types yet
            const { error } = await (supabase.from('contact_messages') as any)
                .insert([{ name, email, message }])

            if (error) {
                console.error('Supabase Error:', error)
                throw new Error(error.message)
            }

            toast.success('Message sent successfully! We will get back to you soon.')
            setName('')
            setEmail('')
            setMessage('')
        } catch (err: any) {
            console.error('Contact Form Submission Error:', err)
            toast.error('Failed to send message. Please try again later.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <Navbar />
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '7rem 1.5rem 4rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Contact Us</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>We're here to help. Reach out to us anytime.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>

                    {/* Contact Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Get In Touch</h2>
                        {CONTACTS.map(c => (
                            <div key={c.label} className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontSize: '1.75rem', flexShrink: 0 }}>{c.icon}</span>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{c.label}</div>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginTop: '0.2rem' }}>{c.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="glass-card" style={{ padding: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Send a Message</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Name <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    className="input-dark"
                                    style={{ width: '100%' }}
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Your Full Name"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Email Address <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="email"
                                    className="input-dark"
                                    style={{ width: '100%' }}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>Message <span style={{ color: 'red' }}>*</span></label>
                                <textarea
                                    className="input-dark"
                                    rows={5}
                                    style={{ width: '100%', resize: 'vertical' }}
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="How can we help you?"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn-primary"
                                style={{ padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }}
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>

                </div>

                <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>← Back to Home</Link>
                </div>
            </div>
        </div>
    )
}
