'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Nav() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  if (path.startsWith('/admin')) return null

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/portfolio', label: 'Work' },
    { href: '/cv', label: 'CV' },
  ]

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(10,10,10,0.85)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <Link href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400, color: '#fff', textDecoration: 'none', letterSpacing: '0.05em' }}>
          innocent<span style={{ color: 'rgba(255,255,255,0.3)' }}>.</span>
        </Link>

        {/* Desktop */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }} className="hide-mobile">
          {links.map(l => (
            <Link key={l.href} href={l.href} className={`nav-link ${path === l.href ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
          <a href="mailto:innorh45@gmail.com" className="btn-primary" style={{ padding: '9px 20px', fontSize: '0.7rem' }}>
            Let's Talk
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexDirection: 'column', gap: '5px', display: 'none' }}
          className="mobile-hamburger">
          <span style={{ display: 'block', width: '22px', height: '1px', background: '#fff', transition: 'transform 0.2s, opacity 0.2s', transform: open ? 'rotate(45deg) translateY(6px)' : 'none' }} />
          <span style={{ display: 'block', width: '22px', height: '1px', background: '#fff', opacity: open ? 0 : 1, transition: 'opacity 0.2s' }} />
          <span style={{ display: 'block', width: '22px', height: '1px', background: '#fff', transition: 'transform 0.2s', transform: open ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
        </button>
      </header>

      {/* Mobile menu */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 49, background: '#0A0A0A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '28px', paddingTop: '70px' }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 300, color: path === l.href ? '#fff' : 'rgba(255,255,255,0.3)', textDecoration: 'none' }}>
              {l.label}
            </Link>
          ))}
          <a href="mailto:innorh45@gmail.com" className="btn-primary" style={{ marginTop: '16px' }}>
            Let's Talk
          </a>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mobile-hamburger { display: flex !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </>
  )
}