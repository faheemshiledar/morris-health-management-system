// app/api/appointments/route.js
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(name), doctors(name, specialization)')
    .order('date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req) {
  const { patient_id, doctor_id, date, time, status, notes } = await req.json()

  const { data, error } = await supabase
    .from('appointments')
    .insert([{ patient_id, doctor_id, date, time, status, notes }])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PUT(req) {
  const { id, patient_id, doctor_id, date, time, status, notes } = await req.json()

  const { data, error } = await supabase
    .from('appointments')
    .update({ patient_id, doctor_id, date, time, status, notes })
    .eq('id', id)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req) {
  const { id } = await req.json()
  const { error } = await supabase.from('appointments').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
