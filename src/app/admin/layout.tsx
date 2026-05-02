import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin — innocentdev' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', color: '#fff' }}>
      <header style={{ padding: '14px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>
          IA<span style={{ color: '#fff' }}>.</span> ADMIN
        </span>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {['projects', 'skills', 'experience', 'profile', 'messages'].map(section => (
            <a key={section} href={`/admin/${section}`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {section}
            </a>
          ))}
        </div>
      </header>
      {children}
    </div>
  )
}