// components/StatCard.js

export default function StatCard({ title, value, icon, color = 'blue', sub }) {
  const colors = {
    blue:   'bg-blue-50 border-blue-200 text-blue-700',
    green:  'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red:    'bg-red-50 border-red-200 text-red-700',
    teal:   'bg-teal-50 border-teal-200 text-teal-700',
  }

  return (
    <div className={`rounded-xl border p-5 ${colors[color]} flex items-center gap-4`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{title}</p>
        <p className="text-3xl font-bold mt-0.5">{value ?? '—'}</p>
        {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
      </div>
    </div>
  )
}
