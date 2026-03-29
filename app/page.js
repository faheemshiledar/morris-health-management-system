'use client'
// app/page.js — Dashboard

import { useEffect, useState } from 'react'
import StatCard from '@/components/StatCard'
import PageHeader from '@/components/PageHeader'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setStats(d.stats)
        setRecent(d.recentAppointments ?? [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Loading dashboard…</div>

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back — here's your clinic at a glance."
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        <StatCard title="Total Patients"      value={stats?.patients}     icon="🧑‍⚕️" color="blue"   />
        <StatCard title="Total Doctors"       value={stats?.doctors}      icon="👨‍⚕️" color="green"  />
        <StatCard title="Appointments Today"  value={stats?.todayAppts}   icon="📅"   color="orange" />
        <StatCard title="Pending Lab Tests"   value={stats?.pendingLabs}  icon="🔬"   color="purple" />
        <StatCard title="Completed Tests"     value={stats?.doneLabs}     icon="✅"   color="teal"   />
        <StatCard title="Total Appointments"  value={stats?.totalAppts}   icon="📋"   color="blue"   />
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="font-semibold text-slate-700">Recent Appointments</h2>
        </div>
        {recent.length === 0 ? (
          <p className="text-center py-10 text-slate-400">No appointments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 bg-slate-50">
              <tr>
                {['Patient', 'Doctor', 'Date', 'Time', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3">{a.patients?.name ?? '—'}</td>
                  <td className="px-6 py-3">{a.doctors?.name ?? '—'}</td>
                  <td className="px-6 py-3">{a.date}</td>
                  <td className="px-6 py-3">{a.time}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      ${a.status === 'Completed'  ? 'bg-green-100 text-green-700'  :
                        a.status === 'Cancelled'  ? 'bg-red-100 text-red-700'    :
                                                    'bg-blue-100 text-blue-700'   }`}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick tip */}
      <div className="mt-8 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex items-center gap-4">
        <span className="text-3xl">🤖</span>
        <div>
          <p className="font-semibold">Try Morris AI Assistant</p>
          <p className="text-blue-200 text-sm mt-0.5">Generate patient summaries, explain lab results, and get health insights — powered by Groq.</p>
        </div>
        <a href="/ai-assistant" className="ml-auto shrink-0 bg-white text-blue-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition">
          Open AI →
        </a>
      </div>
    </div>
  )
}
