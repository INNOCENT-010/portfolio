'use client'
import type { Profile } from '@/lib/supabase'

export default function CTALinks({ profile }: { profile: Profile | null }) {
  const links = [
    {
      label: 'Email',
      value: profile?.email ?? 'innorh45@gmail.com',
      href: `mailto:${profile?.email ?? 'innorh45@gmail.com'}`,
    },
    profile?.whatsapp && {
      label: 'WhatsApp',
      value: `+${profile.whatsapp}`,
      href: `https://wa.me/${profile.whatsapp}`,
    },
    profile?.phone && {
      label: 'Call',
      value: profile.phone,
      href: `tel:${profile.phone}`,
    },
    {
      label: 'GitHub',
      value: '@INNOCENT-010',
      href: profile?.github_url ?? 'https://github.com/INNOCENT-010',
    },
    {
      label: 'LinkedIn',
      value: 'innocent-amaechi',
      href: profile?.linkedin_url ?? 'https://linkedin.com/in/innocent-amaechi-006b973a6',
    },
  ].filter(Boolean) as { label: string; value: string; href: string }[]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.05)' }}>
      {links.map(item => (
        <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '18px 22px', background: 'var(--ink)',
            textDecoration: 'none', color: '#fff',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#111')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--ink)')}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {item.label}
          </span>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
            {item.value}
          </span>
        </a>
      ))}
    </div>
  )
}