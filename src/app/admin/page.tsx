'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/lib/supabase'

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [uploading, setUploading] = useState<string | null>(null)
  const heroRef = useRef<HTMLInputElement>(null)
  const profileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/profile')
      .then(r => r.json())
      .then(data => { setProfile(data); setLoading(false) })
  }, [])

  const uploadImage = async (file: File, field: 'hero_image_url' | 'profile_image_url') => {
    setUploading(field)
    setMsg('')
    const ext = file.name.split('.').pop()
    const filename = `${field}-${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('project-images')
      .upload(filename, file, { upsert: true })
    if (error) { setMsg(`Upload failed: ${error.message}`); setUploading(null); return }
    const { data } = supabase.storage.from('project-images').getPublicUrl(filename)
    setProfile(p => ({ ...p, [field]: data.publicUrl }))
    setUploading(null)
    setMsg(`Photo uploaded — click Save Profile to apply.`)
  }

  const save = async () => {
    if (!profile.id) return
    setSaving(true)
    setMsg('')
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg(`Error: ${data.error}`); return }
    setProfile(data)
    setMsg('✓ Profile saved!')
  }

  const inp: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '10px 12px',
    color: '#fff',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.82rem',
    outline: 'none',
  }

  const lbl: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: '0.1em',
    display: 'block',
    marginBottom: '6px',
    textTransform: 'uppercase',
  }

  const ImageUpload = ({
    field, label, hint, previewStyle,
  }: {
    field: 'hero_image_url' | 'profile_image_url'
    label: string
    hint: string
    previewStyle: React.CSSProperties
  }) => {
    const ref = field === 'hero_image_url' ? heroRef : profileRef
    return (
      <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <label style={lbl}>{label}</label>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', marginBottom: '14px' }}>{hint}</p>
        {(profile as any)[field] && (
          <div style={{ marginBottom: '14px', position: 'relative', display: 'inline-block' }}>
            <img src={(profile as any)[field]} alt={label} style={{ ...previewStyle, display: 'block', border: '1px solid rgba(255,255,255,0.08)', objectFit: 'cover', objectPosition: 'center top' }} />
            <button
              onClick={() => setProfile(p => ({ ...p, [field]: '' }))}
              style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.65rem', padding: '3px 8px', cursor: 'pointer' }}>
              Remove
            </button>
          </div>
        )}
        <div
          onClick={() => !uploading && ref.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
          onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
          onDrop={e => {
            e.preventDefault()
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
            const f = e.dataTransfer.files?.[0]
            if (f && f.type.startsWith('image/')) uploadImage(f, field)
          }}
          style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '28px', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading === field ? 0.6 : 1, transition: 'border-color 0.2s' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: uploading === field ? '#fff' : 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
            {uploading === field ? 'Uploading…' : `Click or drag to upload ${label}`}
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)' }}>PNG, JPG, WEBP</p>
        </div>
        <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, field) }} />
      </div>
    )
  }

  if (loading) return (
    <div style={{ padding: '48px 32px' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>Loading…</p>
    </div>
  )

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 32px' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '6px' }}>Profile</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', marginBottom: '36px' }}>
        Changes save to Supabase via the server — images persist.
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>

        <ImageUpload
          field="hero_image_url"
          label="Hero Background Photo"
          hint="Full-screen background on homepage. Recommended: 1920×1080px landscape."
          previewStyle={{ width: '100%', maxWidth: '480px', height: '200px' }}
        />

        <ImageUpload
          field="profile_image_url"
          label="Profile / DP Photo"
          hint="Shown on the About page. Recommended: portrait, 600×800px."
          previewStyle={{ width: '160px', height: '200px' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {([
            { field: 'name', label: 'Full Name' },
            { field: 'title', label: 'Job Title' },
            { field: 'email', label: 'Email' },
            { field: 'location', label: 'Location' },
            { field: 'whatsapp', label: 'WhatsApp Number (e.g. 2348104945035)' },
            { field: 'phone', label: 'Phone / Call Number' },
            { field: 'github_url', label: 'GitHub URL' },
            { field: 'linkedin_url', label: 'LinkedIn URL' },
          ] as const).map(({ field, label }) => (
            <div key={field} style={{ gridColumn: field === 'github_url' || field === 'linkedin_url' ? 'span 2' : 'span 1' }}>
              <label style={lbl}>{label}</label>
              <input
                value={(profile as any)[field] ?? ''}
                onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
                style={inp}
              />
            </div>
          ))}
        </div>

        <div>
          <label style={lbl}>Bio</label>
          <textarea rows={5} value={profile.bio ?? ''}
            onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
            style={{ ...inp, resize: 'vertical' }} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
          <input type="checkbox" checked={profile.available ?? false}
            onChange={e => setProfile(p => ({ ...p, available: e.target.checked }))} />
          Available for work
        </label>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '28px', alignItems: 'center' }}>
        <button onClick={save} disabled={saving || !!uploading}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '11px 28px', background: '#fff', color: '#000', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: (saving || !!uploading) ? 0.6 : 1 }}>
          {saving ? 'Saving…' : 'Save Profile'}
        </button>
        {msg && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: msg.startsWith('Error') || msg.startsWith('Upload failed') ? '#ff6b6b' : 'rgba(255,255,255,0.6)' }}>
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}