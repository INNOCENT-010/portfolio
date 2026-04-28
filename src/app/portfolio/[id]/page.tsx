'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Project, MediaItem } from '@/lib/supabase'
import Link from 'next/link'

export default function ProjectPage() {
  const { id } = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    supabase.from('projects').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (!data) { router.push('/portfolio'); return }
        setProject(data)
        setLoading(false)
      })
  }, [id])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (lightbox === null) return
    if (!project) return
    const allMedia = getAllMedia(project)
    if (e.key === 'ArrowRight') setLightbox(i => Math.min((i ?? 0) + 1, allMedia.length - 1))
    if (e.key === 'ArrowLeft') setLightbox(i => Math.max((i ?? 0) - 1, 0))
    if (e.key === 'Escape') setLightbox(null)
  }, [lightbox, project])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ink)' }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>Loading…</span>
    </div>
  )

  if (!project) return null

  const getAllMedia = (p: Project): MediaItem[] => [
    ...(p.image_url && !p.media?.find(m => m.url === p.image_url)
      ? [{ url: p.image_url, type: 'image' as const, name: 'Cover' }]
      : []),
    ...(p.media ?? [])
  ]

  const allMedia = getAllMedia(project)
  const active = allMedia[activeIndex]
  const lb = lightbox !== null ? allMedia[lightbox] : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', paddingTop: '90px' }}>

      {/* Lightbox */}
      {lb && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.96)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
          {/* Close */}
          <button onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>

          {/* Prev */}
          {lightbox! > 0 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(i => (i ?? 1) - 1) }}
              style={{ position: 'absolute', left: '24px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: '44px', height: '44px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ‹
            </button>
          )}

          {/* Next */}
          {lightbox! < allMedia.length - 1 && (
            <button onClick={e => { e.stopPropagation(); setLightbox(i => (i ?? 0) + 1) }}
              style={{ position: 'absolute', right: '24px', background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', width: '44px', height: '44px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ›
            </button>
          )}

          {/* Media */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '85vh' }}>
            {lb.type === 'video' ? (
              <video src={lb.url} controls autoPlay
                style={{ maxWidth: '90vw', maxHeight: '85vh', outline: 'none' }} />
            ) : (
              <img src={lb.url} alt={lb.name}
                style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', display: 'block' }} />
            )}
          </div>

          {/* Counter */}
          <p style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
            {(lightbox ?? 0) + 1} / {allMedia.length}
          </p>
        </div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 48px 100px' }}>

        {/* Back */}
        <Link href="/portfolio" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '48px' }}>
          ← All Projects
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'start' }}>

          {/* LEFT — media */}
          <div>
            {/* Main viewer */}
            <div style={{ position: 'relative', overflow: 'hidden', background: '#111', border: '1px solid rgba(255,255,255,0.06)', cursor: allMedia.length > 0 ? 'zoom-in' : 'default' }}
              onClick={() => allMedia.length > 0 && setLightbox(activeIndex)}>
              {allMedia.length === 0 ? (
                <div style={{ aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.15)' }}>No media</span>
                </div>
              ) : active?.type === 'video' ? (
                <video key={active.url} src={active.url} controls
                  style={{ width: '100%', aspectRatio: '16/10', display: 'block', objectFit: 'cover' }} />
              ) : (
                <div style={{ aspectRatio: '16/10', overflow: 'hidden' }}>
                  <img key={active?.url} src={active?.url} alt={active?.name || project.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }} />
                </div>
              )}

              {/* Zoom hint */}
              {allMedia.length > 0 && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', padding: '4px 8px', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', pointerEvents: 'none' }}>
                  Click to expand
                </div>
              )}

              {/* Nav arrows */}
              {allMedia.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setActiveIndex(i => Math.max(i - 1, 0)) }}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ‹
                  </button>
                  <button onClick={e => { e.stopPropagation(); setActiveIndex(i => Math.min(i + 1, allMedia.length - 1)) }}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '32px', height: '32px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {allMedia.length > 1 && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                {allMedia.map((m, i) => (
                  <button key={i} onClick={() => setActiveIndex(i)}
                    style={{
                      width: '56px', height: '40px', padding: 0, cursor: 'pointer',
                      border: `1px solid ${activeIndex === i ? '#fff' : 'rgba(255,255,255,0.08)'}`,
                      overflow: 'hidden', background: '#1a1a1a', flexShrink: 0,
                      transition: 'border-color 0.2s', outline: 'none',
                    }}>
                    {m.type === 'video' ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#222' }}>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>▶</span>
                      </div>
                    ) : (
                      <img src={m.url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}
                  </button>
                ))}

                {/* Open all in lightbox */}
                <button onClick={() => setLightbox(0)}
                  style={{ padding: '0 12px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.06em', textTransform: 'uppercase', height: '40px', transition: 'border-color 0.2s, color 0.2s', outline: 'none', flexShrink: 0, whiteSpace: 'nowrap' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}>
                  View All ↗
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — details */}
          <div style={{ paddingTop: '8px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '14px' }}>Project</p>

            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 300, color: '#fff', lineHeight: 1.05, marginBottom: '6px' }}>
              {project.title}
            </h1>

            <div className="divider" style={{ margin: '16px 0' }} />

            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.88rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.85, marginBottom: '32px', fontWeight: 300 }}>
              {project.long_description || project.description}
            </p>

            {/* Tech stack */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                Tech Stack
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {project.tech_stack.map(t => (
                  <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '5px 12px', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Media count */}
            {allMedia.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Media
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)' }}>
                  {allMedia.length} file{allMedia.length > 1 ? 's' : ''} — click any image to preview full size
                </p>
              </div>
            )}

            {/* Links */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {project.github_url && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn-ghost"
                  style={{ fontSize: '0.72rem', padding: '10px 22px' }}>
                  View on GitHub
                </a>
              )}
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn-primary"
                  style={{ fontSize: '0.72rem', padding: '10px 22px' }}>
                  Live Demo ↗
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Full media grid below */}
        {allMedia.length > 1 && (
          <div style={{ marginTop: '80px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '20px' }}>
              All Media
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {allMedia.map((m, i) => (
                <div key={i} onClick={() => setLightbox(i)}
                  style={{ aspectRatio: '4/3', overflow: 'hidden', background: '#111', cursor: 'zoom-in', position: 'relative', border: '1px solid rgba(255,255,255,0.04)' }}>
                  {m.type === 'video' ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#161616', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }}>▶</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.06em' }}>VIDEO</span>
                    </div>
                  ) : (
                    <img src={m.url} alt={m.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}