// app/api/billing/route.js
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('billing')
    .select('*, patients(name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req) {
  const { patient_id, description, amount, status, due_date } = await req.json()

  const { data, error } = await supabase
    .from('billing')
    .insert([{ patient_id, description, amount, status, due_date }])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PUT(req) {
  const { id, patient_id, description, amount, status, due_date } = await req.json()

  const { data, error } = await supabase
    .from('billing')
    .update({ patient_id, description, amount, status, due_date })
    .eq('id', id)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req) {
  const { id } = await req.json()
  const { error } = await supabase.from('billing').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
