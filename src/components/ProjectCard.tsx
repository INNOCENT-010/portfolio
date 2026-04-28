'use client'
import Link from 'next/link'
import type { Project } from '@/lib/supabase'

export default function ProjectCard({ p }: { p: Project }) {
  const thumb = p.image_url || p.media?.[0]?.url

  return (
    <Link href={`/portfolio/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="project-card" style={{
        background: '#111',
        border: '1px solid rgba(255,255,255,0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '380px',
      }}>

        {/* TOP 65% — image */}
        <div style={{ flex: '0 0 65%', position: 'relative', overflow: 'hidden', background: '#0D0D0D' }}>
          {thumb ? (
            <img src={thumb} alt={p.title} className="img-zoom"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'rgba(255,255,255,0.04)', fontStyle: 'italic' }}>
                {p.title[0]}
              </span>
            </div>
          )}
        </div>

        {/* BOTTOM 35% — text */}
        <div style={{
          flex: '0 0 35%',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 300, color: '#fff', marginBottom: '4px', lineHeight: 1.2 }}>
              {p.title}
            </h3>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: '0.73rem',
              color: 'rgba(255,255,255,0.36)', lineHeight: 1.55,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {p.description}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {p.tech_stack.slice(0, 3).map(t => (
                <span key={t} className="tag">{t}</span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {p.github_url && (
                <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.32)', letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase' }}>
                  GitHub ↗
                </a>
              )}
              {p.live_url && (
                <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: '#fff', letterSpacing: '0.06em', textDecoration: 'none', textTransform: 'uppercase' }}>
                  Live ↗
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}