'use client'
// app/appointments/page.js

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'

const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Cancelled', 'No-Show']
const EMPTY = { patient_id: '', doctor_id: '', date: '', time: '', status: 'Scheduled', notes: '' }

const STATUS_COLORS = {
  Scheduled:  'bg-blue-100 text-blue-700',
  Completed:  'bg-green-100 text-green-700',
  Cancelled:  'bg-red-100 text-red-700',
  'No-Show':  'bg-orange-100 text-orange-700',
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([])
  const [patients, setPatients]         = useState([])
  const [doctors, setDoctors]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [modal, setModal]               = useState(false)
  const [form, setForm]                 = useState(EMPTY)
  const [selected, setSelected]         = useState(null)
  const [saving, setSaving]             = useState(false)
  const [filter, setFilter]             = useState('All')

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/appointments').then(r => r.json()),
      fetch('/api/patients').then(r => r.json()),
      fetch('/api/doctors').then(r => r.json()),
    ]).then(([a, p, d]) => {
      setAppointments(a.data ?? [])
      setPatients(p.data ?? [])
      setDoctors(d.data ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd  = ()  => { setForm(EMPTY); setSelected(null); setModal('add') }
  const openEdit = (a) => { 
    setForm({
      patient_id: a.patient_id,
      doctor_id:  a.doctor_id,
      date:       a.date,
      time:       a.time,
      status:     a.status,
      notes:      a.notes ?? '',
    })
    setSelected(a)
    setModal('edit')
  }
  const close = () => { setModal(false); setSelected(null) }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setSaving(true)
    const method = modal === 'add' ? 'POST' : 'PUT'
    const body   = modal === 'add' ? form : { ...form, id: selected.id }
    await fetch('/api/appointments', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    close()
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this appointment?')) return
    await fetch('/api/appointments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const filtered = filter === 'All'
    ? appointments
    : appointments.filter(a => a.status === filter)

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={`${appointments.length} total appointment${appointments.length !== 1 ? 's' : ''}`}
        action={
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
            + New Appointment
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['All', ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
              ${filter === s
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <p className="text-center py-16 text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-slate-400">No appointments found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 bg-slate-50">
              <tr>
                {['Patient', 'Doctor', 'Date', 'Time', 'Status', 'Notes', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium">{a.patients?.name ?? '—'}</td>
                  <td className="px-5 py-3">{a.doctors?.name ?? '—'}</td>
                  <td className="px-5 py-3">{a.date}</td>
                  <td className="px-5 py-3">{a.time}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-[150px] truncate">{a.notes || '—'}</td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => openEdit(a)} className="text-xs text-amber-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(a.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'New Appointment' : 'Edit Appointment'} onClose={close}>
          <div className="grid grid-cols-2 gap-4">
            {/* Patient */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Patient</label>
              <select name="patient_id" value={form.patient_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">— Select Patient —</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {/* Doctor */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor</label>
              <select name="doctor_id" value={form.doctor_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">— Select Doctor —</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization}</option>)}
              </select>
            </div>
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            {/* Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Time</label>
              <input type="time" name="time" value={form.time} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            {/* Status */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
              <textarea name="notes" rows={3} value={form.notes} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={close} className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Appointment'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
