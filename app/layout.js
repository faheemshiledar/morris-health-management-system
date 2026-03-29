// app/layout.js
import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title:       'Morris Health Management System',
  description: 'A modern, AI-powered clinic management platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-slate-50 text-slate-800 antialiased">
        <Sidebar />
        {/* main content — offset by sidebar width */}
        <main className="flex-1 ml-64 p-8 overflow-auto">
          {children}
        </main>
      </body>
    </html>
  )
}
