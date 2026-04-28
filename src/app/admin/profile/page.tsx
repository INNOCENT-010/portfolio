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
    supabase.from('profile').select('*').single().then(({ data }) => {
      if (data) setProfile(data)
      setLoading(false)
    })
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
    setMsg(`${field === 'hero_image_url' ? 'Hero' : 'Profile'} photo uploaded — click Save to apply.`)
  }

  const save = async () => {
    if (!profile.id) return
    setSaving(true)
    setMsg('')
    const { error } = await supabase.from('profile').update({
      name: profile.name,
      title: profile.title,
      bio: profile.bio,
      email: profile.email,
      github_url: profile.github_url,
      linkedin_url: profile.linkedin_url,
      location: profile.location,
      available: profile.available,
      hero_image_url: profile.hero_image_url,
      profile_image_url: profile.profile_image_url,
    }).eq('id', profile.id)
    setSaving(false)
    setMsg(error ? `Error: ${error.message}` : '✓ Profile saved!')
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
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>Profile</h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '36px' }}>
        Upload photos and edit your bio here.
      </p>

      <div style={{ display: 'grid', gap: '28px' }}>

        {/* Hero image */}
        <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
          <label style={lbl}>Hero Background Photo</label>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginBottom: '14px' }}>
            Displays full-screen behind your name on the homepage
          </p>
          {profile.hero_image_url && (
            <div style={{ marginBottom: '14px', position: 'relative', display: 'inline-block' }}>
              <img src={profile.hero_image_url} alt="Hero"
                style={{ width: '100%', maxWidth: '480px', height: '200px', objectFit: 'cover', objectPosition: 'center top', display: 'block', border: '1px solid rgba(255,255,255,0.08)' }} />
              <button onClick={() => setProfile(p => ({ ...p, hero_image_url: '' }))}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.7rem', padding: '4px 8px', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          )}
          <div onClick={() => heroRef.current?.click()}
            style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '24px', textAlign: 'center', cursor: uploading === 'hero_image_url' ? 'not-allowed' : 'pointer', opacity: uploading === 'hero_image_url' ? 0.6 : 1 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: uploading === 'hero_image_url' ? '#fff' : 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
              {uploading === 'hero_image_url' ? 'Uploading…' : 'Click to upload hero photo'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.15)' }}>Recommended: wide landscape, min 1920×1080px</p>
          </div>
          <input ref={heroRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'hero_image_url') }} />
        </div>

        {/* Profile image */}
        <div style={{ padding: '24px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px' }}>
          <label style={lbl}>Profile / DP Photo</label>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)', marginBottom: '14px' }}>
            Displays on the About page
          </p>
          {profile.profile_image_url && (
            <div style={{ marginBottom: '14px', position: 'relative', display: 'inline-block' }}>
              <img src={profile.profile_image_url} alt="Profile"
                style={{ width: '160px', height: '200px', objectFit: 'cover', objectPosition: 'center top', display: 'block', border: '1px solid rgba(255,255,255,0.08)' }} />
              <button onClick={() => setProfile(p => ({ ...p, profile_image_url: '' }))}
                style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.7rem', padding: '4px 8px', cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          )}
          <div onClick={() => profileRef.current?.click()}
            style={{ border: '1px dashed rgba(255,255,255,0.12)', padding: '24px', textAlign: 'center', cursor: uploading === 'profile_image_url' ? 'not-allowed' : 'pointer', opacity: uploading === 'profile_image_url' ? 0.6 : 1 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: uploading === 'profile_image_url' ? '#fff' : 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
              {uploading === 'profile_image_url' ? 'Uploading…' : 'Click to upload profile photo'}
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'rgba(255,255,255,0.15)' }}>Recommended: portrait, min 600×800px</p>
          </div>
          <input ref={profileRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'profile_image_url') }} />
        </div>

        {/* Text fields */}
        {([
          { field: 'name', label: 'Name' },
          { field: 'title', label: 'Title' },
          { field: 'email', label: 'Email' },
          { field: 'github_url', label: 'GitHub URL' },
          { field: 'linkedin_url', label: 'LinkedIn URL' },
          { field: 'location', label: 'Location' },
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

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>
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