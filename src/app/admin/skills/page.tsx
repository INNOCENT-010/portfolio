'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Skill } from '@/lib/supabase'

const categories = ['Frontend', 'Backend', 'DevOps', 'Other']

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [editing, setEditing] = useState<Partial<Skill> | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const load = async () => {
    const { data } = await supabase.from('skills').select('*').order('order_index')
    setSkills(data ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => setEditing({ name: '', category: 'Frontend', proficiency: 80, order_index: skills.length + 1 })
  const cancel = () => { setEditing(null); setMsg('') }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    const { error } = editing.id
      ? await supabase.from('skills').update(editing).eq('id', editing.id)
      : await supabase.from('skills').insert(editing)
    setSaving(false)
    if (error) return setMsg(`Error: ${error.message}`)
    await load(); cancel()
  }

  const del = async (id: string) => {
    if (!confirm('Delete?')) return
    await supabase.from('skills').delete().eq('id', id)
    load()
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Skills</h1>
        <button onClick={openNew} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '10px 20px', background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>
          + Add Skill
        </button>
      </div>

      {editing && (
        <div style={{ marginBottom: '28px', padding: '24px', border: '1px solid rgba(200,241,53,0.25)', borderRadius: '10px', background: 'rgba(200,241,53,0.03)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '6px' }}>NAME</label>
              <input value={editing.name ?? ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '10px 12px', color: '#F7F7F5', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '6px' }}>CATEGORY</label>
              <select value={editing.category ?? 'Frontend'} onChange={e => setEditing(p => ({ ...p, category: e.target.value as any }))}
                style={{ width: '100%', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '10px 12px', color: '#F7F7F5', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none' }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '6px' }}>PROFICIENCY ({editing.proficiency}%)</label>
              <input type="range" min={0} max={100} value={editing.proficiency ?? 80} onChange={e => setEditing(p => ({ ...p, proficiency: Number(e.target.value) }))}
                style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: '6px' }}>ORDER</label>
              <input type="number" value={editing.order_index ?? 0} onChange={e => setEditing(p => ({ ...p, order_index: Number(e.target.value) }))}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '10px 12px', color: '#F7F7F5', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={save} disabled={saving} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '10px 24px', background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancel} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '10px 20px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            {msg && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent)' }}>{msg}</span>}
          </div>
        </div>
      )}

      {loading ? <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>Loading…</p> : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {categories.map(cat => {
            const catSkills = skills.filter(s => s.category === cat)
            if (!catSkills.length) return null
            return (
              <div key={cat}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>{cat.toUpperCase()}</p>
                {catSkills.map(s => (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', marginBottom: '6px', background: 'rgba(255,255,255,0.02)' }}>
                    <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>{s.name}</span>
                    <div style={{ width: '120px', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                      <div style={{ height: '100%', width: `${s.proficiency}%`, background: 'var(--accent)', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', width: '36px' }}>{s.proficiency}%</span>
                    <button onClick={() => setEditing(s)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '5px 10px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '3px', background: 'transparent', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => del(s.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '5px 10px', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '3px', background: 'transparent', color: 'rgba(255,100,100,0.5)', cursor: 'pointer' }}>Del</button>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
