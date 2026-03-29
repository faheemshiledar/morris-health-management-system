'use client'
// app/ai-assistant/page.js

import { useState } from 'react'
import PageHeader from '@/components/PageHeader'

const QUICK_PROMPTS = [
  { label: '🩸 Explain CBC Results',        text: 'Explain a Complete Blood Count (CBC) test result in simple terms. Normal ranges and what abnormal values could mean.' },
  { label: '💊 Diabetes Management Tips',   text: 'Give me simple tips for managing Type 2 diabetes for a newly diagnosed patient.' },
  { label: '❤️ Heart Health Summary',       text: 'Summarise the key factors that affect heart health and how a patient can improve them.' },
  { label: '🫀 Blood Pressure Explained',   text: 'Explain what high blood pressure means, its risks, and simple lifestyle changes to manage it.' },
  { label: '🔬 What is HbA1c?',             text: 'Explain what the HbA1c test measures, what normal vs high values mean, and why it matters for diabetes.' },
  { label: '😴 Sleep & Health Connection',  text: 'How does poor sleep affect overall health? Give actionable tips for better sleep.' },
]

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 Hello! I'm **Morris AI**, your health assistant.\n\nI can help you:\n• Explain lab test results in simple terms\n• Generate patient health summaries\n• Answer general health questions\n• Provide lifestyle & wellness tips\n\n⚠️ *I do not diagnose or prescribe. Always consult a licensed doctor for medical decisions.*\n\nHow can I help you today?`,
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return

    setMessages(m => [...m, { role: 'user', content: userMsg }])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'chat', message: userMsg }),
      })
      const d = await res.json()
      setMessages(m => [...m, { role: 'assistant', content: d.response ?? 'No response.' }])
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: '❌ AI service error. Please check your GROQ_API_KEY.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <PageHeader
        title="AI Health Assistant"
        subtitle="Powered by Groq · llama3-70b-8192 · Non-diagnostic"
      />

      {/* Quick prompts */}
      <div className="flex gap-2 flex-wrap mb-4">
        {QUICK_PROMPTS.map(q => (
          <button
            key={q.label}
            onClick={() => sendMessage(q.text)}
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded-full bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3 shrink-0 mt-1">
                🤖
              </div>
            )}
            <div
              className={`max-w-xl px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
                }`}
            >
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-sm ml-3 shrink-0 mt-1">
                👤
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm mr-3 shrink-0">
              🤖
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex gap-3">
        <textarea
          rows={2}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about a patient's lab results, health condition, medication, or general health question… (Enter to send)"
          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition disabled:opacity-40 shrink-0"
        >
          Send →
        </button>
      </div>
    </div>
  )
}
