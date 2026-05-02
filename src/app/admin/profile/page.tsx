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
  const cvRef = useRef<HTMLInputElement>(null)

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
    const { error } = await supabase.storage.from('project-images').upload(filename, file, { upsert: true })
    if (error) { setMsg(`Upload failed: ${error.message}`); setUploading(null); return }
    const { data } = supabase.storage.from('project-images').getPublicUrl(filename)
    setProfile(p => ({ ...p, [field]: data.publicUrl }))
    setUploading(null)
    setMsg('Photo uploaded — click Save to apply.')
  }

  const uploadCV = async (file: File) => {
    setUploading('cv_url')
    setMsg('')
    const ext = file.name.split('.').pop()
    const filename = `cv-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('project-images').upload(filename, file, {
      upsert: true,
      contentType: file.type,
    })
    if (error) { setMsg(`CV upload failed: ${error.message}`); setUploading(null); return }
    const { data } = supabase.storage.from('project-images').getPublicUrl(filename)
    setProfile(p => ({ ...p, cv_url: data.publicUrl }))
    setUploading(null)
    setMsg('CV uploaded — click Save to apply.')
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
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '10px 12px', color: '#fff',
    fontFamily: 'var(--font-mono)', fontSize: '0.82rem', outline: 'none',
  }

  const lbl: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em',
    display: 'block', marginBottom: '6px', textTransform: 'uppercase',
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
        Uploads save to Supabase Storage. Always click Save Profile after uploading.
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>

        {/* Hero image */}
        <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={lbl}>Hero Background Photo</label>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', marginBottom: '14px' }}>
            Full-screen background on homepage. Recommended: 1920×1080px landscape.
          </p>
          {profile.hero_image_url && (
            <div style={{ marginBottom: '14px', position: 'relative', display: 'inline-block' }}>
              <img src={profile.hero_image_url} alt="Hero"
                style={{ width: '100%', maxWidth: '460px', height: '180px', objectFit: 'cover', objectPosition: 'center top', display: 'block', border: '1px solid rgba(255,255,255,0.08)' }} />
              <button onClick={() => setProfile(p => ({ ...p, hero_image_url: '' }))}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.65rem', padding: '3px 8px', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          )}
          <div onClick={() => !uploading && heroRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
            onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            onDrop={e => {
              e.preventDefault()
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              const f = e.dataTransfer.files?.[0]
              if (f?.type.startsWith('image/')) uploadImage(f, 'hero_image_url')
            }}
            style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '24px', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'border-color 0.2s', opacity: uploading === 'hero_image_url' ? 0.6 : 1 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: uploading === 'hero_image_url' ? '#fff' : 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
              {uploading === 'hero_image_url' ? 'Uploading…' : 'Click or drag to upload hero photo'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)' }}>PNG, JPG, WEBP</p>
          </div>
          <input ref={heroRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'hero_image_url') }} />
        </div>

        {/* Profile image */}
        <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={lbl}>Profile / DP Photo</label>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', marginBottom: '14px' }}>
            Shown on the About page. Recommended: portrait, 600×800px.
          </p>
          {profile.profile_image_url && (
            <div style={{ marginBottom: '14px', position: 'relative', display: 'inline-block' }}>
              <img src={profile.profile_image_url} alt="Profile"
                style={{ width: '140px', height: '180px', objectFit: 'cover', objectPosition: 'center top', display: 'block', border: '1px solid rgba(255,255,255,0.08)' }} />
              <button onClick={() => setProfile(p => ({ ...p, profile_image_url: '' }))}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.65rem', padding: '3px 8px', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          )}
          <div onClick={() => !uploading && profileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
            onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            onDrop={e => {
              e.preventDefault()
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              const f = e.dataTransfer.files?.[0]
              if (f?.type.startsWith('image/')) uploadImage(f, 'profile_image_url')
            }}
            style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '24px', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'border-color 0.2s', opacity: uploading === 'profile_image_url' ? 0.6 : 1 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: uploading === 'profile_image_url' ? '#fff' : 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
              {uploading === 'profile_image_url' ? 'Uploading…' : 'Click or drag to upload profile photo'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)' }}>PNG, JPG, WEBP</p>
          </div>
          <input ref={profileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'profile_image_url') }} />
        </div>

        {/* CV upload */}
        <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <label style={lbl}>CV / Resume</label>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.18)', marginBottom: '14px' }}>
            Visitors can view and download from /cv. PDF or Word doc.
          </p>
          {profile.cv_url && (
            <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)' }}>
                {profile.cv_url.split('/').pop()?.slice(0, 40)}…
              </span>
              <a href={profile.cv_url} target="_blank" rel="noopener noreferrer"
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#fff', textDecoration: 'none', marginLeft: 'auto', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
                Preview ↗
              </a>
              <button onClick={() => setProfile(p => ({ ...p, cv_url: '' }))}
                style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.6)', cursor: 'pointer', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                Remove
              </button>
            </div>
          )}
          <div onClick={() => !uploading && cvRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
            onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}
            onDrop={e => {
              e.preventDefault()
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'
              const f = e.dataTransfer.files?.[0]
              if (f) uploadCV(f)
            }}
            style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '24px', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'border-color 0.2s', opacity: uploading === 'cv_url' ? 0.6 : 1 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: uploading === 'cv_url' ? '#fff' : 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
              {uploading === 'cv_url' ? 'Uploading CV…' : 'Click or drag to upload CV'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)' }}>PDF or DOCX recommended</p>
          </div>
          <input ref={cvRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadCV(f) }} />
        </div>

        {/* Text fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {([
            { field: 'name', label: 'Full Name' },
            { field: 'title', label: 'Job Title' },
            { field: 'email', label: 'Email' },
            { field: 'location', label: 'Location' },
            { field: 'whatsapp', label: 'WhatsApp (e.g. 2348104945035)' },
            { field: 'phone', label: 'Phone / Call Number' },
          ] as const).map(({ field, label }) => (
            <div key={field}>
              <label style={lbl}>{label}</label>
              <input value={(profile as any)[field] ?? ''}
                onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
                style={inp} />
            </div>
          ))}
        </div>

        {([
          { field: 'github_url', label: 'GitHub URL' },
          { field: 'linkedin_url', label: 'LinkedIn URL' },
        ] as const).map(({ field, label }) => (
          <div key={field}>
            <label style={lbl}>{label}</label>
            <input value={(profile as any)[field] ?? ''}
              onChange={e => setProfile(p => ({ ...p, [field]: e.target.value }))}
              style={inp} />
          </div>
        ))}

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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: msg.startsWith('Error') || msg.startsWith('CV upload failed') || msg.startsWith('Upload failed') ? '#ff6b6b' : 'rgba(255,255,255,0.6)' }}>
            {msg}
          </span>
        )}
      </div>
    </div>
  )
}