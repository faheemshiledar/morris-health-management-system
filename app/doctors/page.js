'use client'
// app/doctors/page.js

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'

const SPECIALIZATIONS = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Orthopedist',
  'Dermatologist', 'Pediatrician', 'Gynecologist', 'Psychiatrist',
  'Ophthalmologist', 'ENT Specialist', 'Gastroenterologist', 'Oncologist',
]

const EMPTY = { name: '', specialization: 'General Physician', phone: '', email: '', schedule: '', qualification: '' }

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [form, setForm]       = useState(EMPTY)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving]   = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/doctors')
      .then(r => r.json())
      .then(d => setDoctors(d.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd  = ()  => { setForm(EMPTY); setSelected(null); setModal('add') }
  const openEdit = (d) => { setForm({ ...d }); setSelected(d); setModal('edit') }
  const close    = ()  => { setModal(false); setSelected(null) }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setSaving(true)
    const method = modal === 'add' ? 'POST' : 'PUT'
    const body   = modal === 'add' ? form    : { ...form, id: selected.id }
    await fetch('/api/doctors', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    close()
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this doctor?')) return
    await fetch('/api/doctors', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle={`${doctors.length} doctor${doctors.length !== 1 ? 's' : ''} on staff`}
        action={
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
            + Add Doctor
          </button>
        }
      />

      {/* Cards grid */}
      {loading ? (
        <p className="text-center py-16 text-slate-400">Loading…</p>
      ) : doctors.length === 0 ? (
        <p className="text-center py-16 text-slate-400">No doctors added yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(d => (
            <div key={d.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  {d.name?.[0] ?? '?'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{d.name}</p>
                  <p className="text-xs text-blue-600">{d.specialization}</p>
                </div>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <p>📞 {d.phone}</p>
                <p>✉️ {d.email}</p>
                {d.qualification && <p>🎓 {d.qualification}</p>}
                {d.schedule      && <p>🗓️ {d.schedule}</p>}
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => openEdit(d)} className="flex-1 text-xs py-1.5 rounded-lg border text-amber-600 border-amber-200 hover:bg-amber-50 transition">Edit</button>
                <button onClick={() => handleDelete(d.id)} className="flex-1 text-xs py-1.5 rounded-lg border text-red-500 border-red-200 hover:bg-red-50 transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Doctor' : 'Edit Doctor'} onClose={close}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name"      name="name"          value={form.name}          onChange={handleChange} colSpan />
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Specialization</label>
              <select name="specialization" value={form.specialization} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                {SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <Field label="Phone"         name="phone"         value={form.phone}         onChange={handleChange} />
            <Field label="Email"         name="email"         type="email" value={form.email} onChange={handleChange} />
            <Field label="Qualification" name="qualification" value={form.qualification} onChange={handleChange} colSpan />
            <Field label="Schedule"      name="schedule"      value={form.schedule}      onChange={handleChange} colSpan
              placeholder="e.g. Mon–Fri 9am–5pm" />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={close} className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Doctor'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, colSpan, placeholder }) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
    </div>
  )
}
