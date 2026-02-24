import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const SYSTEM_PROMPT = `You are an AI assistant for ABC Polytechnic Institute. 
You ONLY answer questions related to:
- College courses, curriculum, and departments
- Exam schedules, results, and grading
- Student admissions, fees, and enrollment
- Campus facilities and events
- Placement and internship opportunities
- College rules, regulations, and policies
- Faculty and academic programs

If a question is NOT related to the college or academic matters, politely decline and redirect to college topics.
Always be helpful, concise, and professional. Keep responses under 250 words.`

const schema = z.object({
    message: z.string().min(1).max(500),
})

// Rule-based fallback when OpenAI is unavailable
function getRuleBasedReply(message: string): string {
    const msg = message.toLowerCase()
    if (msg.includes('admission') || msg.includes('apply') || msg.includes('enroll'))
        return '📋 **Admissions** are open for 2025-26. Visit the Admissions page or contact the office at +91-1905-000000. Required documents: 10th marksheet, TC, and character certificate.'
    if (msg.includes('fee') || msg.includes('fees') || msg.includes('cost') || msg.includes('tuition'))
        return '💰 **Fee Structure**: Tuition is ₹18,000/year for govt-aided students. Additional charges include exam fees (~₹1,500/sem) and library fees. Scholarships available for SC/ST/OBC students.'
    if (msg.includes('result') || msg.includes('marks') || msg.includes('grade') || msg.includes('score'))
        return '📊 **Results** are published on the Student Portal. Go to Results section in your dashboard. If you see any discrepancy, contact the Exam Cell within 7 days of result declaration.'
    if (msg.includes('course') || msg.includes('branch') || msg.includes('department') || msg.includes('program'))
        return '📚 **Available Diploma Programs** (3 years each):\n• Computer Engineering (CS)\n• Civil Engineering (CE)\n• Mechanical Engineering (ME)\n• Electrical Engineering (EE)\n• Electronics & Communication (EC)\n• Information Technology (IT)'
    if (msg.includes('placement') || msg.includes('job') || msg.includes('company') || msg.includes('recruit'))
        return '🏭 **Placement Cell** is active year-round. Recent recruiters include TCS, Infosys, L&T, and Wipro with packages from 3.5–4.5 LPA. Contact placement@abcpolytechnic.edu.in for internship queries.'
    if (msg.includes('exam') || msg.includes('schedule') || msg.includes('timetable') || msg.includes('date'))
        return '📅 **Exam Schedule** is published 3 weeks before exams on the portal. Semester exams are held in Nov-Dec (odd sem) and Apr-May (even sem). Check Announcements for exact dates.'
    if (msg.includes('hostel') || msg.includes('accommodation') || msg.includes('room'))
        return '🏠 **Hostel** facility is available for outstation students. Boys and Girls hostels are separate. Monthly charges: ₹3,500 (room + meals). Contact the hostel warden to book a seat.'
    if (msg.includes('library') || msg.includes('book') || msg.includes('reading'))
        return '📖 **Library** is open Mon–Sat, 8 AM – 8 PM. Over 10,000 books available. Students can borrow up to 3 books for 14 days. E-resources are also available via the student portal.'
    if (msg.includes('contact') || msg.includes('phone') || msg.includes('email') || msg.includes('address'))
        return '📞 **Contact Info**:\n• Phone: +91-1905-000000\n• Email: info@abcpolytechnic.edu.in\n• Address: Sunder Nagar, Mandi, Himachal Pradesh — 175002\n• Office Hours: Mon–Sat, 9 AM – 5 PM'
    if (msg.includes('scholarship') || msg.includes('stipend') || msg.includes('financial'))
        return '🎓 **Scholarships** available: HP State Merit Scholarship, Post-Matric scholarship for SC/ST, and HPTECHBOARD scholarships. Apply within first month of admission. Visit the Accounts section for forms.'
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('help'))
        return '👋 Hello! I\'m the ABC Polytechnic AI Assistant. You can ask me about:\n• Admissions & Fees\n• Courses & Departments\n• Exam Schedule & Results\n• Placements\n• Hostel & Library\n• Contact Information'
    return '🤖 I can help with questions about **ABC Polytechnic Institute** — admissions, courses, results, placements, hostels, library, and more. Please ask a specific question!'
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { message } = schema.parse(body)

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        let reply = ''
        const startTime = Date.now()
        let tokensUsed: number | null = null

        const apiKey = process.env.OPENAI_API_KEY
        let usedOpenAI = false

        if (apiKey && apiKey.startsWith('sk-')) {
            try {
                const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: message },
                        ],
                        max_tokens: 350,
                        temperature: 0.7,
                    }),
                })

                if (openaiRes.ok) {
                    const data = await openaiRes.json()
                    reply = data.choices?.[0]?.message?.content ?? ''
                    tokensUsed = data.usage?.total_tokens ?? null
                    usedOpenAI = true
                }
            } catch {
                // OpenAI fetch failed — fall through to rule-based
            }
        }

        if (!reply) {
            reply = getRuleBasedReply(message)
        }

        const responseMs = Date.now() - startTime

        // Log to Supabase (best-effort — don't fail request if logging fails)
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('chatbot_logs') as any).insert({
                user_id: user?.id ?? null,
                session_id: crypto.randomUUID(),
                user_message: message,
                bot_response: reply,
                tokens_used: tokensUsed,
                response_ms: responseMs,
                platform: usedOpenAI ? 'web-openai' : 'web-rules',
            })
        } catch { /* ignore logging errors */ }

        return NextResponse.json({ reply })
    } catch (err) {
        if (err instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
        }
        console.error('Chatbot error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
