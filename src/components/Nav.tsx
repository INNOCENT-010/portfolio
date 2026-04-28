'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const path = usePathname()
  if (path.startsWith('/admin')) return null

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      padding: '20px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(10,10,10,0.8)',
      backdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
    }}>
      <Link href="/" style={{
        fontFamily: 'var(--font-display)',
        fontSize: '1.2rem',
        fontWeight: 400,
        color: '#fff',
        textDecoration: 'none',
        letterSpacing: '0.05em',
      }}>
        innocent<span style={{ color: 'rgba(255,255,255,0.3)' }}>.</span>
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        {[
          { href: '/', label: 'Home' },
          { href: '/about', label: 'About' },
          { href: '/portfolio', label: 'Work' },
        ].map(l => (
          <Link key={l.href} href={l.href}
            className={`nav-link ${path === l.href ? 'active' : ''}`}>
            {l.label}
          </Link>
        ))}
        <a href="mailto:innorh45@gmail.com" className="btn-primary"
          style={{ padding: '9px 20px', fontSize: '0.7rem' }}>
          Let's Talk
        </a>
      </nav>
    </header>
  )
}