'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project, MediaItem } from '@/lib/supabase'

const empty: Omit<Project, 'id' | 'created_at' | 'updated_at'> = {
  title: '', description: '', long_description: '', tech_stack: [],
  github_url: '', live_url: '', image_url: '', media: [], featured: false, order_index: 0
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [editing, setEditing] = useState<Partial<Project> | null>(null)
  const [techInput, setTechInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    const { data } = await supabase.from('projects').select('*').order('order_index')
    setProjects(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing({ ...empty })
    setTechInput('')
    setMediaItems([])
    setMsg('')
  }

  const openEdit = (p: Project) => {
    setEditing({ ...p })
    setTechInput(p.tech_stack.join(', '))
    // Merge image_url + media into one list for editing
    const items: MediaItem[] = []
    if (p.image_url) items.push({ url: p.image_url, type: 'image', name: 'Cover' })
    if (p.media?.length) {
      p.media.forEach(m => { if (m.url !== p.image_url) items.push(m) })
    }
    setMediaItems(items)
    setMsg('')
  }

  const cancel = () => {
    setEditing(null)
    setMediaItems([])
    setMsg('')
    setUploadProgress('')
  }

  const handleFiles = async (files: FileList) => {
    const allowed = Array.from(files).filter(f =>
      f.type.startsWith('image/') || f.type.startsWith('video/')
    )
    if (!allowed.length) return
    setUploading(true)

    const uploaded: MediaItem[] = []
    for (let i = 0; i < allowed.length; i++) {
      const file = allowed[i]
      setUploadProgress(`Uploading ${i + 1}/${allowed.length}: ${file.name}`)
      const ext = file.name.split('.').pop()
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('project-images').upload(filename, file, { upsert: true })
      if (error) { setMsg(`Upload failed: ${error.message}`); continue }
      const { data } = supabase.storage.from('project-images').getPublicUrl(filename)
      uploaded.push({
        url: data.publicUrl,
        type: file.type.startsWith('video/') ? 'video' : 'image',
        name: file.name
      })
    }

    setMediaItems(prev => [...prev, ...uploaded])
    setUploading(false)
    setUploadProgress('')
  }

  const removeMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index))
  }

  const setCover = (index: number) => {
    setMediaItems(prev => {
      const items = [...prev]
      const [item] = items.splice(index, 1)
      return [item, ...items]
    })
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    setMsg('')

    const image_url = mediaItems.find(m => m.type === 'image')?.url || ''
    const payload = {
      ...editing,
      image_url,
      media: mediaItems,
      tech_stack: techInput.split(',').map(t => t.trim()).filter(Boolean)
    }

    let error = null
    if (editing.id) {
      const res = await fetch(`/api/projects/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) { const d = await res.json(); error = d.error }
    } else {
      const { error: e } = await supabase.from('projects').insert(payload)
      error = e?.message
    }

    setSaving(false)
    if (error) return setMsg(`Error: ${error}`)
    setMsg('Saved!')
    await load()
    setTimeout(cancel, 800)
  }

  const del = async (id: string) => {
    if (!confirm('Delete this project?')) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (!res.ok) { const d = await res.json(); alert(`Delete failed: ${d.error}`); return }
    load()
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px',
    padding: '10px 12px', color: '#F7F7F5',
    fontFamily: 'var(--font-mono)', fontSize: '0.85rem', outline: 'none'
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em',
    display: 'block', marginBottom: '6px', textTransform: 'uppercase'
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '48px 32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800 }}>Projects</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '4px' }}>{projects.length} total</p>
        </div>
        <button onClick={openNew} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '10px 20px', background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer' }}>
          + New Project
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div style={{ marginBottom: '32px', padding: '28px', border: '1px solid rgba(200,241,53,0.25)', borderRadius: '10px', background: 'rgba(200,241,53,0.03)' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
            {editing.id ? 'Edit Project' : 'New Project'}
          </h2>

          <div style={{ display: 'grid', gap: '16px' }}>

            {/* Media upload zone */}
            <div>
              <label style={labelStyle}>Images & Videos</label>

              {/* Existing media grid */}
              {mediaItems.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                  {mediaItems.map((m, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: '6px', overflow: 'hidden', aspectRatio: '16/10', background: 'rgba(255,255,255,0.04)', border: i === 0 ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)' }}>
                      {m.type === 'video' ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)' }}>
                          <span style={{ fontSize: '20px' }}>▶</span>
                        </div>
                      ) : (
                        <img src={m.url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                      {/* Cover badge */}
                      {i === 0 && (
                        <span style={{ position: 'absolute', bottom: '3px', left: '3px', fontFamily: 'var(--font-mono)', fontSize: '0.55rem', background: 'var(--accent)', color: '#0D0D0D', padding: '1px 4px', borderRadius: '2px', fontWeight: 700 }}>COVER</span>
                      )}
                      {/* Controls */}
                      <div style={{ position: 'absolute', top: '3px', right: '3px', display: 'flex', gap: '3px' }}>
                        {i !== 0 && (
                          <button onClick={() => setCover(i)} title="Set as cover"
                            style={{ width: '20px', height: '20px', background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: '3px', color: 'var(--accent)', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ★
                          </button>
                        )}
                        <button onClick={() => removeMedia(i)} title="Remove"
                          style={{ width: '20px', height: '20px', background: 'rgba(0,0,0,0.75)', border: 'none', borderRadius: '3px', color: '#ff6b6b', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)' }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                onDrop={e => {
                  e.preventDefault()
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
                }}
                style={{ border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '6px', padding: '20px', textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'border-color 0.2s', opacity: uploading ? 0.6 : 1 }}>
                {uploading ? (
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)' }}>{uploadProgress}</p>
                ) : (
                  <>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>
                      Click or drag & drop images / videos
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>
                      PNG, JPG, WEBP, MP4, MOV — multiple files OK · First image becomes cover
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={e => { if (e.target.files?.length) handleFiles(e.target.files) }}
                style={{ display: 'none' }}
              />
            </div>

            {/* Text fields */}
            {(['title', 'description', 'github_url', 'live_url'] as const).map(field => (
              <div key={field}>
                <label style={labelStyle}>{field.replace(/_/g, ' ')}</label>
                <input
                  value={(editing as any)[field] ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, [field]: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            ))}

            <div>
              <label style={labelStyle}>Long Description</label>
              <textarea rows={3} value={editing.long_description ?? ''}
                onChange={e => setEditing(prev => ({ ...prev, long_description: e.target.value }))}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            <div>
              <label style={labelStyle}>Tech Stack (comma-separated)</label>
              <input value={techInput} onChange={e => setTechInput(e.target.value)}
                placeholder="Next.js, TypeScript, Supabase" style={inputStyle} />
            </div>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                <input type="checkbox" checked={editing.featured ?? false}
                  onChange={e => setEditing(prev => ({ ...prev, featured: e.target.checked }))} />
                Featured on homepage
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ ...labelStyle, margin: 0 }}>Order</label>
                <input type="number" value={editing.order_index ?? 0}
                  onChange={e => setEditing(prev => ({ ...prev, order_index: Number(e.target.value) }))}
                  style={{ ...inputStyle, width: '70px' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px', alignItems: 'center' }}>
            <button onClick={save} disabled={saving || uploading}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '10px 24px', background: 'var(--accent)', color: '#0D0D0D', border: 'none', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', opacity: (saving || uploading) ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={cancel}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', padding: '10px 20px', background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel
            </button>
            {msg && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: msg.startsWith('Error') ? '#ff6b6b' : 'var(--accent)' }}>
                {msg}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Project list */}
      {loading ? (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)' }}>Loading…</p>
      ) : (
        <div style={{ display: 'grid', gap: '8px' }}>
          {projects.map(p => {
            const thumb = p.image_url || p.media?.[0]?.url
            return (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', background: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: '56px', height: '38px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  {thumb
                    ? <img src={thumb} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: '14px', opacity: 0.3 }}>🖼</span></div>
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{p.title}</span>
                    {p.featured && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(200,241,53,0.12)', color: 'var(--accent)', borderRadius: '3px' }}>Featured</span>}
                    {(p.media?.length || 0) > 0 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{p.media.length} media</span>}
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{p.tech_stack.join(' · ')}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => openEdit(p)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '6px 14px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '4px', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => del(p.id)} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', padding: '6px 14px', border: '1px solid rgba(255,100,100,0.2)', borderRadius: '4px', background: 'transparent', color: 'rgba(255,100,100,0.6)', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}