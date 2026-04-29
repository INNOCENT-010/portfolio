'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Project } from '@/lib/supabase'
import Link from 'next/link'

const categories = ['All', 'Frontend', 'Backend', 'Full Stack', 'DevOps']

function FightingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Fighter state
    const f1 = { x: 0, y: 0, facing: 1, state: 'idle', stateT: 0, hitFlash: 0 }
    const f2 = { x: 0, y: 0, facing: -1, state: 'idle', stateT: 0, hitFlash: 0 }

    // Fight sequence: idle → walk → punch/kick → recoil → repeat
    const sequence = ['idle', 'walk', 'punch', 'recoil', 'idle', 'walk', 'kick', 'recoil']
    let seqIdx1 = 0, seqIdx2 = 4 // offset so they alternate
    let seqT = 0
    const SEQ_DUR = 40 // frames per state

    // Effects
    const effects: { x: number; y: number; r: number; op: number; type: string }[] = []

    const drawStickman = (
      x: number, y: number, facing: number,
      state: string, st: number, hitFlash: number,
      color: string
    ) => {
      const s = 1 // scale
      const H = 80 * s // total height
      const head = H * 0.15
      const torsoH = H * 0.28
      const legH = H * 0.32
      const armH = H * 0.24

      const headY = y - H + head
      const shoulderY = headY + head * 2.2
      const hipY = shoulderY + torsoH
      const footY = hipY + legH

      // Animate limbs by state
      let punchArm = 0, kickLeg = 0, lean = 0, bobY = 0

      if (state === 'idle') {
        bobY = Math.sin(st * 0.15) * 3
        punchArm = Math.sin(st * 0.08) * 0.15
      } else if (state === 'walk') {
        bobY = Math.abs(Math.sin(st * 0.3)) * -4
        punchArm = Math.sin(st * 0.3) * 0.5
        kickLeg = Math.sin(st * 0.3) * 0.6
      } else if (state === 'punch') {
        const prog = Math.min(st / (SEQ_DUR * 0.5), 1)
        punchArm = prog < 0.5 ? prog * 2 : 2 - prog * 2
        lean = punchArm * 0.3 * facing
      } else if (state === 'kick') {
        const prog = Math.min(st / (SEQ_DUR * 0.5), 1)
        kickLeg = prog < 0.5 ? prog * 2 : 2 - prog * 2
        lean = kickLeg * 0.2 * facing
      } else if (state === 'recoil') {
        lean = -0.25 * facing
        bobY = 5
      }

      const c = hitFlash > 0 ? '#ff4444' : color
      ctx.strokeStyle = c
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'

      const bY = bobY

      // Head
      ctx.beginPath()
      ctx.arc(x, headY + bY, head, 0, Math.PI * 2)
      ctx.stroke()

      // Eyes
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(x + facing * head * 0.4, headY + bY - 2, 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Torso (with lean)
      const leanX = lean * 20
      ctx.beginPath()
      ctx.moveTo(x, headY + head * 2 + bY)
      ctx.lineTo(x + leanX, hipY + bY)
      ctx.stroke()

      // Punch arm (front)
      const punchExt = punchArm * facing * 40
      const punchY = punchArm * -10
      ctx.beginPath()
      ctx.moveTo(x, shoulderY + bY)
      ctx.lineTo(x + leanX + punchExt, shoulderY + punchY + bY)
      ctx.stroke()

      // Idle arm (back)
      ctx.beginPath()
      ctx.moveTo(x, shoulderY + bY)
      ctx.lineTo(x - facing * 16 + leanX, shoulderY + 20 + bY)
      ctx.stroke()

      // Kick leg
      const kickExt = kickLeg * facing * 36
      const kickLiftY = kickLeg * -24
      ctx.beginPath()
      ctx.moveTo(x + leanX, hipY + bY)
      ctx.lineTo(x + leanX + kickExt * 0.5, hipY + legH * 0.5 + kickLiftY * 0.5 + bY)
      ctx.lineTo(x + leanX + kickExt, hipY + legH * 0.1 + kickLiftY + bY)
      ctx.stroke()

      // Standing leg
      ctx.beginPath()
      ctx.moveTo(x + leanX, hipY + bY)
      ctx.lineTo(x + leanX - facing * 8, hipY + legH * 0.5 + bY)
      ctx.lineTo(x + leanX, footY + bY)
      ctx.stroke()

      // Ground feet
      ctx.beginPath()
      ctx.moveTo(x + leanX - 6, footY + bY)
      ctx.lineTo(x + leanX + 6, footY + bY)
      ctx.stroke()
    }

    const spawnEffect = (x: number, y: number, type: string) => {
      effects.push({ x, y, r: 0, op: 1, type })
    }

    const draw = () => {
      t++
      seqT++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const groundY = canvas.height * 0.72

      // Position fighters
      const gap = 90
      f1.x = cx - gap
      f1.y = groundY
      f2.x = cx + gap
      f2.y = groundY

      // Advance sequence
      if (seqT >= SEQ_DUR) {
        seqT = 0
        seqIdx1 = (seqIdx1 + 1) % sequence.length
        seqIdx2 = (seqIdx2 + 1) % sequence.length

        // Spawn hit effect when punch/kick lands
        const s1 = sequence[seqIdx1]
        const s2 = sequence[seqIdx2]
        if (s1 === 'punch' || s1 === 'kick') {
          spawnEffect(f2.x, f2.y - 50, s1 === 'kick' ? 'kick' : 'punch')
          f2.hitFlash = 8
        }
        if (s2 === 'punch' || s2 === 'kick') {
          spawnEffect(f1.x, f1.y - 50, s2 === 'kick' ? 'kick' : 'punch')
          f1.hitFlash = 8
        }
      }

      f1.state = sequence[seqIdx1]
      f2.state = sequence[seqIdx2]
      if (f1.hitFlash > 0) f1.hitFlash--
      if (f2.hitFlash > 0) f2.hitFlash--

      // Ground line
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, groundY + 2)
      ctx.lineTo(canvas.width, groundY + 2)
      ctx.stroke()

      // Draw fighters
      drawStickman(f1.x, f1.y, 1, f1.state, seqT, f1.hitFlash, 'rgba(255,255,255,0.7)')
      drawStickman(f2.x, f2.y, -1, f2.state, seqT, f2.hitFlash, 'rgba(255,255,255,0.7)')

      // VS text
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.font = `bold ${Math.min(canvas.width * 0.08, 80)}px serif`
      ctx.textAlign = 'center'
      ctx.fillText('VS', cx, groundY - 60)

      // Update + draw effects
      for (let i = effects.length - 1; i >= 0; i--) {
        const e = effects[i]
        e.r += 3
        e.op -= 0.04
        if (e.op <= 0) { effects.splice(i, 1); continue }

        ctx.strokeStyle = `rgba(255,255,255,${e.op * 0.6})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
        ctx.stroke()

        // Star burst
        if (e.type === 'punch') {
          for (let j = 0; j < 6; j++) {
            const angle = (j / 6) * Math.PI * 2 + t * 0.1
            ctx.beginPath()
            ctx.moveTo(e.x, e.y)
            ctx.lineTo(e.x + Math.cos(angle) * e.r * 0.8, e.y + Math.sin(angle) * e.r * 0.8)
            ctx.stroke()
          }
        } else {
          // Kick — arc
          ctx.beginPath()
          ctx.arc(e.x, e.y, e.r * 0.6, 0, Math.PI)
          ctx.stroke()
        }
      }

      // Subtle dust particles on ground
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ;[f1.x, f2.x].forEach(fx => {
        if (f1.state === 'walk' || f2.state === 'walk') {
          ctx.beginPath()
          ctx.arc(fx + (Math.random() - 0.5) * 20, groundY + 2, Math.random() * 3, 0, Math.PI * 2)
          ctx.fill()
        }
      })

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
      pointerEvents: 'none',
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
    <div style={{ minHeight: '100vh', background: 'var(--ink)', paddingTop: '80px', position: 'relative', overflow: 'hidden' }}>

      <FightingBackground />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: 'clamp(32px, 6vw, 48px) clamp(16px, 4vw, 48px) 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>Work</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 8vw, 4.5rem)', fontWeight: 300, color: '#fff', lineHeight: 0.95, marginBottom: '4px' }}>All</h1>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 8vw, 4.5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 0.95, color: 'rgba(255,255,255,0.3)' }}>Projects</h1>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '40px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => filter(cat)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '6px 14px',
                cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
                border: 'none', outline: 'none',
                background: active === cat ? '#fff' : 'rgba(255,255,255,0.06)',
                color: active === cat ? '#000' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
              }}>
              {cat}
            </button>
          ))}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginLeft: '6px' }}>
            {filtered.length} projects
          </span>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: '72px', background: 'rgba(255,255,255,0.02)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>No projects found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((p, i) => {
              const thumb = p.image_url || p.media?.[0]?.url
              const isHovered = hovered === p.id
              return (
                <Link key={p.id} href={`/portfolio/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    onMouseEnter={() => setHovered(p.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: 'clamp(12px, 2vw, 24px)',
                      padding: 'clamp(12px, 2vw, 16px) clamp(12px, 2vw, 20px)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      background: isHovered ? 'rgba(255,255,255,0.04)' : 'rgba(10,10,10,0.6)',
                      backdropFilter: 'blur(8px)',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                      position: 'relative',
                    }}>

                    {/* Left bar */}
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
                      background: '#fff',
                      transform: isHovered ? 'scaleY(1)' : 'scaleY(0)',
                      transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
                      transformOrigin: 'bottom',
                    }} />

                    {/* Index */}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.15)', width: '24px', flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Thumbnail */}
                    <div style={{ width: 'clamp(52px, 8vw, 72px)', height: 'clamp(36px, 5vw, 46px)', flexShrink: 0, overflow: 'hidden', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {thumb ? (
                        <img src={thumb} alt={p.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'rgba(255,255,255,0.05)', fontStyle: 'italic' }}>{p.title[0]}</span>
                        </div>
                      )}
                    </div>

                    {/* Title + desc */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', fontWeight: 300, color: isHovered ? '#fff' : 'rgba(255,255,255,0.8)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.2s' }}>
                        {p.title}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)', color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 300 }}>
                        {p.description}
                      </p>
                    </div>

                    {/* Tags — hide on small mobile */}
                    <div className="hide-mobile" style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {p.tech_stack.slice(0, 2).map(t => (
                        <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', padding: '2px 6px', border: `1px solid ${isHovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`, color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s' }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    {/* Arrow */}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)', flexShrink: 0, transition: 'all 0.25s', transform: isHovered ? 'translateX(4px)' : 'translateX(0)' }}>→</span>
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