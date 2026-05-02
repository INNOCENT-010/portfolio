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

    const effects: { x: number; y: number; r: number; op: number; type: string; vx: number; vy: number }[] = []

    // Fight choreography — richer move set
    const moves = [
      { name: 'idle', dur: 50 },
      { name: 'approach', dur: 40 },
      { name: 'jab', dur: 25 },
      { name: 'idle', dur: 20 },
      { name: 'cross', dur: 30 },
      { name: 'recoil', dur: 25 },
      { name: 'idle', dur: 20 },
      { name: 'kick_high', dur: 35 },
      { name: 'recoil', dur: 25 },
      { name: 'idle', dur: 20 },
      { name: 'uppercut', dur: 30 },
      { name: 'knockback', dur: 40 },
      { name: 'recover', dur: 30 },
    ]

    let moveIdx1 = 0, moveIdx2 = 6
    let moveT = 0

    const spawnHit = (x: number, y: number, type: string) => {
      // Main burst
      effects.push({ x, y, r: 0, op: 1, type, vx: 0, vy: 0 })
      // Flying sparks
      for (let i = 0; i < 6; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 3
        effects.push({ x, y, r: 1, op: 0.8, type: 'spark', vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 1 })
      }
    }

    const drawFighter = (
      x: number, y: number,
      facing: number,
      move: string, mt: number, dur: number,
      hitFlash: number,
    ) => {
      const H = Math.min(canvas.height * 0.18, 100)
      const head = H * 0.14
      const torsoH = H * 0.28
      const legH = H * 0.32

      const headY = y - H
      const shoulderY = headY + head * 2.2
      const hipY = shoulderY + torsoH
      const footY = hipY + legH

      const prog = mt / dur
      const ease = prog < 0.5 ? prog * 2 : 2 - prog * 2

      let frontArmX = 0, frontArmY = 0
      let backArmX = -facing * 12, backArmY = 15
      let frontLegX = 0, frontLegY = legH
      let backLegX = -facing * 8, backLegY = legH
      let bodyLean = 0, bobY = 0, knockX = 0

      if (move === 'idle') {
        bobY = Math.sin(mt * 0.12) * 2.5
        frontArmX = facing * 8 + Math.sin(mt * 0.08) * 3
        frontArmY = 20
        backArmX = -facing * 10
        backArmY = 18
      } else if (move === 'approach') {
        bobY = Math.abs(Math.sin(mt * 0.25)) * -4
        frontArmX = facing * (10 + Math.sin(mt * 0.25) * 15)
        frontArmY = 20 + Math.sin(mt * 0.25) * 5
        frontLegX = facing * Math.sin(mt * 0.25) * 18
        backLegX = -facing * Math.sin(mt * 0.25) * 14
      } else if (move === 'jab') {
        frontArmX = facing * (15 + ease * 38)
        frontArmY = 5 - ease * 8
        bodyLean = ease * 0.2 * facing
        frontLegX = facing * 6
      } else if (move === 'cross') {
        frontArmX = facing * (10 + ease * 45)
        frontArmY = 2 - ease * 5
        bodyLean = ease * 0.28 * facing
        frontLegX = facing * 10
        backLegX = -facing * 4
      } else if (move === 'uppercut') {
        frontArmX = facing * (8 + ease * 20)
        frontArmY = 20 - ease * 32
        bodyLean = ease * 0.15 * facing
        bobY = -ease * 8
      } else if (move === 'kick_high') {
        frontLegX = facing * ease * 50
        frontLegY = legH * (1 - ease * 0.7)
        bodyLean = ease * 0.2 * facing
        backArmX = -facing * 20
        backArmY = 5
        frontArmX = -facing * 15
        frontArmY = 8
      } else if (move === 'recoil') {
        bodyLean = -ease * 0.3 * facing
        bobY = ease * 6
        knockX = -facing * ease * 12
        frontArmX = -facing * 8
        frontArmY = 18
      } else if (move === 'knockback') {
        bodyLean = -0.35 * facing
        knockX = -facing * (ease * 28)
        bobY = Math.sin(prog * Math.PI) * 10
        frontArmX = -facing * 15
        backArmX = facing * 5
        frontArmY = 5
      } else if (move === 'recover') {
        bodyLean = -0.35 * facing * (1 - prog)
        knockX = -facing * 28 * (1 - prog)
        frontArmX = facing * 8 * prog
        frontArmY = 20
      }

      const c = hitFlash > 0
        ? `rgba(255,${80 - hitFlash * 8},${80 - hitFlash * 8},${0.9})`
        : 'rgba(255,255,255,0.85)'

      ctx.strokeStyle = c
      ctx.lineWidth = 2.2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const ox = knockX
      const bY = bobY
      const lean = bodyLean * 25

      // Shadow
      ctx.fillStyle = 'rgba(255,255,255,0.06)'
      ctx.beginPath()
      ctx.ellipse(x + ox, footY, 18, 4, 0, 0, Math.PI * 2)
      ctx.fill()

      // Head
      ctx.beginPath()
      ctx.arc(x + ox + lean * 0.3, headY + bY, head, 0, Math.PI * 2)
      ctx.stroke()

      // Eyes
      ctx.fillStyle = c
      ctx.beginPath()
      ctx.arc(x + ox + lean * 0.3 + facing * head * 0.45, headY + bY - 1, 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Torso
      ctx.beginPath()
      ctx.moveTo(x + ox, headY + head * 2.1 + bY)
      ctx.lineTo(x + ox + lean, hipY + bY)
      ctx.stroke()

      // Front arm
      const elbowX = x + ox + lean * 0.5 + frontArmX * 0.5
      const elbowY = shoulderY + bY + frontArmY * 0.5
      ctx.beginPath()
      ctx.moveTo(x + ox, shoulderY + bY)
      ctx.quadraticCurveTo(elbowX, elbowY, x + ox + lean + frontArmX, shoulderY + bY + frontArmY)
      ctx.stroke()

      // Back arm
      ctx.beginPath()
      ctx.moveTo(x + ox, shoulderY + bY)
      ctx.lineTo(x + ox + lean * 0.3 + backArmX, shoulderY + bY + backArmY)
      ctx.stroke()

      // Front leg
      const kneeFX = x + ox + lean + frontLegX * 0.5
      const kneeFY = hipY + bY + frontLegY * 0.5
      ctx.beginPath()
      ctx.moveTo(x + ox + lean, hipY + bY)
      ctx.quadraticCurveTo(kneeFX, kneeFY, x + ox + lean + frontLegX, hipY + bY + frontLegY)
      ctx.stroke()

      // Back leg
      ctx.beginPath()
      ctx.moveTo(x + ox + lean, hipY + bY)
      ctx.lineTo(x + ox + lean * 0.5 + backLegX, hipY + bY + backLegY)
      ctx.stroke()

      // Foot lines
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x + ox + lean + frontLegX - 5, hipY + bY + frontLegY)
      ctx.lineTo(x + ox + lean + frontLegX + facing * 8, hipY + bY + frontLegY)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(x + ox + lean * 0.5 + backLegX - 4, hipY + bY + backLegY)
      ctx.lineTo(x + ox + lean * 0.5 + backLegX + facing * 6, hipY + bY + backLegY)
      ctx.stroke()
    }

    let hitFlash1 = 0, hitFlash2 = 0

    const draw = () => {
      t++
      moveT++
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx = canvas.width / 2
      const groundY = canvas.height * 0.78

      const curMove1 = moves[moveIdx1]
      const curMove2 = moves[moveIdx2]

      if (moveT >= curMove1.dur && moveT >= curMove2.dur) {
        const old1 = moves[moveIdx1].name
        const old2 = moves[moveIdx2].name

        moveIdx1 = (moveIdx1 + 1) % moves.length
        moveIdx2 = (moveIdx2 + 1) % moves.length
        moveT = 0

        // Spawn effects when attack connects
        const new1 = moves[moveIdx1].name
        const new2 = moves[moveIdx2].name

        if ((old1 === 'jab' || old1 === 'cross' || old1 === 'uppercut') && new1 === 'idle') {
          spawnHit(cx + 30, groundY - 55, old1)
          hitFlash2 = 10
        }
        if ((old1 === 'kick_high') && new1 === 'idle') {
          spawnHit(cx + 40, groundY - 70, 'kick')
          hitFlash2 = 12
        }
        if ((old2 === 'jab' || old2 === 'cross' || old2 === 'uppercut') && new2 === 'idle') {
          spawnHit(cx - 30, groundY - 55, old2)
          hitFlash1 = 10
        }
        if ((old2 === 'kick_high') && new2 === 'idle') {
          spawnHit(cx - 40, groundY - 70, 'kick')
          hitFlash1 = 12
        }
      }

      if (hitFlash1 > 0) hitFlash1--
      if (hitFlash2 > 0) hitFlash2--

      // Ground
      ctx.strokeStyle = 'rgba(255,255,255,0.07)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - 160, groundY)
      ctx.lineTo(cx + 160, groundY)
      ctx.stroke()

      // Stage glow under fighters
      const grd = ctx.createRadialGradient(cx, groundY, 0, cx, groundY, 140)
      grd.addColorStop(0, 'rgba(255,255,255,0.04)')
      grd.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.ellipse(cx, groundY, 140, 20, 0, 0, Math.PI * 2)
      ctx.fill()

      // Draw fighters closer together
      const gap = Math.min(canvas.width * 0.065, 70)
      drawFighter(cx - gap, groundY, 1, curMove1.name, moveT, curMove1.dur, hitFlash1)
      drawFighter(cx + gap, groundY, -1, curMove2.name, moveT, curMove2.dur, hitFlash2)

      // Effects
      for (let i = effects.length - 1; i >= 0; i--) {
        const e = effects[i]
        e.x += e.vx
        e.y += e.vy
        e.vy += 0.15 // gravity on sparks
        e.r += e.type === 'spark' ? 0.5 : 2.5
        e.op -= e.type === 'spark' ? 0.05 : 0.035

        if (e.op <= 0) { effects.splice(i, 1); continue }

        if (e.type === 'spark') {
          ctx.fillStyle = `rgba(255,255,255,${e.op})`
          ctx.beginPath()
          ctx.arc(e.x, e.y, 1.5, 0, Math.PI * 2)
          ctx.fill()
        } else if (e.type === 'kick') {
          ctx.strokeStyle = `rgba(255,255,255,${e.op * 0.7})`
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 1.5)
          ctx.stroke()
          // Swoosh lines
          for (let j = 0; j < 4; j++) {
            const a = (j / 4) * Math.PI + t * 0.05
            ctx.beginPath()
            ctx.moveTo(e.x, e.y)
            ctx.lineTo(e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r * 0.6)
            ctx.stroke()
          }
        } else {
          // Punch burst
          ctx.strokeStyle = `rgba(255,255,255,${e.op * 0.6})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2)
          ctx.stroke()
          // Star
          for (let j = 0; j < 8; j++) {
            const a = (j / 8) * Math.PI * 2
            ctx.beginPath()
            ctx.moveTo(e.x + Math.cos(a) * e.r * 0.3, e.y + Math.sin(a) * e.r * 0.3)
            ctx.lineTo(e.x + Math.cos(a) * e.r, e.y + Math.sin(a) * e.r)
            ctx.stroke()
          }
        }
      }

      // VS
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.font = `300 ${Math.min(canvas.width * 0.05, 52)}px serif`
      ctx.textAlign = 'center'
      ctx.fillText('VS', cx, groundY - 85)

      animId = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
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

      {/* Fight arena — bottom portion of screen, projects list sits above it */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: '30vh', zIndex: 0, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(10,10,10,0) 0%, rgba(10,10,10,0.15) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto', padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 48px) 48px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>Work</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 6vw, 3.5rem)', fontWeight: 300, color: '#fff', lineHeight: 0.95, marginBottom: '4px' }}>All</h1>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 6vw, 3.5rem)', fontWeight: 300, fontStyle: 'italic', lineHeight: 0.95, color: 'rgba(255,255,255,0.3)' }}>Projects</h1>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '28px' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => filter(cat)}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', padding: '6px 14px',
                cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase',
                border: 'none', outline: 'none',
                background: active === cat ? '#fff' : 'rgba(255,255,255,0.07)',
                color: active === cat ? '#000' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s', backdropFilter: 'blur(8px)',
              }}>
              {cat}
            </button>
          ))}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(255,255,255,0.18)', alignSelf: 'center', marginLeft: '4px' }}>
            {filtered.length} projects
          </span>
        </div>

        {/* Projects — glassmorphism so fight shows through */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: '68px', background: 'rgba(255,255,255,0.02)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>No projects found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
                      gap: 'clamp(10px, 2vw, 20px)',
                      padding: 'clamp(10px, 1.5vw, 14px) clamp(12px, 2vw, 18px)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      // Glass effect — fight visible through list
                      background: isHovered
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(10,10,10,0.55)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      transition: 'background 0.2s',
                      cursor: 'pointer',
                      position: 'relative',
                    }}>

                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: '2px',
                      background: '#fff',
                      transform: isHovered ? 'scaleY(1)' : 'scaleY(0)',
                      transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1)',
                      transformOrigin: 'bottom',
                    }} />

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.15)', width: '22px', flexShrink: 0 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div style={{ width: 'clamp(48px, 7vw, 66px)', height: 'clamp(32px, 5vw, 42px)', flexShrink: 0, overflow: 'hidden', background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {thumb ? (
                        <img src={thumb} alt={p.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: isHovered ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.05)', fontStyle: 'italic' }}>{p.title[0]}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.88rem, 2.5vw, 1rem)', fontWeight: 300, color: isHovered ? '#fff' : 'rgba(255,255,255,0.8)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.2s' }}>
                        {p.title}
                      </h3>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(0.62rem, 1.5vw, 0.7rem)', color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 300 }}>
                        {p.description}
                      </p>
                    </div>

                    <div className="hide-mobile" style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {p.tech_stack.slice(0, 2).map(t => (
                        <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.52rem', padding: '2px 6px', border: `1px solid ${isHovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)'}`, color: isHovered ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: '0.04em', transition: 'all 0.2s' }}>
                          {t}
                        </span>
                      ))}
                    </div>

                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: isHovered ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.1)', flexShrink: 0, transition: 'all 0.25s', transform: isHovered ? 'translateX(4px)' : 'translateX(0)', display: 'inline-block' }}>→</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Spacer so bottom projects don't sit right on top of fighters */}
        <div style={{ height: 'clamp(180px, 28vh, 260px)' }} />
      </div>
    </div>
  )
}