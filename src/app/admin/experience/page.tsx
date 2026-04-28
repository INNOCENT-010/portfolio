'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Experience } from '@/lib/supabase'

export default function AdminExperiencePage() {
  const [items, setItems] = useState<Experience[]>([])
  const [editing, setEditing] = useState<Partial<Experience> | null>(null)
  const [techInput, setTechInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await supabase.from('experience').select('*').order('order_index')
    setItems(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing({ company: '', role: '', start_date: '', end_date: '', current: false, description: '', tech_stack: [], order_index: items.length + 1 }); setTechInput('') }
  const openEdit = (e: Experience) => { setEditing({ ...e }); setTechInput(e.tech_stack.join(', ')) }
  const cancel = () => setEditing(null)

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const payload = { ...editing, tech_stack: techInput.split(',').map(t => t.trim()).filter(Boolean) }
    const { error } = editing.id
      ? await supabase.from('experience').update(payload).eq('id', editing.id)
      : await supabase.from('experience').insert(payload)
    setSaving(false)
    if (!error) { await load(); cancel() }
  }

  const del = async (id: string) => {
    if (!confirm('Delete?')) return
    await supabase.from('experience').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Experience</h1>
        <button onClick={openNew} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '10px 20px', background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>+ Add Role</button>
      </div>

      {editing && (
        <div style={{ marginBottom: '28px', padding: '24px', border: '1px solid rgba(200,241,53,0.25)', borderRadius: '10px', background: 'rgba(200,241,53,0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
            {[['company', 'Company'], ['role', 'Role'], ['start_date', 'Start Date (e.g. Jan 2023)'], ['end_date', 'End Date']].map(([field, label]) => (
              <div key={field}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '6px' }}>{label.toUpperCase()}</label>
                <input value={(editing as any)[field] ?? ''} onChange={e => setEditing(p => ({ ...p, [field]: e.target.value }))}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '10px 12px', color: '#F7F7F5', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none' }} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '6px' }}>DESCRIPTION</label>
            <textarea rows={3} value={editing.description ?? ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '10px 12px', color: '#F7F7F5', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none', resize: 'vertical' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '6px' }}>TECH STACK (comma-separated)</label>
            <input value={techInput} onChange={e => setTechInput(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '10px 12px', color: '#F7F7F5', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none' }} />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '16px', cursor: 'pointer' }}>
            <input type="checkbox" checked={editing.current ?? false} onChange={e => setEditing(p => ({ ...p, current: e.target.checked }))} />
            Current role
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={save} disabled={saving} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '10px 24px', background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancel} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '10px 20px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>Loading…</p> : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {items.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{item.role}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)' }}>{item.company}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                  {item.start_date} — {item.current ? 'Present' : item.end_date}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(item)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Edit</button>
                <button onClick={() => del(item.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '6px 14px', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '4px', background: 'transparent', color: 'rgba(255,100,100,0.5)', cursor: 'pointer' }}>Del</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
