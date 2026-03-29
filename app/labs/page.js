'use client'
// app/labs/page.js

import { useEffect, useState } from 'react'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'

const TEST_NAMES = [
  'Complete Blood Count (CBC)', 'Blood Glucose (Fasting)', 'HbA1c',
  'Lipid Panel', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)',
  'Thyroid Profile (T3/T4/TSH)', 'Urine Routine', 'COVID-19 PCR',
  'Vitamin D', 'Vitamin B12', 'Iron Studies', 'ECG', 'X-Ray', 'MRI', 'CT Scan',
]

const STATUS_COLORS = {
  Pending:    'bg-yellow-100 text-yellow-700',
  Processing: 'bg-blue-100 text-blue-700',
  Completed:  'bg-green-100 text-green-700',
}

const EMPTY = { patient_id: '', test_name: 'Complete Blood Count (CBC)', result: '', status: 'Pending', notes: '' }

export default function LabsPage() {
  const [labs, setLabs]           = useState([])
  const [patients, setPatients]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [selected, setSelected]   = useState(null)
  const [saving, setSaving]       = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult]   = useState('')
  const [filter, setFilter]       = useState('All')

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/labs').then(r => r.json()),
      fetch('/api/patients').then(r => r.json()),
    ]).then(([l, p]) => {
      setLabs(l.data ?? [])
      setPatients(p.data ?? [])
    }).finally(() => setLoading(false))
  }

  useEffect(load, [])

  const openAdd  = ()  => { setForm(EMPTY); setSelected(null); setAiResult(''); setModal('add') }
  const openEdit = (l) => {
    setForm({
      patient_id: l.patient_id,
      test_name:  l.test_name,
      result:     l.result ?? '',
      status:     l.status,
      notes:      l.notes ?? '',
    })
    setSelected(l)
    setAiResult(l.ai_explanation ?? '')
    setModal('edit')
  }
  const openView = (l) => { setSelected(l); setAiResult(l.ai_explanation ?? ''); setModal('view') }
  const close    = ()  => { setModal(false); setSelected(null); setAiResult('') }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async () => {
    setSaving(true)
    const method = modal === 'add' ? 'POST' : 'PUT'
    const body   = modal === 'add'
      ? { ...form, ai_explanation: aiResult }
      : { ...form, id: selected.id, ai_explanation: aiResult }

    await fetch('/api/labs', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    close()
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this lab test?')) return
    await fetch('/api/labs', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  const explainWithAI = async () => {
    if (!form.result) return alert('Please enter a result first.')
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lab',
          testName: form.test_name,
          result: form.result,
          notes: form.notes,
        }),
      })
      const d = await res.json()
      setAiResult(d.response ?? '')
    } catch (err) {
      alert('AI explanation failed. Check your GROQ_API_KEY.')
    } finally {
      setAiLoading(false)
    }
  }

  const filtered = filter === 'All' ? labs : labs.filter(l => l.status === filter)

  return (
    <div>
      <PageHeader
        title="Lab Tests"
        subtitle={`${labs.length} test record${labs.length !== 1 ? 's' : ''}`}
        action={
          <button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
            + Add Lab Test
          </button>
        }
      />

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {['All', 'Pending', 'Processing', 'Completed'].map(s => (
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
          <p className="text-center py-16 text-slate-400">No lab tests found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 bg-slate-50">
              <tr>
                {['Patient', 'Test', 'Result', 'Status', 'AI', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(l => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium">{l.patients?.name ?? '—'}</td>
                  <td className="px-5 py-3">{l.test_name}</td>
                  <td className="px-5 py-3 max-w-[140px] truncate text-slate-500">{l.result || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[l.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    {l.ai_explanation ? '🤖✅' : '—'}
                  </td>
                  <td className="px-5 py-3 flex gap-2">
                    <button onClick={() => openView(l)} className="text-xs text-blue-600 hover:underline">View</button>
                    <button onClick={() => openEdit(l)} className="text-xs text-amber-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(l.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Add Lab Test' : 'Edit Lab Test'} onClose={close}>
          <div className="space-y-4">
            {/* Patient */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Patient</label>
              <select name="patient_id" value={form.patient_id} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                <option value="">— Select Patient —</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {/* Test Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Test Name</label>
              <select name="test_name" value={form.test_name} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                {TEST_NAMES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            {/* Result */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Result</label>
              <textarea name="result" rows={2} value={form.result} onChange={handleChange}
                placeholder="e.g. Hemoglobin: 11.2 g/dL, WBC: 5500/µL …"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
                {['Pending', 'Processing', 'Completed'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Notes</label>
              <textarea name="notes" rows={2} value={form.notes} onChange={handleChange}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            </div>

            {/* AI Explain Button */}
            <div>
              <button onClick={explainWithAI} disabled={aiLoading}
                className="w-full py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition disabled:opacity-50">
                {aiLoading ? '🤖 Generating explanation…' : '🤖 Explain Results with AI'}
              </button>
            </div>

            {/* AI Result */}
            {aiResult && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-900 whitespace-pre-wrap">
                <p className="font-semibold text-purple-700 mb-2">🤖 Morris AI Explanation</p>
                {aiResult}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-5">
            <button onClick={close} className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50">
              {saving ? 'Saving…' : 'Save Test'}
            </button>
          </div>
        </Modal>
      )}

      {/* View Modal */}
      {modal === 'view' && selected && (
        <Modal title="Lab Test Details" onClose={close}>
          <div className="space-y-3 text-sm">
            {[
              ['Patient',   selected.patients?.name],
              ['Test Name', selected.test_name],
              ['Status',    selected.status],
              ['Result',    selected.result],
              ['Notes',     selected.notes],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-semibold text-slate-500 w-28 shrink-0">{k}</span>
                <span className="text-slate-800">{v || '—'}</span>
              </div>
            ))}
          </div>
          {selected.ai_explanation && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-purple-900 whitespace-pre-wrap">
              <p className="font-semibold text-purple-700 mb-2">🤖 Morris AI Explanation</p>
              {selected.ai_explanation}
            </div>
          )}
          <div className="mt-5 flex justify-end">
            <button onClick={close} className="px-4 py-2 text-sm rounded-lg border hover:bg-slate-50">Close</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
