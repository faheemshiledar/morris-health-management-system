// app/api/ai/route.js
// Central AI endpoint — handles chat, lab explanations, and patient summaries.

import { askGroq } from '@/lib/groq'
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const body = await req.json()
    const { type } = body
    let prompt = ''

    // ── Lab result explanation ─────────────────────────────────────
    if (type === 'lab') {
      const { testName, result, notes } = body
      prompt = `
You are explaining lab results to a healthcare worker (not directly to a patient).
Test: ${testName}
Result: ${result}
Additional notes: ${notes || 'None'}

Please provide:
1. What this test measures
2. Whether these values appear normal, borderline, or abnormal
3. What abnormal values may indicate (if applicable)
4. Suggested follow-up actions

Keep it short, clear, and professional. Add a note that this is informational only.
      `.trim()
    }

    // ── Patient health summary ─────────────────────────────────────
    else if (type === 'summary') {
      const { patientName, age, gender, medicalHistory, recentTests } = body
      prompt = `
Generate a brief, structured health summary for:
Patient: ${patientName}, ${age} years old, ${gender}
Medical History: ${medicalHistory || 'Not provided'}
Recent Lab Tests: ${recentTests || 'None recorded'}

Format:
- Overview (1–2 sentences)
- Key Health Concerns
- Suggested Monitoring Areas
- General Wellness Tips

Keep it under 200 words. This is for internal clinical use only.
      `.trim()
    }

    // ── General chat ───────────────────────────────────────────────
    else {
      const { message } = body
      prompt = message
    }

    const response = await askGroq(prompt)
    return NextResponse.json({ response })

  } catch (err) {
    console.error('AI route error:', err)
    return NextResponse.json(
      { error: err.message ?? 'AI service failed.' },
      { status: 500 }
    )
  }
}
