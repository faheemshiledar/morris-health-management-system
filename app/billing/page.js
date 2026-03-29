'use client'
// app/billing/page.js

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import StatCard from '@/components/StatCard'

const STATUS_COLORS = {
  Paid:    'bg-green-100 text-green-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Overdue: 'bg-red-100 text-red-700',
}

const EMPTY = { patient_id: '', description: '', amount: '', status: 'Pending', due_date: '' }

export default function BillingPage() {
  const [bills, setBills]         = useState([])
  const [patients, setPatients]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [selected, setSelected]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [filter, setFilter]       = useState('All')

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/billing').then(r => r.json()),
      fetch('/api/patients').then(r => r.json()),
    ]).then(([b, p]) => {
      setBills(b.data ?? [])
      setPatients(p.data ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd  = ()  => { setForm(EMPTY); setSelected(null); setModal('add') }
  const openEdit = (b) => {
    setForm({ patient_id: b.patient_id, description: b.description, amount: b.amount, status: b.status, due_date: b.due_date ?? '' })
    setSelected(b); setModal('edit')
  }
  const close = () => { setModal(false); setSelected(null) }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setSaving(true)
    const method = modal === 'add' ? 'POST' : 'PUT'
    const body   = modal === 'add' ? form : { ...form, id: selected.id }
    await fetch('/api/billing', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false); close(); load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this bill?')) return
    await fetch('/api/billing', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const totalPaid    = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + Number(b.amount), 0)
  const totalPending = bills.filter(b => b.status === 'Pending').reduce((s, b) => s + Number(b.amount), 0)
  const totalOverdue = bills.filter(b => b.status === 'Overdue').reduce((s, b) => s + Number(b.amount), 0)

  const filtered = filter === 'All' ? bills : bills.filter(b => b.status === filter)

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

  return (
    <div>
      <PageHeader
        title="Billing & Payments"
        subtitle="Track invoices and payment status"
        action={
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
            + New Bill
          </button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <StatCard title="Total Collected"  value={fmt(totalPaid)}    icon="💰" color="green"  />
        <StatCard title="Pending Amount"   value={fmt(totalPending)} icon="⏳" color="orange" />
        <StatCard title="Overdue Amount"   value={fmt(totalOverdue)} icon="⚠️" color="red"    />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5">
        {['All', 'Paid', 'Pending', 'Overdue'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
              ${filter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <p className="text-center py-16 text-slate-400">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-16 text-slate-400">No bills found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 bg-slate-50">
              <tr>
                {['Patient', 'Description', 'Amount', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(b => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium">{b.patients?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-slate-500">{b.description}</td>
                  <td className="px-5 py-3 font-semibold">{fmt(b.amount)}</td>
                  <td className="px-5 py-3">{b.due_date || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => openEdit(b)} className="text-xs text-amber-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(b.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'New Bill' : 'Edit Bill'} onClose={close}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Patient</label>
              <select name="patient_id" value={form.patient_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">— Select Patient —</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <input name="description" value={form.description} onChange={handleChange}
                placeholder="e.g. Consultation + CBC Test"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Amount (₹)</label>
                <input type="number" name="amount" value={form.amount} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Due Date</label>
                <input type="date" name="due_date" value={form.due_date} onChange={handleChange}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                {['Pending', 'Paid', 'Overdue'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button onClick={close} className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Bill'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
