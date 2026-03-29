// lib/groq.js
// Reusable wrapper around the Groq SDK.
// All AI calls in this project go through askGroq().

import Groq from 'groq-sdk'

// The SDK picks up GROQ_API_KEY automatically from process.env,
// but we make it explicit so it's easy to spot.
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

const DEFAULT_SYSTEM = `You are Morris AI, a helpful medical assistant inside Morris Health Management System.
You explain things in clear, simple English. Always:
- Keep responses under 200 words.
- Use bullet points when listing items.
- Add a disclaimer when giving health-related information.
- Never diagnose or prescribe — only explain and educate.`

/**
 * Send a prompt to Groq and get back a plain-text response.
 *
 * @param {string} userPrompt   - The user's question or context.
 * @param {string} [systemMsg]  - Override the default system message.
 * @returns {Promise<string>}
 */
export async function askGroq(userPrompt, systemMsg = DEFAULT_SYSTEM) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system',  content: systemMsg },
        { role: 'user',    content: userPrompt },
      ],
      max_tokens: 512,
      temperature: 0.6,
    })

    return completion.choices[0]?.message?.content?.trim() ?? 'No response generated.'
  } catch (err) {
    console.error('Groq error:', err)
    throw new Error('AI service is temporarily unavailable. Please try again.')
  }
}
