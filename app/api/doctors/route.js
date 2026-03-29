// app/api/doctors/route.js
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req) {
  const { name, specialization, phone, email, schedule, qualification } = await req.json()

  const { data, error } = await supabase
    .from('doctors')
    .insert([{ name, specialization, phone, email, schedule, qualification }])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PUT(req) {
  const { id, name, specialization, phone, email, schedule, qualification } = await req.json()

  const { data, error } = await supabase
    .from('doctors')
    .update({ name, specialization, phone, email, schedule, qualification })
    .eq('id', id)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req) {
  const { id } = await req.json()
  const { error } = await supabase.from('doctors').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
