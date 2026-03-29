'use client'
// app/patients/page.js

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'

const EMPTY = { name: '', age: '', gender: 'Male', phone: '', email: '', address: '', medical_history: '' }

export default function PatientsPage() {
  const [patients, setPatients]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)   // 'add' | 'edit' | 'view' | false
  const [form, setForm]           = useState(EMPTY)
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')
  const [saving, setSaving]       = useState(false)

  const load = () => {
    setLoading(true)
    fetch('/api/patients')
      .then(r => r.json())
      .then(d => setPatients(d.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd  = ()  => { setForm(EMPTY); setModal('add') }
  const openEdit = (p) => { setForm({ ...p }); setSelected(p); setModal('edit') }
  const openView = (p) => { setSelected(p); setModal('view') }
  const close    = ()  => { setModal(false); setSelected(null) }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setSaving(true)
    const method = modal === 'add' ? 'POST' : 'PUT'
    const body   = modal === 'add' ? form    : { ...form, id: selected.id }
    await fetch('/api/patients', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    close()
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this patient? This cannot be undone.')) return
    await fetch('/api/patients', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.phone?.includes(search)
  )

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle={`${patients.length} registered patient${patients.length !== 1 ? 's' : ''}`}
        action={
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
            + Add Patient
          </button>
        }
      />

      {/* Search */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or phone…"
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <p className="text-center py-16 text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-slate-400">No patients found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 bg-slate-50">
              <tr>
                {['Name', 'Age', 'Gender', 'Phone', 'Email', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium">{p.name}</td>
                  <td className="px-6 py-3">{p.age}</td>
                  <td className="px-6 py-3">{p.gender}</td>
                  <td className="px-6 py-3">{p.phone}</td>
                  <td className="px-6 py-3 text-slate-500">{p.email}</td>
                  <td className="px-6 py-3 flex gap-2">
                    <button onClick={() => openView(p)} className="text-xs text-blue-600 hover:underline">View</button>
                    <button onClick={() => openEdit(p)} className="text-xs text-amber-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add New Patient' : 'Edit Patient'} onClose={close}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Full Name" name="name" value={form.name} onChange={handleChange} colSpan />
            <Field label="Age"    name="age"   type="number" value={form.age}   onChange={handleChange} />
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <Field label="Phone"   name="phone"   value={form.phone}   onChange={handleChange} />
            <Field label="Email"   name="email"   type="email" value={form.email} onChange={handleChange} colSpan />
            <Field label="Address" name="address" value={form.address} onChange={handleChange} colSpan />
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Medical History</label>
              <textarea name="medical_history" rows={3} value={form.medical_history} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={close} className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50 transition">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Patient'}
            </button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <Modal title="Patient Details" onClose={close}>
          <div className="space-y-3 text-sm">
            {[
              ['Name',            selected.name],
              ['Age',             selected.age],
              ['Gender',          selected.gender],
              ['Phone',           selected.phone],
              ['Email',           selected.email],
              ['Address',         selected.address],
              ['Medical History', selected.medical_history],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-semibold text-slate-500 w-36 shrink-0">{k}</span>
                <span className="text-slate-800">{v || '—'}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => { close(); openEdit(selected) }}
              className="px-4 py-2 text-sm rounded-lg bg-amber-50 text-amber-700 font-semibold border border-amber-200 hover:bg-amber-100 transition">
              Edit
            </button>
            <button onClick={close} className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50 transition">Close</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, colSpan }) {
  return (
    <div className={colSpan ? 'col-span-2' : ''}>
      <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange}
        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
    </div>
  )
}
