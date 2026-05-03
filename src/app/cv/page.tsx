'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

const SESSION_KEY = 'cv_unlocked'
const CORRECT_PIN = process.env.NEXT_PUBLIC_CV_PIN ?? '1234'

export default function CVPage() {
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [shaking, setShaking] = useState(false)
  const [cvUrl, setCvUrl] = useState<string | null>(null)
  const [name, setName] = useState('Amaechi Innocent')
  const [title, setTitle] = useState('Full Stack Developer')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check session
    if (sessionStorage.getItem(SESSION_KEY) === 'true') setUnlocked(true)
    // Load profile
    supabase.from('profile').select('name, title, cv_url').single().then(({ data }) => {
      if (data) {
        if (data.name) setName(data.name)
        if (data.title) setTitle(data.title)
        if (data.cv_url) setCvUrl(data.cv_url)
      }
      setLoading(false)
    })
  }, [])

  const attempt = () => {
    if (pin === CORRECT_PIN) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      setUnlocked(true)
      setError('')
    } else {
      setError('Incorrect PIN. Request access from Innocent.')
      setShaking(true)
      setPin('')
      setTimeout(() => setShaking(false), 600)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') attempt()
  }

  // ── PIN screen ──
  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>

          {/* Lock icon */}
          <div style={{ marginBottom: '32px' }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', display: 'block', opacity: 0.5 }}>
              <rect x="8" y="18" width="24" height="18" rx="2" stroke="white" strokeWidth="1.5" />
              <path d="M13 18V13a7 7 0 0 1 14 0v5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="20" cy="27" r="2" fill="white" />
              <line x1="20" y1="29" x2="20" y2="32" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 300, color: '#fff', marginBottom: '6px' }}>
            CV Access
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.08em', marginBottom: '36px', lineHeight: 1.7 }}>
            This CV is private.<br />Enter the PIN provided by Innocent.
          </p>

          {/* PIN dots display */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: pin.length > i ? '#fff' : 'transparent',
                border: '1px solid rgba(255,255,255,0.25)',
                transition: 'background 0.15s',
              }} />
            ))}
          </div>

          {/* Numpad */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
            marginBottom: '16px',
            animation: shaking ? 'shake 0.5s ease' : 'none',
          }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button key={n}
                onClick={() => pin.length < 4 && setPin(p => p + n)}
                style={{
                  padding: '18px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', color: '#fff',
                  fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300,
                  cursor: 'pointer', transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
                {n}
              </button>
            ))}
            {/* Bottom row: delete, 0, enter */}
            <button onClick={() => setPin(p => p.slice(0, -1))}
              style={{ padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
              ⌫
            </button>
            <button onClick={() => pin.length < 4 && setPin(p => p + '0')}
              style={{ padding: '18px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 300, cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}>
              0
            </button>
            <button onClick={attempt}
              disabled={pin.length < 4}
              style={{ padding: '18px', background: pin.length === 4 ? '#fff' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: pin.length === 4 ? '#000' : 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: pin.length === 4 ? 'pointer' : 'default', transition: 'all 0.2s', fontWeight: 600, letterSpacing: '0.05em' }}>
              GO
            </button>
          </div>

          {/* Also allow keyboard input */}
          <input
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={handleKey}
            placeholder="Or type PIN + Enter"
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', outline: 'none', textAlign: 'center', letterSpacing: '0.3em', marginBottom: '12px' }}
          />

          {error && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#ff6b6b', marginBottom: '12px', letterSpacing: '0.04em' }}>
              {error}
            </p>
          )}

          <Link href="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ← Back to site
          </Link>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            15% { transform: translateX(-8px); }
            30% { transform: translateX(8px); }
            45% { transform: translateX(-6px); }
            60% { transform: translateX(6px); }
            75% { transform: translateX(-3px); }
            90% { transform: translateX(3px); }
          }
        `}</style>
      </div>
    )
  }

  // ── CV viewer ──
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', paddingTop: '80px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(28px, 5vw, 56px) clamp(16px, 4vw, 48px) 80px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Curriculum Vitae
            </p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 300, color: '#fff', lineHeight: 1, marginBottom: '4px' }}>
              {name}
            </h1>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', fontWeight: 300 }}>
              {title}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {cvUrl && (
              <a href={cvUrl} download target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ fontSize: '0.72rem', padding: '10px 22px' }}>
                Download ↓
              </a>
            )}
            <button
              onClick={() => { sessionStorage.removeItem(SESSION_KEY); setUnlocked(false); setPin('') }}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '10px 18px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)', cursor: 'pointer' }}>
              Lock
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ height: '500px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)' }}>Loading…</span>
          </div>
        ) : cvUrl ? (
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0f0f0f', overflow: 'hidden' }}>
            {cvUrl.toLowerCase().includes('.pdf') ? (
              <iframe
                src={`${cvUrl}#toolbar=0&navpanes=0`}
                style={{ width: '100%', height: 'clamp(480px, 78vh, 880px)', border: 'none', display: 'block' }}
                title="CV"
              />
            ) : (
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(cvUrl)}&embedded=true`}
                style={{ width: '100%', height: 'clamp(480px, 78vh, 880px)', border: 'none', display: 'block' }}
                title="CV"
              />
            )}
          </div>
        ) : (
          <div style={{ border: '1px dashed rgba(255,255,255,0.08)', padding: '80px 40px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 300, color: 'rgba(255,255,255,0.18)', fontStyle: 'italic' }}>
              CV not uploaded yet
            </p>
          </div>
        )}

        <div style={{ marginTop: '28px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Link href="/about" className="btn-ghost" style={{ fontSize: '0.7rem', padding: '9px 20px' }}>About Me</Link>
          <Link href="/portfolio" className="btn-ghost" style={{ fontSize: '0.7rem', padding: '9px 20px' }}>View Work</Link>
        </div>
      </div>
    </div>
  )
}