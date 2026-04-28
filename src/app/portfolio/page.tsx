'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'
import Link from 'next/link'

const categories = ['All', 'Frontend', 'Backend', 'Full Stack', 'DevOps']

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY })

    // Particles
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.5 + 0.1,
    }))

    // Grid nodes
    const cols = 12, rows = 8
    const nodes = Array.from({ length: cols * rows }, (_, i) => ({
      x: (i % cols) * (window.innerWidth / (cols - 1)),
      y: Math.floor(i / cols) * (window.innerHeight / (rows - 1)),
      ox: (i % cols) * (window.innerWidth / (cols - 1)),
      oy: Math.floor(i / cols) * (window.innerHeight / (rows - 1)),
    }))

    let t = 0

    const draw = () => {
      t += 0.008
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update + draw grid nodes (displaced by mouse + wave)
      nodes.forEach(n => {
        const dx = mouse.x - n.ox
        const dy = mouse.y - n.oy
        const dist = Math.sqrt(dx * dx + dy * dy)
        const force = Math.max(0, 180 - dist) / 180
        n.x = n.ox + Math.sin(t + n.ox * 0.008) * 18 - dx * force * 0.12
        n.y = n.oy + Math.cos(t + n.oy * 0.008) * 14 - dy * force * 0.12
      })

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 0.5
      for (let r = 0; r < rows; r++) {
        ctx.beginPath()
        for (let c = 0; c < cols; c++) {
          const n = nodes[r * cols + c]
          c === 0 ? ctx.moveTo(n.x, n.y) : ctx.lineTo(n.x, n.y)
        }
        ctx.stroke()
      }
      for (let c = 0; c < cols; c++) {
        ctx.beginPath()
        for (let r = 0; r < rows; r++) {
          const n = nodes[r * cols + c]
          r === 0 ? ctx.moveTo(n.x, n.y) : ctx.lineTo(n.x, n.y)
        }
        ctx.stroke()
      }

      // Draw node dots
      nodes.forEach(n => {
        const dx = mouse.x - n.x
        const dy = mouse.y - n.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const glow = Math.max(0, 1 - dist / 200)
        ctx.beginPath()
        ctx.arc(n.x, n.y, 1.5 + glow * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${0.08 + glow * 0.5})`
        ctx.fill()
      })

      // Draw connection lines between nearby particles
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Mouse attraction
        const dx = mouse.x - p.x
        const dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          p.vx += dx * 0.00015
          p.vy += dy * 0.00015
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`
        ctx.fill()

        // Connect nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx2 = p.x - q.x
          const dy2 = p.y - q.y
          const d = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (d < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(255,255,255,${0.12 * (1 - d / 120)})`
            ctx.lineWidth = 0.4
            ctx.stroke()
          }
        }
      })

      // Mouse ripple
      const rippleR = (Math.sin(t * 3) * 0.5 + 0.5) * 60 + 20
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, rippleR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${0.06 * (1 - rippleR / 80)})`
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, rippleR * 1.6, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255,255,255,${0.03})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed', inset: 0, zIndex: 0,
      pointerEvents: 'none', opacity: 0.9,
    }} />
  )
}

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [filtered, setFiltered] = useState<Project[]>([])
  const [active, setActive] = useState('All')
  const [loading, setLoading] = useState(true)
  const [hovered, setHovered] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('projects').select('*').order('order_index')
      .then(({ data }) => {
        setProjects(data ?? [])
        setFiltered(data ?? [])
        setLoading(false)
      })
  }, [])

  const filter = (cat: string) => {
    setActive(cat)
    if (cat === 'All') return setFiltered(projects)
    setFiltered(projects.filter(p =>
      p.tech_stack.some(t => t.toLowerCase().includes(cat.toLowerCase())) ||
      (cat === 'Full Stack' && p.tech_stack.length >= 3)
    ))
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', paddingTop: '90px', position: 'relative', overflow: 'hidden' }}>

      <AnimatedBackground />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '40px 48px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: '52px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Work
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 300, color: '#fff', lineHeight: 0.95, marginBottom: '6px' }}>
            All
          </h1>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 0.95, color: 'rgba(255,255,255,0.3)' }}>
            Projects
          </h1>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '48px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => filter(cat)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
                padding: '7px 16px', cursor: 'pointer',
                letterSpacing: '0.08em', textTransform: 'uppercase',
                border: 'none', outline: 'none',
                background: active === cat ? '#fff' : 'rgba(255,255,255,0.05)',
                color: active === cat ? '#000' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }}>
              {cat}
            </button>
          ))}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginLeft: '8px' }}>
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Projects list */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ height: '76px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>No projects found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Column headers */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '0 24px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '2px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', width: '28px' }}>#</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', width: '72px' }}>Preview</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', flex: 1 }}>Project</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', width: '180px' }}>Stack</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em', width: '80px', textAlign: 'right' }}>Links</span>
            </div>

            {filtered.map((p, i) => {
              const thumb = p.image_url || p.media?.[0]?.url
              const isHovered = hovered === p.id
              return (
                <Link key={p.id} href={`/portfolio/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    onMouseEnter={() => setHovered(p.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '24px',
                      padding: '16px 24px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                      transition: 'background 0.25s',
                      cursor: 'pointer',
                      position: 'relative',
                    }}>

                    {/* Hover left bar */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0,
                      width: '2px',
                      background: '#fff',
                      transform: isHovered ? 'scaleY(1)' : 'scaleY(0)',
                      transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
                      transformOrigin: 'bottom',
                    }} />

                    {/* Index */}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: isHovered ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)', width: '28px', flexShrink: 0, transition: 'color 0.2s' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Thumbnail */}
                    <div style={{ width: '72px', height: '46px', flexShrink: 0, overflow: 'hidden', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {thumb ? (
                        <img src={thumb} alt={p.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'rgba(255,255,255,0.05)', fontStyle: 'italic' }}>{p.title[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Title + desc */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 300,
                        color: isHovered ? '#fff' : 'rgba(255,255,255,0.8)',
                        marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        transition: 'color 0.2s',
                      }}>
                        {p.title}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 300 }}>
                        {p.description}
                      </p>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0, width: '180px', flexWrap: 'wrap' }}>
                      {p.tech_stack.slice(0, 3).map(t => (
                        <span key={t} style={{
                          fontFamily: 'var(--font-mono)', fontSize: '0.58rem', letterSpacing: '0.06em',
                          padding: '2px 7px', textTransform: 'uppercase',
                          border: `1px solid ${isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
                          color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)',
                          transition: 'all 0.2s',
                        }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div style={{ display: 'flex', gap: '10px', flexShrink: 0, width: '80px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      {p.github_url && (
                        <a href={p.github_url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.2s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}>
                          GH
                        </a>
                      )}
                      {p.live_url && (
                        <a href={p.live_url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: isHovered ? '#fff' : 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'color 0.2s' }}>
                          ↗
                        </a>
                      )}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)', transition: 'all 0.25s', transform: isHovered ? 'translateX(3px)' : 'translateX(0)' }}>→</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
