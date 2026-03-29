// app/api/dashboard/route.js
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]

    const [
      { count: patients },
      { count: doctors },
      { count: todayAppts },
      { count: pendingLabs },
      { count: doneLabs },
      { count: totalAppts },
      { data: recentAppointments },
    ] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('doctors').select('*', { count: 'exact', head: true }),
      supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('date', today),
      supabase.from('lab_tests').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
      supabase.from('lab_tests').select('*', { count: 'exact', head: true }).eq('status', 'Completed'),
      supabase.from('appointments').select('*', { count: 'exact', head: true }),
      supabase.from('appointments')
        .select('id, date, time, status, patients(name), doctors(name)')
        .order('created_at', { ascending: false })
        .limit(8),
    ])

    return NextResponse.json({
      stats: { patients, doctors, todayAppts, pendingLabs, doneLabs, totalAppts },
      recentAppointments: recentAppointments ?? [],
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
