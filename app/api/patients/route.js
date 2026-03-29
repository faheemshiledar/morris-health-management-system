// app/api/patients/route.js
import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req) {
  const body = await req.json()
  const { name, age, gender, phone, email, address, medical_history } = body

  const { data, error } = await supabase
    .from('patients')
    .insert([{ name, age, gender, phone, email, address, medical_history }])
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function PUT(req) {
  const body = await req.json()
  const { id, name, age, gender, phone, email, address, medical_history } = body

  const { data, error } = await supabase
    .from('patients')
    .update({ name, age, gender, phone, email, address, medical_history })
    .eq('id', id)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req) {
  const { id } = await req.json()

  const { error } = await supabase.from('patients').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
