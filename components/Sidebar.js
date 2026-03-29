'use client'
// components/Sidebar.js

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',               label: 'Dashboard',    icon: '📊' },
  { href: '/patients',       label: 'Patients',     icon: '🧑‍⚕️' },
  { href: '/doctors',        label: 'Doctors',      icon: '👨‍⚕️' },
  { href: '/appointments',   label: 'Appointments', icon: '📅' },
  { href: '/labs',           label: 'Lab Tests',    icon: '🔬' },
  { href: '/billing',        label: 'Billing',      icon: '💳' },
  { href: '/ai-assistant',   label: 'AI Assistant', icon: '🤖' },
]

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-blue-900 text-white flex flex-col shadow-xl z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-blue-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-1">Morris</p>
        <h1 className="text-lg font-bold leading-tight">Health Management</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {NAV.map(({ href, label, icon }) => {
          const active = path === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-blue-700 text-white border-r-4 border-blue-300'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-blue-800 text-xs text-blue-400">
        <p>Morris HMS v1.0</p>
        <p className="mt-0.5">Powered by Groq AI</p>
      </div>
    </aside>
  )
}
