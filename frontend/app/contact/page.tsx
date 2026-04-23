'use client'

import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

const SUBJECTS = ['Demande d\'inscription', 'Renseignement', 'Partenariat', 'Autre']

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch(`${API_URL}/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', phone: '', subject: SUBJECTS[0], message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="container py-12 max-w-2xl" style={{ paddingBottom: '5rem' }}>
      <h1 className="text-3xl font-black uppercase mb-2" style={{ color: 'var(--color-primary)' }}>
        Nous contacter
      </h1>
      <p className="text-gray-500 mb-8">
        Une question, une inscription ? Envoyez-nous un message et nous vous répondrons rapidement.
      </p>

      {status === 'success' && (
        <div className="rounded-lg p-4 mb-6 font-semibold text-green-800 bg-green-100">
          ✓ Message envoyé ! Nous vous répondrons dans les plus brefs délais.
        </div>
      )}
      {status === 'error' && (
        <div className="rounded-lg p-4 mb-6 font-semibold text-red-800 bg-red-100">
          ✗ Une erreur s'est produite. Veuillez réessayer.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>Nom *</label>
          <input type="text" required value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-orange-400"
            placeholder="Votre nom" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>Email *</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-orange-400"
              placeholder="votre@email.fr" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>
              Téléphone <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input type="tel" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-orange-400"
              placeholder="06 00 00 00 00" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>Sujet *</label>
          <select required value={form.subject}
            onChange={e => setForm({ ...form, subject: e.target.value })}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-orange-400 bg-white">
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--color-primary)' }}>Message *</label>
          <textarea required rows={6} value={form.message}
            onChange={e => setForm({ ...form, message: e.target.value })}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-orange-400 resize-none"
            placeholder="Votre message..." />
        </div>

        <button type="submit" disabled={status === 'loading'}
          className="font-bold py-3 px-8 rounded transition-opacity disabled:opacity-50"
          style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-primary)' }}>
          {status === 'loading' ? 'Envoi...' : 'Envoyer le message'}
        </button>
      </form>
    </div>
  )
}
